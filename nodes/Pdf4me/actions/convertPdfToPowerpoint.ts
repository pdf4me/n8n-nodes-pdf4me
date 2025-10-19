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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'converted_document.pptx',
		description: 'Name for the output PowerPoint document file',
		placeholder: 'my-presentation.pptx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToPowerpoint],
			},
		},
		hint: 'Convert PDF to PowerPoint document. See our <b><a href="https://docs.pdf4me.com/n8n/convert/convert-pdf-to-powerpoint/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
		],
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'converted-powerpoint',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToPowerpoint],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const qualityType = this.getNodeParameter('qualityType', index) as string;
	const language = this.getNodeParameter('language', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input types
	if (inputDataType === 'binaryData') {
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

		// Use provided input filename or extract from binary data
		const binaryData = item[0].binary[binaryPropertyName];
		originalFileName = docName || binaryData.fileName || 'document';
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

	// Build the request body based on the Python code structure
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		qualityType,
		language,
		ocrWhenNeeded: 'true', // String as in Python code
		outputFormat: advancedOptions.outputFormat !== false, // Preserve original formatting
		mergeAllSheets: advancedOptions.mergeAllSheets !== false, // Combine content appropriately
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	// Make the API request using the shared function
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToPowerPoint', body);

	// Handle the binary response (PowerPoint document data)
	if (responseData) {
		// Validate that we received valid data
		if (!Buffer.isBuffer(responseData)) {
			throw new Error('Invalid response format: Expected Buffer but received ' + typeof responseData);
		}

		// Generate filename if not provided
		let fileName = outputFileName || originalFileName.replace(/\.[^.]*$/, '') + '.pptx';
		if (!fileName.toLowerCase().endsWith('.pptx')) {
			fileName = fileName.replace(/\.[^.]*$/, '') + '.pptx';
		}

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		return [
			{
				json: {
					fileName,
					mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
					fileSize: responseData.length,
					success: true,
					inputDataType,
					sourceFileName: originalFileName,
					qualityType,
					language,
				},
				binary: {
					[binaryDataKey]: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

