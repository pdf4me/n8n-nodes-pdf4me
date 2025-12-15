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
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
		description: 'URL of the file to convert',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToPowerpoint],
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
				operation: [ActionConstants.ConvertPdfToPowerpoint],
				inputDataType: ['base64', 'url'],
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
		// Returns blobId which is then used in ConvertPdfToPowerPoint API payload
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
		console.log('URL Input - docContent:', docContent);
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

	// Make the API request
	let responseData;
	try {
		responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToPowerPoint', body);
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
					sourceFileName: inputDocName,
					originalFileName,
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

