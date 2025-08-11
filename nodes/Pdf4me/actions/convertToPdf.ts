import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';



export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
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
				value: 'binaryData',
				description: 'Use binary data from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded content',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the file to convert',
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
				inputDataType: ['binaryData'],
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
				inputDataType: ['binaryData'],
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
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input file (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputDataType: ['base64', 'url'],
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
				inputDataType: ['url'],
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
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let docName: string;

	// Handle different input types
	if (inputDataType === 'binaryData') {
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
				'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		// Use provided input filename or extract from binary data
		const binaryData = item[0].binary[binaryPropertyName];
		docName = inputFileName || binaryData.fileName || 'document';
	} else if (inputDataType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for base64 input type.');
		}
	} else if (inputDataType === 'url') {
		// URL input
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for URL input type.');
		}

		// Download the file from URL and convert to base64
		try {
			const options = {

				method: 'GET' as const,

				url: fileUrl,

				encoding: 'arraybuffer' as const,

			};

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
			docContent = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download file from URL: ${fileUrl}. Error: ${error}`);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
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
					inputDataType,
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