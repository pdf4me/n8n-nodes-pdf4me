import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
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
		description: 'Choose how to provide the PDF file to convert to Excel',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
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
				operation: [ActionConstants.ConvertPdfToExcel],
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
				operation: [ActionConstants.ConvertPdfToExcel],
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
		description: 'URL to the PDF file to convert to Excel',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Quality Type',
		name: 'qualityType',
		type: 'options',
		required: true,
		default: 'Draft',
		description: 'Choose the quality type for conversion',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'Draft',
				description: 'Faster conversion, good for simple PDFs with clear tables',
			},
			{
				name: 'Quality',
				value: 'Quality',
				description: 'Slower but more accurate, better for complex layouts',
			},
		],

	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		required: true,
		default: 'English',
		description: 'OCR language for text recognition in images/scanned PDFs',
		placeholder: 'English',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
		hint: 'Convert PDF to Excel spreadsheet. See our <b><a href="https://docs.pdf4me.com/n8n/convert/convert-pdf-to-excel/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Merge All Sheets',
		name: 'mergeAllSheets',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Combine all Excel sheets into one (True) or separate sheets (False)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Preserve original formatting when possible',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
	{
		displayName: 'OCR When Needed',
		name: 'ocrWhenNeeded',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Use OCR (Optical Character Recognition) for scanned PDFs',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'PDF_to_EXCEL_output.xlsx',
		description: 'Name for the output Excel file',
		placeholder: 'document.xlsx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'converted-excel',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
			},
		},
	},
];

/**
 * Convert a PDF file to Excel format using PDF4Me API
 * Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save Excel file
 * PDF to Excel conversion extracts tables, text, and data from PDF into spreadsheet format
 *
 * About PDF to Excel conversion features:
 * - qualityType "Draft": Faster conversion, good for simple PDFs with clear tables
 * - qualityType "Quality": Slower but more accurate, better for complex layouts
 * - mergeAllSheets: Useful when PDF has multiple pages with related data
 * - ocrWhenNeeded: Essential for scanned PDFs or PDFs with image-based text
 * - language: Improves OCR accuracy for non-English text
 * - outputFormat: Tries to maintain original cell formatting, colors, fonts
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		if (binaryData.fileName) {
			originalFileName = binaryData.fileName;
		}


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
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}


		docContent = await downloadPdfFromUrl.call(this, this.helpers, pdfUrl);

	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Prepare the payload (data) to send to the API
	// This payload configures the PDF to Excel conversion settings
	const body: IDataObject = {
		docContent,									// Base64 encoded PDF document content
		docName: originalFileName,					 // Name of the source PDF file for reference
		qualityType: this.getNodeParameter('qualityType', index) as string,
		mergeAllSheets: this.getNodeParameter('mergeAllSheets', index) as boolean,
		language: this.getNodeParameter('language', index) as string,
		outputFormat: this.getNodeParameter('outputFormat', index) as boolean,
		ocrWhenNeeded: this.getNodeParameter('ocrWhenNeeded', index) as boolean,
		IsAsync: true,									// Enable asynchronous processing
	};



	// Send the conversion request to the API
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToExcel', body);

	if (responseData) {


		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'pdf_to_excel_output';
			fileName = `${baseName}.xlsx`;
		}

		// Ensure .xlsx extension
		if (!fileName.toLowerCase().endsWith('.xlsx')) {
			fileName = `${fileName.replace(/\.[^.]*$/, '')}.xlsx`;
		}

		// Convert response to buffer
		let excelBuffer: any;
		if (Buffer.isBuffer(responseData)) {
			excelBuffer = responseData;
		} else if (typeof responseData === 'string') {
			excelBuffer = Buffer.from(responseData, 'base64');
		} else {
			excelBuffer = Buffer.from(responseData as any);
		}

		// Validate the response contains Excel data
		if (!excelBuffer || excelBuffer.length < 1000) {
			throw new Error('Invalid Excel response from API. The converted file appears to be too small or corrupted.');
		}

		// Create binary data for output
		const binaryData = await this.helpers.prepareBinaryData(
			excelBuffer,
			fileName,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		return [
			{
				json: {
					fileName,
					fileSize: excelBuffer.length,
					success: true,
					originalFileName,
					qualityType: body.qualityType,
					language: body.language,
					ocrUsed: body.ocrWhenNeeded,
					mergeAllSheets: body.mergeAllSheets,
					message: 'PDF converted to Excel successfully',
				},
				binary: {
					[binaryDataKey]: binaryData,
				},
			},
		];
	}

	throw new Error('No response data received from PDF4ME API');
}

/**
 * Download PDF from URL and convert to base64
 */
const downloadPdfFromUrl = async (helpers: IExecuteFunctions['helpers'], pdfUrl: string): Promise<string> => {
	try {
		const response = await helpers.httpRequest({
			method: 'GET',
			url: pdfUrl,
			encoding: 'arraybuffer',
			returnFullResponse: true,
		});

		if (response.statusCode >= 400) {
			throw new Error(`Failed to download PDF from URL: ${response.statusCode} ${response.statusMessage}`);
		}

		// Check if response body exists and handle different formats
		if (!response.body) {
			throw new Error('No response body received from URL');
		}

		let buffer: Buffer;

		// Handle different response body formats
		if (response.body instanceof Buffer) {
			buffer = response.body;
		} else if (typeof response.body === 'string') {
			// If it's a string, convert to buffer
			buffer = Buffer.from(response.body, 'utf8');
		} else if (response.body instanceof ArrayBuffer) {
			// If it's an ArrayBuffer, convert to Buffer
			buffer = Buffer.from(response.body);
		} else if (ArrayBuffer.isView(response.body)) {
			// If it's a TypedArray or DataView
			buffer = Buffer.from(response.body.buffer, response.body.byteOffset, response.body.byteLength);
		} else {
			// Try to convert using Buffer.from with default encoding
			try {
				buffer = Buffer.from(response.body as any);
			} catch (error) {
				throw new Error(`Unable to convert response body to buffer. Body type: ${typeof response.body}, Body: ${String(response.body).substring(0, 100)}`);
			}
		}

		// Validate the buffer
		if (!buffer || buffer.length === 0) {
			throw new Error('Downloaded file is empty');
		}

		const base64Content = buffer.toString('base64');

		// Validate the downloaded content
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid PDF file.');
		}

		return base64Content;
	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading PDF from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading PDF: ${error.message}`);
		} else {
			throw new Error(`Error downloading PDF from URL: ${error.message}`);
		}
	}
};
