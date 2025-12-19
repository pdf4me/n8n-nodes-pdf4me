import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
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
		description: 'How to provide the input Word document',
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
				description: 'Provide Word document content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Word document',
			},
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['binaryData'],
			},
		},

	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		description: 'Name of the input Word file (including extension). If not provided, will use the filename from binary data.',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['binaryData'],
			},
		},
		hint: 'Convert Word to PDF form. See our <b><a href="https://docs.pdf4me.com/n8n/convert/convert-word-to-pdf-form/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'Base64 encoded content of the Word document',
		placeholder: 'UEsDBBQAAAAIAA==...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input Word file (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
				inputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the Word document to convert to PDF form',
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
		placeholder: 'converted_form.pdf',
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
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'pdf-form',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertWordToPdfForm],
			},
		},
	},
];

/**
 * Convert a Word document to PDF form using PDF4Me API
 * Process: Read Word file → Encode to base64 → Send API request → Handle response → Save PDF form
 * This converts Word documents into PDF forms with fillable fields
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let docName: string;
	let blobId: string = '';

	// Handle different input types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
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

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		docName = inputFileName || binaryData.fileName || 'document.docx';

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for base64 input type.');
		}

		// Handle data URLs
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for URL input type.');
		}

		// 2. Use URL directly in docContent
		blobId = '';
		docContent = fileUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('Word document content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: docName,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	// Make the API request using the shared function
	let responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertWordToPdfForm', body);

	// Handle the binary response (PDF form data)
	if (responseData) {
		// Validate that we received valid PDF data
		if (!Buffer.isBuffer(responseData)) {
			throw new Error('Invalid response format: Expected Buffer but received ' + typeof responseData);
		}

		// Check if the response looks like a PDF (should start with %PDF)
		const responseString = responseData.toString('utf8', 0, 10);
		if (!responseString.startsWith('%PDF')) {
			// If it doesn't look like a PDF, it might be an error message or base64 encoded
			const errorText = responseData.toString('utf8', 0, 200);
			if (errorText.includes('error') || errorText.includes('Error')) {
				throw new Error(`API returned error: ${errorText}`);
			}
			// Try to decode as base64 if it doesn't look like a PDF
			try {
				const decodedBuffer = Buffer.from(responseData.toString('utf8'), 'base64');
				const decodedString = decodedBuffer.toString('utf8', 0, 10);
				if (decodedString.startsWith('%PDF')) {
					// It was base64 encoded, use the decoded version
					responseData = decodedBuffer;
				} else {
					throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
				}
			} catch (decodeError) {
				throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
			}
		}

		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName) {
			fileName = `word_to_pdf_form_${Date.now()}.pdf`;
		}

		// Ensure the filename has .pdf extension
		if (!fileName.toLowerCase().endsWith('.pdf')) {
			fileName = fileName.replace(/\.[^.]*$/, '') + '.pdf';
		}

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/pdf',
		);

		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: responseData.length,
					success: true,
					inputDataType,
					sourceFileName: docName,
					operation: 'ConvertWordToPdfForm',
					message: 'Word document successfully converted to PDF form',
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
