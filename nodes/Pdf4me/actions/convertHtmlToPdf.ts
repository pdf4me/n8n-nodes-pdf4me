import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer available (Node.js global)
declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the HTML file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use HTML file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide HTML content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to HTML file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to HTML file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the HTML file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 HTML Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded HTML document content',
		placeholder: '<!DOCTYPE html><html><head><title>Sample</title></head><body>...</body></html>',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'HTML URL',
		name: 'htmlUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the HTML file to convert',
		placeholder: 'https://example.com/page.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
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
		description: 'Local file path to the HTML file to convert',
		placeholder: '/path/to/document.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'html_to_pdf_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-html-converted.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.html',
		description: 'Name of the source HTML file for reference',
		placeholder: 'original-file.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Page Layout',
		name: 'layout',
		type: 'options',
		default: 'Portrait',
		description: 'Page orientation for the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				name: 'Portrait',
				value: 'Portrait',
				description: 'Vertical orientation (taller than wide)',
			},
			{
				name: 'Landscape',
				value: 'Landscape',
				description: 'Horizontal orientation (wider than tall)',
			},
		],
	},
	{
		displayName: 'Page Format',
		name: 'format',
		type: 'options',
		default: 'A4',
		description: 'Page size for the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{ name: 'A4', value: 'A4' },
			{ name: 'A5', value: 'A5' },
			{ name: 'A6', value: 'A6' },
			{ name: 'Legal', value: 'Legal' },
			{ name: 'Letter', value: 'Letter' },
		],
	},
	{
		displayName: 'Scale',
		name: 'scale',
		type: 'number',
		default: 0.8,
		description: 'Scaling factor for content (0.1 to 2.0)',
		typeOptions: {
			minValue: 0.1,
			maxValue: 2.0,
			numberStepSize: 0.1,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Margins',
		name: 'margins',
		type: 'collection',
		placeholder: 'Add Margin',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				displayName: 'Top Margin',
				name: 'topMargin',
				type: 'string',
				default: '40px',
				description: 'Top margin spacing (e.g., "40px", "2cm", "1in")',
			},
			{
				displayName: 'Bottom Margin',
				name: 'bottomMargin',
				type: 'string',
				default: '40px',
				description: 'Bottom margin spacing (e.g., "40px", "2cm", "1in")',
			},
			{
				displayName: 'Left Margin',
				name: 'leftMargin',
				type: 'string',
				default: '40px',
				description: 'Left margin spacing (e.g., "40px", "2cm", "1in")',
			},
			{
				displayName: 'Right Margin',
				name: 'rightMargin',
				type: 'string',
				default: '40px',
				description: 'Right margin spacing (e.g., "40px", "2cm", "1in")',
			},
		],
	},
	{
		displayName: 'PDF Options',
		name: 'pdfOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				displayName: 'Print Background',
				name: 'printBackground',
				type: 'boolean',
				default: true,
				description: 'Whether to include background colors and images in the PDF',
			},
			{
				displayName: 'Display Header Footer',
				name: 'displayHeaderFooter',
				type: 'boolean',
				default: true,
				description: 'Whether to show header and footer in the PDF',
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
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
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
	let layout: string;
	let format: string;
	let scale: number;
	let margins: IDataObject;
	let pdfOptions: IDataObject;
	let advancedOptions: IDataObject;

	if (operation === ActionConstants.ConvertToPdf) {
		// Use the parameters from the Convert to PDF action
		inputDataType = this.getNodeParameter('htmlInputDataType', index) as string;
		outputFileName = this.getNodeParameter('htmlOutputFileName', index) as string;
		docName = this.getNodeParameter('htmlDocName', index) as string;
		layout = this.getNodeParameter('htmlLayout', index) as string;
		format = this.getNodeParameter('htmlFormat', index) as string;
		scale = this.getNodeParameter('htmlScale', index) as number;
		margins = this.getNodeParameter('htmlMargins', index) as IDataObject;
		pdfOptions = this.getNodeParameter('htmlPdfOptions', index) as IDataObject;
		advancedOptions = this.getNodeParameter('htmlAdvancedOptions', index) as IDataObject;
	} else {
		// Use the original parameters (for backward compatibility)
		inputDataType = this.getNodeParameter('inputDataType', index) as string;
		outputFileName = this.getNodeParameter('outputFileName', index) as string;
		docName = this.getNodeParameter('docName', index) as string;
		layout = this.getNodeParameter('layout', index) as string;
		format = this.getNodeParameter('format', index) as string;
		scale = this.getNodeParameter('scale', index) as number;
		margins = this.getNodeParameter('margins', index) as IDataObject;
		pdfOptions = this.getNodeParameter('pdfOptions', index) as IDataObject;
		advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	}

	let docContent: string;
	let originalFileName = docName;
	let indexFilePath = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get HTML content from binary data
		const binaryPropertyName = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('htmlBinaryPropertyName', index) as string
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
			indexFilePath = binaryData.fileName;
		}
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('htmlBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:text/html;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		indexFilePath = originalFileName;
	} else if (inputDataType === 'url') {
		// Use HTML URL directly - download the file first
		const htmlUrl = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('htmlUrl', index) as string
			: this.getNodeParameter('htmlUrl', index) as string;

		// Validate URL format
		try {
			new URL(htmlUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the HTML file.');
		}

		docContent = await downloadHtmlFromUrl(htmlUrl);
		indexFilePath = htmlUrl;
	} else if (inputDataType === 'filePath') {
		// Use local file path - read the file and convert to base64
		const filePath = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('htmlFilePath', index) as string
			: this.getNodeParameter('filePath', index) as string;

		// Validate file path (basic check)
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the HTML file.');
		}

		try {
			// Read the file and convert to base64
			const fs = await import('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');

			// Validate the HTML content
			if (docContent.length < 50) {
				throw new Error('HTML file appears to be too small. Please ensure the file is a valid HTML file.');
			}

			// Extract filename from path for original filename
			const pathParts = filePath.replace(/\\/g, '/').split('/');
			originalFileName = pathParts[pathParts.length - 1];
			indexFilePath = filePath;

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
		throw new Error('HTML content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		indexFilePath,
		layout,
		format,
		scale,
		async: true, // Asynchronous processing as per Python sample
	};

	// Add margins if provided
	if (margins.topMargin) body.topMargin = margins.topMargin;
	if (margins.bottomMargin) body.bottomMargin = margins.bottomMargin;
	if (margins.leftMargin) body.leftMargin = margins.leftMargin;
	if (margins.rightMargin) body.rightMargin = margins.rightMargin;

	// Add PDF options if provided
	if (pdfOptions.printBackground !== undefined) body.printBackground = pdfOptions.printBackground;
	if (pdfOptions.displayHeaderFooter !== undefined) body.displayHeaderFooter = pdfOptions.displayHeaderFooter;

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertHtmlToPdf', body);

	// Handle the binary response (converted PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'html_to_pdf_output';
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
					layout,
					format,
					scale,
					originalFileName,
					message: 'HTML converted to PDF successfully',
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

async function downloadHtmlFromUrl(htmlUrl: string): Promise<string> {
	/**
	 * Download HTML from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 *
	 * Args:
	 *   htmlUrl (str): URL to the HTML file
	 *
	 * Returns:
	 *   str: Base64 encoded HTML content
	 *
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the HTML file
		const response = await fetch(htmlUrl);

		if (!response.ok) {
			throw new Error(`Failed to download HTML from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Convert to base64
		const base64Content = buffer.toString('base64');

		// Validate the content
		if (base64Content.length < 50) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid HTML file.');
		}

		return base64Content;

	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading HTML from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading HTML: ${error.message}`);
		} else {
			throw new Error(`Error downloading HTML from URL: ${error.message}`);
		}
	}
}