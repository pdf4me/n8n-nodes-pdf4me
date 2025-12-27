import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to read SwissQR code from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to PDF file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF content',
		placeholder: 'JVBERi0xLjQKJcfs...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file to read SwissQR code from',
		placeholder: 'https://example.com/file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'swissqr_code_data.json',
		description: 'Name for the output SwissQR code data file (JSON)',
		placeholder: 'swissqr_code_data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
			},
		},
		hint: 'Read SwissQR code from PDF. See our <b><a href="https://docs.pdf4me.com/n8n/barcode/read-swiss-qr-code/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Enable asynchronous processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadSwissQrCode],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;

	// Main PDF content
	let docContent: string = '';
	let docName: string = outputFileName.endsWith('.pdf') ? outputFileName : 'input.pdf';
	let blobId: string = '';

	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		docName = binaryData.fileName || docName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}

		// 2. Set docName to GetDocument.pdf for URL input
		docName = 'GetDocument.pdf';

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = pdfUrl.trim();
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ReadSwissQrBill', body);

	// Parse the JSON response
	let parsedResult = result;
	if (Buffer.isBuffer(result)) {
		try {
			parsedResult = JSON.parse(result.toString('utf8'));
		} catch (e) {
			parsedResult = result;
		}
	} else if (typeof result === 'string') {
		try {
			parsedResult = JSON.parse(result);
		} catch {
			parsedResult = result;
		}
	}

	return [
		{
			json: {
				success: true,
				message: 'SwissQR code reading completed successfully',
				docName,
				swissQrData: parsedResult,
			},
		},
	];
}
