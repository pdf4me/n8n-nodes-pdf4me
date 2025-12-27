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
		description: 'Choose how to provide the PDF file to extract metadata from',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
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
				operation: [ActionConstants.GetPdfMetadata],
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
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
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
		description: 'URL to the PDF file to extract metadata from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'pdf_metadata.json',
		description: 'Name for the output metadata file',
		placeholder: 'my-pdf-metadata.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
			},
		},
		hint: 'Get PDF metadata. See our <b><a href="https://docs.pdf4me.com/n8n/pdf/get-pdf-metadata/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property that will contain the JSON metadata file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
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
				operation: [ActionConstants.GetPdfMetadata],
			},
		},
	},
];

/**
 * Get PDF Metadata - Extract metadata information from PDF documents using PDF4ME
 * Process: Read PDF document → Encode to base64 → Send API request → Poll for completion → Return metadata
 *
 * This action extracts metadata from PDF documents:
 * - Returns structured JSON data with PDF metadata (title, author, creation date, etc.)
 * - Supports various PDF document formats
 * - Always processes asynchronously for optimal performance
 * - Returns both JSON data and binary JSON file containing the metadata
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main PDF content
	let docContent: string = '';
	let docName: string = outputFileName;
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
		docName = binaryData.fileName || outputFileName;

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

		// 2. Extract filename from URL
		docName = pdfUrl.split('/').pop() || outputFileName;

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = pdfUrl;
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
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/GetPdfMetadata', body);

	// Prepare the JSON response data
	const jsonResponse = {
		...result, // Raw API response data
		_metadata: {
			success: true,
			message: 'PDF metadata extracted successfully',
			processingTimestamp: new Date().toISOString(),
			sourceFileName: docName,
			operation: 'getPdfMetadata',
		},
	};

	// Create binary data from the JSON response
	const jsonString = JSON.stringify(jsonResponse, null, 2);
	const jsonBuffer = Buffer.from(jsonString, 'utf8');

	// Generate filename for the JSON file
	let jsonFileName = outputFileName;
	if (!jsonFileName.toLowerCase().endsWith('.json')) {
		jsonFileName = `${jsonFileName.replace(/\.[^.]*$/, '')}.json`;
	}

	// Create binary data using n8n's helper
	const binaryData = await this.helpers.prepareBinaryData(
		jsonBuffer,
		jsonFileName,
		'application/json',
	);

	// Return both JSON and binary data
	return [
		{
			json: jsonResponse,
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
			pairedItem: { item: index },
		},
	];
}
