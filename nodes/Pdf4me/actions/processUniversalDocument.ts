import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	uploadBlobToPdf4me,
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
		description: 'Choose how to provide the document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use document file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide document content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to document file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the document file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
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
		description: 'Base64 encoded document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
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
		description: 'URL to the document file to process',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'document.pdf',
		description: 'Name of the source document file for reference',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
			},
		},
		hint: 'Process Universal Document. See our <b><a href="https://docs.pdf4me.com/integration/n8n/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of field names to extract from the document (e.g., "field1,field2,field3")',
		placeholder: 'field1,field2,field3',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
			},
		},
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		default: 'Standard',
		description: 'Extraction mode for field processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
			},
		},
		options: [
			{
				name: 'Standard',
				value: 'Standard',
				description: 'Standard extraction mode (default)',
			},
			{
				name: 'Strict',
				value: 'Strict',
				description: 'Strict extraction mode',
			},
		],
	},
	{
		displayName: 'Document Type',
		name: 'documentType',
		type: 'string',
		default: '',
		description: 'Optional document type identifier',
		placeholder: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessUniversalDocument],
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
				operation: [ActionConstants.ProcessUniversalDocument],
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
 * Process Universal Document - Extract specified fields from documents using universal document processing
 * Process: Read Document → Encode to base64 or upload blob → Send API request → Poll for completion → Return extracted field data
 *
 * This action extracts specified fields from documents:
 * - Returns structured JSON data with extracted field values
 * - Supports various document formats
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const fieldsInput = this.getNodeParameter('fields', index) as string;
	const mode = this.getNodeParameter('mode', index) as string;
	const documentType = this.getNodeParameter('documentType', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docName;
	let blobId: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
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
			throw new Error('Invalid URL format. Please provide a valid URL to the document file.');
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
		throw new Error('Document content is required');
	}

	// Validate and parse fields
	if (!fieldsInput || fieldsInput.trim() === '') {
		throw new Error('Fields are required. Please provide at least one field name.');
	}

	// Parse comma-separated fields and trim whitespace
	const fields = fieldsInput
		.split(',')
		.map((field) => field.trim())
		.filter((field) => field.length > 0);

	if (fields.length === 0) {
		throw new Error('At least one valid field name is required');
	}

	// Map mode string to integer (Standard = 0, Strict = 1)
	const modeValue = mode === 'Strict' ? 1 : 0;

	// Ensure docName is never empty - API requires it for document identification
	const finalDocName =
		(inputDocName && inputDocName.trim()) || (docName && docName.trim()) || 'document.pdf';

	// Build the request body according to API specification
	const body: IDataObject = {
		docName: finalDocName,
		docContent,
		fields,
		mode: modeValue,
		isAsync: true,
	};

	// Add optional documentType if provided
	if (documentType && documentType.trim() !== '') {
		body.documentType = documentType.trim();
	}

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessUniversalDocument', body);

	// Handle the response (extracted field data)
	if (responseData) {
		// Return both raw data and metadata
		return [
			{
				json: {
					...responseData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Fields extracted successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: finalDocName,
						operation: 'processUniversalDocument',
					},
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No field extraction results received from PDF4ME API');
}
