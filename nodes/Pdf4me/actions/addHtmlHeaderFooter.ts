import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add HTML header/footer to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
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
				operation: [ActionConstants.AddHtmlHeaderFooter],
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
				operation: [ActionConstants.AddHtmlHeaderFooter],
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
		description: 'URL to the PDF file to add HTML header/footer to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
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
		description: 'Local file path to the PDF file to add HTML header/footer to',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_header_footer.pdf',
		description: 'Name for the output PDF file with HTML header/footer',
		placeholder: 'my-document-with-header-footer.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'HTML Content',
		name: 'htmlContent',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '<div style="text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;">Document Header PDF4me</div>',
		description: 'HTML content to add as header or footer (plain HTML, not base64)',
		placeholder: '<div style="text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;">Document Header</div>',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'options',
		required: true,
		default: 'Header',
		description: 'Where to place the HTML content',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
		options: [
			{
				name: 'Header',
				value: 'Header',
				description: 'Add HTML content as header',
			},
			{
				name: 'Footer',
				value: 'Footer',
				description: 'Add HTML content as footer',
			},
			{
				name: 'Both',
				value: 'Both',
				description: 'Add HTML content as both header and footer',
			},
		],
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		description: 'Page options: empty for all pages, "1" for page 1, "1,3,5" for specific pages, "2-5" for range, "1,3,7-10" for mixed, "2-" for from page 2',
		placeholder: '1,3,5 or 2-5 or leave empty for all pages',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Skip First Page',
		name: 'skipFirstPage',
		type: 'boolean',
		default: false,
		description: 'Whether to skip adding header/footer to the first page',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Margins',
		name: 'margins',
		type: 'collection',
		placeholder: 'Add Margin',
		default: {},
		description: 'Margin settings for the HTML header/footer',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
		options: [
			{
				displayName: 'Left Margin',
				name: 'marginLeft',
				type: 'number',
				default: 20,
				description: 'Left margin in pixels',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Right Margin',
				name: 'marginRight',
				type: 'number',
				default: 20,
				description: 'Right margin in pixels',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Top Margin',
				name: 'marginTop',
				type: 'number',
				default: 50,
				description: 'Top margin in pixels',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Bottom Margin',
				name: 'marginBottom',
				type: 'number',
				default: 50,
				description: 'Bottom margin in pixels',
				typeOptions: {
					minValue: 0,
					maxValue: 1000,
				},
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
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
			{
				displayName: 'Use Async Processing',
				name: 'useAsync',
				type: 'boolean',
				default: true,
				description: 'Whether to use asynchronous processing for better handling of large files',
			},
		],
	},
];

/**
 * Add HTML content as header or footer to a PDF document using PDF4Me API
 * Process: Read PDF → Encode to base64 → Send API request → Poll for completion → Save PDF with HTML header/footer
 * This action allows adding HTML content as headers, footers, or both to PDF documents
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const htmlContent = this.getNodeParameter('htmlContent', index) as string;
	const location = this.getNodeParameter('location', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const skipFirstPage = this.getNodeParameter('skipFirstPage', index) as boolean;
	const margins = this.getNodeParameter('margins', index) as IDataObject;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const useAsync = advancedOptions?.useAsync !== false; // Default to true

	let docContent: string;

	// Handle different input data types for the main PDF
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
				'Common property names are "data" for file uploads or the filename without extension.'
			);
		}

		docContent = item[0].binary[binaryPropertyName].data;
	} else if (inputDataType === 'base64') {
		// Get PDF content from base64 string
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		// Download PDF from URL
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		docContent = await downloadPdfFromUrl(pdfUrl);
	} else if (inputDataType === 'filePath') {
		// Read PDF from local file path
		const filePath = this.getNodeParameter('filePath', index) as string;
		docContent = await readPdfFromFile(filePath);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	validatePdfContent(docContent, inputDataType);

	// Build the request body
	const body: IDataObject = {
		docContent: docContent,
		docName: outputFileName,
		htmlContent: htmlContent,
		pages: pages,
		location: location,
		skipFirstPage: skipFirstPage,
	};

	// Add margins if provided
	if (margins.marginLeft !== undefined) body.marginLeft = margins.marginLeft;
	if (margins.marginRight !== undefined) body.marginRight = margins.marginRight;
	if (margins.marginTop !== undefined) body.marginTop = margins.marginTop;
	if (margins.marginBottom !== undefined) body.marginBottom = margins.marginBottom;

	// Add custom profiles if provided
	if (advancedOptions.profiles) {
		try {
			const profiles = JSON.parse(advancedOptions.profiles as string);
			sanitizeProfiles(profiles);
			Object.assign(body, profiles);
		} catch (error) {
			throw new Error(`Invalid custom profiles JSON: ${error}`);
		}
	}

	// Make the API request
	let result: any;
	if (useAsync) {
		result = await pdf4meAsyncRequest.call(this, '/api/v2/AddHtmlHeaderFooter', body);
	} else {
		result = await pdf4meApiRequest.call(this, '/api/v2/AddHtmlHeaderFooter', body);
	}

	// Return the result as binary data
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		'application/pdf',
	);

	return [
		{
			json: {
				success: true,
				message: 'PDF with HTML header/footer created successfully',
				fileName: outputFileName,
				mimeType: 'application/pdf',
				fileSize: result.length,
				location: location,
				htmlContent: htmlContent,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}

/**
 * Download PDF content from a URL
 */
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	const https = require('https');
	const http = require('http');

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
			// Check for error status codes
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
				return;
			}

			const chunks: any[] = [];
			let totalSize = 0;

			res.on('data', (chunk: any) => {
				chunks.push(chunk);
				totalSize += chunk.length;
			});

			res.on('end', () => {
				if (totalSize === 0) {
					reject(new Error('Downloaded file is empty. Please check the URL.'));
					return;
				}

				// Combine chunks and convert to base64
				const buffer = Buffer.concat(chunks);
				resolve(buffer.toString('base64'));
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
 * Read PDF content from a local file path
 */
async function readPdfFromFile(filePath: string): Promise<string> {
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		return fileBuffer.toString('base64');
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
}

/**
 * Validate PDF content
 */
function validatePdfContent(docContent: string, inputDataType: string): void {
	if (!docContent || docContent.trim() === '') {
		throw new Error(`Empty PDF content provided via ${inputDataType}`);
	}

	// Basic validation for base64 content
	if (inputDataType === 'base64') {
		try {
			Buffer.from(docContent, 'base64');
		} catch (error) {
			throw new Error('Invalid base64 encoded PDF content');
		}
	}
} 