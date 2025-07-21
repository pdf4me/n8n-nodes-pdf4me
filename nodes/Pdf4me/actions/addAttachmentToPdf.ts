import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
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
 *   "async": true					  // Optional: Use async processing for large files
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

// Simplified debug configuration
interface DebugConfig {
	enabled: boolean;
	logLevel: 'none' | 'basic' | 'detailed';
	logToConsole?: boolean;
}

// Simplified debug logger class
class DebugLogger {
	private config: DebugConfig;

	constructor(config: DebugConfig) {
		this.config = config;
	}

	log(level: string, message: string, data?: any): void {
		if (!this.config.enabled) return;



		if (this.config.logToConsole !== false) {
			if (data) {
				// Log data if needed
			}
		}
	}
}

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
			{
				displayName: 'Use Async Processing',
				name: 'useAsync',
				type: 'boolean',
				default: true,
				description: 'Whether to use asynchronous processing. Recommended for big files and high call volumes to reduce server load.',
			},
		],
	},
	{
		displayName: 'Debug Options',
		name: 'debugOptions',
		type: 'collection',
		placeholder: 'Add Debug Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddAttachmentToPdf],
			},
		},
		options: [
			{
				displayName: 'Enable Debug Mode',
				name: 'enableDebug',
				type: 'boolean',
				default: false,
				description: 'Enable comprehensive debugging and logging',
			},
			{
				displayName: 'Debug Log Level',
				name: 'debugLogLevel',
				type: 'options',
				default: 'basic',
				description: 'Level of detail for debug logging',
				displayOptions: {
					show: {
						enableDebug: [true],
					},
				},
				options: [
					{ name: 'Basic', value: 'basic', description: 'Essential information only' },
					{ name: 'Detailed', value: 'detailed', description: 'Include step-by-step details' },
				],
			},
			{
				displayName: 'Log to Console',
				name: 'logToConsole',
				type: 'boolean',
				default: true,
				description: 'Output debug logs to console',
				displayOptions: {
					show: {
						enableDebug: [true],
					},
				},
			},
		],
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
	const debugOptions = this.getNodeParameter('debugOptions', index) as IDataObject;
	const useAsync = advancedOptions?.useAsync !== false; // Default to true

	// Initialize debug logger
	const debugConfig: DebugConfig = {
		enabled: debugOptions?.enableDebug === true,
		logLevel: (debugOptions?.debugLogLevel as any) || 'basic',
	};

	const logger = new DebugLogger(debugConfig);
	logger.log('info', 'Starting Add Attachment to PDF operation', {
		inputDataType,
		outputFileName,
		useAsync,
		debugEnabled: debugConfig.enabled,
	});

	try {
		let docContent: string;

		// Handle different input data types for the main PDF
		if (inputDataType === 'binaryData') {
			logger.log('debug', 'Processing binary data input');
			// Get PDF content from binary data
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const item = this.getInputData(index);

			logger.log('debug', 'Binary data analysis', {
				hasBinary: !!item[0].binary,
				availableProperties: item[0].binary ? Object.keys(item[0].binary) : [],
				requestedProperty: binaryPropertyName,
			});

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

			// Get binary data buffer and convert to base64
			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			docContent = buffer.toString('base64');
			logger.log('debug', 'Binary data extracted', {
				contentLength: docContent.length,
				contentPreview: docContent.substring(0, 100) + '...',
			});
		} else if (inputDataType === 'base64') {
			logger.log('debug', 'Processing base64 input');
			// Get PDF content from base64 string
			docContent = this.getNodeParameter('base64Content', index) as string;
			logger.log('debug', 'Base64 content received', {
				contentLength: docContent.length,
				contentPreview: docContent.substring(0, 100) + '...',
			});
		} else if (inputDataType === 'url') {
			logger.log('debug', 'Processing URL input');
			// Download PDF from URL
			const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
			logger.log('debug', 'Downloading PDF from URL', { url: pdfUrl });
			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
				method: 'GET' as const,
				url: pdfUrl,
				encoding: 'arraybuffer' as const,
			});
			const buffer = Buffer.from(response as Buffer);
			docContent = buffer.toString('base64');
			logger.log('debug', 'PDF downloaded successfully', {
				contentLength: docContent.length,
				contentPreview: docContent.substring(0, 100) + '...',
			});
		} else {
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}

		// Validate PDF content
		validatePdfContent(docContent, inputDataType, logger);

		// Additional validation for API request
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is empty or invalid');
		}

		// Ensure docName has .pdf extension
		const docName = this.getNodeParameter('docName', index) as string || 'document.pdf';
		validateFileExtension(docName, '.pdf', logger);

		// Process attachments
		const attachmentArray: IDataObject[] = [];

		logger.log('debug', 'Processing attachments', {
			hasAttachments: !!attachments.attachment,
			attachmentCount: attachments.attachment && Array.isArray(attachments.attachment) ? attachments.attachment.length : 0,
		});

		if (attachments.attachment && Array.isArray(attachments.attachment)) {
			for (let i = 0; i < attachments.attachment.length; i++) {
				const attachment = attachments.attachment[i] as IDataObject;
				const attachmentName = attachment.attachmentName as string;
				const attachmentContentType = attachment.attachmentContentType as string;

				logger.log('debug', `Processing attachment ${i + 1}/${attachments.attachment.length}`, {
					name: attachmentName,
					contentType: attachmentContentType,
				});

				let attachmentContent: string;

				if (attachmentContentType === 'binaryData') {
					logger.log('debug', 'Processing attachment as binary data');
					// Get attachment from binary data
					const binaryFieldName = attachment.attachmentBinaryField as string;
					const item = this.getInputData(index);

					logger.log('debug', 'Attachment binary data analysis', {
						hasBinary: !!item[0].binary,
						availableProperties: item[0].binary ? Object.keys(item[0].binary) : [],
						requestedProperty: binaryFieldName,
					});

					if (!item[0].binary || !item[0].binary[binaryFieldName]) {
						throw new Error(`Attachment binary field '${binaryFieldName}' not found.`);
					}

					// Get attachment binary data buffer and convert to base64
					const attachmentBuffer = await this.helpers.getBinaryDataBuffer(index, binaryFieldName);
					attachmentContent = attachmentBuffer.toString('base64');
					logger.log('debug', 'Attachment binary data extracted', {
						contentLength: attachmentContent.length,
						contentPreview: attachmentContent.substring(0, 100) + '...',
					});
				} else if (attachmentContentType === 'base64') {
					logger.log('debug', 'Processing attachment as base64');
					// Get attachment from base64 string
					attachmentContent = attachment.attachmentBase64Content as string;
					logger.log('debug', 'Attachment base64 content received', {
						contentLength: attachmentContent.length,
						contentPreview: attachmentContent.substring(0, 100) + '...',
					});
				} else if (attachmentContentType === 'url') {
					logger.log('debug', 'Processing attachment as URL');
					// Download attachment from URL
					const attachmentUrl = attachment.attachmentUrl as string;
					logger.log('debug', 'Downloading attachment from URL', { url: attachmentUrl });
					const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
						method: 'GET' as const,
						url: attachmentUrl,
						encoding: 'arraybuffer' as const,
					});
					const buffer = Buffer.from(response as Buffer);
					attachmentContent = buffer.toString('base64');
					logger.log('debug', 'Attachment downloaded successfully', {
						contentLength: attachmentContent.length,
						contentPreview: attachmentContent.substring(0, 100) + '...',
					});
				} else {
					throw new Error(`Unsupported attachment content type: ${attachmentContentType}`);
				}

				// Validate attachment name has proper extension
				validateFileExtension(attachmentName, '', logger); // Empty string means just check for any extension

				// Validate attachment content (similar to PDF validation)
				if (!attachmentContent || attachmentContent.trim() === '') {
					throw new Error(`Empty attachment content for: ${attachmentName}`);
				}

				// Basic validation for attachment base64 content
				try {
					const attachmentBuffer = Buffer.from(attachmentContent, 'base64');
					if (attachmentBuffer.length === 0) {
						throw new Error(`Attachment content is empty for: ${attachmentName}`);
					}
					logger.log('debug', 'Attachment content validation passed', {
						name: attachmentName,
						decodedSize: attachmentBuffer.length,
					});
				} catch (error) {
					logger.log('error', 'Invalid attachment base64 content', {
						name: attachmentName,
						error: error.message,
					});
					throw new Error(`Invalid base64 encoded attachment content for ${attachmentName}: ${error.message}`);
				}

				attachmentArray.push({
					docName: attachmentName,
					docContent: attachmentContent,
				});

				logger.log('debug', `Attachment ${i + 1} processed successfully`, { name: attachmentName });
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

		logger.log('debug', 'Request body prepared', {
			docName: body.docName,
			contentLength: docContent.length,
			attachmentCount: attachmentArray.length,
			async: useAsync,
			bodyKeys: Object.keys(body),
		});

		// Log a sample of the request body for debugging (without exposing full content)
		logger.log('debug', 'Request body sample', {
			docName: body.docName,
			docContentLength: typeof body.docContent === 'string' ? body.docContent.length : 0,
			docContentPreview: typeof body.docContent === 'string' ? body.docContent.substring(0, 50) + '...' : 'none',
			attachments: attachmentArray.map((att: any) => ({
				name: att.docName,
				contentLength: typeof att.docContent === 'string' ? att.docContent.length : 0,
				contentPreview: typeof att.docContent === 'string' ? att.docContent.substring(0, 50) + '...' : 'none',
			})),
		});

		// Additional debugging: Log the exact structure being sent (similar to C# example)
		logger.log('debug', 'Final request structure', {
			hasDocName: !!body.docName,
			hasDocContent: !!body.docContent,
			docContentType: typeof body.docContent,
			hasAttachments: !!body.attachments,
			attachmentCount: Array.isArray(body.attachments) ? body.attachments.length : 0,
			asyncFlag: useAsync,
			allKeys: Object.keys(body),
		});

		// Add custom profiles if provided
		if (advancedOptions.profiles) {
			logger.log('debug', 'Processing custom profiles');
			try {
				const profiles = JSON.parse(advancedOptions.profiles as string);
				sanitizeProfiles(profiles);
				Object.assign(body, profiles);
				logger.log('debug', 'Custom profiles applied successfully', { profiles });
			} catch (error) {
				logger.log('error', 'Failed to parse custom profiles', { error: error.message });
				throw new Error(`Invalid custom profiles JSON: ${error}`);
			}
		}

		// Make the API request (following C# example pattern)
		let result: any;
		logger.log('debug', 'Making API request', { useAsync, endpoint: '/api/v2/AddAttachmentToPdf' });

		// Use the appropriate request method based on async setting
		// For big files and too many calls async is recommended to reduce the server load
		if (useAsync) {
			result = await pdf4meAsyncRequest.call(this, '/api/v2/AddAttachmentToPdf', body);
		} else {
			result = await pdf4meApiRequest.call(this, '/api/v2/AddAttachmentToPdf', body);
		}

		logger.log('debug', 'API request completed successfully', {
			resultType: typeof result,
			resultLength: result ? result.length : 0,
		});

		// Ensure output filename has .pdf extension
		let finalOutputFileName = outputFileName;
		if (!finalOutputFileName.toLowerCase().endsWith('.pdf')) {
			finalOutputFileName = `${finalOutputFileName.replace(/\.[^.]*$/, '')}.pdf`;
			logger.log('debug', 'Added .pdf extension to output filename', {
				original: outputFileName,
				final: finalOutputFileName,
			});
		}

		// Return the result as binary data
		const binaryData = await this.helpers.prepareBinaryData(
			result,
			finalOutputFileName,
			'application/pdf',
		);

		// Prepare output
		const output: any = {
			json: {
				success: true,
				message: 'PDF with attachments created successfully',
				fileName: finalOutputFileName,
				mimeType: 'application/pdf',
				fileSize: result.length,
				attachmentCount: attachmentArray.length,
			},
			binary: {
				data: binaryData,
			},
		};

		logger.log('info', 'Add Attachment to PDF operation completed successfully', {
			fileName: finalOutputFileName,
			attachmentCount: attachmentArray.length,
		});

		return [output];
	} catch (error) {
		logger.log('error', 'Add Attachment to PDF operation failed', {
			error: error.message,
			stack: error.stack,
		});

		throw error;
	}
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
function validateFileExtension(fileName: string, expectedExtension: string, logger?: DebugLogger): void {
	if (expectedExtension === '') {
		// Just check for any extension
		if (!fileName.includes('.')) {
			logger?.log('warn', 'File name missing extension', { fileName });
		}
	} else if (!fileName.toLowerCase().endsWith(expectedExtension.toLowerCase())) {
		logger?.log('warn', `File name missing ${expectedExtension} extension`, { fileName, expectedExtension });
	}
}

/**
 * Validate PDF content (enhanced validation based on C# example)
 */
function validatePdfContent(docContent: string, inputDataType: string, logger?: DebugLogger): void {
	if (!docContent || docContent.trim() === '') {
		logger?.log('error', 'Empty PDF content provided', { inputDataType });
		throw new Error(`Empty PDF content provided via ${inputDataType}`);
	}

	logger?.log('debug', 'Validating PDF content', {
		inputDataType,
		contentLength: docContent.length,
		contentPreview: docContent.substring(0, 100) + '...',
	});

	// Enhanced validation for base64 content (similar to C# example)
	try {
		const buffer = Buffer.from(docContent, 'base64');

		// Check if the decoded content is reasonable size (at least 100 bytes for a minimal PDF)
		if (buffer.length < 100) {
			logger?.log('error', 'Decoded content too small for a valid PDF', {
				decodedSize: buffer.length,
				inputDataType,
			});
			throw new Error(`Decoded content too small (${buffer.length} bytes) for a valid PDF file`);
		}

		// Check if it starts with PDF signature (%PDF)
		const pdfSignature = buffer.toString('ascii', 0, 4);
		if (pdfSignature !== '%PDF') {
			logger?.log('warn', 'Content does not start with PDF signature', {
				signature: pdfSignature,
				inputDataType,
			});
			// Don't throw error here as some PDFs might have different headers
		}

		logger?.log('debug', 'PDF content validation passed', {
			decodedSize: buffer.length,
			pdfSignature: pdfSignature,
			inputDataType,
		});
	} catch (error) {
		if (error.message.includes('Decoded content too small') || error.message.includes('PDF signature')) {
			throw error;
		}
		logger?.log('error', 'Invalid base64 content', { error: error.message });
		throw new Error(`Invalid base64 encoded PDF content: ${error.message}`);
	}

	logger?.log('debug', 'PDF content validation completed successfully');
}
