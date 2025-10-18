import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';



export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the Markdown file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Markdown file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide Markdown content already encoded in base64 format',
			},
			{
				name: 'Markdown Code',
				value: 'markdownCode',
				description: 'Write raw Markdown code manually (will be converted to base64)',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Markdown file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Markdown file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Markdown Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Provide the Markdown content already encoded in base64 format (not raw Markdown code). Example: IyBTYW1wbGUgTWFya2Rvd24KCkZvciBleGFtcGxlLCB0aGlzIGlzIGEgKipib2xkKiogdGV4dC4=',
		placeholder: 'IyBTYW1wbGUgTWFya2Rvd24KCkZvciBleGFtcGxlLCB0aGlzIGlzIGEgKipib2xkKiogdGV4dC4=',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Markdown Code',
		name: 'markdownCode',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Write your Markdown code here. It will be automatically converted to base64.',
		placeholder: '# Sample Markdown\n\nThis is a **bold** text and *italic* text.\n\n- List item 1\n- List item 2',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
				inputDataType: ['markdownCode'],
			},
		},
	},
	{
		displayName: 'Markdown URL',
		name: 'markdownUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Markdown file to convert',
		placeholder: 'https://example.com/readme.md',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'markdown_to_pdf_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-markdown-converted.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
			},
		},
		hint: 'Convert Markdown to PDF. See our <b><a href="https://docs.pdf4me.com/n8n/convert/markdown-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'sample.md',
		description: 'Name of the source Markdown file with extension',
		placeholder: 'original-file.md',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
			},
		},
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertMarkdownToPdf],
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
				operation: [ActionConstants.ConvertMarkdownToPdf],
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
	let advancedOptions: IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	if (operation === ActionConstants.ConvertToPdf) {
		// Use the parameters from the Convert to PDF action
		inputDataType = this.getNodeParameter('mdInputDataType', index) as string;
		outputFileName = this.getNodeParameter('mdOutputFileName', index) as string;
		advancedOptions = this.getNodeParameter('mdAdvancedOptions', index) as IDataObject;
	} else {
		// Use the original parameters (for backward compatibility)
		inputDataType = this.getNodeParameter('inputDataType', index) as string;
		outputFileName = this.getNodeParameter('outputFileName', index) as string;
		advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	}

	let docContent: string;
	let originalFileName: string = 'markdown_file';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get Markdown content from binary data
		const binaryPropertyName = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('mdBinaryPropertyName', index) as string
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
			? this.getNodeParameter('mdBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;

		// Validate base64 content
		if (!docContent || docContent.trim() === '') {
			throw new Error('Base64 content cannot be empty');
		}

		// Validate that it looks like base64 (contains only valid base64 characters)
		const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
		if (!base64Regex.test(docContent)) {
			throw new Error('Invalid base64 format. Base64 should only contain A-Z, a-z, 0-9, +, /, and = characters');
		}

		// Try to decode to verify it's valid base64
		try {
			const decoded = Buffer.from(docContent, 'base64').toString('utf8');
			// Check if decoded content looks like Markdown
			if (!decoded.includes('#') && !decoded.includes('*') && !decoded.includes('-')) {
				// console.log('Warning: Decoded base64 content does not appear to be Markdown');
			}
		} catch (error) {
			throw new Error(`Invalid base64 content: ${error.message}`);
		}

		// Remove data URL prefix if present (e.g., "data:text/markdown;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'markdownCode') {
		// Use raw Markdown code and convert to base64
		const markdownCode = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('mdMarkdownCode', index) as string
			: this.getNodeParameter('markdownCode', index) as string;

		// Validate Markdown code
		if (!markdownCode || markdownCode.trim().length === 0) {
			throw new Error('Markdown code cannot be empty');
		}

		// Convert Markdown to base64
		try {
			docContent = Buffer.from(markdownCode, 'utf8').toString('base64');
		} catch (error) {
			// Fallback: try with different encoding
			docContent = Buffer.from(markdownCode, 'latin1').toString('base64');
		}
	} else if (inputDataType === 'url') {
		// Use Markdown URL directly - download the file first
		const markdownUrl = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('mdUrl', index) as string
			: this.getNodeParameter('markdownUrl', index) as string;

		// Validate URL format
		try {
			new URL(markdownUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the Markdown file.');
		}

		docContent = await downloadMarkdownFromUrl(markdownUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate base64 content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Markdown content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		IsAsync: true, // Asynchronous processing as per Python sample
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertMdToPdf', body);

	// Handle the binary response (converted PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'markdown_to_pdf_output';
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
					message: 'Markdown converted to PDF successfully',
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

async function downloadMarkdownFromUrl(markdownUrl: string): Promise<string> {
	/**
	 * Download Markdown from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 *
	 * Args:
	 *   markdownUrl (str): URL to the Markdown file
	 *
	 * Returns:
	 *   str: Base64 encoded Markdown content
	 *
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the Markdown file
		const response = await fetch(markdownUrl);

		if (!response.ok) {
			throw new Error(`Failed to download Markdown from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Convert to base64
		const base64Content = buffer.toString('base64');

		// Validate the content
		if (base64Content.length < 50) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid Markdown file.');
		}

		return base64Content;

	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading Markdown from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading Markdown: ${error.message}`);
		} else {
			throw new Error(`Error downloading Markdown from URL: ${error.message}`);
		}
	}
}
