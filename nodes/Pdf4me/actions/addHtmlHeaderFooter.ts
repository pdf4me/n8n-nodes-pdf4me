import type { INodeProperties, INodeExecutionData } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

/**
 * Add HTML Header Footer to PDF - PDF4Me API Implementation
 *
 * API Endpoint: POST /api/v2/AddHtmlHeaderFooter
 *
 * Request Structure (based on Python example):
 * {
 *   "docContent": "base64_content",	// Required: Base64 encoded PDF content
 *   "docName": "output.pdf",		   // Required: Output PDF file name
 *   "htmlContent": "<div>header</div>", // Required: HTML content (plain HTML, not base64)
 *   "pages": "1",					  // Required: Page options: "", "1", "1,3,5", "2-5", "1,3,7-10", "2-"
 *   "location": "Header",			  // Required: Location options: "Header", "Footer", "Both"
 *   "skipFirstPage": false,			// Required: Skip first page (true/false)
 *   "marginLeft": 2.01,				// Required: Left margin in pixels (double)
 *   "marginRight": 2.01,			   // Required: Right margin in pixels (double)
 *   "marginTop": 3.01,				 // Required: Top margin in pixels (double)
 *   "marginBottom": 5.01,			  // Required: Bottom margin in pixels (double)
 * }
 *
 * Response Handling:
 * - 200: Immediate success, returns PDF with HTML header/footer as binary data
 * - 202: Async processing, requires polling Location header for completion
 *
 * This implementation supports multiple input methods:
 * - Binary data from previous nodes
 * - Base64 encoded strings
 * - URLs to PDF files
 * - Local file paths
 */

// Make Node.js globals available
// declare const URL: any;
// declare const console: any;
// declare const process: any;

// Simplified debug configuration
interface DebugConfig {
	enabled: boolean;
	logLevel: 'none' | 'basic' | 'detailed';
	logToConsole?: boolean;
}

// Simplified debug logger class
class DebugLogger {
	private config: DebugConfig;

	constructor(config: DebugConfig) {
		this.config = config;
	}

	log(level: string, message: string, data?: any): void {
		if (!this.config.enabled) return;



		if (this.config.logToConsole !== false) {
			if (data) {
				// Log data if needed
			}
		}
	}
}

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
		displayName: 'HTML Content',
		name: 'htmlContent',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '<div style="text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;">Document Header PDF4me</div>',
		description: 'HTML content to be added as header/footer (plain HTML, not base64)',
		placeholder: '<div style="text-align: center; font-family: Arial; font-size: 12px; color: #FF0000;">Document Header</div>',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
		hint: 'Add HTML header/footer to your PDF. See our <b><a href="https://docs.pdf4me.com/n8n/edit/add-html-header-footer-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'options',
		required: true,
		default: 'Header',
		description: 'Location where to add the HTML content',
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
		required: true,
		default: '',
		description: 'Specify page indices as comma-separated values or ranges to process (e.g. "0, 1, 2-" or "1, 2, 3-7"). Leave empty for all pages.',
		placeholder: '1,3,5 or 2-5 or 1,3,7-10 or 2-',
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
		required: true,
		default: false,
		description: 'Whether to skip adding HTML header/footer to the first page',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Margin Left (Px)',
		name: 'marginLeft',
		type: 'number',
		required: true,
		default: 20.0,
		typeOptions: {
			minValue: 0,
			numberStepSize: 0.1,
		},
		description: 'Left margin in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Margin Right (Px)',
		name: 'marginRight',
		type: 'number',
		required: true,
		default: 20.0,
		typeOptions: {
			minValue: 0,
			numberStepSize: 0.1,
		},
		description: 'Right margin in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Margin Top (Px)',
		name: 'marginTop',
		type: 'number',
		required: true,
		default: 50.0,
		typeOptions: {
			minValue: 0,
			numberStepSize: 0.1,
		},
		description: 'Top margin in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Margin Bottom (Px)',
		name: 'marginBottom',
		type: 'number',
		required: true,
		default: 50.0,
		typeOptions: {
			minValue: 0,
			numberStepSize: 0.1,
		},
		description: 'Bottom margin in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_html_header_footer.pdf',
		description: 'Name for the output PDF file with HTML header/footer',
		placeholder: 'my-document-with-header-footer.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
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
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Debug Mode',
		name: 'debugMode',
		type: 'boolean',
		default: false,
		description: 'Enable debug logging for troubleshooting',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'pdf-with-header-footer',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddHtmlHeaderFooter],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const logger = new DebugLogger({
		enabled: this.getNodeParameter('debugMode', index, false) as boolean,
		logLevel: 'basic',
		logToConsole: true,
	});

	logger.log('info', 'Starting Add HTML Header Footer to PDF operation');

	try {
		// Get input parameters
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const htmlContent = this.getNodeParameter('htmlContent', index) as string;
		const location = this.getNodeParameter('location', index) as string;
		const pages = this.getNodeParameter('pages', index) as string;
		const skipFirstPage = this.getNodeParameter('skipFirstPage', index) as boolean;
		const marginLeft = this.getNodeParameter('marginLeft', index) as number;
		const marginRight = this.getNodeParameter('marginRight', index) as number;
		const marginTop = this.getNodeParameter('marginTop', index) as number;
		const marginBottom = this.getNodeParameter('marginBottom', index) as number;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
		logger.log('info', `Input data type: ${inputDataType}`);
		logger.log('info', `Location: ${location}`);
		logger.log('info', `Pages: ${pages}`);
		logger.log('info', `Skip first page: ${skipFirstPage}`);

		// Get PDF content based on input type
		let docContent: string = '';
		let actualDocName: string = docName;
		let blobId: string = '';

		switch (inputDataType) {
		case 'binaryData': {
			// 1. Validate binary data
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const item = this.getInputData(index);
			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`Binary property "${binaryPropertyName}" not found in input data`);
			}

			// 2. Get binary data metadata
			const binaryData = item[0].binary[binaryPropertyName];
			actualDocName = binaryData.fileName || docName;

			// 3. Convert to Buffer
			const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

			// 4. Upload to UploadBlob
			blobId = await uploadBlobToPdf4me.call(this, fileBuffer, actualDocName);

			// 5. Use blobId in docContent
			docContent = `${blobId}`;
			logger.log('info', `Using binary data with filename: ${actualDocName}, blobId: ${blobId}`);
			break;
		}

		case 'base64': {
			docContent = this.getNodeParameter('base64Content', index) as string;
			actualDocName = docName;
			blobId = '';
			logger.log('info', 'Using base64 content');
			break;
		}

		case 'url': {
			// 1. Get URL parameter
			const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

			// 2. Extract filename from URL
			actualDocName = pdfUrl.split('/').pop() || docName;

			// 3. Use URL directly in docContent
			blobId = '';
			docContent = pdfUrl;
			logger.log('info', `Using PDF URL directly: ${pdfUrl}`);
			break;
		}

		default:
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}

		// Validate PDF content (skip for blobId and URL formats)
		if (inputDataType === 'base64') {
			validatePdfContent(docContent, inputDataType, logger);
		}

		// Prepare the API request payload
		const payload: IDataObject = {
			docContent,
			docName: actualDocName,
			htmlContent,
			pages,
			location,
			skipFirstPage,
			marginLeft,
			marginRight,
			marginTop,
			marginBottom,
			IsAsync: true,
		};

		logger.log('info', 'Prepared API payload', {
			docName: actualDocName,
			htmlContentLength: htmlContent.length,
			location,
			pages,
			skipFirstPage,
			margins: { marginLeft, marginRight, marginTop, marginBottom },
		});

		// Make API request
		const apiUrl = '/api/v2/AddHtmlHeaderFooter';

		logger.log('info', 'Making async API request');
		const result: any = await pdf4meAsyncRequest.call(this, apiUrl, payload);

		logger.log('info', `API request successful, received ${result.length} bytes`);

		// Create binary data using n8n's helper for proper UI formatting
		const binaryData = await this.helpers.prepareBinaryData(
			result,
			outputFileName,
			'application/pdf',
		);

		// Create output item
		const outputItem = {
			json: {
				success: true,
				message: 'HTML header/footer added successfully',
				fileName: outputFileName,
				mimeType: 'application/pdf',
				fileSize: result.length,
				originalDocName: actualDocName,
				location,
				pages,
				skipFirstPage,
				margins: {
					left: marginLeft,
					right: marginRight,
					top: marginTop,
					bottom: marginBottom,
				},
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
		};

		logger.log('info', 'Operation completed successfully');
		return [outputItem as INodeExecutionData];

	} catch (error) {
		logger.log('error', 'Operation failed', error);
		throw error;
	}
}


/**
 * Validate PDF content
 */
function validatePdfContent(docContent: string, inputDataType: string, logger?: DebugLogger): void {
	if (!docContent || typeof docContent !== 'string') {
		throw new Error('Invalid PDF content provided');
	}

	// For base64 content, validate the PDF header
	if (inputDataType === 'base64' || inputDataType === 'binaryData') {
		try {
			const buffer = Buffer.from(docContent, 'base64');
			const pdfHeader = buffer.toString('ascii', 0, 4);
			if (pdfHeader !== '%PDF') {
				throw new Error('Content does not appear to be a valid PDF (missing PDF header)');
			}
			logger?.log('info', `PDF content validated: ${buffer.length} bytes`);
		} catch (error) {
			throw new Error(`Failed to validate PDF content: ${error.message}`);
		}
	}
}
