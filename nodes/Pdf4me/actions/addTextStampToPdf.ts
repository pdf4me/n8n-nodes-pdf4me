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
		description: 'Choose how to provide the PDF file to add text stamp to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
		description: 'URL to the PDF file to add text stamp to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
		description: 'Local file path to the PDF file to add text stamp to',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_text_stamp.pdf',
		description: 'Name for the output PDF file with text stamp',
		placeholder: 'my-document-with-stamp.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to be stamped on the PDF',
		placeholder: 'CONFIDENTIAL',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '1',
		description: 'Page numbers to add text stamp (e.g., 1, 1-3, 1,3,5)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
		description: 'Horizontal alignment of the text stamp',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
		default: 'Center',
		description: 'Vertical alignment of the text stamp',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 50,
		description: 'Opacity (0-100): 0=invisible, 100=fully opaque',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Font Name',
		name: 'fontName',
		type: 'options',
		options: [
			{ name: 'Arial', value: 'Arial' },
			{ name: 'Times New Roman', value: 'Times New Roman' },
			{ name: 'Helvetica', value: 'Helvetica' },
			{ name: 'Courier New', value: 'Courier New' },
		],
		default: 'Arial',
		description: 'Font for the text stamp',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 24,
		description: 'Font size (8-72)',
		typeOptions: {
			minValue: 8,
			maxValue: 72,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Font Color',
		name: 'fontColor',
		type: 'string',
		default: '#FF0000',
		description: 'Font color in hex: #000000 (black), #FF0000 (red), #0000FF (blue), #808080 (gray)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Bold',
		name: 'isBold',
		type: 'boolean',
		default: true,
		description: 'Make text bold',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Italic',
		name: 'isItalics',
		type: 'boolean',
		default: false,
		description: 'Make text italic',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Underline',
		name: 'underline',
		type: 'boolean',
		default: false,
		description: 'Underline the text',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Rotation',
		name: 'rotate',
		type: 'number',
		default: 45,
		description: 'Rotation angle: 0 (horizontal), 45 (diagonal), 90 (vertical), -45 (reverse diagonal)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Background Stamp',
		name: 'isBackground',
		type: 'boolean',
		default: true,
		description: 'Place stamp in background (true) or foreground (false)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Show Only in Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: false,
		description: 'Show stamp only when printing (true) or in view and print (false)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Transverse',
		name: 'transverse',
		type: 'boolean',
		default: false,
		description: 'Transverse positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
			},
		},
	},
	{
		displayName: 'Fit Text Over Page',
		name: 'fitTextOverPage',
		type: 'boolean',
		default: false,
		description: 'Fit text over entire page',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextStampToPdf],
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
				operation: [ActionConstants.AddTextStampToPdf],
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
	const text = this.getNodeParameter('text', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const marginXInMM = this.getNodeParameter('marginXInMM', index) as number;
	const marginYInMM = this.getNodeParameter('marginYInMM', index) as number;
	const marginXInPx = this.getNodeParameter('marginXInPx', index) as number;
	const marginYInPx = this.getNodeParameter('marginYInPx', index) as number;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const fontName = this.getNodeParameter('fontName', index) as string;
	const fontSize = this.getNodeParameter('fontSize', index) as number;
	const fontColor = this.getNodeParameter('fontColor', index) as string;
	const isBold = this.getNodeParameter('isBold', index) as boolean;
	const isItalics = this.getNodeParameter('isItalics', index) as boolean;
	const underline = this.getNodeParameter('underline', index) as boolean;
	const rotate = this.getNodeParameter('rotate', index) as number;
	const isBackground = this.getNodeParameter('isBackground', index) as boolean;
	const showOnlyInPrint = this.getNodeParameter('showOnlyInPrint', index) as boolean;
	const transverse = this.getNodeParameter('transverse', index) as boolean;
	const fitTextOverPage = this.getNodeParameter('fitTextOverPage', index) as boolean;

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

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		pages,
		text,
		alignX,
		alignY,
		marginXInMM,
		marginYInMM,
		marginXInPx,
		marginYInPx,
		opacity,
		fontName,
		fontSize,
		fontColor,
		isBold,
		isItalics,
		underline,
		rotate,
		isBackground,
		showOnlyInPrint,
		transverse,
		fitTextOverPage,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Stamp', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'document_with_text_stamp';
			fileName = `${baseName}_stamped.pdf`;
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
					message: 'Text stamp added successfully',
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