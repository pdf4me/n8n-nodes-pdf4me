import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and other Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const console: any;
declare const require: any;
declare const setTimeout: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Merge Type',
		name: 'mergeType',
		type: 'options',
		required: true,
		default: 'merge',
		description: 'Choose the type of PDF merging operation',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergePDF],
			},
		},
		options: [
			{
				name: 'Merge Multiple PDFs',
				value: 'merge',
				description: 'Combine multiple PDF files into a single PDF document',
			},
			{
				name: 'Overlay PDFs',
				value: 'overlay',
				description: 'Merge two PDF files one over another as overlay',
			},
		],
	},
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF data',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergePDF],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['merge'],
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
		displayName: 'Base PDF Binary Field',
		name: 'baseBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the base PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['binaryData'],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['binaryData'],
			},
		},
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['merge'],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['base64'],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['base64'],
			},
		},
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['merge'],
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
		displayName: 'Base PDF URL',
		name: 'basePdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the base PDF file',
		placeholder: 'https://example.com/base.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['url'],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['url'],
			},
		},
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['merge'],
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
		displayName: 'Base PDF File Path',
		name: 'basePdfFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the base PDF file',
		placeholder: '/path/to/base.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['filePath'],
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
				operation: [ActionConstants.MergePDF],
				mergeType: ['overlay'],
				inputDataType: ['filePath'],
			},
		},
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
				operation: [ActionConstants.MergePDF],
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
				operation: [ActionConstants.MergePDF],
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
				operation: [ActionConstants.MergePDF],
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
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const mergeType = this.getNodeParameter('mergeType', index) as string;
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		let responseData: Buffer;

		if (mergeType === 'merge') {
			// Merge multiple PDFs into single PDF
			responseData = await handleMergeMultiplePDFs.call(this, index, inputDataType, docName, advancedOptions);
		} else {
			// Overlay two PDFs
			responseData = await handleOverlayPDFs.call(this, index, inputDataType, advancedOptions);
		}

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
						mergeType,
						inputFileCount: mergeType === 'merge' ? 'multiple' : 2,
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

async function handleMergeMultiplePDFs(this: IExecuteFunctions, index: number, inputDataType: string, docName: string, advancedOptions: IDataObject): Promise<Buffer> {
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

	return await pdf4meAsyncRequest.call(this, '/api/v2/Merge', body);
}

async function handleOverlayPDFs(this: IExecuteFunctions, index: number, inputDataType: string, advancedOptions: IDataObject): Promise<Buffer> {
	let basePdfBase64: string;
	let layerPdfBase64: string;

	if (inputDataType === 'binaryData') {
		// Get PDF contents from binary data
		const baseBinaryPropertyName = this.getNodeParameter('baseBinaryPropertyName', index) as string;
		const layerBinaryPropertyName = this.getNodeParameter('layerBinaryPropertyName', index) as string;
		
		const item = this.getInputData(index);

		// Get base PDF
		if (!item[0].binary || !item[0].binary[baseBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${baseBinaryPropertyName}'`);
		}
		const baseBuffer = await this.helpers.getBinaryDataBuffer(index, baseBinaryPropertyName);
		basePdfBase64 = baseBuffer.toString('base64');

		// Get layer PDF
		if (!item[0].binary || !item[0].binary[layerBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${layerBinaryPropertyName}'`);
		}
		const layerBuffer = await this.helpers.getBinaryDataBuffer(index, layerBinaryPropertyName);
		layerPdfBase64 = layerBuffer.toString('base64');
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		basePdfBase64 = this.getNodeParameter('baseBase64Content', index) as string;
		layerPdfBase64 = this.getNodeParameter('layerBase64Content', index) as string;
		
		if (!basePdfBase64 || !layerPdfBase64) {
			throw new Error('Both base and layer PDF base64 contents are required');
		}
	} else if (inputDataType === 'url') {
		// Get PDF contents from URLs
		const basePdfUrl = this.getNodeParameter('basePdfUrl', index) as string;
		const layerPdfUrl = this.getNodeParameter('layerPdfUrl', index) as string;
		
		if (!basePdfUrl || !layerPdfUrl) {
			throw new Error('Both base and layer PDF URLs are required');
		}

		basePdfBase64 = await downloadPdfFromUrl(basePdfUrl);
		layerPdfBase64 = await downloadPdfFromUrl(layerPdfUrl);
	} else if (inputDataType === 'filePath') {
		// Get PDF contents from file paths
		const basePdfFilePath = this.getNodeParameter('basePdfFilePath', index) as string;
		const layerPdfFilePath = this.getNodeParameter('layerPdfFilePath', index) as string;
		
		if (!basePdfFilePath || !layerPdfFilePath) {
			throw new Error('Both base and layer PDF file paths are required');
		}

		basePdfBase64 = await readPdfFromFile(basePdfFilePath);
		layerPdfBase64 = await readPdfFromFile(layerPdfFilePath);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

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

	return await pdf4meAsyncRequest.call(this, '/api/v2/MergeOverlay', body);
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
						`Please use the final URL directly instead of the redirecting URL.`
					));
					return;
				}
			}

			// Check for error status codes
			if (res.statusCode !== 200) {
				reject(new Error(
					`HTTP Error ${res.statusCode}: ${res.statusMessage}\n` +
					`The server returned an error instead of the PDF file. ` +
					`This might indicate:\n` +
					`- The file doesn't exist\n` +
					`- Authentication is required\n` +
					`- The URL is incorrect\n` +
					`- Server is experiencing issues`
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
						`This might be an HTML error page instead of a PDF file. ` +
						`Please check the URL and ensure it points directly to a PDF file.`
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
						`Please ensure the URL points to a valid PDF file.`
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
					
					let errorMessage = `The downloaded file does not appear to be a valid PDF file. ` +
						`PDF files should start with "%PDF".\n\n` +
						`Downloaded content starts with: "${decodedContent}"\n\n`;

					if (isHtml) {
						errorMessage += `The downloaded content appears to be HTML (likely an error page). ` +
							`This usually means:\n` +
							`1. The URL requires authentication\n` +
							`2. The file doesn't exist\n` +
							`3. The server is returning an error page\n` +
							`4. The URL is incorrect\n\n` +
							`Please check the URL and ensure it points directly to a PDF file.`;
					} else {
						errorMessage += `This might indicate:\n` +
							`1. The file is corrupted\n` +
							`2. The URL points to a different file type\n` +
							`3. The server is not serving the file correctly\n\n` +
							`Please verify the URL and try again.`;
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
