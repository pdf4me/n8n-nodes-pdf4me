import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and setTimeout available (Node.js globals)
declare const Buffer: any;
declare const setTimeout: any;
declare const require: any;
declare const URL: any;
declare const console: any;
declare const fetch: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the Excel file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Excel file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide Excel content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Excel file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to Excel file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Excel file',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Excel Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded Excel spreadsheet content (.xlsx)',
		placeholder: 'UEsDBBQAAAAIAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Excel URL',
		name: 'excelUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Excel file to convert',
		placeholder: 'https://example.com/spreadsheet.xlsx',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
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
		description: 'Local file path to the Excel file to convert',
		placeholder: '/path/to/spreadsheet.xlsx',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'spreadsheet_to_pdf_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-spreadsheet-converted.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output',
		description: 'Name for the output PDF file (used by API)',
		placeholder: 'output',
		displayOptions: {
			show: {
				operation: [ActionConstants.XlsxToPdf],
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
				operation: [ActionConstants.XlsxToPdf],
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
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// Check if this is called from Convert to PDF or standalone
	const operation = this.getNodeParameter('operation', index) as string;
	
	let inputDataType: string;
	let outputFileName: string;
	let docName: string;
	let advancedOptions: IDataObject;
	
	if (operation === ActionConstants.ConvertToPdf) {
		// Use the parameters from the Convert to PDF action
		inputDataType = this.getNodeParameter('xlsxInputDataType', index) as string;
		outputFileName = this.getNodeParameter('xlsxOutputFileName', index) as string;
		docName = this.getNodeParameter('xlsxDocName', index) as string;
		advancedOptions = this.getNodeParameter('xlsxAdvancedOptions', index) as IDataObject;
	} else {
		// Use the original parameters (for backward compatibility)
		inputDataType = this.getNodeParameter('inputDataType', index) as string;
		outputFileName = this.getNodeParameter('outputFileName', index) as string;
		docName = this.getNodeParameter('docName', index) as string;
		advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	}

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get Excel content from binary data
		const binaryPropertyName = operation === ActionConstants.ConvertToPdf 
			? this.getNodeParameter('xlsxBinaryPropertyName', index) as string
			: this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		// Use the original filename if available
		if (binaryData.fileName) {
			originalFileName = binaryData.fileName;
		}
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('xlsxBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Use Excel URL directly - download the file first
		const excelUrl = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('excelUrl', index) as string
			: this.getNodeParameter('excelUrl', index) as string;
		
		// Validate URL format
		try {
			new URL(excelUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the Excel file.');
		}

		console.log(`Downloading Excel from URL: ${excelUrl}`);
		docContent = await downloadExcelFromUrl(excelUrl);
		console.log('Excel file successfully downloaded and encoded to base64');
	} else if (inputDataType === 'filePath') {
		// Use local file path - read the file and convert to base64
		const filePath = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('xlsxFilePath', index) as string
			: this.getNodeParameter('filePath', index) as string;

		// Validate file path (basic check)
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the Excel file.');
		}

		try {
			// Read the file and convert to base64
			const fs = require('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');

			// Validate the Excel content
			if (docContent.length < 100) {
				throw new Error('Excel file appears to be too small. Please ensure the file is a valid Excel spreadsheet.');
			}

			// Extract filename from path for original filename
			const pathParts = filePath.replace(/\\/g, '/').split('/');
			originalFileName = pathParts[pathParts.length - 1];

		} catch (error) {
			if (error.code === 'ENOENT') {
				throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
			} else if (error.code === 'EACCES') {
				throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
			} else {
				throw new Error(`Error reading file: ${error.message}`);
			}
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate base64 content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Excel content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		async: true, // Asynchronous processing as per Python sample
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertToPdf', body);

	// Handle the binary response (converted PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'spreadsheet_to_pdf_output';
			fileName = `${baseName}.pdf`;
		}

		// Ensure proper extension
		if (!fileName.includes('.')) {
			fileName = `${fileName}.pdf`;
		}

		// Ensure responseData is a Buffer
		let pdfBuffer: any;
		if (Buffer.isBuffer(responseData)) {
			pdfBuffer = responseData;
		} else if (typeof responseData === 'string') {
			// If it's a base64 string, convert to buffer
			pdfBuffer = Buffer.from(responseData, 'base64');
		} else {
			// If it's already binary data, convert to buffer
			pdfBuffer = Buffer.from(responseData as any);
		}

		// Validate the PDF buffer
		if (!pdfBuffer || pdfBuffer.length < 100) {
			throw new Error('Invalid PDF response from API. The converted PDF appears to be too small or corrupted.');
		}

		// Create binary data for output using n8n's helper
		const binaryData = await this.helpers.prepareBinaryData(
			pdfBuffer,
			fileName,
			'application/pdf',
		);

		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: pdfBuffer.length,
					success: true,
					originalFileName,
					message: 'Excel spreadsheet converted to PDF successfully',
				},
				binary: {
					data: binaryData, // Use 'data' as the key for consistency with other nodes
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

async function downloadExcelFromUrl(excelUrl: string): Promise<string> {
	/**
	 * Download Excel from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 * 
	 * Args:
	 *   excelUrl (str): URL to the Excel file
	 * 
	 * Returns:
	 *   str: Base64 encoded Excel content
	 * 
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the Excel file
		const response = await fetch(excelUrl);
		
		if (!response.ok) {
			throw new Error(`Failed to download Excel from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		
		// Convert to base64
		const base64Content = buffer.toString('base64');
		
		// Validate the content
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid Excel file.');
		}

		console.log(`Excel downloaded successfully: ${buffer.length} bytes`);
		return base64Content;
		
	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading Excel from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading Excel: ${error.message}`);
		} else {
			throw new Error(`Error downloading Excel from URL: ${error.message}`);
		}
	}
} 