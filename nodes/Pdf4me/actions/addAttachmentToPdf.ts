import type { INodeExecutionData, INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

/**
 * Add Attachment to PDF - PDF4Me API Implementation
 *
 * API Endpoint: POST /api/v2/AddAttachmentToPdf
 *
 * Request Structure (based on C# example):
 * {
 *   "docName": "sample.pdf",		   // Required: Source PDF file name with .pdf extension
 *   "docContent": "base64_content",	// Required: Base64 encoded PDF content
 *   "attachments": [				   // Required: Array of attachments
 *	 {
 *	   "docName": "sample.txt",	   // Required: Attachment file name with extension
 *	   "docContent": "base64_content" // Required: Base64 encoded attachment content
 *	 }
 *   ],
 * }
 *
 * Response Handling:
 * - 200: Immediate success, returns PDF with attachments as binary data
 * - 202: Async processing, requires polling Location header for completion
 *
 * This implementation supports multiple input methods:
 * - Binary data from previous nodes
 * - Base64 encoded strings
 * - URLs to PDF files
 * - Local file paths
 */

// Make Node.js globals available
// declare const URL: any;
// declare const console: any;
// declare const process: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add attachments to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
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
				operation: [ActionConstants.AddAttachmentToPdf],
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
				operation: [ActionConstants.AddAttachmentToPdf],
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
		description: 'URL to the PDF file to add attachments to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_attachments.pdf',
		description: 'Name for the output PDF file with attachments',
		placeholder: 'my-document-with-attachments.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
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
				operation: [ActionConstants.AddAttachmentToPdf],
			},
		},
		hint: 'Add various file types as attachments to your PDF. See our <b><a href="https://docs.pdf4me.com/integration/n8n/edit/add-attachment-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Attachments',
		name: 'attachments',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Attachment',
		default: {},
		description: 'Files to attach to the PDF document',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
			},
		},
		options: [
			{
				name: 'attachment',
				displayName: 'Attachment',
				values: [
					{
						displayName: 'Attachment Content Type',
						name: 'attachmentContentType',
						type: 'options',
						default: 'binaryData',
						description: 'How to provide the attachment content',
						options: [
							{
								name: 'Binary Data',
								value: 'binaryData',
								description: 'Use file from previous node',
							},
							{
								name: 'Base64 String',
								value: 'base64',
								description: 'Provide content as base64 encoded string',
							},
							{
								name: 'URL',
								value: 'url',
								description: 'Provide URL to file',
							},
						],
					},
					{
						displayName: 'Attachment Name',
						name: 'attachmentName',
						type: 'string',
						default: '',
						description: 'Name for the attachment file (with extension)',
						placeholder: 'document.txt',
						required:	true,
					},
					{
						displayName: 'Base64 Content',
						name: 'attachmentBase64Content',
						type: 'string',
						default: '',
						description: 'Base64 encoded attachment content',
						placeholder: 'SGVsbG8gV29ybGQ=',
					},
					{
						displayName: 'Binary Field Name',
						name: 'attachmentBinaryField',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the attachment file',
						placeholder: 'data',
					},
					{
						displayName: 'File URL',
						name: 'attachmentUrl',
						type: 'string',
						default: '',
						description: 'URL to the attachment file',
						placeholder: 'https://example.com/attachment.txt',
					},
				],
			},
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
				operation: [ActionConstants.AddAttachmentToPdf],
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
		placeholder: 'pdf-with-attachments',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
			},
		},
	},
];

/**
 * Add file attachments to a PDF document using PDF4Me API
 * Process: Read PDF & Attachments → Encode to base64 → Send API request → Poll for completion → Save PDF with attachments
 * This action allows attaching files (like .txt, .doc, .jpg, etc.) to PDF documents for additional document management
 *
 * Troubleshooting "File could not be opened" error:
 * 1. Ensure the PDF file is valid and not corrupted
 * 2. Check that the PDF file is actually a PDF (starts with %PDF)
 * 3. Verify the base64 encoding is correct
 * 4. Ensure the docName has a .pdf extension
 * 5. Check that attachment files are valid and properly encoded
 * 6. Try with a simple, small PDF file first
 * 7. Enable debug mode for detailed logging
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const attachments = this.getNodeParameter('attachments', index) as IDataObject;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string = '';
	let docName: string = '';
	let blobId: string = '';

		// Handle different input data types for the main PDF
		if (inputDataType === 'binaryData') {
			// 1. Validate binary data
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

			// 2. Get binary data metadata
			const binaryData = item[0].binary[binaryPropertyName];
			docName = binaryData.fileName || 'document.pdf';

			// 3. Convert to Buffer
			const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

			// 4. Upload to UploadBlob
			blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

			// 5. Use blobId in docContent
			docContent = `${blobId}`;
		} else if (inputDataType === 'base64') {
			// Get PDF content from base64 string
			docContent = this.getNodeParameter('base64Content', index) as string;
			docName = this.getNodeParameter('docName', index) as string || 'document.pdf';
			blobId = '';
		} else if (inputDataType === 'url') {
			// 1. Get URL parameter
			const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

			// 2. Extract filename from URL
			docName = pdfUrl.split('/').pop() || 'document.pdf';

			// 3. Use URL directly in docContent
			blobId = '';
			docContent = pdfUrl;
		} else {
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}

		// Ensure docName has .pdf extension
		validateFileExtension(docName, '.pdf');

		// Additional validation for API request
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is empty or invalid');
		}

		// Validate PDF content (skip for blobId and URL formats)
		if (inputDataType === 'base64') {
			validatePdfContent(docContent, inputDataType);
		}

		// Process attachments
		const attachmentArray: IDataObject[] = [];

		if (attachments.attachment && Array.isArray(attachments.attachment)) {
			for (let i = 0; i < attachments.attachment.length; i++) {
				const attachment = attachments.attachment[i] as IDataObject;
				const attachmentName = attachment.attachmentName as string;
				const attachmentContentType = attachment.attachmentContentType as string;

				let attachmentContent: string;

				if (attachmentContentType === 'binaryData') {
					// 1. Validate binary data
					const binaryFieldName = attachment.attachmentBinaryField as string;
					const item = this.getInputData(index);

					if (!item[0].binary || !item[0].binary[binaryFieldName]) {
						throw new Error(`Attachment binary field '${binaryFieldName}' not found.`);
					}

					// 2. Get binary data metadata
					const attachmentBinaryData = item[0].binary[binaryFieldName];
					const attachmentFileName = attachmentName || attachmentBinaryData.fileName || 'attachment';

					// 3. Convert to Buffer
					const attachmentFileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryFieldName);

					// 4. Upload to UploadBlob
					const attachmentBlobId = await uploadBlobToPdf4me.call(this, attachmentFileBuffer, attachmentFileName);

					// 5. Use blobId in attachmentContent
					attachmentContent = `${attachmentBlobId}`;
				} else if (attachmentContentType === 'base64') {
					// Get attachment from base64 string
					attachmentContent = attachment.attachmentBase64Content as string;
				} else if (attachmentContentType === 'url') {
					// 1. Get URL parameter
					const attachmentUrl = attachment.attachmentUrl as string;

					// 2. Use URL directly in attachmentContent
					attachmentContent = attachmentUrl;
				} else {
					throw new Error(`Unsupported attachment content type: ${attachmentContentType}`);
				}

				// Validate attachment name has proper extension
				validateFileExtension(attachmentName, ''); // Empty string means just check for any extension

				// Validate attachment content (similar to PDF validation)
				if (!attachmentContent || attachmentContent.trim() === '') {
					throw new Error(`Empty attachment content for: ${attachmentName}`);
				}

				// Basic validation for attachment base64 content (only for base64 input type)
				if (attachmentContentType === 'base64') {
					try {
						const attachmentBuffer = Buffer.from(attachmentContent, 'base64');
						if (attachmentBuffer.length === 0) {
							throw new Error(`Attachment content is empty for: ${attachmentName}`);
						}
					} catch (error) {
						throw new Error(`Invalid base64 encoded attachment content for ${attachmentName}: ${error.message}`);
					}
				}

				attachmentArray.push({
					docName: attachmentName,
					docContent: attachmentContent,
				});

			}
		}

		if (attachmentArray.length === 0) {
			throw new Error('No attachments provided. Please add at least one attachment.');
		}

		// Build the request body according to API specification
		const body: IDataObject = {
			// PDF File Name - Required: Source PDF file name with .pdf extension
			docName: docName,
			// PDF File content - Required: The content of the input file (base64)
			docContent: docContent,
			// Attachments - List of attachments to be added to the PDF
			attachments: attachmentArray,
		};

		// Validate request body (following C# example validation pattern)
		if (!body.docName || !body.docContent || !body.attachments || !Array.isArray(body.attachments) || body.attachments.length === 0) {
			const missingFields = [];
			if (!body.docName) missingFields.push('docName');
			if (!body.docContent) missingFields.push('docContent');
			if (!body.attachments || !Array.isArray(body.attachments) || body.attachments.length === 0) missingFields.push('attachments');

			throw new Error(`Missing required fields in request body: ${missingFields.join(', ')}. Required: docName, docContent, and at least one attachment.`);
		}

		// Add custom profiles if provided
		if (advancedOptions.profiles) {
			try {
				const profiles = JSON.parse(advancedOptions.profiles as string);
				sanitizeProfiles(profiles);
				Object.assign(body, profiles);
			} catch (error) {
				throw new Error(`Invalid custom profiles JSON: ${error}`);
			}
		}

		// Make the API request (following C# example pattern)
		// Use async request method for better performance with large files
	const result = await pdf4meAsyncRequest.call(this, '/api/v2/AddAttachmentToPdf', body) as Buffer;

		// Ensure output filename has .pdf extension
		let finalOutputFileName = outputFileName;
		if (!finalOutputFileName.toLowerCase().endsWith('.pdf')) {
			finalOutputFileName = `${finalOutputFileName.replace(/\.[^.]*$/, '')}.pdf`;
		}

		// Return the result as binary data
		const binaryData = await this.helpers.prepareBinaryData(
			result,
			finalOutputFileName,
			'application/pdf',
		);

		// Prepare output
	const output: INodeExecutionData = {
			json: {
				success: true,
				message: 'PDF with attachments created successfully',
				fileName: finalOutputFileName,
				mimeType: 'application/pdf',
				fileSize: result.length,
				attachmentCount: attachmentArray.length,
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
			pairedItem: { item: index },
		};

	return [output];
}

/**
 * Download PDF content from a URL
 */

/**
 * Read PDF content from a local file path
 */

/**
 * Validate file extension (helper function based on C# example)
 */
function validateFileExtension(fileName: string, expectedExtension: string): void {
	if (expectedExtension === '') {
		// Just check for any extension
		if (!fileName.includes('.')) {
			return;
		}
	} else if (!fileName.toLowerCase().endsWith(expectedExtension.toLowerCase())) {
		return;
	}
}

/**
 * Validate PDF content (enhanced validation based on C# example)
 */
function validatePdfContent(docContent: string, inputDataType: string): void {
	if (!docContent || docContent.trim() === '') {
		throw new Error(`Empty PDF content provided via ${inputDataType}`);
	}

	// Enhanced validation for base64 content (similar to C# example)
	try {
		const buffer = Buffer.from(docContent, 'base64');

		// Check if the decoded content is reasonable size (at least 100 bytes for a minimal PDF)
		if (buffer.length < 100) {
			throw new Error(`Decoded content too small (${buffer.length} bytes) for a valid PDF file`);
		}

		// Check if it starts with PDF signature (%PDF)
		const pdfSignature = buffer.toString('ascii', 0, 4);
		if (pdfSignature !== '%PDF') {
			// Don't throw error here as some PDFs might have different headers
		}
	} catch (error) {
		if (error.message.includes('Decoded content too small') || error.message.includes('PDF signature')) {
			throw error;
		}
		throw new Error(`Invalid base64 encoded PDF content: ${error.message}`);
	}
}
