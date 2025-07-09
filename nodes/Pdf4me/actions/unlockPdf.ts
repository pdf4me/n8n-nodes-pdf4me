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
		description: 'Choose how to provide the protected PDF file to unlock',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use protected PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide protected PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to protected PDF file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to protected PDF file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the protected PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
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
		description: 'Base64 encoded protected PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
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
		description: 'URL to the protected PDF file to unlock',
		placeholder: 'https://example.com/protected-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
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
		description: 'Local file path to the protected PDF file to unlock',
		placeholder: '/path/to/protected-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'unlocked_document.pdf',
		description: 'Name for the output unlocked PDF file',
		placeholder: 'my-unlocked-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'protected_document.pdf',
		description: 'Name of the source protected PDF file for reference',
		placeholder: 'original-protected-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
	},
	{
		displayName: 'PDF Password',
		name: 'password',
		type: 'string',
		required: true,
		default: '',
		description: 'Password to unlock the protected PDF document',
		placeholder: 'Enter PDF password',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
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
				operation: [ActionConstants.UnlockPdf],
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
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

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

		// Use the original filename if available
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

		console.log(`Downloading PDF from URL: ${pdfUrl}`);
		docContent = await downloadPdfFromUrl(pdfUrl);
		console.log('PDF file successfully downloaded and encoded to base64');
	} else if (inputDataType === 'filePath') {
		// Use local file path - read the file and convert to base64
		const filePath = this.getNodeParameter('filePath', index) as string;

		// Validate file path (basic check)
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the PDF file.');
		}

		try {
			// Read the file and convert to base64
			const fs = require('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');

			// Validate the PDF content
			if (docContent.length < 100) {
				throw new Error('PDF file appears to be too small. Please ensure the file is a valid PDF.');
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
		throw new Error('PDF content is required');
	}

	// Validate password
	if (!password || password.trim() === '') {
		throw new Error('PDF password is required to unlock the document');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		password,
		async: true, // Asynchronous processing as per Python sample
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Unlock', body);

	// Handle the binary response (unlocked PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'unlocked_document';
			fileName = `${baseName}_unlocked.pdf`;
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
			throw new Error('Invalid PDF response from API. The unlocked PDF appears to be too small or corrupted.');
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
					message: 'PDF unlocked successfully',
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

async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	/**
	 * Download PDF from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 * 
	 * Args:
	 *   pdfUrl (str): URL to the PDF file
	 * 
	 * Returns:
	 *   str: Base64 encoded PDF content
	 * 
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the PDF file
		const response = await fetch(pdfUrl);
		
		if (!response.ok) {
			throw new Error(`Failed to download PDF from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		
		// Convert to base64
		const base64Content = buffer.toString('base64');
		
		// Validate the content
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid PDF file.');
		}

		console.log(`PDF downloaded successfully: ${buffer.length} bytes`);
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
} 