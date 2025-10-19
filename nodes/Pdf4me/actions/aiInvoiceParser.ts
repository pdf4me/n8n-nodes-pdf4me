import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';



export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the invoice document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use invoice file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide invoice content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to invoice file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: false,
		default: 'data',
		description: 'Name of the binary property that contains the invoice file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Invoice Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded invoice content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Invoice URL',
		name: 'invoiceUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the invoice file to process',
		placeholder: 'https://example.com/invoice.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Invoice Name',
		name: 'docName',
		type: 'string',
		default: 'invoice.pdf',
		description: 'Name of the source invoice file for reference',
		placeholder: 'original-invoice.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
			},
		},
		hint: 'Extract structured data from invoices using AI technology for automated data entry. See our <b><a href="https://docs.pdf4me.com/n8n/pdf4me-ai/ai-invoice-parser/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		description: 'Add custom fields to extract from the invoice using AI (e.g., phone number, email, tax ID)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiInvoiceParser],
			},
		},
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'name',
						type: 'string',
						default: '',
						placeholder: 'e.g., phone, email, tax_id',
						description: 'Name of the custom field to extract',
						required: true,
					},
					{
						displayName: 'Field Description',
						name: 'description',
						type: 'string',
						default: '',
						placeholder: 'e.g., Phone number of the vendor',
						description: 'Description to help the AI understand what to extract',
					},
				],
			},
		],
	},
];

/**
 * AI Invoice Parser - Extract structured data from invoices using PDF4ME's AI/ML technology
 * Process: Read invoice → Encode to base64 → Send API request → Return extracted results
 *
 * This action mirrors the Python aiinvoice.py script functionality exactly:
 * - Extracts amounts, dates, vendor information, and line items
 * - Supports various invoice formats using AI/ML technology
 * - Supports custom fields (phone, email, tax ID, etc.) for AI extraction
 * - Returns structured data in the same format as the Python script
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string; // User input for document name

	let docContent: string;

	// Handle different input data types - convert all to base64
	if (inputDataType === 'binaryData') {
		// Get invoice content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Download file from URL and convert to base64
		const invoiceUrl = this.getNodeParameter('invoiceUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: invoiceUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = Buffer.from(response);
		docContent = buffer.toString('base64');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate invoice content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Invoice content is required');
	}

	// Validate that base64 content looks like a PDF
	if (!docContent.startsWith('JVBERi0x')) {
		throw new Error(`Invalid PDF content. Base64 should start with 'JVBERi0x' (PDF header), but starts with: ${docContent.substring(0, 20)}`);
	}

	// Get custom fields if specified
	const customFieldsData = this.getNodeParameter('customFields', index, {}) as IDataObject;
	const customFieldsList = (customFieldsData.field as Array<{ name: string; description?: string }>) || [];

	// Transform custom fields into an array of field names
	const customFieldNames: string[] = [];
	if (customFieldsList.length > 0) {
		customFieldsList.forEach((field) => {
			if (field.name) {
				customFieldNames.push(field.name);
			}
		});
	}

	// Build the request payload
	const payload: IDataObject = {
		docName,       // User-provided document name
		docContent,    // Base64 encoded invoice document content
		...(customFieldNames.length > 0 && { customFieldKeys: customFieldNames }),
		IsAsync: true,
	};

	// Make the API request to process the invoice - using async request for proper 202 handling
	let result: any;
	try {
		// Use async request function for invoice processing
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessInvoice', payload);
	} catch (error) {
		// Enhanced error handling with debugging context
		if (error.code === 'ECONNRESET') {
			throw new Error(`Connection was reset. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 500) {
			throw new Error(`PDF4Me server error (500): ${error.message || 'The service was not able to process your request.'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 404) {
			throw new Error(`API endpoint not found. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 401) {
			throw new Error(`Authentication failed. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 403) {
			throw new Error(`Access denied. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 429) {
			throw new Error(`Rate limit exceeded. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode) {
			throw new Error(`PDF4Me API error (${error.statusCode}): ${error.message || 'Unknown error'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else {
			throw new Error(`Connection error: ${error.message || 'Unknown connection issue'} | Debug: docLength=${docContent?.length}, docName=${docName}, errorCode=${error.code}`);
		}
	}

	// Process the response - handle the exact same format as Python script output
	if (result) {
		let processedData: any;

		// Parse the result
		try {
			if (typeof result === 'string') {
				processedData = JSON.parse(result);
			} else {
				processedData = result;
			}
		} catch (error) {
			throw new Error(`Failed to parse API response: ${error.message}`);
		}

		// Return both raw data and metadata
		const metadata: IDataObject = {
			success: true,
			message: 'Invoice processed successfully using AI',
			processingTimestamp: new Date().toISOString(),
			sourceFileName: docName,
			operation: 'aiInvoiceParser',
		};

		// Add custom fields info to metadata if used
		if (customFieldsList.length > 0) {
			metadata.customFieldsUsed = customFieldsList.map((f) => f.name);
			metadata.customFieldsCount = customFieldsList.length;
		}

		return [
			{
				json: {
					...processedData, // Raw API response data
					_metadata: metadata,
				},
			},
		];
	}

	// Error case - no response received
	throw new Error('No response data received from PDF4ME AI Invoice Processing API');
}
