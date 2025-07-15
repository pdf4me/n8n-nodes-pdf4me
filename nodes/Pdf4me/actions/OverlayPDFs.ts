import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and other Node.js globals available
// declare const Buffer: any;
// declare const URL: any;
// declare const console: any;
declare const require: any;
// declare const setTimeout: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Base PDF Input Type',
		name: 'baseInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the base PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use base PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base PDF content as base64 encoded string',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to base PDF file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to base PDF file',
			},
		],
	},
	{
		displayName: 'Layer PDF Input Type',
		name: 'layerInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the layer PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use layer PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide layer PDF content as base64 encoded string',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to layer PDF file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to layer PDF file',
			},
		],
	},
	{
		displayName: 'Base PDF Binary Field',
		name: 'baseBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the base PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Layer PDF Binary Field',
		name: 'layerBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the layer PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base PDF Base64 Content',
		name: 'baseBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded base PDF content',
		placeholder: 'base64content',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Layer PDF Base64 Content',
		name: 'layerBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded layer PDF content',
		placeholder: 'base64content',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Base PDF URL',
		name: 'basePdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the base PDF file',
		placeholder: 'https://example.com/base.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Layer PDF URL',
		name: 'layerPdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the layer PDF file',
		placeholder: 'https://example.com/layer.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Base PDF File Path',
		name: 'basePdfFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the base PDF file',
		placeholder: '/path/to/base.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Layer PDF File Path',
		name: 'layerPdfFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the layer PDF file',
		placeholder: '/path/to/layer.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'overlayed_output.pdf',
		description: 'Name for the output overlayed PDF file',
		placeholder: 'overlayed_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
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
				operation: [ActionConstants.OverlayPDFs],
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
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const baseInputType = this.getNodeParameter('baseInputType', index) as string;
		const layerInputType = this.getNodeParameter('layerInputType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents based on input data types
		const { basePdfBase64, layerPdfBase64 } = await getPdfContents.call(this, index, baseInputType, layerInputType);

		// Build the request body for overlay merging
		const body: IDataObject = {
			baseDocContent: basePdfBase64,
			baseDocName: 'base.pdf',
			layerDocContent: layerPdfBase64,
			layerDocName: 'layer.pdf',
		};

		// Add profiles if provided
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;

		sanitizeProfiles(body);

		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/MergeOverlay', body);

		// Handle the binary response (overlayed PDF file data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				fileName = 'overlayed_output.pdf';
			}

			// Ensure .pdf extension
			if (!fileName.toLowerCase().endsWith('.pdf')) {
				fileName = `${fileName.replace(/\.[^.]*$/, '')}.pdf`;
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
						inputFileCount: 2,
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}

		// Error case
		throw new Error('No response data received from PDF4ME API');
	} catch (error) {
		// Re-throw the error with additional context
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`PDF overlay operation failed: ${errorMessage}`);
	}
}

async function getPdfContents(this: IExecuteFunctions, index: number, baseInputType: string, layerInputType: string): Promise<{ basePdfBase64: string; layerPdfBase64: string }> {
	let basePdfBase64: string;
	let layerPdfBase64: string;

	// Get base PDF content
	if (baseInputType === 'binaryData') {
		const baseBinaryPropertyName = this.getNodeParameter('baseBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[baseBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${baseBinaryPropertyName}'`);
		}
		const baseBuffer = await this.helpers.getBinaryDataBuffer(index, baseBinaryPropertyName);
		basePdfBase64 = baseBuffer.toString('base64');
	} else if (baseInputType === 'base64') {
		basePdfBase64 = this.getNodeParameter('baseBase64Content', index) as string;
		if (!basePdfBase64) {
			throw new Error('Base PDF base64 content is required');
		}
	} else if (baseInputType === 'url') {
		const basePdfUrl = this.getNodeParameter('basePdfUrl', index) as string;
		if (!basePdfUrl) {
			throw new Error('Base PDF URL is required');
		}
		basePdfBase64 = await downloadPdfFromUrl(basePdfUrl);
	} else if (baseInputType === 'filePath') {
		const basePdfFilePath = this.getNodeParameter('basePdfFilePath', index) as string;
		if (!basePdfFilePath) {
			throw new Error('Base PDF file path is required');
		}
		basePdfBase64 = await readPdfFromFile(basePdfFilePath);
	} else {
		throw new Error(`Unsupported base PDF input type: ${baseInputType}`);
	}

	// Get layer PDF content
	if (layerInputType === 'binaryData') {
		const layerBinaryPropertyName = this.getNodeParameter('layerBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[layerBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${layerBinaryPropertyName}'`);
		}
		const layerBuffer = await this.helpers.getBinaryDataBuffer(index, layerBinaryPropertyName);
		layerPdfBase64 = layerBuffer.toString('base64');
	} else if (layerInputType === 'base64') {
		layerPdfBase64 = this.getNodeParameter('layerBase64Content', index) as string;
		if (!layerPdfBase64) {
			throw new Error('Layer PDF base64 content is required');
		}
	} else if (layerInputType === 'url') {
		const layerPdfUrl = this.getNodeParameter('layerPdfUrl', index) as string;
		if (!layerPdfUrl) {
			throw new Error('Layer PDF URL is required');
		}
		layerPdfBase64 = await downloadPdfFromUrl(layerPdfUrl);
	} else if (layerInputType === 'filePath') {
		const layerPdfFilePath = this.getNodeParameter('layerPdfFilePath', index) as string;
		if (!layerPdfFilePath) {
			throw new Error('Layer PDF file path is required');
		}
		layerPdfBase64 = await readPdfFromFile(layerPdfFilePath);
	} else {
		throw new Error(`Unsupported layer PDF input type: ${layerInputType}`);
	}

	return { basePdfBase64, layerPdfBase64 };
}

/**
 * Download PDF from URL and convert to base64
 */
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
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
			// Check for redirects
			if (res.statusCode >= 300 && res.statusCode < 400) {
				const location = res.headers.location;
				if (location) {
					reject(new Error(
						`URL redirects to: ${location}\n` +
						'Please use the final URL directly instead of the redirecting URL.',
					));
					return;
				}
			}

			// Check for error status codes
			if (res.statusCode !== 200) {
				reject(new Error(
					`HTTP Error ${res.statusCode}: ${res.statusMessage}\n` +
					'The server returned an error instead of the PDF file. ' +
					'This might indicate:\n' +
					'- The file doesn\'t exist\n' +
					'- Authentication is required\n' +
					'- The URL is incorrect\n' +
					'- Server is experiencing issues',
				));
				return;
			}

			const chunks: any[] = [];
			let totalSize = 0;

			res.on('data', (chunk: any) => {
				chunks.push(chunk);
				totalSize += chunk.length;

				// Check if we're getting too much data (likely HTML error page)
				if (totalSize > 1024 * 1024) { // 1MB limit
					req.destroy();
					reject(new Error(
						`Downloaded content is too large (${totalSize} bytes). ` +
						'This might be an HTML error page instead of a PDF file. ' +
						'Please check the URL and ensure it points directly to a PDF file.',
					));
				}
			});

			res.on('end', () => {
				if (totalSize === 0) {
					reject(new Error('Downloaded file is empty. Please check the URL.'));
					return;
				}

				// Combine chunks and convert to base64
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');

				// Validate the PDF content
				if (base64Content.length < 100) {
					reject(new Error(
						`Downloaded file is too small (${base64Content.length} base64 chars). ` +
						'Please ensure the URL points to a valid PDF file.',
					));
					return;
				}

				// Check if it starts with PDF header
				const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
				if (!decodedContent.startsWith('%PDF')) {
					// Try to get more info about what we actually downloaded
					const first100Chars = Buffer.from(base64Content, 'base64').toString('ascii', 0, 100);
					const isHtml = first100Chars.toLowerCase().includes('<html') ||
                                  first100Chars.toLowerCase().includes('<!doctype');

					let errorMessage = 'The downloaded file does not appear to be a valid PDF file. ' +
						'PDF files should start with "%PDF".\n\n' +
						`Downloaded content starts with: "${decodedContent}"\n\n`;

					if (isHtml) {
						errorMessage += 'The downloaded content appears to be HTML (likely an error page). ' +
							'This usually means:\n' +
							'1. The URL requires authentication\n' +
							'2. The file doesn\'t exist\n' +
							'3. The server is returning an error page\n' +
							'4. The URL is incorrect\n\n' +
							'Please check the URL and ensure it points directly to a PDF file.';
					} else {
						errorMessage += 'This might indicate:\n' +
							'1. The file is corrupted\n' +
							'2. The URL points to a different file type\n' +
							'3. The server is not serving the file correctly\n\n' +
							'Please verify the URL and try again.';
					}

					reject(new Error(errorMessage));
					return;
				}

				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Download timeout. The server took too long to respond.'));
		});

		req.end();
	});
}

/**
 * Read PDF from local file path and convert to base64
 */
async function readPdfFromFile(filePath: string): Promise<string> {
	const fs = require('fs');

	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');

		// Validate the PDF content
		if (base64Content.length < 100) {
			throw new Error('PDF file appears to be too small. Please ensure the file is a valid PDF.');
		}

		// Check if it starts with PDF header
		const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
		if (!decodedContent.startsWith('%PDF')) {
			throw new Error('The file does not appear to be a valid PDF file. PDF files should start with "%PDF".');
		}

		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
}