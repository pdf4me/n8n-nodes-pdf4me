import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

// Make Node.js globals available

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to extract attachments from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
		description: 'URL to the PDF file to extract attachments from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the document (used for processing)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
			},
		},
		hint: 'Extract attachment from PDF. See our <b><a href="https://docs.pdf4me.com/n8n/extract/extract-attachment-from-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'attachment',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use \'JSON\' to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: '{ \'outputDataFormat\': \'json\' }',
			},
		],
	},
];

/**
 * Extract Attachment from PDF - Extract embedded attachments from PDF documents using PDF4ME
 * Process: Read PDF document → Encode to base64 → Send API request → Poll for completion → Return attachment data
 *
 * This action extracts embedded attachments from PDF documents:
 * - Returns structured JSON data with all extracted attachments
 * - Supports various PDF document formats
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docName;
	let blobId: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

		// Get binary data from previous node
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are \'data\' for file uploads or the filename without extension.'
			);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// 2. Extract filename from URL
		inputDocName = pdfUrl.split('/').pop() || docName;

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = pdfUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName: inputDocName,
		IsAsync: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make API call
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractAttachmentFromPdf', body);

	// Handle the response (extracted attachment file as stream/binary)
	if (responseData) {
		// Define response structure types
		interface OutputDocument {
			fileName?: string;
			streamFile: string;
		}

		interface ResponseItem {
			documents?: unknown;
			outputDocuments?: OutputDocument[];
		}

		// Parse response - it should be JSON with outputDocuments array
		let parsedResponse: ResponseItem | ResponseItem[];

		if (Buffer.isBuffer(responseData)) {
			// If it's a buffer, parse as JSON string
			try {
				parsedResponse = JSON.parse(responseData.toString('utf8')) as ResponseItem | ResponseItem[];
			} catch (error) {
				throw new Error(`Failed to parse response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else if (typeof responseData === 'string') {
			// If it's a string, parse as JSON
			try {
				parsedResponse = JSON.parse(responseData) as ResponseItem | ResponseItem[];
			} catch (error) {
				throw new Error(`Failed to parse response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else {
			// Already parsed JSON object
			parsedResponse = responseData as ResponseItem | ResponseItem[];
		}

		// Handle array response (response is an array with objects containing outputDocuments)
		const responseArray = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];

		// Extract outputDocuments from the response
		const outputDocuments: OutputDocument[] = [];
		for (const item of responseArray) {
			if (item && item.outputDocuments && Array.isArray(item.outputDocuments)) {
				outputDocuments.push(...item.outputDocuments);
			}
		}

		if (outputDocuments.length === 0) {
			throw new Error('No attachments found in the PDF document');
		}

		// Process the first attachment
		const attachment = outputDocuments[0];

		if (!attachment || !attachment.streamFile) {
			throw new Error('No streamFile found in attachment data');
		}

		// Use the fileName from the response (e.g., "Test.txt")
		const fileName = attachment.fileName || `extracted_attachment_${Date.now()}.txt`;

		// Convert base64 streamFile to Buffer (binary data)
		let fileBuffer: Buffer;
		try {
			// Ensure streamFile is a string
			const streamFileData = typeof attachment.streamFile === 'string'
				? attachment.streamFile
				: String(attachment.streamFile);

			// Remove any whitespace that might be in the base64 string
			const cleanBase64 = streamFileData.trim().replace(/\s/g, '');

			// Validate base64 string is not empty
			if (!cleanBase64 || cleanBase64.length === 0) {
				throw new Error('streamFile is empty');
			}

			// Decode base64 to Buffer
			fileBuffer = Buffer.from(cleanBase64, 'base64');

			// Validate buffer was created successfully
			if (!fileBuffer || fileBuffer.length === 0) {
				throw new Error('Failed to create buffer from base64 data');
			}
		} catch (error) {
			throw new Error(`Failed to decode base64 streamFile to binary: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}

		// Determine MIME type based on file extension (respect the original fileName)
		let mimeType = 'application/octet-stream';
		const fileExtension = fileName.split('.').pop()?.toLowerCase();
		if (fileExtension === 'txt') {
			mimeType = 'text/plain';
		} else if (fileExtension === 'pdf') {
			mimeType = 'application/pdf';
		} else if (fileExtension === 'jpg' || fileExtension === 'jpeg') {
			mimeType = 'image/jpeg';
		} else if (fileExtension === 'png') {
			mimeType = 'image/png';
		} else if (fileExtension === 'zip') {
			mimeType = 'application/zip';
		}

		// Convert Buffer (decoded from base64) to n8n binary data format
		const binaryData = await this.helpers.prepareBinaryData(
			fileBuffer,
			fileName, // Use the original fileName from response (e.g., "Test.txt")
			mimeType,
		);

		// Return binary data - streamFile converted to binary
		return [
			{
				json: {
					success: true,
					message: 'Attachment extracted successfully and converted to binary',
					fileName,
					mimeType,
					fileSize: fileBuffer.length,
					sourceFileName: inputDocName,
					processingTimestamp: new Date().toISOString(),
					totalAttachments: outputDocuments.length,
				},
				binary: {
					[binaryDataName || 'data']: binaryData, // The streamFile converted from base64 to binary
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No attachment extraction results received from PDF4ME API');
}

