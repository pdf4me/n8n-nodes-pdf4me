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
	let docContent: string;
	let docName: string = outputFileName.endsWith('.pdf') ? outputFileName : 'input.pdf';
	let blobId: string = '';
	let inputDocName: string = '';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName;
		docName = inputDocName;

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ReadSwissQrBill API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(pdfUrl);
		docName = pdfUrl.split('/').pop() || docName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	// Build the request body
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'input.pdf';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
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
			pairedItem: { item: index },
		},
	];
}
