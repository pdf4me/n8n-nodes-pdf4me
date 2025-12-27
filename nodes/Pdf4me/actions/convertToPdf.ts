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
		description: 'How to provide the input data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use binary data from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded content',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the file to convert',
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
				operation: [ActionConstants.ConvertToPdf],
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
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
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
				operation: [ActionConstants.ConvertToPdf],
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
		description: 'Name of the input file (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
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
		description: 'URL of the file to convert to PDF',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
				inputDataType: ['url'],
			},
		},

	},

	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'converted_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
			},
		},
		hint: 'Convert file to PDF. See our <b><a href="https://docs.pdf4me.com/n8n/convert/convert-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
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
		placeholder: 'converted-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertToPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	// Main document content and metadata
	let docContent: string = '';
	let docName: string = '';
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
		docName = inputFileName || binaryData.fileName || 'document';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ConvertToPdf API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
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
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
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

	// Build the request body - everything is sent via docContent
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName,
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
		responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertToPdf', body);
	} catch (error: unknown) {
		// Provide better error messages with debugging information
		const errorObj = error as { statusCode?: number; message?: string };
		if (errorObj.statusCode === 500) {
			throw new Error(
				`PDF4Me server error (500): ${errorObj.message || 'The service was not able to process your request.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${docName}, ` +
				`docContentLength=${docContent?.length || 0}, ` +
				`docContentType=${typeof docContent === 'string' && docContent.startsWith('http') ? 'URL' : inputDataType === 'binaryData' ? 'blobId' : 'base64'}`
			);
		} else if (errorObj.statusCode === 400) {
			throw new Error(
				`Bad request (400): ${errorObj.message || 'Please check your parameters.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${docName}`
			);
		}
		throw error;
	}

	// Handle the binary response (PDF data)
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
			fileName = `converted_${Date.now()}.pdf`;
		}

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/pdf',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: responseData.length,
					success: true,
					inputDataType,
					sourceFileName: docName,
				},
				binary: {
					[binaryDataKey]: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
