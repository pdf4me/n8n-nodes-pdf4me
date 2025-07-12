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
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF data',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
		options: [
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF files from previous nodes',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file paths to PDF files',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URLs to PDF files',
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFiles',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['binaryData'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'Binary Property Name',
						name: 'binaryPropertyName',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the PDF file',
						placeholder: 'data',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFilesBase64',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['base64'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'Base64 Content',
						name: 'base64Content',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						default: '',
						description: 'Base64 encoded PDF content',
						placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PA...',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFilesUrl',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['url'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'PDF URL',
						name: 'pdfUrl',
						type: 'string',
						default: '',
						description: 'URL to the PDF file',
						placeholder: 'https://example.com/document.pdf',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFilesPath',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['filePath'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'File Path',
						name: 'filePath',
						type: 'string',
						default: '',
						description: 'Local file path to the PDF file',
						placeholder: '/path/to/document.pdf',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'merged_output.pdf',
		description: 'Name for the output merged PDF file',
		placeholder: 'merged_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'merged_output',
		description: 'Name of the output document for reference',
		placeholder: 'merged-document',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
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
				operation: [ActionConstants.MergeMultiplePDFs],
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
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents based on input data type
		const pdfContentsBase64 = await getPdfContents.call(this, index, inputDataType);

		// Validate that we have at least 2 PDFs to merge
		if (pdfContentsBase64.length < 2) {
			throw new Error('At least 2 PDF files are required for merging');
		}

		// Build the request body for merging multiple PDFs
		const body: IDataObject = {
			docContent: pdfContentsBase64,
			docName,
		};

		// Add profiles if provided
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;

		sanitizeProfiles(body);

		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Merge', body);

		// Handle the binary response (merged PDF file data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				// Extract name from docName if available, otherwise use default
				const baseName = docName || 'merged_output';
				fileName = `${baseName}.pdf`;
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
						inputFileCount: pdfContentsBase64.length,
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
		throw new Error(`PDF merge operation failed: ${errorMessage}`);
	}
}

async function getPdfContents(this: IExecuteFunctions, index: number, inputDataType: string): Promise<string[]> {
	let pdfContentsBase64: string[];

	if (inputDataType === 'binaryData') {
		// Get PDF contents from multiple binary files
		const pdfFiles = this.getNodeParameter('pdfFiles', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];
        
		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		const item = this.getInputData(index);
		pdfContentsBase64 = [];

		for (const pdfFile of pdfFileArray) {
			const binaryPropertyName = pdfFile.binaryPropertyName as string;
            
			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				const fileName = pdfFile.fileName as string || binaryPropertyName;
				throw new Error(`No binary data found in property '${binaryPropertyName}' for file '${fileName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			const base64Content = buffer.toString('base64');
			pdfContentsBase64.push(base64Content);
		}
	} else if (inputDataType === 'base64') {
		// Get PDF contents from multiple base64 files
		const pdfFiles = this.getNodeParameter('pdfFilesBase64', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];
        
		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		pdfContentsBase64 = [];
		for (const pdfFile of pdfFileArray) {
			const base64Content = pdfFile.base64Content as string;
			if (!base64Content || base64Content.trim() === '') {
				const fileName = pdfFile.fileName as string || 'unnamed';
				throw new Error(`Base64 content is required for file '${fileName}'`);
			}
			pdfContentsBase64.push(base64Content.trim());
		}
	} else if (inputDataType === 'url') {
		// Get PDF contents from multiple URLs
		const pdfFiles = this.getNodeParameter('pdfFilesUrl', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];
        
		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		pdfContentsBase64 = [];
		for (const pdfFile of pdfFileArray) {
			const pdfUrl = pdfFile.pdfUrl as string;
			if (!pdfUrl || pdfUrl.trim() === '') {
				const fileName = pdfFile.fileName as string || 'unnamed';
				throw new Error(`PDF URL is required for file '${fileName}'`);
			}
			const base64Content = await downloadPdfFromUrl(pdfUrl.trim());
			pdfContentsBase64.push(base64Content);
		}
	} else if (inputDataType === 'filePath') {
		// Get PDF contents from multiple file paths
		const pdfFiles = this.getNodeParameter('pdfFilesPath', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];
        
		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		pdfContentsBase64 = [];
		for (const pdfFile of pdfFileArray) {
			const filePath = pdfFile.filePath as string;
			if (!filePath || filePath.trim() === '') {
				const fileName = pdfFile.fileName as string || 'unnamed';
				throw new Error(`File path is required for file '${fileName}'`);
			}
			const base64Content = await readPdfFromFile(filePath.trim());
			pdfContentsBase64.push(base64Content);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	return pdfContentsBase64;
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
                        'Please use the final URL directly instead of the redirecting URL.'
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
                    '- Server is experiencing issues'
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
                        'Please check the URL and ensure it points directly to a PDF file.'
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
                        'Please ensure the URL points to a valid PDF file.'
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