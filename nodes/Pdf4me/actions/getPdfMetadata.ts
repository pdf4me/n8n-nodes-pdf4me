import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;
declare const require: any;

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
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
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
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the PDF file to extract metadata from',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
				inputDataType: ['filePath'],
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

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

	// Main PDF content
	let docContent: string;
	let docName: string = outputFileName;
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || outputFileName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		docContent = fileBuffer.toString('base64');
		docName = filePath.split('/').pop() || outputFileName;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const axios = require('axios');
		const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data, 'binary');
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		async: useAsync,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/GetPdfMetadata', body);

	// Return the result as binary data (JSON)
	const mimeType = 'application/json';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'PDF metadata extracted successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
