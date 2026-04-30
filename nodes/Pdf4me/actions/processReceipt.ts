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
		description: 'Choose how to provide the receipt document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use receipt file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide receipt content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to receipt file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the receipt file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
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
		description: 'Base64 encoded receipt document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
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
		description: 'URL to the receipt document file to process',
		placeholder: 'https://example.com/receipt.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'receipt.pdf',
		description: 'Name of the receipt document file for reference',
		placeholder: 'receipt.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
		hint: 'AI - Receipt Data Extraction. See our <b><a href="https://docs.pdf4me.com/integration/n8n/pdf4me-ai/ai-process-receipt/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Receipt Type',
		name: 'receiptType',
		type: 'options',
		default: '',
		description: 'Optional receipt type for improved parsing accuracy',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
		options: [
			{
				name: 'None',
				value: '',
				description: 'No specific receipt type',
			},
			{
				name: 'Meal',
				value: 'meal',
				description: 'Meal receipt',
			},
			{
				name: 'Supplies',
				value: 'supplies',
				description: 'Supplies receipt',
			},
			{
				name: 'Hotel',
				value: 'hotel',
				description: 'Hotel receipt',
			},
			{
				name: 'Fuel and Energy',
				value: 'fuel and energy',
				description: 'Fuel and energy receipt',
			},
			{
				name: 'Transportation',
				value: 'transportation',
				description: 'Transportation receipt',
			},
			{
				name: 'Communication',
				value: 'communication',
				description: 'Communication receipt',
			},
			{
				name: 'Subscriptions',
				value: 'subscriptions',
				description: 'Subscriptions receipt',
			},
			{
				name: 'Entertainment',
				value: 'entertainment',
				description: 'Entertainment receipt',
			},
			{
				name: 'Training',
				value: 'training',
				description: 'Training receipt',
			},
			{
				name: 'Healthcare',
				value: 'healthcare',
				description: 'Healthcare receipt',
			},
			{
				name: 'Generic',
				value: 'generic',
				description: 'Generic receipt',
			},
		],
	},
	{
		displayName: 'Analyze Items',
		name: 'analyzeItems',
		type: 'boolean',
		default: true,
		description: 'Whether to analyze individual items on the receipt',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
	},
	{
		displayName: 'Extract Merchant Info',
		name: 'extractMerchantInfo',
		type: 'boolean',
		default: true,
		description: 'Whether to extract merchant information',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
	},
	{
		displayName: 'Calculate Totals',
		name: 'calculateTotals',
		type: 'boolean',
		default: true,
		description: 'Whether to calculate totals and subtotals',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
			},
		},
	},
	{
		displayName: 'Custom Field Keys',
		name: 'customFieldKeys',
		type: 'string',
		default: '',
		description: 'Comma-separated list of custom field keys to extract (e.g., "field1,field2,field3")',
		placeholder: 'field1,field2,field3',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessReceipt],
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
				operation: [ActionConstants.ProcessReceipt],
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
 * Process Receipt - Process receipt documents using PDF4ME API
 * Process: Read Receipt → Encode to base64 or upload blob → Send API request → Poll for completion → Return processed receipt data
 *
 * This action processes receipt documents:
 * - Returns structured JSON data with processed receipt information
 * - Supports various receipt types for improved parsing accuracy
 * - Can analyze items, extract merchant info, and calculate totals
 * - Supports custom field extraction
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const receiptType = this.getNodeParameter('receiptType', index) as string;
	const analyzeItems = this.getNodeParameter('analyzeItems', index) as boolean;
	const extractMerchantInfo = this.getNodeParameter('extractMerchantInfo', index) as boolean;
	const calculateTotals = this.getNodeParameter('calculateTotals', index) as boolean;
	const customFieldKeysInput = this.getNodeParameter('customFieldKeys', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;

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
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		// Validate that base64 content looks like a PDF
		if (!docContent.startsWith('JVBERi0x')) {
			throw new Error(
				`Invalid PDF content. Base64 should start with 'JVBERi0x' (PDF header), but starts with: ${docContent.substring(0, 20)}`,
			);
		}
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;

		// 2. Validate URL format
		try {
			new URL(documentUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the receipt file.');
		}

		// 3. Extract filename from URL
		inputDocName = documentUrl.split('/').pop() || docName;

		// 4. Use URL directly in docContent
		docContent = documentUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate document content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Receipt document content is required');
	}

	// Parse custom field keys if provided
	let customFieldKeys: string[] = [];
	if (customFieldKeysInput && customFieldKeysInput.trim() !== '') {
		customFieldKeys = customFieldKeysInput
			.split(',')
			.map((key) => key.trim())
			.filter((key) => key.length > 0);
	}

	// Build the request payload
	const payload: IDataObject = {
		docName: inputDocName,
		docContent,
		analyzeItems,
		extractMerchantInfo,
		calculateTotals,
		IsAsync: true,
	};

	// Add optional receiptType if provided
	if (receiptType && receiptType.trim() !== '') {
		payload.receiptType = receiptType.trim();
	}

	// Add customFieldKeys if provided
	if (customFieldKeys.length > 0) {
		payload.customFieldKeys = customFieldKeys;
	}

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) payload.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(payload);

	const shouldRetryExpiredJobError = (error: unknown): boolean => {
		const normalizedError = error as { message?: string; description?: string; statusCode?: number };
		const message =
			`${normalizedError?.message || ''} ${normalizedError?.description || ''}`.toLowerCase();
		return (
			(message.includes('processing job not found') || message.includes('job not found or expired'))
		);
	};

	const executeProcessReceipt = async (): Promise<unknown> =>
		pdf4meAsyncRequest.call(this, '/api/v2/ProcessReceipt', payload);

	// Make the API request to process receipt - retry once for transient async job expiry
	let responseData: unknown;
	try {
		responseData = await executeProcessReceipt();
	} catch (error) {
		if (shouldRetryExpiredJobError(error)) {
			responseData = await executeProcessReceipt();
		} else {
			const requestError = error as { code?: string; statusCode?: number; message?: string };
			const normalizedMessage = `${requestError.message || ''}`.toLowerCase();
			if (requestError.code === 'ECONNRESET') {
				throw new Error(
					`Connection was reset. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (normalizedMessage.includes('authorization failed')) {
				throw new Error(
					`Authentication failed. Please check your PDF4ME API credentials. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (
				normalizedMessage.includes('connection to the server was closed unexpectedly') ||
				normalizedMessage.includes('server was closed unexpectedly')
			) {
				throw new Error(
					`PDF4ME server connection closed unexpectedly. Please retry. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (normalizedMessage.includes('canceled')) {
				throw new Error(
					`Request was canceled before completion. Please retry the workflow run. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode === 500) {
				throw new Error(
					`PDF4Me server error (500): ${requestError.message || 'The service was not able to process your request.'} | Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode === 404) {
				throw new Error(
					`API endpoint not found. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode === 401) {
				throw new Error(
					`Authentication failed. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode === 403) {
				throw new Error(
					`Access denied. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode === 429) {
				throw new Error(
					`Rate limit exceeded. Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else if (requestError.statusCode) {
				throw new Error(
					`PDF4Me API error (${requestError.statusCode}): ${requestError.message || 'Unknown error'} | Debug: docLength=${docContent?.length}, docName=${inputDocName}`,
				);
			} else {
				throw new Error(
					`Connection error: ${requestError.message || 'Unknown connection issue'} | Debug: docLength=${docContent?.length}, docName=${inputDocName}, errorCode=${requestError.code}`,
				);
			}
		}
	}

	// Process the response - same output handling as other AI actions
	if (responseData) {
		let processedData: IDataObject;

		try {
			if (typeof responseData === 'string') {
				processedData = JSON.parse(responseData) as IDataObject;
			} else {
				processedData = responseData as IDataObject;
			}
		} catch (error) {
			const parseError = error as { message?: string };
			throw new Error(`Failed to parse API response: ${parseError.message || 'Unknown parse error'}`);
		}

		// Return both raw data and metadata
		return [
			{
				json: {
					...processedData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Receipt processed successfully using AI',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: inputDocName,
						operation: 'processReceipt',
					},
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No response data received from PDF4ME AI Receipt Processing API');
}
