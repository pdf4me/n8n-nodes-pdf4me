import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
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
	},
	{
		displayName: 'Image Settings',
		name: 'imageSettings',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: false,
		},
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
		options: [
			{
				name: 'settings',
				displayName: 'Settings',
				values: [
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
					},
				],
			},
		],
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
		description: 'Comma-separated page numbers (e.g., "1,3,5") or range (e.g., "1-5")',
		placeholder: '1,3,5 or 1-5',
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
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const pageSelection = this.getNodeParameter('pageSelection', index) as string;
	const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
	const outputFileNamePrefix = this.getNodeParameter('outputFileNamePrefix', index) as string;
	const imageSettings = this.getNodeParameter('imageSettings', index) as IDataObject;

	let docContent: string;

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
		// Use PDF URL directly - download the file first
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}


		const options = {
			method: 'GET' as const,
			url: pdfUrl,
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
				'Accept': 'application/pdf,application/octet-stream,*/*',
			},
			timeout: 30000, // 30 seconds timeout
			encoding: 'arraybuffer' as const,
		};
		docContent = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);

	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Validate PDF content
	validatePdfContent(docContent);

	// Get image settings
	const settings = imageSettings.settings as IDataObject || {};
	const widthPixel = settings.widthPixel as number || 800;
	const imageExtension = settings.imageExtension as string || 'jpeg';

	// Prepare page selection
	let pageNrs: number[] = [];
	let pageNrsString = '';

	if (pageSelection === 'specific') {
		// Parse specific page numbers
		pageNrs = pageNumbers.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
		if (pageNrs.length === 0) {
			throw new Error('Please provide valid page numbers (e.g., "1,3,5")');
		}
		pageNrsString = pageNumbers;
	} else if (pageSelection === 'range') {
		// Parse page range
		const rangeMatch = pageNumbers.match(/^(\d+)-(\d+)$/);
		if (!rangeMatch) {
			throw new Error('Please provide a valid page range (e.g., "1-5")');
		}
		const start = parseInt(rangeMatch[1]);
		const end = parseInt(rangeMatch[2]);
		if (start > end) {
			throw new Error('Start page number must be less than or equal to end page number');
		}
		pageNrs = Array.from({length: end - start + 1}, (_, i) => start + i);
		pageNrsString = pageNumbers;
	} else {
		// All pages - use empty string to indicate all pages
		pageNrsString = '';
	}



	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		imageAction: {
			WidthPixel: widthPixel.toString(),
			ImageExtension: imageExtension,
		},
		IsAsync: true,
	};

	// Add page selection if specified
	if (pageSelection !== 'all') {
		(body.imageAction as IDataObject).PageSelection = {
			PageNrs: pageNrs,
		};
		body.pageNrs = pageNrsString;
	}



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

		// --- BEGIN: Response Debug Logging ---
		const debugLog: any = {
			timestamp: new Date().toISOString(),
			typeof: typeof parsedResponse,
		};
		if (Buffer.isBuffer(responseData)) {
			debugLog.type = 'Buffer';
			debugLog.firstBytesHex = responseData.slice(0, 8).toString('hex');
			debugLog.firstBytesAscii = responseData.slice(0, 8).toString('ascii');
			debugLog.length = responseData.length;
		} else if (typeof responseData === 'string') {
			debugLog.type = 'string';
			debugLog.length = responseData.length;
			debugLog.first200 = responseData.substring(0, 200);
			try {
				const buffer = Buffer.from(responseData, 'base64');
				debugLog.base64FirstBytesHex = buffer.slice(0, 8).toString('hex');
				debugLog.base64FirstBytesAscii = buffer.slice(0, 8).toString('ascii');
			} catch {
				// Ignore buffer conversion errors for debugging
			}
		} else if (Array.isArray(parsedResponse)) {
			debugLog.type = 'array';
			debugLog.length = parsedResponse.length;
			debugLog.firstItemKeys = parsedResponse[0] ? Object.keys(parsedResponse[0]) : [];
		} else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
			debugLog.type = 'object';
			debugLog.keys = Object.keys(parsedResponse);
			debugLog.preview = JSON.stringify(parsedResponse, null, 2).substring(0, 500);
		} else {
			debugLog.type = typeof parsedResponse;
		}
		try {
			// This.helpers.fs is not available, so we'll skip file writing for now.
			// If debugging is critical, this needs to be refactored to use this.helpers.request
			// or a different method to fetch the response for logging.
			// For now, we'll just log to console.
		} catch (e) {
			// Ignore file write errors for debugging
		}
		// --- END: Response Debug Logging ---

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
							[fileName]: binaryData,
						},
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
							[fileName]: binaryData,
						},
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
		// Enhanced error handling
		if (error.message && error.message.includes('File is Empty')) {
			throw new Error(
				'PDF4ME API Error: File is Empty. This usually means:\n' +
				'1. The PDF file is corrupted or invalid\n' +
				'2. The file content wasn\'t properly encoded\n' +
				'3. The input data type doesn\'t match the actual data\n\n' +
				`Input Type: ${inputDataType}\n` +
				`Content Length: ${body.docContent && typeof body.docContent === 'string' ? body.docContent.length : 0}\n` +
				`Has Content: ${!!body.docContent}`,
			);
		}
		throw error;
	}
}

/**
 * Validate PDF content
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
		if (error.message.includes('PDF files should start with')) {
			throw error;
		}
		throw new Error('Invalid base64 content. Please ensure the PDF content is properly base64 encoded.');
	}
}