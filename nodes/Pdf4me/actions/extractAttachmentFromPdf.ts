import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to extract attachments from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
		description: 'Name of the binary property that contains the PDF file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
		description: 'URL to the PDF file to extract attachments from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
				inputDataType: ['url'],
			},
		},
		hint: 'Extract attachment from PDF. See our <b><a href="https://docs.pdf4me.com/n8n/extract/extract-attachment-from-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the document (used for processing)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use \'JSON\' to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: '{ \'outputDataFormat\': \'json\' }',
			},
		],
	},
];

/**
 * Extract Attachment from PDF - Extract embedded attachments from PDF documents using PDF4ME
 * Process: Read PDF document → Encode to base64 → Send API request → Poll for completion → Return attachment data
 * 
 * This action extracts embedded attachments from PDF documents:
 * - Returns structured JSON data with all extracted attachments
 * - Supports various PDF document formats
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

		// Get binary data from previous node
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are \'data\' for file uploads or the filename without extension.'
			);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		docContent = await downloadPdfFromUrl.call(this, pdfUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName,
		IsAsync: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make API call
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractAttachmentFromPdf', body);

	// Handle the response (extracted attachments)
	if (responseData) {
		// Return both raw data and metadata
		return [
			{
				json: {
					...responseData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Attachments extracted successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: docName,
						operation: 'extractAttachmentFromPdf',
					},
				},
			},
		];
	}

	// Error case - no response received
	throw new Error('No attachment extraction results received from PDF4ME API');
}

async function downloadPdfFromUrl(this: IExecuteFunctions, pdfUrl: string): Promise<string> {
	try {
		const options = {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);

		return Buffer.from(response).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download PDF from URL: ${error.message}`);
	}
}

