import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input PDF Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
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
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
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
		description: 'Name of the binary property that contains the PDF file',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
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
		description: 'Base64 encoded PDF content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the PDF file',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output Image Extension',
		name: 'imageExtension',
		type: 'options',
		default: 'jpeg',
		description: 'Output image format',
		options: [
			{ name: 'JPEG', value: 'jpeg' },
			{ name: 'JPG', value: 'jpg' },
			{ name: 'PNG', value: 'png' },
			{ name: 'BMP', value: 'bmp' },
			{ name: 'GIF', value: 'gif' },
			{ name: 'JB2', value: 'jb2' },
			{ name: 'JP2', value: 'jp2' },
			{ name: 'JPF', value: 'jpf' },
			{ name: 'JPX', value: 'jpx' },
			{ name: 'TIF', value: 'tif' },
			{ name: 'TIFF', value: 'tiff' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Image Width (px)',
		name: 'widthPixel',
		type: 'number',
		default: 800,
		description: 'Width of the output image in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Page Numbers(comma-separated)',
		name: 'pageNumbers',
		type: 'string',
		default: '',
		description: 'Comma-separated list of page numbers to convert (e.g., "1,2,3"). Leave empty for all pages.',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Page Range',
		name: 'pageRange',
		type: 'string',
		default: '',
		description: 'Page range as string (e.g., "1-2", "2-", "1,3,5"). Leave empty for all pages.',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
	{
		displayName: 'Use Async Processing',
		name: 'useAsync',
		type: 'boolean',
		default: true,
		description: 'Whether to use asynchronous processing for large files',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateImagesFromPdf],
			},
		},
	},
];

// Helper function to download PDF from URL and convert to base64
async function downloadPdfFromUrl(pdfUrl: string): Promise<{base64: string, fileName: string}> {
	const https = require('https');
	const http = require('http');
	const { URL } = require('url');
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
				let fileName = parsedUrl.pathname.split('/').pop() || 'document.pdf';
				const contentDisposition = res.headers['content-disposition'];
				if (contentDisposition) {
					const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
					if (match) {
						fileName = match[1];
					}
				}
				resolve({ base64: base64Content, fileName });
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

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const imageExtension = this.getNodeParameter('imageExtension', index) as string;
	const widthPixel = this.getNodeParameter('widthPixel', index) as number;
	const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
	const pageRange = this.getNodeParameter('pageRange', index) as string;
	const useAsync = this.getNodeParameter('useAsync', index) as boolean;

	// Main PDF content
	let docContent: string;
	let docName: string = 'document.pdf';
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || 'document.pdf';
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		docContent = fileBuffer.toString('base64');
		docName = filePath.split('/').pop() || 'document.pdf';
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const { base64, fileName } = await downloadPdfFromUrl(pdfUrl);
		docContent = base64;
		docName = fileName || 'document.pdf';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const imageAction: IDataObject = {
		WidthPixel: String(widthPixel),
		ImageExtension: imageExtension,
		PageSelection: {}, // Always include PageSelection
	};
	const body: IDataObject = {
		docContent,
		docname: docName,
		imageAction,
		async: true,
	};
	imageAction.PageSelection = {};
	if (pageNumbers && pageNumbers.trim() !== '') {
		const pageNrs = pageNumbers.split(',').map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n) && n > 0);
		if (pageNrs.length > 0) {
			imageAction.PageSelection = { PageNrs: pageNrs };
			body.pageNrs = pageNumbers; // Send the raw string as well
		}
	}
	if (pageRange) {
		body.pageNrs = pageRange;
	}

	// Make the API request
	let result: any;
	if (useAsync) {
		result = await pdf4meAsyncRequest.call(this, '/api/v2/CreateImages', body);
	} else {
		result = await pdf4meApiRequest.call(this, '/api/v2/CreateImages', body);
	}

	// Parse the response and return all images as binary outputs
	let images: any[] = [];
	if (Array.isArray(result)) {
		images = result;
	} else if (result && typeof result === 'object') {
		if (Array.isArray(result.outputDocuments)) {
			images = result.outputDocuments.map((doc: any) => ({
				docContent: doc.streamFile,
				docName: doc.fileName,
			}));
		} else if (result.docContent && result.docName) {
			images = [result];
		}
	}
	if (!images.length) {
		throw new Error('No images returned from PDF4me API');
	}

	// Return each image as a separate binary output
	const outputs: INodeExecutionData[] = images.map((img, i) => {
		const buffer = Buffer.from(img.docContent, 'base64');
		const fileName = img.docName || `image_${i + 1}.${imageExtension}`;
		const mimeType = imageExtension === 'png' ? 'image/png'
			: imageExtension === 'jpg' || imageExtension === 'jpeg' ? 'image/jpeg'
				: imageExtension === 'gif' ? 'image/gif'
					: imageExtension === 'bmp' ? 'image/bmp'
						: imageExtension === 'tif' || imageExtension === 'tiff' ? 'image/tiff'
							: 'application/octet-stream';
		return {
			json: {
				success: true,
				message: 'PDF page converted to image successfully',
				fileName,
				mimeType,
				fileSize: buffer.length,
				pageIndex: i + 1,
			},
			binary: {
				data: {
					data: buffer.toString('base64'),
					fileName,
					mimeType,
				},
			},
		};
	});
	return outputs;
}
