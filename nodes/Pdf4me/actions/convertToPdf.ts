import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';
import { readFileSync } from 'fs';

// Make Buffer available (it's a Node.js global)
declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				description: 'Use binary data from previous node',
				value: 'binaryData',
			},
			{
				name: 'Base64 String',
				description: 'Provide base64 encoded content',
				value: 'base64',
			},
			{
				name: 'URL',
				description: 'Provide a URL to the file to convert',
				value: 'url',
			},
			{
				name: 'Local Path',
				description: 'Provide a local file path to convert',
				value: 'localPath',
			},
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		description: 'Name of the input file (including extension). If not provided, will use the filename from binary data.',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded content of the file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input file (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the file to convert to PDF',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		required: true,
		description: 'Local file path to convert to PDF',
		placeholder: '/path/to/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputType: ['localPath'],
			},
		},
	},

	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'converted_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
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
				operation: [ActionConstants.ConvertToPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputType = this.getNodeParameter('inputType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let docName: string;

	// Handle different input types
	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
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
		
		// Use provided input filename or extract from binary data
		const binaryData = item[0].binary[binaryPropertyName];
		docName = inputFileName || binaryData.fileName || 'document';
	} else if (inputType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('inputFileName', index) as string;
		
		if (!docName) {
			throw new Error('Input file name is required for base64 input type.');
		}
	} else if (inputType === 'url') {
		// URL input
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		docName = this.getNodeParameter('inputFileName', index) as string;
		
		if (!docName) {
			throw new Error('Input file name is required for URL input type.');
		}
		
		// Download the file from URL and convert to base64
		try {
			const response = await this.helpers.request({
				method: 'GET',
				url: fileUrl,
				encoding: null,
			});
			docContent = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download file from URL: ${fileUrl}. Error: ${error}`);
		}
	} else if (inputType === 'localPath') {
		// Local file path input
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		docName = this.getNodeParameter('inputFileName', index) as string;
		
		if (!docName) {
			throw new Error('Input file name is required for local path input type.');
		}
		
		// Read the local file and convert to base64
		try {
			const fileBuffer = readFileSync(localFilePath);
			docContent = fileBuffer.toString('base64');
		} catch (error) {
			throw new Error(`Failed to read local file: ${localFilePath}. Error: ${error}`);
		}
	} else {
		throw new Error(`Unsupported input type: ${inputType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: docName, // Use full filename with extension
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	let responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertToPdf', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Validate that we received valid PDF data
		if (!Buffer.isBuffer(responseData)) {
			throw new Error('Invalid response format: Expected Buffer but received ' + typeof responseData);
		}

		// Check if the response looks like a PDF (should start with %PDF)
		const responseString = responseData.toString('utf8', 0, 10);
		if (!responseString.startsWith('%PDF')) {
			// If it doesn't look like a PDF, it might be an error message or base64 encoded
			const errorText = responseData.toString('utf8', 0, 200);
			if (errorText.includes('error') || errorText.includes('Error')) {
				throw new Error(`API returned error: ${errorText}`);
			}
			// Try to decode as base64 if it doesn't look like a PDF
			try {
				const decodedBuffer = Buffer.from(responseData.toString('utf8'), 'base64');
				const decodedString = decodedBuffer.toString('utf8', 0, 10);
				if (decodedString.startsWith('%PDF')) {
					// It was base64 encoded, use the decoded version
					responseData = decodedBuffer;
				} else {
					throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
				}
			} catch (decodeError) {
				throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
			}
		}

		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName) {
			fileName = `converted_${Date.now()}.pdf`;
		}

		// responseData is already binary data (Buffer)
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
					inputType,
					sourceFileName: docName,
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
} 