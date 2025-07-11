import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	sanitizeProfiles,
} from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const require: any;
declare const console: any;
declare const process: any;

// Debug configuration
interface DebugConfig {
	enabled: boolean;
	logLevel: 'none' | 'basic' | 'detailed' | 'verbose';
	logToConsole: boolean;
	logToFile: boolean;
	logFilePath?: string;
	performanceTracking: boolean;
	errorTracking: boolean;
}

// Performance tracking
interface PerformanceMetrics {
	startTime: number;
	endTime?: number;
	duration?: number;
	steps: {
		name: string;
		startTime: number;
		endTime?: number;
		duration?: number;
	}[];
	memoryUsage?: {
		heapUsed: number;
		heapTotal: number;
		external: number;
	};
}

// Debug logger class
class DebugLogger {
	private config: DebugConfig;
	private metrics: PerformanceMetrics;
	private logs: string[] = [];

	constructor(config: DebugConfig) {
		this.config = config;
		this.metrics = {
			startTime: Date.now(),
			steps: [],
		};
	}

	log(level: string, message: string, data?: any): void {
		if (!this.config.enabled) return;

		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
		
		this.logs.push(logEntry);
		
		if (data) {
			this.logs.push(`Data: ${JSON.stringify(data, null, 2)}`);
		}

		if (this.config.logToConsole) {
			console.log(logEntry);
			if (data) {
				console.log('Data:', data);
			}
		}
	}

	startStep(stepName: string): void {
		if (!this.config.performanceTracking) return;
		
		this.metrics.steps.push({
			name: stepName,
			startTime: Date.now(),
		});
		
		this.log('debug', `Starting step: ${stepName}`);
	}

	endStep(stepName: string): void {
		if (!this.config.performanceTracking) return;
		
		const step = this.metrics.steps.find(s => s.name === stepName);
		if (step) {
			step.endTime = Date.now();
			step.duration = step.endTime - step.startTime;
			this.log('debug', `Completed step: ${stepName} (${step.duration}ms)`);
		}
	}

	endExecution(): PerformanceMetrics {
		this.metrics.endTime = Date.now();
		this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
		
		if (this.config.performanceTracking) {
			// Get memory usage if available
			if (typeof process !== 'undefined' && process.memoryUsage) {
				this.metrics.memoryUsage = process.memoryUsage();
			}
			
			this.log('info', `Total execution time: ${this.metrics.duration}ms`);
			this.log('info', 'Performance metrics:', this.metrics);
		}

		return this.metrics;
	}

	getLogs(): string[] {
		return [...this.logs];
	}

	clearLogs(): void {
		this.logs = [];
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
				operation: ['AddAttachmentToPdf'],
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
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
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
				operation: ['AddAttachmentToPdf'],
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
				operation: ['AddAttachmentToPdf'],
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
				operation: ['AddAttachmentToPdf'],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the PDF file to add attachments to',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: ['AddAttachmentToPdf'],
				inputDataType: ['filePath'],
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
				operation: ['AddAttachmentToPdf'],
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
				operation: ['AddAttachmentToPdf'],
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
				operation: ['AddAttachmentToPdf'],
			},
		},
		options: [
			{
				name: 'attachment',
				displayName: 'Attachment',
				values: [
					{
						displayName: 'Attachment Name',
						name: 'attachmentName',
						type: 'string',
						default: '',
						description: 'Name for the attachment file (with extension)',
						placeholder: 'document.txt',
						required: true,
					},
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
							{
								name: 'File Path',
								value: 'filePath',
								description: 'Provide local file path',
							},
						],
					},
					{
						displayName: 'Binary Field Name',
						name: 'attachmentBinaryField',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the attachment file',
						placeholder: 'data',
						displayOptions: {
							show: {
								attachmentContentType: ['binaryData'],
							},
						},
					},
					{
						displayName: 'Base64 Content',
						name: 'attachmentBase64Content',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						default: '',
						description: 'Base64 encoded attachment content',
						placeholder: 'SGVsbG8gV29ybGQ=',
						displayOptions: {
							show: {
								attachmentContentType: ['base64'],
							},
						},
					},
					{
						displayName: 'File URL',
						name: 'attachmentUrl',
						type: 'string',
						default: '',
						description: 'URL to the attachment file',
						placeholder: 'https://example.com/attachment.txt',
						displayOptions: {
							show: {
								attachmentContentType: ['url'],
							},
						},
					},
					{
						displayName: 'File Path',
						name: 'attachmentFilePath',
						type: 'string',
						default: '',
						description: 'Local file path to the attachment file',
						placeholder: '/path/to/attachment.txt',
						displayOptions: {
							show: {
								attachmentContentType: ['filePath'],
							},
						},
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
				operation: ['AddAttachmentToPdf'],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
			{
				displayName: 'Use Async Processing',
				name: 'useAsync',
				type: 'boolean',
				default: true,
				description: 'Whether to use asynchronous processing for better handling of large files',
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
				operation: ['AddAttachmentToPdf'],
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
					{ name: 'Verbose', value: 'verbose', description: 'Maximum detail including data dumps' },
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
			{
				displayName: 'Track Performance',
				name: 'trackPerformance',
				type: 'boolean',
				default: true,
				description: 'Track execution time and memory usage',
				displayOptions: {
					show: {
						enableDebug: [true],
					},
				},
			},
			{
				displayName: 'Include Debug Info in Output',
				name: 'includeDebugInOutput',
				type: 'boolean',
				default: false,
				description: 'Include debug information in the node output',
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
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	// const docName = this.getNodeParameter('docName', index) as string; // Not used in current implementation
	const attachments = this.getNodeParameter('attachments', index) as IDataObject;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const debugOptions = this.getNodeParameter('debugOptions', index) as IDataObject;
	const useAsync = advancedOptions?.useAsync !== false; // Default to true

	// Initialize debug logger
	const debugConfig: DebugConfig = {
		enabled: debugOptions?.enableDebug === true,
		logLevel: (debugOptions?.debugLogLevel as any) || 'basic',
		logToConsole: debugOptions?.logToConsole !== false,
		logToFile: false,
		performanceTracking: debugOptions?.trackPerformance !== false,
		errorTracking: true,
	};

	const logger = new DebugLogger(debugConfig);
	logger.log('info', 'Starting Add Attachment to PDF operation', {
		inputDataType,
		outputFileName,
		useAsync,
		debugEnabled: debugConfig.enabled,
	});

	try {

		logger.startStep('input_processing');
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
					'Common property names are "data" for file uploads or the filename without extension.'
				);
			}

			docContent = item[0].binary[binaryPropertyName].data;
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
			docContent = await downloadPdfFromUrl(pdfUrl, logger);
			logger.log('debug', 'PDF downloaded successfully', {
				contentLength: docContent.length,
				contentPreview: docContent.substring(0, 100) + '...',
			});
		} else if (inputDataType === 'filePath') {
			logger.log('debug', 'Processing file path input');
			// Read PDF from local file path
			const filePath = this.getNodeParameter('filePath', index) as string;
			logger.log('debug', 'Reading PDF from file path', { filePath });
			docContent = await readPdfFromFile(filePath, logger);
			logger.log('debug', 'PDF read successfully', {
				contentLength: docContent.length,
				contentPreview: docContent.substring(0, 100) + '...',
			});
		} else {
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}
		logger.endStep('input_processing');

		logger.startStep('validation');
		// Validate PDF content
		validatePdfContent(docContent, inputDataType, logger);
		logger.endStep('validation');

		logger.startStep('attachment_processing');
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

					attachmentContent = item[0].binary[binaryFieldName].data;
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
					attachmentContent = await downloadPdfFromUrl(attachmentUrl, logger);
					logger.log('debug', 'Attachment downloaded successfully', {
						contentLength: attachmentContent.length,
						contentPreview: attachmentContent.substring(0, 100) + '...',
					});
				} else if (attachmentContentType === 'filePath') {
					logger.log('debug', 'Processing attachment as file path');
					// Read attachment from local file path
					const attachmentFilePath = attachment.attachmentFilePath as string;
					logger.log('debug', 'Reading attachment from file path', { filePath: attachmentFilePath });
					attachmentContent = await readPdfFromFile(attachmentFilePath, logger);
					logger.log('debug', 'Attachment read successfully', {
						contentLength: attachmentContent.length,
						contentPreview: attachmentContent.substring(0, 100) + '...',
					});
				} else {
					throw new Error(`Unsupported attachment content type: ${attachmentContentType}`);
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
		logger.endStep('attachment_processing');

		logger.startStep('request_preparation');
		// Build the request body
		const body: IDataObject = {
			docName: outputFileName,
			docContent: docContent,
			attachments: attachmentArray,
		};

		logger.log('debug', 'Request body prepared', {
			docName: outputFileName,
			contentLength: docContent.length,
			attachmentCount: attachmentArray.length,
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
		logger.endStep('request_preparation');

		logger.startStep('api_request');
		// Make the API request
		let result: any;
		logger.log('debug', 'Making API request', { useAsync, endpoint: '/api/v2/AddAttachmentToPdf' });
		
		if (useAsync) {
			result = await pdf4meAsyncRequest.call(this, '/api/v2/AddAttachmentToPdf', body);
		} else {
			result = await pdf4meApiRequest.call(this, '/api/v2/AddAttachmentToPdf', body);
		}
		
		logger.log('debug', 'API request completed successfully', {
			resultType: typeof result,
			resultLength: result ? result.length : 0,
		});
		logger.endStep('api_request');

		logger.startStep('output_preparation');
		// Return the result as binary data
		const binaryData = await this.helpers.prepareBinaryData(
			result,
			outputFileName,
			'application/pdf',
		);
		logger.endStep('output_preparation');

		// Get final performance metrics
		const metrics = logger.endExecution();
		
		// Prepare output
		const output: any = {
			json: {
				success: true,
				message: 'PDF with attachments created successfully',
				fileName: outputFileName,
				mimeType: 'application/pdf',
				fileSize: result.length,
				attachmentCount: attachmentArray.length,
			},
			binary: {
				data: binaryData,
			},
		};

		// Include debug information if requested
		if (debugOptions?.includeDebugInOutput && debugConfig.enabled) {
			output.json.debug = {
				performance: metrics,
				logs: logger.getLogs(),
				config: debugConfig,
			};
		}

		logger.log('info', 'Add Attachment to PDF operation completed successfully', {
			fileName: outputFileName,
			attachmentCount: attachmentArray.length,
			totalDuration: metrics.duration,
		});

		return [output];
	} catch (error) {
		logger.log('error', 'Add Attachment to PDF operation failed', {
			error: error.message,
			stack: error.stack,
		});
		
		// Get performance metrics even on error
		const metrics = logger.endExecution();
		
		// Include debug information in error if requested
		if (debugOptions?.includeDebugInOutput && debugConfig.enabled) {
			throw new Error(`Add Attachment to PDF failed: ${error.message}\n\nDebug Info:\n${JSON.stringify({
				performance: metrics,
				logs: logger.getLogs(),
				config: debugConfig,
			}, null, 2)}`);
		}
		
		throw error;
	}
}

/**
 * Download PDF content from a URL
 */
async function downloadPdfFromUrl(pdfUrl: string, logger?: DebugLogger): Promise<string> {
	const https = require('https');
	const http = require('http');

	const parsedUrl = new URL(pdfUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	// Set up request options with timeout and user agent
	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000, // 30 seconds timeout
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'application/pdf,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			// Check for error status codes
			if (res.statusCode !== 200) {
				const error = `HTTP Error ${res.statusCode}: ${res.statusMessage}`;
				logger?.log('error', 'Download failed with HTTP error', { statusCode: res.statusCode, statusMessage: res.statusMessage });
				reject(new Error(error));
				return;
			}

			const chunks: any[] = [];
			let totalSize = 0;

			res.on('data', (chunk: any) => {
				chunks.push(chunk);
				totalSize += chunk.length;
			});

			res.on('end', () => {
				if (totalSize === 0) {
					logger?.log('error', 'Downloaded file is empty');
					reject(new Error('Downloaded file is empty. Please check the URL.'));
					return;
				}

				// Combine chunks and convert to base64
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');
				logger?.log('debug', 'File downloaded successfully', { 
					url: pdfUrl, 
					fileSize: totalSize, 
					base64Length: base64Content.length 
				});
				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				logger?.log('error', 'Download stream error', { error: error.message });
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			logger?.log('error', 'Request error', { error: error.message });
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			logger?.log('error', 'Download timeout');
			req.destroy();
			reject(new Error('Download timeout. The server took too long to respond.'));
		});

		req.end();
	});
}

/**
 * Read PDF content from a local file path
 */
async function readPdfFromFile(filePath: string, logger?: DebugLogger): Promise<string> {
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');
		logger?.log('debug', 'File read successfully', { 
			filePath, 
			fileSize: fileBuffer.length, 
			base64Length: base64Content.length 
		});
		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			logger?.log('error', 'File not found', { filePath });
			throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
		} else if (error.code === 'EACCES') {
			logger?.log('error', 'Permission denied', { filePath });
			throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
		} else {
			logger?.log('error', 'File read error', { filePath, error: error.message });
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
}

/**
 * Validate PDF content
 */
function validatePdfContent(docContent: string, inputDataType: string, logger?: DebugLogger): void {
	if (!docContent || docContent.trim() === '') {
		logger?.log('error', 'Empty PDF content provided', { inputDataType });
		throw new Error(`Empty PDF content provided via ${inputDataType}`);
	}

	logger?.log('debug', 'Validating PDF content', { 
		inputDataType, 
		contentLength: docContent.length,
		contentPreview: docContent.substring(0, 100) + '...'
	});

	// Basic validation for base64 content
	if (inputDataType === 'base64') {
		try {
			Buffer.from(docContent, 'base64');
			logger?.log('debug', 'Base64 validation passed');
		} catch (error) {
			logger?.log('error', 'Invalid base64 content', { error: error.message });
			throw new Error('Invalid base64 encoded PDF content');
		}
	}

	logger?.log('debug', 'PDF content validation completed successfully');
}
