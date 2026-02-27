import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	uploadBlobToPdf4me,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the marriage certificate document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use marriage certificate file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide marriage certificate content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to marriage certificate file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: false,
		default: 'data',
		description: 'Name of the binary property that contains the marriage certificate file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Marriage Certificate Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded marriage certificate document content',
		placeholder: 'JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PAovVHlwZSAvWE9iamVjdA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Marriage Certificate URL',
		name: 'marriageCertificateUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the marriage certificate file to process',
		placeholder: 'https://example.com/marriage_certificate.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'marriage_certificate.pdf',
		description: 'Name of the source marriage certificate file for reference',
		placeholder: 'original-marriage_certificate.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
			},
		},
		hint: 'Extract structured data from marriage certificates using AI technology for document verification. See our <b><a href="https://docs.pdf4me.com/integration/n8n/pdf4me-ai/ai-process-marriage-certificate/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Verify Authenticity',
		name: 'verifyAuthenticity',
		type: 'boolean',
		required: false,
		default: false,
		description: 'Whether to verify the authenticity of the marriage certificate',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
			},
		},
	},
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		placeholder: 'Add Custom Field',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Add custom field keys to extract from the marriage certificate using AI',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessMarriageCertificate],
			},
		},
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Key',
						name: 'key',
						type: 'string',
						default: '',
						placeholder: 'e.g., witness_name, ceremony_location',
						description: 'Key name of the custom field to extract',
						required: true,
					},
				],
			},
		],
	},
];

/**
 * AI Process Marriage Certificate - Extract structured data from marriage certificates using PDF4ME's AI/ML technology
 * Process: Read marriage certificate → Encode to base64 → Send API request → Poll for completion → Return extracted results
 *
 * This action extracts structured data from marriage certificates:
 * - Extracts names of parties, date of marriage, location, officiant, witnesses, and certificate number
 * - Supports various marriage certificate formats using AI/ML technology
 * - Always processes asynchronously for optimal performance
 * - Supports optional authenticity verification
 * - Supports optional custom field keys for additional data extraction
 * - Returns structured data in JSON format
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const verifyAuthenticity = this.getNodeParameter('verifyAuthenticity', index, false) as boolean;
	const customFieldsData = this.getNodeParameter('customFields', index, {}) as IDataObject;

	let docContent: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get marriage certificate content from binary data - upload to blob and use blob ID
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		const fileName = binaryData.fileName || docName;

		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, fileName);
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:image/png;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Use URL directly in docContent - no upload required
		const marriageCertificateUrl = this.getNodeParameter('marriageCertificateUrl', index) as string;
		docContent = marriageCertificateUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate marriage certificate content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Marriage certificate content is required');
	}

	// Note: Marriage certificate images may not start with PDF header, so we skip PDF validation
	// The API will handle validation of the actual content

	// Get custom field keys if specified
	const customFieldsList = (customFieldsData.field as Array<{ key: string }>) || [];
	const customFieldKeys: string[] = [];
	if (customFieldsList.length > 0) {
		customFieldsList.forEach((field) => {
			if (field.key) {
				customFieldKeys.push(field.key);
			}
		});
	}

	// Build the request payload - matching contract and health card actions
	const payload: IDataObject = {
		docContent,    // Base64, blob ID, or URL of marriage certificate document
		docName,       // User-provided document name
		IsAsync: true,
	};

	// Add optional verifyAuthenticity if provided
	if (verifyAuthenticity) {
		payload.VerifyAuthenticity = verifyAuthenticity;
	}

	// Add optional customFieldKeys if provided
	if (customFieldKeys.length > 0) {
		payload.CustomFieldKeys = customFieldKeys;
	}

	// Make the API request to process the marriage certificate
	let result: unknown;
	try {
		// Use async request function for marriage certificate processing
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessMarriageCertificate', payload);
	} catch (error: unknown) {
		const err = error as { code?: string; statusCode?: number; message?: string };
		// Enhanced error handling with debugging context - matching other AI actions
		if (err.code === 'ECONNRESET') {
			throw new Error(`Connection was reset. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode === 500) {
			throw new Error(`PDF4Me server error (500): ${err.message || 'The service was not able to process your request.'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode === 404) {
			throw new Error(`API endpoint not found. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode === 401) {
			throw new Error(`Authentication failed. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode === 403) {
			throw new Error(`Access denied. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode === 429) {
			throw new Error(`Rate limit exceeded. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (err.statusCode) {
			throw new Error(`PDF4Me API error (${err.statusCode}): ${err.message || 'Unknown error'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else {
			throw new Error(`Connection error: ${err.message || 'Unknown connection issue'} | Debug: docLength=${docContent?.length}, docName=${docName}, errorCode=${err.code}`);
		}
	}

	// Process the response - handle the exact same format as other AI actions
	if (result) {
		let processedData: IDataObject;

		// Parse the result
		try {
			if (typeof result === 'string') {
				processedData = JSON.parse(result) as IDataObject;
			} else {
				processedData = result as IDataObject;
			}
		} catch (error: unknown) {
			const err = error as Error;
			throw new Error(`Failed to parse API response: ${err.message}`);
		}

		// Return both raw data and metadata
		const metadata: IDataObject = {
			success: true,
			message: 'Marriage certificate processed successfully using AI',
			processingTimestamp: new Date().toISOString(),
			sourceFileName: docName,
			operation: 'aiProcessMarriageCertificate',
		};

		// Add verifyAuthenticity and custom fields info to metadata if used
		if (verifyAuthenticity) {
			metadata.verifyAuthenticity = verifyAuthenticity;
		}
		if (customFieldKeys.length > 0) {
			metadata.customFieldsUsed = customFieldKeys;
			metadata.customFieldsCount = customFieldKeys.length;
		}

		return [
			{
				json: {
					...processedData, // Raw API response data
					_metadata: metadata,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No response data received from PDF4ME AI Marriage Certificate Processing API');
}


