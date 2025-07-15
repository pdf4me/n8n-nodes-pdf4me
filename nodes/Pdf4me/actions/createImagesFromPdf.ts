import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// Declare Node.js global
declare const Buffer: any;

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
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
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
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the PDF file to convert',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				inputDataType: ['filePath'],
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


		docContent = await downloadPdfFromUrl(pdfUrl);

	} else if (inputDataType === 'filePath') {
		// Use local file path - read the file and convert to base64
		const filePath = this.getNodeParameter('filePath', index) as string;

		// Validate file path (basic check)
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the PDF file.');
		}


		docContent = await readPdfFromFile(filePath);

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
		async: true,
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
		const fs = await import('fs');
		const path = await import('path');
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
		const debugPath = path.join('/tmp', 'pdf4me_createimages_response_debug.json');
		try {
			fs.writeFileSync(debugPath, JSON.stringify(debugLog, null, 2));
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
					fs.writeFileSync(path.join('/tmp', `pdf4me_createimages_problem_doc_${i + 1}.json`), JSON.stringify(imageDoc, null, 2));
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
					fs.writeFileSync(path.join('/tmp', `pdf4me_createimages_problem_doc_${i + 1}.json`), JSON.stringify(imageDoc, null, 2));
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
			const fs = await import('fs');
			const path = await import('path');
			const debugPath = path.join('/tmp', 'pdf4me_createimages_raw_response.json');
			try {
				fs.writeFileSync(debugPath, JSON.stringify(parsedResponse, null, 2));
			} catch (e) {
				// Ignore file write errors for debugging
			}
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
 * Download PDF from URL and convert to base64
 */
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	const https = await import('https');
	const http = await import('http');

	const parsedUrl = new URL(pdfUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	// Set up request options with timeout and user agent
	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000, // 30 seconds timeout
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'application/pdf,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			// Check for redirects
			if (res.statusCode >= 300 && res.statusCode < 400) {
				const location = res.headers.location;
				if (location) {
					reject(new Error(
						`URL redirects to: ${location}\n` +
						'Please use the final URL directly instead of the redirecting URL.',
					));
					return;
				}
			}

			// Check for error status codes
			if (res.statusCode !== 200) {
				reject(new Error(
					`HTTP Error ${res.statusCode}: ${res.statusMessage}\n` +
					'The server returned an error instead of the PDF file. ' +
					'This might indicate:\n' +
					'- The file doesn\'t exist\n' +
					'- Authentication is required\n' +
					'- The URL is incorrect\n' +
					'- Server is experiencing issues',
				));
				return;
			}

			const chunks: any[] = [];
			let totalSize = 0;

			res.on('data', (chunk: any) => {
				chunks.push(chunk);
				totalSize += chunk.length;

				// Check if we're getting too much data (likely HTML error page)
				if (totalSize > 1024 * 1024) { // 1MB limit
					req.destroy();
					reject(new Error(
						`Downloaded content is too large (${totalSize} bytes). ` +
						'This might be an HTML error page instead of a PDF file. ' +
						'Please check the URL and ensure it points directly to a PDF file.',
					));
				}
			});

			res.on('end', () => {
				if (totalSize === 0) {
					reject(new Error('Downloaded file is empty. Please check the URL.'));
					return;
				}

				// Combine chunks and convert to base64
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');

				// Validate the PDF content
				if (base64Content.length < 100) {
					reject(new Error(
						`Downloaded file is too small (${base64Content.length} base64 chars). ` +
						'Please ensure the URL points to a valid PDF file.',
					));
					return;
				}

				// Check if it starts with PDF header
				const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
				if (!decodedContent.startsWith('%PDF')) {
					// Try to get more info about what we actually downloaded
					const first100Chars = Buffer.from(base64Content, 'base64').toString('ascii', 0, 100);
					const isHtml = first100Chars.toLowerCase().includes('<html') ||
                                  first100Chars.toLowerCase().includes('<!doctype');

					let errorMessage = 'The downloaded file does not appear to be a valid PDF file. ' +
						'PDF files should start with "%PDF".\n\n' +
						`Downloaded content starts with: "${decodedContent}"\n\n`;

					if (isHtml) {
						errorMessage += 'The downloaded content appears to be HTML (likely an error page). ' +
							'This usually means:\n' +
							'1. The URL requires authentication\n' +
							'2. The file doesn\'t exist\n' +
							'3. The server is returning an error page\n' +
							'4. The URL is incorrect\n\n' +
							'Please check the URL and ensure it points directly to a PDF file.';
					} else {
						errorMessage += 'This might indicate:\n' +
							'1. The file is corrupted\n' +
							'2. The URL points to a different file type\n' +
							'3. The server is not serving the file correctly\n\n' +
							'Please verify the URL and try again.';
					}

					reject(new Error(errorMessage));
					return;
				}

				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Download timeout. The server took too long to respond.'));
		});

		req.end();
	});
}

/**
 * Read PDF from local file path and convert to base64
 */
async function readPdfFromFile(filePath: string): Promise<string> {
	const fs = await import('fs');

	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');

		// Validate the PDF content
		if (base64Content.length < 100) {
			throw new Error('PDF file appears to be too small. Please ensure the file is a valid PDF.');
		}

		// Check if it starts with PDF header
		const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
		if (!decodedContent.startsWith('%PDF')) {
			throw new Error(
				'The file does not appear to be a valid PDF file. ' +
				'PDF files should start with "%PDF".\n\n' +
				`File content starts with: "${decodedContent}"\n\n` +
				'This might indicate:\n' +
				'1. The file is corrupted\n' +
				'2. The file is not actually a PDF\n' +
				'3. The file path is incorrect\n\n' +
				'Please verify the file path and ensure it points to a valid PDF file.',
			);
		}

		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}\n\nPlease check the file path and ensure the file exists.`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}\n\nPlease check file permissions and ensure you have read access.`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
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