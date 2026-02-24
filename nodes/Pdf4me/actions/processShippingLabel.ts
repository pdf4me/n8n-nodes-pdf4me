import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
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
		description: 'Choose how to provide the shipping label document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use shipping label file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide shipping label content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to shipping label file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the shipping label file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Document Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded shipping label document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the shipping label document file to process',
		placeholder: 'https://example.com/shipping_label.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'shipping_label.pdf',
		description: 'Name of the shipping label document file for reference',
		placeholder: 'shipping_label.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
			},
		},
		hint: 'Process Shipping Label. See our <b><a href="https://docs.pdf4me.com/integration/n8n/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessShippingLabel],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use \'JSON\' to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
		],
	},
];

/**
 * Process Shipping Label - Process shipping labels using PDF4ME API
 * Process: Read Shipping Label → Encode to base64 or upload blob → Send API request → Poll for completion → Return processed shipping label data
 *
 * This action processes shipping labels:
 * - Returns structured JSON data with processed shipping label information
 * - Supports various document formats
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docName;
	let blobId: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
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
				'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;

		// 2. Validate URL format
		try {
			new URL(documentUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the shipping label file.');
		}

		// 3. Extract filename from URL
		inputDocName = documentUrl.split('/').pop() || docName;

		// 4. Use URL directly in docContent
		blobId = '';
		docContent = documentUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate document content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Shipping label document content is required');
	}

	// Prepare request body according to API specification
	const body: IDataObject = {
		docName: inputDocName,
		docContent,
		isAsync: true,
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessShippingLabel', body);

	// Handle the response (processed shipping label data)
	if (responseData) {
		// Return both raw data and metadata
		return [
			{
				json: {
					...responseData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Shipping label processed successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: inputDocName,
						operation: 'processShippingLabel',
					},
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No shipping label processing results received from PDF4ME API');
}
