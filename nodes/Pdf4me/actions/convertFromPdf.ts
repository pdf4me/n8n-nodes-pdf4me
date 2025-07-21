import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and setTimeout available (they're Node.js globals)
// declare const URL: any;
// declare const console: any;
// declare const setTimeout: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Convert Type',
		name: 'convertType',
		type: 'options',
		required: true,
		default: 'toWord',
		description: 'Choose the target format for conversion',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
		options: [
			{
				name: 'PDF to Word',
				value: 'toWord',
				description: 'Convert PDF to editable Word document format',
			},
			{
				name: 'PDF to Excel',
				value: 'toExcel',
				description: 'Convert PDF to Excel spreadsheet format, extracting tables and data',
			},
		],
	},
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
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
				operation: [ActionConstants.ConvertFromPDF],
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
				operation: [ActionConstants.ConvertFromPDF],
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
				operation: [ActionConstants.ConvertFromPDF],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'converted_document',
		description: 'Name for the output file (extension will be added automatically)',
		placeholder: 'my-document',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
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
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
	},
	{
		displayName: 'Quality Type',
		name: 'qualityType',
		type: 'options',
		default: 'Draft',
		description: 'Conversion quality setting',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'Draft',
				description: 'Faster conversion, good for simple PDFs with clear text',
			},
			{
				name: 'Quality',
				value: 'Quality',
				description: 'Slower but more accurate, better for complex layouts',
			},
		],
	},
	{
		displayName: 'OCR Language',
		name: 'language',
		type: 'options',
		default: 'English',
		description: 'OCR language for text recognition in images/scanned PDFs',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
		options: [
			{ name: 'Arabic', value: 'Arabic' },
			{ name: 'Chinese (Simplified)', value: 'Chinese_Simplified' },
			{ name: 'Chinese (Traditional)', value: 'Chinese_Traditional' },
			{ name: 'Danish', value: 'Danish' },
			{ name: 'Dutch', value: 'Dutch' },
			{ name: 'English', value: 'English' },
			{ name: 'Finnish', value: 'Finnish' },
			{ name: 'French', value: 'French' },
			{ name: 'German', value: 'German' },
			{ name: 'Italian', value: 'Italian' },
			{ name: 'Japanese', value: 'Japanese' },
			{ name: 'Korean', value: 'Korean' },
			{ name: 'Norwegian', value: 'Norwegian' },
			{ name: 'Portuguese', value: 'Portuguese' },
			{ name: 'Russian', value: 'Russian' },
			{ name: 'Spanish', value: 'Spanish' },
			{ name: 'Swedish', value: 'Swedish' },
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
				operation: [ActionConstants.ConvertFromPDF],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
			{
				displayName: 'Max Retries',
				name: 'maxRetries',
				type: 'number',
				default: 30,
				description: 'Maximum number of polling attempts for async processing (increased for complex PDFs)',
			},
			{
				displayName: 'Merge All Sheets',
				name: 'mergeAllSheets',
				type: 'boolean',
				default: true,
				description: 'Whether to combine multiple pages into single document flow for Word, or combine all sheets into one for Excel',
			},
			{
				displayName: 'Preserve Output Format',
				name: 'outputFormat',
				type: 'boolean',
				default: true,
				description: 'Whether to preserve original formatting when possible',
			},
			{
				displayName: 'Retry Delay (Seconds)',
				name: 'retryDelay',
				type: 'number',
				default: 15,
				description: 'Base seconds to wait between polling attempts (actual delay increases exponentially)',
			},
			{
				displayName: 'Use Async Processing',
				name: 'useAsync',
				type: 'boolean',
				default: true,
				description: 'Whether to use asynchronous processing for better handling of large files',
			},
			{
				displayName: 'Use OCR When Needed',
				name: 'ocrWhenNeeded',
				type: 'boolean',
				default: true,
				description: 'Whether to use OCR (Optical Character Recognition) for scanned PDFs',
			},
		],
	},
];

/**
 * Convert a PDF file to Word document or Excel format using PDF4Me API
 * Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save document
 * PDF to Word conversion transforms PDF content into editable document format with preserved formatting
 * PDF to Excel conversion extracts tables, text, and data from PDF into spreadsheet format
 *
 * Note: Complex PDFs may take several minutes to convert. The system now includes enhanced timeout handling
 * with exponential backoff and up to 25 minutes total processing time for large or complex documents.
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const convertType = this.getNodeParameter('convertType', index) as string;
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const qualityType = this.getNodeParameter('qualityType', index) as string;
	const language = this.getNodeParameter('language', index) as string;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const useAsync = advancedOptions?.useAsync !== false; // Default to true

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



			encoding: 'arraybuffer' as const,



		};



		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response as Buffer);
		docContent = buffer.toString('base64');

	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Validate PDF content
	validatePdfContent(docContent);

	// Determine conversion type and set appropriate endpoint and file extension
	let endpoint: string;
	let fileExtension: string;
	let mimeType: string;


	if (convertType === 'toWord') {
		endpoint = '/api/v2/ConvertPdfToWord';
		fileExtension = '.docx';
		mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

	} else if (convertType === 'toExcel') {
		endpoint = '/api/v2/ConvertPdfToExcel';
		fileExtension = '.xlsx';
		mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

	} else {
		throw new Error(`Unsupported convert type: ${convertType}`);
	}

	// Generate filename if not provided
	let fileName = outputFileName;
	if (!fileName || fileName.trim() === '') {
		// Extract name from docName if available, otherwise use default
		const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'converted_document';
		fileName = `${baseName}${fileExtension}`;
	}

	// Ensure correct extension
	if (!fileName.toLowerCase().endsWith(fileExtension)) {
		fileName = `${fileName.replace(/\.[^.]*$/, '')}${fileExtension}`;
	}



	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		qualityType,
		language,
		mergeAllSheets: advancedOptions?.mergeAllSheets !== undefined ? advancedOptions.mergeAllSheets : true,
		outputFormat: advancedOptions?.outputFormat !== undefined ? advancedOptions.outputFormat : true,
		ocrWhenNeeded: advancedOptions?.ocrWhenNeeded !== undefined ? advancedOptions.ocrWhenNeeded : true,
	};

	// Add async flag if requested
	if (useAsync) {
		body.async = true;
	}

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// About conversion features:
	// - qualityType "Draft": Faster conversion, good for simple PDFs with clear text/tables
	// - qualityType "Quality": Slower but more accurate, better for complex layouts
	// - mergeAllSheets: For Word: maintains document flow across multiple PDF pages
	// - mergeAllSheets: For Excel: combines all Excel sheets into one (True) or separate sheets (False)
	// - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
	// - language: Improves OCR accuracy for non-English text recognition
	// - outputFormat: Tries to maintain original formatting when possible




	try {
		let responseData: any;

		if (useAsync) {
			// Use async processing with improved polling from GenericFunctions

			responseData = await pdf4meAsyncRequest.call(this, endpoint, body);
		} else {
			// Use synchronous processing

			responseData = await pdf4meApiRequest.call(this, endpoint, body);
		}

		// Validate response data
		if (!responseData || responseData.length < 1000) {
			throw new Error(`API returned too little data (${responseData?.length || 0} bytes). This might indicate an error response.`);
		}

		// Check if the response looks like a valid document (should start with PK for ZIP format)
		const firstBytes = responseData.toString('ascii', 0, 4);
		if (!firstBytes.startsWith('PK')) {
			// Log warning for non-ZIP format response
		}

		// Create binary data for output
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			mimeType,
		);



		if (convertType === 'toWord') {
			// Handle Word conversion specific logic if needed
		} else {
			// Handle other conversion types if needed
		}

		return [
			{
				json: {
					fileName,
					mimeType,
					fileSize: responseData.length,
					success: true,
					qualityType,
					language,
					ocrUsed: advancedOptions?.ocrWhenNeeded !== false,
					inputType: inputDataType,
					processingMode: useAsync ? 'async' : 'sync',
					operation,
					convertType,
				},
				binary: {
					data: binaryData,
				},
			},
		];
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

/**
 * Read PDF from local file path and convert to base64
 */

/**
 * Validate PDF content
 */
function validatePdfContent(docContent: string): void {
	// Validate base64 content length (minimum PDF header)
	if (docContent.length < 100) {
		throw new Error('PDF content appears to be too short. Please ensure the file is a valid PDF.');
	}

	// Check if it starts with PDF header
	const decodedContent = Buffer.from(docContent, 'base64').toString('ascii', 0, 10);
	if (!decodedContent.startsWith('%PDF')) {
		throw new Error('The provided content does not appear to be a valid PDF file. PDF files should start with "%PDF".');
	}
}
