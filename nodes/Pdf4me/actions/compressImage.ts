import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Image Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to compress',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use image file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide image content as base64 encoded string',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to image file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to image file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the image file',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Image Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded image content',
		placeholder: 'iVBORw0KGgoAAAANSUhEUgAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Image File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the image file',
		placeholder: '/path/to/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the image file',
		placeholder: 'https://example.com/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'compressed_image.jpg',
		description: 'Name for the output compressed image file',
		placeholder: 'my-compressed-image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
			},
		},
	},
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		default: 'JPG',
		description: 'Output format for the compressed image',
		options: [
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
			},
		},
	},
	{
		displayName: 'Compression Level',
		name: 'compressionLevel',
		type: 'options',
		default: 'Medium',
		description: 'Compression level for the image',
		options: [
			{ name: 'Max', value: 'Max' },
			{ name: 'Medium', value: 'Medium' },
			{ name: 'Low', value: 'Low' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
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
				operation: [ActionConstants.CompressImage],
			},
		},
	},
];

// Helper function to download image from URL and convert to base64
async function downloadImageFromUrl(imageUrl: string): Promise<{base64: string, fileName: string}> {
	const https = require('https');
	const http = require('http');
	const { URL } = require('url');
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
				let fileName = parsedUrl.pathname.split('/').pop() || 'image.jpg';
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

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const imageType = this.getNodeParameter('imageType', index) as string;
	const compressionLevel = this.getNodeParameter('compressionLevel', index) as string;
	const useAsync = this.getNodeParameter('useAsync', index) as boolean;

	// Main image content
	let docContent: string;
	let docName: string = outputFileName;
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || outputFileName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		docContent = fileBuffer.toString('base64');
		docName = filePath.split('/').pop() || outputFileName;
	} else if (inputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const { base64, fileName } = await downloadImageFromUrl(imageUrl);
		docContent = base64;
		docName = fileName || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		imageType,
		compressionLevel,
	};

	// Make the API request
	let result: any;
	if (useAsync) {
		result = await pdf4meAsyncRequest.call(this, '/api/v2/CompressImage', body);
	} else {
		result = await pdf4meApiRequest.call(this, '/api/v2/CompressImage', body);
	}

	// Return the result as binary data
	const mimeType = imageType === 'PNG' ? 'image/png' : 'image/jpeg';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'Image compressed successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				imageType,
				compressionLevel,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
