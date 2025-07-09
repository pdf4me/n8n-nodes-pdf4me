import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to sign',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
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
		description: 'URL to the PDF file to sign',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
		description: 'Local file path to the PDF file to sign',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'signed_document.pdf',
		description: 'Name for the output signed PDF file',
		placeholder: 'my-signed-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Signature Image Input Type',
		name: 'signatureImageInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the signature image',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use signature image from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide signature image content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to signature image file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to signature image file',
			},
		],
	},
	{
		displayName: 'Signature Image Binary Field',
		name: 'signatureBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the signature image',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Signature Image Content',
		name: 'signatureBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded signature image content',
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Signature Image URL',
		name: 'signatureImageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the signature image file',
		placeholder: 'https://example.com/signature.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Signature Image File Path',
		name: 'signatureImageFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the signature image file',
		placeholder: '/path/to/signature.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Image Name',
		name: 'imageName',
		type: 'string',
		default: 'signature.png',
		description: 'Name of the signature image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '1',
		description: 'Page numbers to add signature (e.g., 1, 1-3, 1,3,5)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Alignment',
		name: 'alignX',
		type: 'options',
		options: [
			{ name: 'Left', value: 'Left' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Right', value: 'Right' },
		],
		default: 'Center',
		description: 'Horizontal alignment of the signature',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Alignment',
		name: 'alignY',
		type: 'options',
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Bottom', value: 'Bottom' },
		],
		default: 'Bottom',
		description: 'Vertical alignment of the signature',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Width (mm)',
		name: 'widthInMM',
		type: 'number',
		default: 50,
		description: 'Signature width in millimeters (10-200)',
		typeOptions: {
			minValue: 10,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Height (mm)',
		name: 'heightInMM',
		type: 'number',
		default: 25,
		description: 'Signature height in millimeters (10-200)',
		typeOptions: {
			minValue: 10,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Width (px)',
		name: 'widthInPx',
		type: 'number',
		default: 142,
		description: 'Signature width in pixels (20-600)',
		typeOptions: {
			minValue: 20,
			maxValue: 600,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Height (px)',
		name: 'heightInPx',
		type: 'number',
		default: 71,
		description: 'Signature height in pixels (20-600)',
		typeOptions: {
			minValue: 20,
			maxValue: 600,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (mm)',
		name: 'marginXInMM',
		type: 'number',
		default: 20,
		description: 'Horizontal margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (mm)',
		name: 'marginYInMM',
		type: 'number',
		default: 20,
		description: 'Vertical margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (px)',
		name: 'marginXInPx',
		type: 'number',
		default: 57,
		description: 'Horizontal margin in pixels (0-300)',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (px)',
		name: 'marginYInPx',
		type: 'number',
		default: 57,
		description: 'Vertical margin in pixels (0-300)',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 100,
		description: 'Opacity (0-100): 0=invisible, 100=fully opaque',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Show Only in Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: true,
		description: 'Show signature in view and print (true/false)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Background Signature',
		name: 'isBackground',
		type: 'boolean',
		default: false,
		description: 'Place signature in background (true) or foreground (false)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
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
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const signatureImageInputType = this.getNodeParameter('signatureImageInputType', index) as string;
	const imageName = this.getNodeParameter('imageName', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const widthInMM = this.getNodeParameter('widthInMM', index) as number;
	const heightInMM = this.getNodeParameter('heightInMM', index) as number;
	const widthInPx = this.getNodeParameter('widthInPx', index) as number;
	const heightInPx = this.getNodeParameter('heightInPx', index) as number;
	const marginXInMM = this.getNodeParameter('marginXInMM', index) as number;
	const marginYInMM = this.getNodeParameter('marginYInMM', index) as number;
	const marginXInPx = this.getNodeParameter('marginXInPx', index) as number;
	const marginYInPx = this.getNodeParameter('marginYInPx', index) as number;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const showOnlyInPrint = this.getNodeParameter('showOnlyInPrint', index) as boolean;
	const isBackground = this.getNodeParameter('isBackground', index) as boolean;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Download PDF from URL
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		docContent = await downloadPdfFromUrl(pdfUrl);
	} else if (inputDataType === 'filePath') {
		// Read PDF from local file path
		const filePath = this.getNodeParameter('filePath', index) as string;
		docContent = await readPdfFromFile(filePath);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Handle signature image input
	let imageFile: string;

	if (signatureImageInputType === 'binaryData') {
		// Get signature image from binary data
		const signatureBinaryPropertyName = this.getNodeParameter('signatureBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[signatureBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${signatureBinaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, signatureBinaryPropertyName);
		imageFile = buffer.toString('base64');
	} else if (signatureImageInputType === 'base64') {
		// Use base64 content directly
		imageFile = this.getNodeParameter('signatureBase64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:image/png;base64,")
		if (imageFile.includes(',')) {
			imageFile = imageFile.split(',')[1];
		}
	} else if (signatureImageInputType === 'url') {
		// Download signature image from URL
		const signatureImageUrl = this.getNodeParameter('signatureImageUrl', index) as string;
		imageFile = await downloadImageFromUrl(signatureImageUrl);
	} else if (signatureImageInputType === 'filePath') {
		// Read signature image from local file path
		const signatureImageFilePath = this.getNodeParameter('signatureImageFilePath', index) as string;
		imageFile = await readImageFromFile(signatureImageFilePath);
	} else {
		throw new Error(`Unsupported signature image input type: ${signatureImageInputType}`);
	}

	// Validate signature image content
	if (!imageFile || imageFile.trim() === '') {
		throw new Error('Signature image content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		imageFile,
		imageName,
		pages,
		alignX,
		alignY,
		widthInMM,
		heightInMM,
		widthInPx,
		heightInPx,
		marginXInMM,
		marginYInMM,
		marginXInPx,
		marginYInPx,
		opacity,
		showOnlyInPrint,
		isBackground,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/SignPdf', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'signed_document';
			fileName = `${baseName}_signed.pdf`;
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
					message: 'PDF signed successfully',
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageFromUrl(imageUrl: string): Promise<string> {
	const https = require('https');
	const http = require('http');

	const parsedUrl = new URL(imageUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'image/*,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
				return;
			}

			const chunks: any[] = [];
			res.on('data', (chunk: any) => {
				chunks.push(chunk);
			});

			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');
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
			reject(new Error('Download timeout'));
		});

		req.end();
	});
}

/**
 * Read image from local file path and convert to base64
 */
async function readImageFromFile(filePath: string): Promise<string> {
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');
		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
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

	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'application/pdf,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
				return;
			}

			const chunks: any[] = [];
			res.on('data', (chunk: any) => {
				chunks.push(chunk);
			});

			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');
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
			reject(new Error('Download timeout'));
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
		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
} 