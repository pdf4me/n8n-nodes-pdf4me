import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { sanitizeProfiles, ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

// Make Node.js globals available
// declare const URL: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to rotate',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
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
		description: 'Name of the binary property containing the file to rotate',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
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
				operation: [ActionConstants.RotateDocument],
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
		description: 'Base64 encoded content of the file to rotate',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
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
		description: 'URL of the file to rotate',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
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
				operation: [ActionConstants.RotateDocument],
				inputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name of the output PDF document',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
			},
		},
		hint: 'Rotate document. See our <b><a href="https://docs.pdf4me.com/n8n/organize/rotate-document/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Rotation Type',
		name: 'rotationType',
		type: 'options',
		required: true,
		default: 'UpsideDown',
		description: 'Type of rotation to apply to the entire document',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
			},
		},
		options: [
			{
				name: 'No Rotation',
				value: 'NoRotation',
				description: 'Keep the document as is',
			},
			{
				name: 'Clockwise',
				value: 'Clockwise',
				description: 'Rotate 90 degrees clockwise',
			},
			{
				name: 'Counter Clockwise',
				value: 'CounterClockwise',
				description: 'Rotate 90 degrees counter-clockwise',
			},
			{
				name: 'Upside Down',
				value: 'UpsideDown',
				description: 'Rotate 180 degrees (upside down)',
			},
		],
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.RotateDocument],
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
				operation: [ActionConstants.RotateDocument],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: '{ \'outputDataFormat\': \'json\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const rotationType = this.getNodeParameter('rotationType', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main document content and metadata
	let docContent: string = '';
	let inputDocName: string = '';

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

		console.log('[RotateDocument] Processing binary data input:', {
			binaryPropertyName,
			fileName: binaryData.fileName,
		});

		// Convert binary data to base64 - everything should be sent via docContent
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		console.log('[RotateDocument] Binary data converted to base64:', {
			inputDocName,
			base64Length: docContent.length,
			base64LengthKB: Math.round(docContent.length / 1024),
		});
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

		console.log('[RotateDocument] Processing base64 input:', {
			base64Length: docContent.length,
			base64LengthKB: Math.round(docContent.length / 1024),
			inputDocName,
		});
	} else if (inputDataType === 'url') {
		// URL input - send URL as string directly in docContent
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		inputDocName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!inputDocName) {
			throw new Error('Input file name is required for URL input type.');
		}

		console.log('[RotateDocument] Processing URL input:', {
			fileUrl,
			inputDocName,
		});

		// Send URL as string directly in docContent - no conversion or modification
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
	} else {
		// For binary and base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('Document content is required');
		}
		// Validate base64 format for binary and base64 inputs
		if (inputDataType === 'binaryData' || inputDataType === 'base64') {
			// Basic base64 validation - check if it can be decoded
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
		}
	}

	// Build the request body - everything is sent via docContent
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'output.pdf';
	const body: IDataObject = {
		docContent, // Binary and base64 are sent as base64 string, URL is sent as URL string (no conversion)
		docName: finalDocName,
		rotationType,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	console.log('[RotateDocument] Request payload prepared:', {
		docName: finalDocName,
		hasDocContent: !!body.docContent,
		docContentLength: typeof body.docContent === 'string' ? body.docContent.length : 0,
		docContentLengthKB: typeof body.docContent === 'string' ? Math.round(body.docContent.length / 1024) : 0,
		docContentPreview: typeof body.docContent === 'string'
			? (body.docContent.startsWith('http')
				? body.docContent
				: `${body.docContent.substring(0, 50)}...`)
			: '(empty)',
		rotationType,
	});

	// Make the API request
	console.log('[RotateDocument] Sending request to /api/v2/Rotate');
	let responseData;
	try {
		responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Rotate', body);
	} catch (error: unknown) {
		// Provide better error messages with debugging information
		const errorObj = error as { statusCode?: number; message?: string };
		if (errorObj.statusCode === 500) {
			throw new Error(
				`PDF4Me server error (500): ${errorObj.message || 'The service was not able to process your request.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${finalDocName}, ` +
				`docContentLength=${docContent?.length || 0}, ` +
				`docContentType=${typeof docContent === 'string' && docContent.startsWith('http') ? 'URL' : 'base64'}`
			);
		} else if (errorObj.statusCode === 400) {
			throw new Error(
				`Bad request (400): ${errorObj.message || 'Please check your parameters.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${finalDocName}`
			);
		}
		throw error;
	}
	console.log('[RotateDocument] Rotate API response received:', {
		resultType: typeof responseData,
		resultLength: responseData?.length || 0,
		resultLengthKB: responseData?.length ? Math.round(responseData.length / 1024) : 0,
		resultLengthMB: responseData?.length ? Math.round((responseData.length / 1024 / 1024) * 100) / 100 : 0,
		isBuffer: Buffer.isBuffer(responseData),
	});

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
		let fileName = docName || finalDocName || `rotated_${Date.now()}.pdf`;
		if (!fileName.endsWith('.pdf')) {
			fileName = `${fileName}.pdf`;
		}

		console.log('[RotateDocument] Preparing binary data output:', {
			outputFileName: fileName,
			mimeType: 'application/pdf',
			binaryDataName: binaryDataName || 'data',
		});

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/pdf',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		console.log('[RotateDocument] Document rotation completed successfully:', {
			outputFileName: fileName,
			mimeType: 'application/pdf',
			fileSize: responseData.length,
			fileSizeKB: Math.round(responseData.length / 1024),
			fileSizeMB: Math.round((responseData.length / 1024 / 1024) * 100) / 100,
			inputDataType,
			sourceFileName: inputDocName,
			rotationType,
		});

		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: responseData.length,
					success: true,
					message: 'Document rotated successfully',
					inputDataType,
					sourceFileName: inputDocName,
					docName: finalDocName,
					rotationType,
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

