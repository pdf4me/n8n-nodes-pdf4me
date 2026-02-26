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
		description: 'Choose how to provide the bank cheque document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use bank cheque file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide bank cheque content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to bank cheque file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: false,
		default: 'data',
		description: 'Name of the binary property that contains the bank cheque file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Bank Cheque Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded bank cheque document content',
		placeholder: 'JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PAovVHlwZSAvWE9iamVjdA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Bank Cheque URL',
		name: 'bankChequeUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the bank cheque file to process',
		placeholder: 'https://example.com/cheque.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'cheque.pdf',
		description: 'Name of the source bank cheque file for reference',
		placeholder: 'original-cheque.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
			},
		},
		hint: 'Extract structured data from bank cheques using AI technology for payment processing. See our <b><a href="https://docs.pdf4me.com/integration/n8n/pdf4me-ai/ai-process-bank-cheque/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		description: 'Add custom field keys to extract from the bank cheque using AI',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessBankCheque],
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
						placeholder: 'e.g., cheque_number, bank_name',
						description: 'Key name of the custom field to extract',
						required: true,
					},
				],
			},
		],
	},
];

/**
 * AI Process Bank Cheque - Extract structured data from bank cheques using PDF4ME's AI/ML technology
 * Process: Read bank cheque → Encode to base64 → Send API request → Poll for completion → Return extracted results
 *
 * This action extracts structured data from bank cheques:
 * - Extracts cheque number, amount, payee, date, bank information, and signature
 * - Supports various bank cheque formats using AI/ML technology
 * - Always processes asynchronously for optimal performance
 * - Supports optional custom field keys for additional data extraction
 * - Returns structured data in JSON format
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const customFieldsData = this.getNodeParameter('customFields', index, {}) as IDataObject;

	let docContent: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get bank cheque content from binary data - upload to blob and use blob ID
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

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		// Validate that base64 content looks like a PDF
		if (!docContent.startsWith('JVBERi0x')) {
			throw new Error(`Invalid PDF content. Base64 should start with 'JVBERi0x' (PDF header), but starts with: ${docContent.substring(0, 20)}`);
		}
	} else if (inputDataType === 'url') {
		// Use URL directly in docContent - no upload required
		const bankChequeUrl = this.getNodeParameter('bankChequeUrl', index) as string;
		docContent = bankChequeUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate bank cheque content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Bank cheque content is required');
	}

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
		docContent,    // Base64, blob ID, or URL of bank cheque document
		docName,       // User-provided document name
		isAsync: true,
	};

	// Add optional customFieldKeys if provided
	if (customFieldKeys.length > 0) {
		payload.CustomFieldKeys = customFieldKeys;
	}

	// Make the API request to process the bank cheque
	let result: unknown;
	try {
		// Use async request function for bank cheque processing
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessBankCheque', payload);
	} catch (error: unknown) {
		const err = error as { code?: string; statusCode?: number; message?: string };
		// Enhanced error handling with debugging context - matching contract and health card actions
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
			message: 'Bank cheque processed successfully using AI',
			processingTimestamp: new Date().toISOString(),
			sourceFileName: docName,
			operation: 'aiProcessBankCheque',
		};

		// Add custom fields info to metadata if used
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
	throw new Error('No response data received from PDF4ME AI Bank Cheque Processing API');
}


