import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	pdf4meApiRequest,
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
		description: 'Choose how to provide the PDF file to extract resources from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
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
				operation: [ActionConstants.ExtractResources],
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
				operation: [ActionConstants.ExtractResources],
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
		description: 'URL to the PDF file to extract resources from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the document (used for processing)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
	},
	{
		displayName: 'Extraction Options',
		name: 'extractionOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
		options: [
			{
				displayName: 'Extract Text',
				name: 'extractText',
				type: 'boolean',
				default: true,
				description: 'Whether to extract text content from the PDF',
			},
			{
				displayName: 'Extract Images',
				name: 'extractImage',
				type: 'boolean',
				default: true,
				description: 'Whether to extract images from the PDF',
			},
		],
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
		options: [
			{
				displayName: 'Pages',
				name: 'pages',
				type: 'string',
				default: 'all',
				description: 'Specify pages to extract resources from. Use format: "1,2" for specific pages, "2-5" for page range, or "all" for all pages',
				placeholder: 'all, 1,2, 2-5, 1-3,5,7',
			},
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
 * Extract Resources - Extract text, images, and other resources from PDF documents using PDF4ME
 * Process: Read PDF document → Encode to base64 → Send API request → Poll for completion → Return extracted resources data
 * 
 * This action extracts various resources from PDF documents:
 * - Returns structured JSON data with all extracted resources (text, images, etc.)
 * - Supports various PDF document formats
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const extractionOptions = this.getNodeParameter('extractionOptions', index) as IDataObject;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const pagesOption = advancedOptions?.pages as string || 'all';

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

	// Process pages option and filter PDF content if needed
	if (pagesOption !== 'all') {
		docContent = await filterPdfPages.call(this, docContent, pagesOption);
	}

	// Handle both extractImage and extractImages properties for compatibility
	let extractImages = true;
	if (extractionOptions?.extractImage !== undefined) {
		extractImages = extractionOptions.extractImage as boolean;
	} else if (extractionOptions?.extractImages !== undefined) {
		extractImages = extractionOptions.extractImages as boolean;
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName,
		extractText: extractionOptions?.extractText !== undefined ? extractionOptions.extractText : true,
		extractImages,
		IsAsync: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make API call
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractResources', body);

	// Handle the response (extracted resources)
	if (responseData) {
		// Return both raw data and metadata
		return [
			{
				json: {
					...responseData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Resources extracted successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: docName,
						operation: 'extractResources',
					},
				},
			},
		];
	}

	// Error case - no response received
	throw new Error('No resource extraction results received from PDF4ME API');
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

/**
 * Filter PDF content to include only specified pages using PDF4ME ExtractPages API
 * @param base64Content - Base64 encoded PDF content
 * @param pagesOption - Pages specification (e.g., "1,2", "2-5", "all")
 * @returns Filtered base64 PDF content
 */
async function filterPdfPages(this: IExecuteFunctions, base64Content: string, pagesOption: string): Promise<string> {
	try {
		// Parse pages option
		const pageNumbers = parsePagesOption(pagesOption);
		
		if (pageNumbers.length === 0) {
			throw new Error('Invalid pages specification. Please use format: "1,2", "2-5", or "all"');
		}

		// Use PDF4ME ExtractPages API to get filtered PDF
		const extractPagesBody = {
			docContent: base64Content,
			docName: 'temp_filtered.pdf',
			pageNumbers: pageNumbers.join(','),
			IsAsync: true,
		};

		// Make API call to ExtractPages endpoint using the existing pdf4meApiRequest function
		const responseData = await pdf4meApiRequest.call(this, '/api/v2/Extract', extractPagesBody);

		// Convert response to base64
		if (responseData && responseData instanceof Buffer) {
			return responseData.toString('base64');
		} else if (typeof responseData === 'string') {
			// If it's already a string, it might be base64
			return responseData;
		} else {
			// Fallback: return original content if extraction fails
			// Note: Page filtering failed, using original PDF content
			return base64Content;
		}
	} catch (error) {
		// Note: Failed to filter PDF pages, using original content
		return base64Content;
	}
}

/**
 * Parse pages option string into array of page numbers
 * @param pagesOption - Pages specification string
 * @returns Array of page numbers (1-indexed)
 */
function parsePagesOption(pagesOption: string): number[] {
	const pages: number[] = [];
	const parts = pagesOption.split(',').map(part => part.trim());

	for (const part of parts) {
		if (part.includes('-')) {
			// Handle range (e.g., "2-5")
			const [start, end] = part.split('-').map(num => parseInt(num.trim()));
			if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
				for (let i = start; i <= end; i++) {
					pages.push(i);
				}
			}
		} else {
			// Handle single page number
			const pageNum = parseInt(part);
			if (!isNaN(pageNum) && pageNum > 0) {
				pages.push(pageNum);
			}
		}
	}

	// Remove duplicates and sort
	return [...new Set(pages)].sort((a, b) => a - b);
}

