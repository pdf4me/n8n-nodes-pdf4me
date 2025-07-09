import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { pdf4meAsyncRequest, sanitizeProfiles, ActionConstants } from '../GenericFunctions';

declare const Buffer: any;
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
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
				inputDataType: ['base64'],
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
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name of the output PDF document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetPdfMetadata],
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
				operation: [ActionConstants.GetPdfMetadata],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'json' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let originalFileName = docName;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		const binaryData = item[0].binary[binaryPropertyName];
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		if (binaryData.fileName) {
			originalFileName = binaryData.fileName;
		}
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		docContent = fileBuffer.toString('base64');
		const pathParts = filePath.replace(/\\/g, '/').split('/');
		originalFileName = pathParts[pathParts.length - 1];
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: pdfUrl, encoding: null });
		docContent = Buffer.from(response).toString('base64');
		const urlParts = pdfUrl.replace(/\\/g, '/').split('/');
		originalFileName = urlParts[urlParts.length - 1];
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		async: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GetPdfMetadata', body);

	// Robustly handle the response (Buffer, base64, or object)
	if (responseData) {
		let jsonString: string;
		if (Buffer.isBuffer(responseData)) {
			jsonString = responseData.toString('utf8');
		} else if (typeof responseData === 'string') {
			// If it's base64, decode it
			jsonString = Buffer.from(responseData, 'base64').toString('utf8');
		} else if (typeof responseData === 'object') {
			jsonString = JSON.stringify(responseData, null, 2);
		} else {
			throw new Error('Unexpected response type');
		}

		// Try to parse as JSON
		let parsedJson: any;
		try {
			parsedJson = JSON.parse(jsonString);
		} catch (err) {
			throw new Error('Response is not valid JSON');
		}

		// Save as JSON file
		const fileName = originalFileName.replace(/\.[^.]*$/, '') + '.metadata.json';
		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(JSON.stringify(parsedJson, null, 2), 'utf8'),
			fileName,
			'application/json',
		);
		return [
			{
				json: {
					fileName,
					mimeType: 'application/json',
					fileSize: Buffer.byteLength(JSON.stringify(parsedJson, null, 2)),
					success: true,
					message: 'PDF metadata extracted successfully',
					originalFileName,
					...parsedJson, // Show metadata in JSON tab
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}
	throw new Error('No response data received from PDF4ME API');
} 