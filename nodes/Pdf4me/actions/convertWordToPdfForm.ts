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
		description: 'Choose how to provide the Word document to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Word document from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide Word content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Word document',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Word Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded Word document content (.docx, .doc)',
		placeholder: 'UEsDBBQAAAAIAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Word URL',
		name: 'wordUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Word document to convert',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'word_to_pdf_form_output.pdf',
		description: 'Name for the output PDF form file',
		placeholder: 'my-word-form.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name for the output PDF file (used by API)',
		placeholder: 'output.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
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
				operation: [ActionConstants.ConvertWordToPdfForm],
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
	let advancedOptions: IDataObject;

	if (operation === ActionConstants.ConvertToPdf) {
		// Use the parameters from the Convert to PDF action
		inputDataType = this.getNodeParameter('wordFormInputDataType', index) as string;
		outputFileName = this.getNodeParameter('wordFormOutputFileName', index) as string;
		docName = this.getNodeParameter('wordFormDocName', index) as string;
		advancedOptions = this.getNodeParameter('wordFormAdvancedOptions', index) as IDataObject;
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
		// Get Word content from binary data
		const binaryPropertyName = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('wordFormBinaryPropertyName', index) as string
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
			? this.getNodeParameter('wordFormBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Use Word URL directly - download the file first
		const wordUrl = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('wordFormUrl', index) as string
			: this.getNodeParameter('wordUrl', index) as string;

		// Validate URL format
		try {
			new URL(wordUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the Word document.');
		}

		docContent = await downloadWordFromUrl(wordUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate base64 content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Word document content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		async: true, // Asynchronous processing as per Python sample
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertWordToPdfForm', body);

	// Handle the binary response (converted PDF form data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'word_to_pdf_form_output';
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
			throw new Error('Invalid PDF response from API. The converted PDF form appears to be too small or corrupted.');
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
					message: 'Word document converted to PDF form successfully',
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

async function downloadWordFromUrl(wordUrl: string): Promise<string> {
	/**
	 * Download Word document from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 *
	 * Args:
	 *   wordUrl (str): URL to the Word document
	 *
	 * Returns:
	 *   str: Base64 encoded Word content
	 *
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the Word document
		const response = await fetch(wordUrl);

		if (!response.ok) {
			throw new Error(`Failed to download Word document from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Convert to base64
		const base64Content = buffer.toString('base64');

		// Validate the content
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid Word document.');
		}

		return base64Content;

	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error('Failed to fetch the Word document from the provided URL. Please check the URL and your network connection.');
		}
		throw error;
	}
	return '';
}