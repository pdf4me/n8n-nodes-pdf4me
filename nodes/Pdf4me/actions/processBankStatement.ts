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
		description: 'Choose how to provide the bank statement document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use bank statement file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide bank statement content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to bank statement file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the bank statement file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
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
		description: 'Base64 encoded bank statement document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
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
		description: 'URL to the bank statement document file to process',
		placeholder: 'https://example.com/bank_statement.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'bank_statement.pdf',
		description: 'Name of the bank statement document file for reference',
		placeholder: 'bank_statement.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
			},
		},
		hint: 'AI - Bank Statement Data Extraction. See our <b><a href="https://docs.pdf4me.com/integration/n8n/pdf4me-ai/ai-process-bank-statement/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Bank Name',
		name: 'bankName',
		type: 'string',
		default: '',
		description: 'Optional bank name for improved parsing accuracy',
		placeholder: 'Chase, Bank of America, Wells Fargo, etc.',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
			},
		},
	},
	{
		displayName: 'Analyze Patterns',
		name: 'analyzePatterns',
		type: 'boolean',
		default: true,
		description: 'Whether to analyze transaction patterns',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProcessBankStatement],
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
				operation: [ActionConstants.ProcessBankStatement],
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
				operation: [ActionConstants.ProcessBankStatement],
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
 * Process Bank Statement - Process bank statement documents using PDF4ME API
 * Process: Read Bank Statement → Encode to base64 or upload blob → Send API request → Poll for completion → Return processed bank statement data
 *
 * This action processes bank statement documents:
 * - Returns structured JSON data with processed bank statement information
 * - Supports optional bank name for improved parsing accuracy
 * - Can analyze transaction patterns
 * - Supports custom field extraction
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const bankName = this.getNodeParameter('bankName', index) as string;
	const analyzePatterns = this.getNodeParameter('analyzePatterns', index) as boolean;
	const customFieldKeysInput = this.getNodeParameter('customFieldKeys', index) as string;
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
			throw new Error('Invalid URL format. Please provide a valid URL to the bank statement file.');
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
		throw new Error('Bank statement document content is required');
	}

	// Parse custom field keys if provided
	let customFieldKeys: string[] = [];
	if (customFieldKeysInput && customFieldKeysInput.trim() !== '') {
		customFieldKeys = customFieldKeysInput
			.split(',')
			.map((key) => key.trim())
			.filter((key) => key.length > 0);
	}

	// Prepare request body according to API specification
	// Use user-provided docName (same as aiInvoiceParser) - do not overwrite with derived filename
	const body: IDataObject = {
		docName,
		docContent,
		analyzePatterns,
		isAsync: true,
	};

	// Add optional bankName if provided
	if (bankName && bankName.trim() !== '') {
		body.bankName = bankName.trim();
	}

	// Add customFieldKeys if provided
	if (customFieldKeys.length > 0) {
		body.customFieldKeys = customFieldKeys;
	}

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessBankStatement', body);

	// Handle the response (processed bank statement data)
	// Accept objects (including empty {}) and arrays - null/undefined indicate API returned no data
	if (responseData !== null && responseData !== undefined) {
		const dataToSpread = typeof responseData === 'object' ? responseData : { result: responseData };
		return [
			{
				json: {
					...dataToSpread,
					_metadata: {
						success: true,
						message: 'Bank statement processed successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: inputDocName,
						operation: 'processBankStatement',
					},
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - API returned null/undefined (empty or failed processing)
	const receivedType = responseData === null ? 'null' : typeof responseData;
	const debugHint =
		responseData === undefined
			? 'The API may have returned an empty response, or the polling location URL may be incorrect.'
			: 'Check that the document is a valid bank statement and that your PDF4ME API key has ProcessBankStatement access.';
	throw new Error(
		`No bank statement processing results received from PDF4ME API (received: ${receivedType}). ${debugHint}`,
	);
}
