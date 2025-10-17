import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
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
		hint: 'Read SwissQR code from PDF. See our <b><a href="https://docs.pdf4me.com/n8n/barcode/read-swiss-qr-code/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || docName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}
		const options = {
			method: 'GET' as const,
			url: pdfUrl.trim(),
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response);
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || docName;
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