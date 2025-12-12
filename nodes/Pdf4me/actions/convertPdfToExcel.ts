import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
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
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		description: 'Name of the input file (including extension). If not provided, will use the filename from binary data.',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded content of the file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the file to convert to Excel',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input file (including extension)',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToExcel],
				inputDataType: ['base64', 'url'],
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
				description: 'Suitable for normal PDFs, consumes 1 API call per file',
			},
			{
				name: 'High',
				value: 'High',
				description: 'Suitable for PDFs generated from Images and scanned documents. Consumes 2 API calls per page',
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
 * - qualityType "Draft": Suitable for normal PDFs, consumes 1 API call per file
 * - qualityType "High": Suitable for PDFs generated from Images and scanned documents. Consumes 2 API calls per page
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

	// Main document content and metadata
	let docContent: string = '';
	let inputDocName: string = '';
	let blobId: string = '';

	// Handle different input types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);

		// Check if item exists and has data
		if (!item || !item[0]) {
			throw new Error('No input data found. Please ensure the previous node provides data.');
		}

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
		inputDocName = inputFileName || binaryData.fileName || 'document';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ConvertPdfToExcel API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		inputDocName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!inputDocName) {
			throw new Error('Input file name is required for base64 input type.');
		}

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (inputDataType === 'url') {
		// URL input - send URL as string directly in docContent
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		inputDocName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!inputDocName) {
			throw new Error('Input file name is required for URL input type.');
		}

		// Send URL as string directly in docContent - no conversion or modification
		blobId = '';
		docContent = String(fileUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		try {
			new URL(docContent);
		} catch (error) {
			throw new Error(`Invalid URL format: ${docContent}`);
		}
		// Ensure docContent remains as the original URL string (no trimming)
		// docContent is already set to the URL string above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('Document content is required');
		}
		// Validate base64 format for base64 input
		try {
			const testBuffer = Buffer.from(docContent, 'base64');
			if (testBuffer.length === 0 && docContent.length > 0) {
				throw new Error('Invalid base64 content: Unable to decode base64 string');
			}
		} catch (error) {
			if (error instanceof Error && error.message.includes('Invalid base64')) {
				throw error;
			}
			throw new Error('Invalid base64 content format');
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('Document content is required');
		}
	}

	// Use inputDocName if docName is not provided, otherwise use docName
	const originalFileName = docName || inputDocName || 'document.pdf';

	// Build the request body - everything is sent via docContent
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: originalFileName,
		qualityType: this.getNodeParameter('qualityType', index) as string,
		mergeAllSheets: this.getNodeParameter('mergeAllSheets', index) as boolean,
		language: this.getNodeParameter('language', index) as string,
		outputFormat: this.getNodeParameter('outputFormat', index) as boolean,
		ocrWhenNeeded: this.getNodeParameter('ocrWhenNeeded', index) as boolean,
		IsAsync: true,
	};

	// Make the API request
	let responseData;
	try {
		responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToExcel', body);
	} catch (error: unknown) {
		// Provide better error messages with debugging information
		const errorObj = error as { statusCode?: number; message?: string };
		if (errorObj.statusCode === 500) {
			throw new Error(
				`PDF4Me server error (500): ${errorObj.message || 'The service was not able to process your request.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${originalFileName}, ` +
				`docContentLength=${docContent?.length || 0}, ` +
				`docContentType=${typeof docContent === 'string' && docContent.startsWith('http') ? 'URL' : inputDataType === 'binaryData' ? 'blobId' : 'base64'}`
			);
		} else if (errorObj.statusCode === 400) {
			throw new Error(
				`Bad request (400): ${errorObj.message || 'Please check your parameters.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${originalFileName}`
			);
		}
		throw error;
	}

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
					inputDataType,
					sourceFileName: inputDocName,
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
