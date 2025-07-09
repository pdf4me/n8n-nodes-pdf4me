import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { sanitizeProfiles } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to extract pages from',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
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
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
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
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
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
		description: 'URL to the PDF file to extract pages from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
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
		description: 'Local file path to the PDF file to extract pages from',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name of the output PDF document',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
			},
		},
	},
	{
		displayName: 'Page Numbers',
		name: 'pageNumbers',
		type: 'string',
		required: true,
		default: '',
		description: 'Page numbers to extract (e.g. "1" or "1,3,5" or "2-4")',
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: ['Extract Pages from PDF'],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: `{ 'outputDataFormat': 'json' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}
		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are "data" for file uploads or the filename without extension.'
			);
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		docContent = await downloadPdfFromUrl.call(this, pdfUrl);
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		docContent = await readPdfFromFile(filePath);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName,
		pageNumbers,
		async: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Replace direct API call with helper
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Extract', body);

	// Handle the response
	if (responseData) {
		const fileName = docName || `output_${Date.now()}.pdf`;
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/pdf',
		);
		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: responseData.length,
					success: true,
					message: 'Pages extracted successfully',
					docName,
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response received from PDF4me API');
}

// Helper functions for downloading and reading files
async function downloadPdfFromUrl(this: IExecuteFunctions, pdfUrl: string): Promise<string> {
	try {
		const response = await this.helpers.request({
			method: 'GET',
			url: pdfUrl,
			encoding: null,
		});
		return Buffer.from(response).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download PDF from URL: ${error.message}`);
	}
}

async function readPdfFromFile(filePath: string): Promise<string> {
	try {
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		return fileBuffer.toString('base64');
	} catch (error) {
		throw new Error(`Failed to read PDF file from path: ${error.message}`);
	}
} 