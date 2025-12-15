import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
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
		hint: 'Extract resources from PDF. See our <b><a href="https://docs.pdf4me.com/n8n/extract/extract-resources/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Extract Text',
		name: 'extractText',
		type: 'boolean',
		default: true,
		description: 'Whether to extract text content from the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
	},
	{
		displayName: 'Extract Images',
		name: 'extractImage',
		type: 'boolean',
		default: false,
		description: 'Whether to extract images from the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
	},
	{
		displayName: 'Return Images as Binary',
		name: 'returnImagesAsBinary',
		type: 'boolean',
		default: false,
		description: 'Whether to return extracted images as binary data in addition to JSON metadata',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
			},
		},
	},
	{
		displayName: 'Binary Data Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'image',
		description: 'Name for the binary data property in the output',
		placeholder: 'image',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractResources],
				returnImagesAsBinary: [true],
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
 * - Optionally returns extracted images as binary data for direct use in n8n
 * - Supports various PDF document formats
 * - Always processes asynchronously for optimal performance
 * - Returns both JSON metadata and binary image data when requested
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const extractText = this.getNodeParameter('extractText', index) as boolean;
	const extractImage = this.getNodeParameter('extractImage', index) as boolean;
	const returnImagesAsBinary = this.getNodeParameter('returnImagesAsBinary', index) as boolean;
	const binaryDataName = returnImagesAsBinary ? this.getNodeParameter('binaryDataName', index) as string : 'image';
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const pagesOption = advancedOptions?.pages as string || 'all';

	let docContent: string;
	let blobId: string = '';
	let inputDocName: string = '';

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

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName || 'document.pdf';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ExtractResources API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(pdfUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	// Process pages option and filter PDF content if needed
	// Note: filterPdfPages now accepts blobId, base64, or URL - API handles all types
	if (pagesOption !== 'all') {
		docContent = await filterPdfPages.call(this, docContent, pagesOption, inputDataType);
	}

	// Prepare request body
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'document.pdf';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		extractText: extractText || false,
		extractImages: extractImage || false,
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
		const result: any = {
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
		};

		// Process images as binary data if requested
		if (returnImagesAsBinary && extractImage) {
			const binaryData = await processImagesAsBinary.call(this, responseData, binaryDataName);
			if (binaryData && Object.keys(binaryData).length > 0) {
				result.binary = binaryData;
			}
		}

		return [result];
	}

	// Error case - no response received
	throw new Error('No resource extraction results received from PDF4ME API');
}

/**
 * Filter PDF content to include only specified pages using PDF4ME ExtractPages API
 * @param docContent - PDF content (blobId, base64 string, or URL string)
 * @param pagesOption - Pages specification (e.g., "1,2", "2-5", "all")
 * @param inputDataType - Original input data type (binaryData, base64, or url) - for reference
 * @returns Filtered PDF content as base64 string (ExtractPages always returns base64 PDF)
 */
async function filterPdfPages(this: IExecuteFunctions, docContent: string, pagesOption: string, inputDataType: string): Promise<string> {
	try {
		// Parse pages option
		const pageNumbers = parsePagesOption(pagesOption);

		if (pageNumbers.length === 0) {
			throw new Error('Invalid pages specification. Please use format: "1,2", "2-5", or "all"');
		}

		// Use PDF4ME ExtractPages API to get filtered PDF
		// API accepts blobId, base64, or URL - pass through the same format
		const extractPagesBody = {
			docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
			docName: 'temp_filtered.pdf',
			pageNumbers: pageNumbers.join(','),
			IsAsync: true,
		};

		// Make API call to ExtractPages endpoint using the existing pdf4meAsyncRequest function
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Extract', extractPagesBody);

		// Convert response to base64 (ExtractPages always returns base64 PDF)
		if (responseData && responseData instanceof Buffer) {
			return responseData.toString('base64');
		} else if (typeof responseData === 'string') {
			// If it's already a string, it might be base64
			return responseData;
		} else {
			// Fallback: return original content if extraction fails
			// Note: Page filtering failed, using original PDF content
			return docContent;
		}
	} catch (error) {
		// Note: Failed to filter PDF pages, using original content
		return docContent;
	}
}

/**
 * Process images from API response and convert them to binary data
 * @param responseData - API response data containing extracted resources
 * @param binaryDataName - Name for the binary data property
 * @returns Object containing binary data for images
 */
async function processImagesAsBinary(this: IExecuteFunctions, responseData: any, binaryDataName: string): Promise<IDataObject> {
	const binaryData: IDataObject = {};
	let imageIndex = 1;

	try {
		// Handle different response structures that might contain images
		if (responseData && typeof responseData === 'object') {
			// Check for images in various possible locations in the response
			const imageSources = [
				responseData.images,
				responseData.extractedImages,
				responseData.resources?.images,
				responseData.outputDocuments,
			].filter(Boolean);

			for (const imageSource of imageSources) {
				if (Array.isArray(imageSource)) {
					for (const imageItem of imageSource) {
						if (imageItem && (imageItem.streamFile || imageItem.data || imageItem.content)) {
							const imageBuffer = await processImageItem(imageItem);
							if (imageBuffer) {
								const fileName = imageItem.fileName || imageItem.name || `extracted_image_${imageIndex}.png`;
								const mimeType = getImageMimeType(fileName, imageItem.mimeType);

								const binaryDataItem = await this.helpers.prepareBinaryData(
									imageBuffer,
									fileName,
									mimeType,
								);

								binaryData[`${binaryDataName}_${imageIndex}`] = binaryDataItem;
								imageIndex++;
							}
						}
					}
				} else if (imageSource && typeof imageSource === 'object') {
					// Handle single image object
					if (imageSource.streamFile || imageSource.data || imageSource.content) {
						const imageBuffer = await processImageItem(imageSource);
						if (imageBuffer) {
							const fileName = imageSource.fileName || imageSource.name || `extracted_image_${imageIndex}.png`;
							const mimeType = getImageMimeType(fileName, imageSource.mimeType);

							const binaryDataItem = await this.helpers.prepareBinaryData(
								imageBuffer,
								fileName,
								mimeType,
							);

							binaryData[`${binaryDataName}_${imageIndex}`] = binaryDataItem;
							imageIndex++;
						}
					}
				}
			}
		}
	} catch (error) {
		// Log error but don't fail the entire operation
		// Note: Error handling follows n8n guidelines
	}

	return binaryData;
}

/**
 * Process a single image item and return buffer
 * @param imageItem - Image item from API response
 * @returns Buffer containing image data
 */
async function processImageItem(imageItem: any): Promise<Buffer | null> {
	try {
		if (imageItem.streamFile) {
			// Base64 encoded image data
			return Buffer.from(imageItem.streamFile, 'base64');
		} else if (imageItem.data) {
			// Direct base64 data
			return Buffer.from(imageItem.data, 'base64');
		} else if (imageItem.content) {
			// Content field
			return Buffer.from(imageItem.content, 'base64');
		} else if (imageItem.url) {
			// URL to image - would need to download
			// This is a placeholder for future implementation
			return null;
		}
	} catch (error) {
		// Return null if processing fails
		return null;
	}
	return null;
}

/**
 * Get MIME type for image based on filename or provided type
 * @param fileName - Name of the file
 * @param providedMimeType - MIME type if provided
 * @returns MIME type string
 */
function getImageMimeType(fileName: string, providedMimeType?: string): string {
	if (providedMimeType) {
		return providedMimeType;
	}

	const extension = fileName.toLowerCase().split('.').pop();
	switch (extension) {
	case 'jpg':
	case 'jpeg':
		return 'image/jpeg';
	case 'png':
		return 'image/png';
	case 'gif':
		return 'image/gif';
	case 'bmp':
		return 'image/bmp';
	case 'webp':
		return 'image/webp';
	case 'svg':
		return 'image/svg+xml';
	default:
		return 'image/png'; // Default fallback
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

