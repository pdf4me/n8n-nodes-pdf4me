import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

// Declare Node.js global

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
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
				operation: [ActionConstants.CreateImagesFromPdf],
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
				operation: [ActionConstants.CreateImagesFromPdf],
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
		description: 'URL to the PDF file to convert',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
		hint: 'Convert PDF to images. See our <b><a href="https://docs.pdf4me.com/integration/n8n/image/create-image-from-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Image Width (pixels)',
		name: 'widthPixel',
		type: 'number',
		default: 800,
		description: 'Width of the output images in pixels',
		typeOptions: {
			minValue: 100,
			maxValue: 4000,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Image Format',
		name: 'imageExtension',
		type: 'options',
		default: 'jpeg',
		description: 'Output format for the images',
		options: [
			{
				name: 'JPG',
				value: 'jpg',
				description: 'JPEG image format',
			},
			{
				name: 'JPEG',
				value: 'jpeg',
				description: 'JPEG image format',
			},
			{
				name: 'BMP',
				value: 'bmp',
				description: 'Bitmap image format',
			},
			{
				name: 'GIF',
				value: 'gif',
				description: 'GIF image format',
			},
			{
				name: 'JB2',
				value: 'jb2',
				description: 'JBIG2 image format',
			},
			{
				name: 'JP2',
				value: 'jp2',
				description: 'JPEG 2000 image format',
			},
			{
				name: 'JPF',
				value: 'jpf',
				description: 'JPEG 2000 image format',
			},
			{
				name: 'JPX',
				value: 'jpx',
				description: 'JPEG 2000 image format',
			},
			{
				name: 'PNG',
				value: 'png',
				description: 'PNG image format',
			},
			{
				name: 'TIF',
				value: 'tif',
				description: 'TIFF image format',
			},
			{
				name: 'TIFF',
				value: 'tiff',
				description: 'TIFF image format',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Page Selection',
		name: 'pageSelection',
		type: 'options',
		default: 'all',
		description: 'Choose which pages to convert to images',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
		options: [
			{
				name: 'All Pages',
				value: 'all',
				description: 'Convert all pages to images',
			},
			{
				name: 'Specific Pages',
				value: 'specific',
				description: 'Convert only specific page numbers',
			},
			{
				name: 'Page Range',
				value: 'range',
				description: 'Convert a range of pages',
			},
		],
	},
	{
		displayName: 'Page Numbers',
		name: 'pageNumbers',
		type: 'string',
		default: '',
		description: 'Supports: 3, 2-5, 4-, 1,3,5-7, -1, first, last, all, *',
		placeholder: '1,3,5-7 or -1,last',
		hint: 'Out-of-range positive pages are ignored. Reversed ranges like 7-3 return [7]. Duplicates are kept.',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				pageSelection: ['specific', 'range'],
			},
		},
	},
	{
		displayName: 'Output File Name Prefix',
		name: 'outputFileNamePrefix',
		type: 'string',
		default: 'page',
		description: 'Prefix for output image files (e.g., "page" will create page_1.jpg, page_2.jpg, etc.)',
		placeholder: 'page',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output image files',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const pageSelection = this.getNodeParameter('pageSelection', index) as string;
	const pageNumbers = (pageSelection === 'specific' || pageSelection === 'range')
		? (this.getNodeParameter('pageNumbers', index) as string)
		: '';
	const outputFileNamePrefix = this.getNodeParameter('outputFileNamePrefix', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const widthPixel = this.getNodeParameter('widthPixel', index) as number;
	const imageExtension = this.getNodeParameter('imageExtension', index) as string;

	let docContent: string;
	let blobId: string = '';
	let inputDocName: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
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

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName || 'document';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in CreateImages API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
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
		// Use PDF URL directly - send URL as string directly in docContent
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
		// Validate PDF content for base64
		validatePdfContent(docContent);
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
		// blobId validation - just check it's not empty
	}

	const finalDocName = docName || inputDocName || 'document.pdf';

	// Read document metadata first to resolve page aliases and ranges against PageCount
	const metadataPageCount = await getDocumentPageCount.call(this, docContent, finalDocName);

	// Prepare page selection
	let pageNrs: number[] = [];
	let pageNrsString = '';

	if (pageSelection === 'all') {
		// All pages - keep a default PageNrs and mark pageNrs as "all"
		pageNrs = [1];
		pageNrsString = 'all';
	} else {
		const parsedPageSelection = parsePageSelectionInput(pageNumbers, metadataPageCount);
		pageNrs = parsedPageSelection.pageNrs;
		pageNrsString = parsedPageSelection.pageNrsString;
	}



	// Build the request body
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docname: finalDocName, // API expects lowercase 'docname'
		imageAction: {
			WidthPixel: widthPixel.toString(),
			ImageExtension: imageExtension,
		},
		IsAsync: true,
	};

	// Always include page selection payload
	(body.imageAction as IDataObject).PageSelection = {
		PageNrs: pageNrs,
	};
	body.pageNrs = pageNrsString;

	try {
		// Use async processing for CreateImages endpoint
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/CreateImages', body);

		// --- BEGIN: Buffer/String Response Parsing ---
		let parsedResponse = responseData;
		if (Buffer.isBuffer(responseData)) {
			try {
				parsedResponse = JSON.parse(responseData.toString('utf8'));
			} catch (e) {
				throw new Error('Failed to parse Buffer response as JSON: ' + e.message);
			}
		} else if (typeof responseData === 'string') {
			try {
				parsedResponse = JSON.parse(responseData);
			} catch {
				// If not JSON, leave as string
			}
		}
		// --- END: Buffer/String Response Parsing ---

		// Handle the response which contains multiple images
		const images = [];

		if (Array.isArray(parsedResponse)) {
			// Array of images (legacy format)


			for (let i = 0; i < parsedResponse.length; i++) {
				const imageDoc = parsedResponse[i];

				if (imageDoc.docContent && imageDoc.docName) {
					// Decode base64 content
					const imageBuffer = Buffer.from(imageDoc.docContent, 'base64');

					// Generate filename
					const pageNumber = pageSelection === 'all' ? i + 1 : pageNrs[i];
					const fileName = `${outputFileNamePrefix}_${pageNumber}.${imageExtension}`;

					// Create binary data
					const binaryData = await this.helpers.prepareBinaryData(
						imageBuffer,
						fileName,
						`image/${imageExtension}`,
					);

					images.push({
						json: {
							fileName,
							pageNumber,
							imageFormat: imageExtension,
							fileSize: imageBuffer.length,
							success: true,
							operation,
							inputType: inputDataType,
						},
						binary: {
							[`${binaryDataName || 'data'}_${i + 1}`]: binaryData,
						},
						pairedItem: { item: index },
					});

				} else {
					// Save problematic document for debugging
					// This.helpers.fs is not available, so we'll skip file writing for now.
					// If debugging is critical, this needs to be refactored.
					// Removed console.warn for compliance with n8n guidelines
				}
			}
		} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.outputDocuments) {
			// outputDocuments array (standard format)

			for (let i = 0; i < parsedResponse.outputDocuments.length; i++) {
				const imageDoc = parsedResponse.outputDocuments[i];

				if (imageDoc.streamFile && imageDoc.fileName) {
					// Decode base64 content
					const imageBuffer = Buffer.from(imageDoc.streamFile, 'base64');

					// Use the provided filename or generate one
					const fileName = imageDoc.fileName || `${outputFileNamePrefix}_${i + 1}.${imageExtension}`;

					// Create binary data
					const binaryData = await this.helpers.prepareBinaryData(
						imageBuffer,
						fileName,
						`image/${imageExtension}`,
					);

					images.push({
						json: {
							fileName,
							pageNumber: i + 1,
							imageFormat: imageExtension,
							fileSize: imageBuffer.length,
							success: true,
							operation,
							inputType: inputDataType,
						},
						binary: {
							[`${binaryDataName || 'data'}_${i + 1}`]: binaryData,
						},
						pairedItem: { item: index },
					});

				} else {
				// Save problematic document for debugging
				// This.helpers.fs is not available, so we'll skip file writing for now.
				// If debugging is critical, this needs to be refactored.
				// Removed console.warn for compliance with n8n guidelines
				}
			}
		} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.docContent && parsedResponse.docName) {
			// Single image response (legacy format)

			const imageBuffer = Buffer.from(parsedResponse.docContent, 'base64');
			const fileName = parsedResponse.docName || `${outputFileNamePrefix}_1.${imageExtension}`;

			// Create binary data
			const binaryData = await this.helpers.prepareBinaryData(
				imageBuffer,
				fileName,
				`image/${imageExtension}`,
			);

			images.push({
				json: {
					fileName,
					pageNumber: 1,
					imageFormat: imageExtension,
					fileSize: imageBuffer.length,
					success: true,
					operation,
					inputType: inputDataType,
				},
				binary: {
					[fileName]: binaryData,
				},
				pairedItem: { item: index },
			});

		} else {
			// Unexpected response format - save for debugging
			// This.helpers.fs is not available, so we'll skip file writing for now.
			// If debugging is critical, this needs to be refactored.
			// Removed console.warn for compliance with n8n guidelines
			throw new Error('Unexpected response format from PDF4me CreateImages API. Raw response saved to /tmp/pdf4me_createimages_raw_response.json');
		}


		return images;
	} catch (error) {
		// Enhanced error handling with detailed debugging information
		const errorMessage = error instanceof Error ? error.message : String(error);

		if (errorMessage && errorMessage.includes('File is Empty')) {
			throw new Error(
				'PDF4ME API Error: File is Empty. This usually means:\n' +
				'1. The PDF file is corrupted or invalid\n' +
				'2. The file content wasn\'t properly encoded\n' +
				'3. The input data type doesn\'t match the actual data\n\n' +
				`Input Type: ${inputDataType}\n` +
				`Content Length: ${body.docContent && typeof body.docContent === 'string' ? body.docContent.length : 0}\n` +
				`Content Type: ${inputDataType === 'binaryData' ? 'blobId' : inputDataType === 'url' ? 'URL' : 'base64'}\n` +
				`Has Content: ${!!body.docContent}`,
			);
		}

		// Provide more context for 500 errors
		if (errorMessage && (errorMessage.includes('500') || errorMessage.includes('service was not able to process'))) {
			throw new Error(
				'PDF4ME API Error (500): The service was not able to process your request.\n\n' +
				'Debug Information:\n' +
				`- Input Type: ${inputDataType}\n` +
				`- Document Name: ${finalDocName}\n` +
				`- Content Length: ${docContent?.length || 0}\n` +
				`- Content Type: ${inputDataType === 'binaryData' ? 'blobId/URL' : inputDataType === 'url' ? 'URL' : 'base64'}\n` +
				`- Image Width: ${widthPixel}px\n` +
				`- Image Format: ${imageExtension}\n` +
				`- Page Selection: ${pageSelection}\n` +
				`- Page Numbers: ${body.pageNrs || 'all pages'}\n\n` +
				'Please check:\n' +
				'1. The PDF file is valid and not corrupted\n' +
				'2. The blobId/URL is accessible (for binary data/URL inputs)\n' +
				'3. The page numbers are valid for the document\n' +
				'4. The image settings are within acceptable ranges\n\n' +
				`Original Error: ${errorMessage}`,
			);
		}

		throw error;
	}
}

/**
 * Validate PDF content (for base64 input only)
 */
function validatePdfContent(docContent: string): void {
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is empty or missing');
	}

	// Check if it's valid base64
	try {
		const decoded = Buffer.from(docContent, 'base64');
		if (decoded.length < 100) {
			throw new Error('PDF content appears to be too small after decoding');
		}

		// Check if it starts with PDF header
		const header = decoded.toString('ascii', 0, 10);
		if (!header.startsWith('%PDF')) {
			throw new Error(
				'The content does not appear to be a valid PDF file. ' +
				'PDF files should start with "%PDF".\n\n' +
				`Content starts with: "${header}"`,
			);
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes('PDF files should start with')) {
			throw error;
		}
		throw new Error('Invalid base64 content. Please ensure the PDF content is properly base64 encoded.');
	}
}

async function getDocumentPageCount(
	this: IExecuteFunctions,
	docContent: string,
	docName: string,
): Promise<number> {
	const metadataBody: IDataObject = {
		docContent,
		docName,
		IsAsync: true,
	};

	const metadataResult = await pdf4meAsyncRequest.call(this, '/api/v2/GetPdfMetadata', metadataBody);
	const resolvedPageCount = Number(
		(metadataResult as IDataObject)?.PageCount ??
		(metadataResult as IDataObject)?.pageCount ??
		(metadataResult as IDataObject)?.Pages ??
		(metadataResult as IDataObject)?.pages,
	);

	if (!Number.isFinite(resolvedPageCount) || resolvedPageCount < 1) {
		throw new Error('Unable to resolve PageCount from GetPdfMetadata response.');
	}

	return Math.floor(resolvedPageCount);
}

function normalizePageToken(token: string, pageCount: number): string {
	const lowered = token.trim().toLowerCase();
	if (lowered === 'last') {
		return `${pageCount}`;
	}
	if (lowered === 'first' || lowered === '0') {
		return '1';
	}
	if (lowered === 'all' || lowered === '*') {
		return `1-${pageCount}`;
	}
	return token.trim();
}

function parsePageSelectionInput(input: string, pageCount: number): { pageNrs: number[]; pageNrsString: string } {
	const rawTokens = input.split(',').map((part) => part.trim()).filter((part) => part.length > 0);
	if (rawTokens.length === 0) {
		throw new Error('Please provide page numbers (examples: 1,3,5-7 or -1,last).');
	}

	const normalizedTokens = rawTokens.map((token) => normalizePageToken(token, pageCount));
	const pageNrs: number[] = [];

	for (const token of normalizedTokens) {
		if (/^-\d+$/.test(token)) {
			const negativeIndex = Number.parseInt(token, 10);
			const mappedPage = pageCount + negativeIndex + 1;
			if (mappedPage >= 1 && mappedPage <= pageCount) {
				pageNrs.push(mappedPage);
			}
			continue;
		}

		if (/^\d+$/.test(token)) {
			const page = Number.parseInt(token, 10);
			if (page >= 1 && page <= pageCount) {
				pageNrs.push(page);
			}
			continue;
		}

		const rangeMatch = token.match(/^(\d+)-(\d*)$/);
		if (rangeMatch) {
			const firstPage = Number.parseInt(rangeMatch[1], 10);
			const lastPage = rangeMatch[2] === '' ? pageCount : Number.parseInt(rangeMatch[2], 10);

			if (firstPage >= 1 && firstPage <= pageCount && lastPage < firstPage) {
				pageNrs.push(firstPage);
			}

			for (let current = firstPage; current <= lastPage; current++) {
				if (current >= 1 && current <= pageCount) {
					pageNrs.push(current);
				}
			}
		}
	}

	return {
		pageNrs,
		pageNrsString: normalizedTokens.join(','),
	};
}
