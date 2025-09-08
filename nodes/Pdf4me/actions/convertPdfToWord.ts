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
		description: 'Choose how to provide the PDF file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'converted_document.docx',
		description: 'Name for the output Word document file',
		placeholder: 'my-document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				operation: [ActionConstants.ConvertPdfToWord],
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
				description: 'Whether to combine multiple pages into single document flow',
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
				displayName: 'Use OCR When Needed',
				name: 'ocrWhenNeeded',
				type: 'boolean',
				default: true,
				description: 'Whether to use OCR (Optical Character Recognition) for scanned PDFs',
			},
		],
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'converted-word',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToWord],
			},
		},
	},
];

/**
 * Convert a PDF file to Word document format using PDF4Me API
 * Process: Read PDF file → Encode to base64 → Send API request → Poll for completion → Save Word document
 * PDF to Word conversion transforms PDF content into editable document format with preserved formatting
 *
 * Note: Complex PDFs may take several minutes to convert. The system now includes enhanced timeout handling
 * with exponential backoff and up to 25 minutes total processing time for large or complex documents.
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const qualityType = this.getNodeParameter('qualityType', index) as string;
	const language = this.getNodeParameter('language', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
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
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		originalFileName = this.getNodeParameter('docName', index) as string;

		if (!originalFileName) {
			throw new Error('Document name is required for base64 input type.');
		}

		// Handle data URLs
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// URL input
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		originalFileName = this.getNodeParameter('docName', index) as string;

		if (!originalFileName) {
			throw new Error('Document name is required for URL input type.');
		}

		// Download the file from URL and convert to base64
		try {
			const options = {

				method: 'GET' as const,

				url: pdfUrl,

				encoding: 'arraybuffer' as const,

			};

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
			docContent = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download file from URL: ${pdfUrl}. Error: ${error}`);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		qualityType,
		language,
		mergeAllSheets: true, // Always merge sheets as in C#
		outputFormat: 'xyz', // Example value, adjust as needed
		ocrWhenNeeded: 'true', // String as in C#
		IsAsync: true,
	};

	// Add profiles if provided
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	// Make the API request using the shared function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToWord', body);

	// Handle the binary response (Word document data)
	if (responseData) {
		// Validate that we received valid data
		if (!Buffer.isBuffer(responseData)) {
			throw new Error('Invalid response format: Expected Buffer but received ' + typeof responseData);
		}

		// Generate filename if not provided
		let fileName = outputFileName || originalFileName.replace(/\.[^.]*$/, '') + '.docx';
		if (!fileName.toLowerCase().endsWith('.docx')) {
			fileName = fileName.replace(/\.[^.]*$/, '') + '.docx';
		}

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		);

		return [
			{
				json: {
					fileName,
					mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					fileSize: responseData.length,
					success: true,
					inputDataType,
					sourceFileName: originalFileName,
					qualityType,
					language,
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

