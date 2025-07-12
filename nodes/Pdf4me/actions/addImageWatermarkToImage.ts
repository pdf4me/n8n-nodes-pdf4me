import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
// declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Image Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to watermark',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
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
				operation: [ActionConstants.AddImageWatermarkToImage],
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
				operation: [ActionConstants.AddImageWatermarkToImage],
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
				operation: [ActionConstants.AddImageWatermarkToImage],
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
				operation: [ActionConstants.AddImageWatermarkToImage],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Watermark Image Data Type',
		name: 'watermarkDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the watermark image',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use watermark image from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide watermark image as base64 encoded string',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to watermark image',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to watermark image',
			},
		],
	},
	{
		displayName: 'Watermark Binary Field',
		name: 'watermarkBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the watermark image',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				watermarkDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Watermark Content',
		name: 'watermarkBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded watermark image content',
		placeholder: 'iVBORw0KGgoAAAANSUhEUgAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				watermarkDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Watermark File Path',
		name: 'watermarkFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the watermark image',
		placeholder: '/path/to/watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				watermarkDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Watermark Image URL',
		name: 'watermarkImageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the watermark image file',
		placeholder: 'https://example.com/watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				watermarkDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'image_with_watermark.jpg',
		description: 'Name for the output image file with watermark',
		placeholder: 'my-image-with-watermark.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Position',
		name: 'position',
		type: 'options',
		default: 'topright',
		description: 'Position of the watermark on the image',
		options: [
			{ name: 'Top Right', value: 'topright' },
			{ name: 'Top Left', value: 'topleft' },
			{ name: 'Bottom Right', value: 'bottomright' },
			{ name: 'Bottom Left', value: 'bottomleft' },
			{ name: 'Central Horizontal', value: 'centralhorizontal' },
			{ name: 'Central Vertical', value: 'centralvertical' },
			{ name: 'Diagonal', value: 'diagonal' },
			{ name: 'Custom', value: 'custom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 1,
		description: 'Watermark opacity (0.0 to 1.0)',
		typeOptions: {
			minValue: 0,
			maxValue: 1,
			step: 0.01,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Horizontal Offset',
		name: 'horizontalOffset',
		type: 'number',
		default: 0,
		description: 'Horizontal offset for positioning (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Vertical Offset',
		name: 'verticalOffset',
		type: 'number',
		default: 0,
		description: 'Vertical offset for positioning (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 0.0,
		description: 'X position for custom positioning (float)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 0.0,
		description: 'Y position for custom positioning (float)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Rotation',
		name: 'rotation',
		type: 'number',
		default: 0.0,
		description: 'Rotation angle for watermark (float)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
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
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
];

// Add a helper function to download image from URL and convert to base64
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
				// Try to extract filename from Content-Disposition or fallback to URL
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
	const watermarkDataType = this.getNodeParameter('watermarkDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const position = this.getNodeParameter('position', index) as string;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const horizontalOffset = this.getNodeParameter('horizontalOffset', index) as number;
	const verticalOffset = this.getNodeParameter('verticalOffset', index) as number;
	const positionX = this.getNodeParameter('positionX', index, 0.0) as number;
	const positionY = this.getNodeParameter('positionY', index, 0.0) as number;
	const rotation = this.getNodeParameter('rotation', index) as number;
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

	// Watermark image content
	let watermarkContent: string;
	let watermarkFileName: string = 'watermark.png';
	if (watermarkDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('watermarkBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}' for watermark`);
		}
		watermarkContent = item[0].binary[binaryPropertyName].data;
		watermarkFileName = item[0].binary[binaryPropertyName].fileName || 'watermark.png';
	} else if (watermarkDataType === 'base64') {
		watermarkContent = this.getNodeParameter('watermarkBase64Content', index) as string;
	} else if (watermarkDataType === 'filePath') {
		const filePath = this.getNodeParameter('watermarkFilePath', index) as string;
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		watermarkContent = fileBuffer.toString('base64');
		watermarkFileName = filePath.split('/').pop() || 'watermark.png';
	} else if (watermarkDataType === 'url') {
		const watermarkImageUrl = this.getNodeParameter('watermarkImageUrl', index) as string;
		const { base64, fileName } = await downloadImageFromUrl(watermarkImageUrl);
		watermarkContent = base64;
		watermarkFileName = fileName || 'watermark.png';
	} else {
		throw new Error(`Unsupported watermark data type: ${watermarkDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		WatermarkFileName: watermarkFileName,
		WatermarkFileContent: watermarkContent,
		Position: position,
		Opacity: opacity,
		HorizontalOffset: horizontalOffset,
		VerticalOffset: verticalOffset,
		PositionX: position === 'custom' ? positionX : 0.0,
		PositionY: position === 'custom' ? positionY : 0.0,
		Rotation: rotation,
	};

	// Make the API request
	let result: any;
	if (useAsync) {
		result = await pdf4meAsyncRequest.call(this, '/api/v2/AddImageWatermarkToImage', body);
	} else {
		result = await pdf4meApiRequest.call(this, '/api/v2/AddImageWatermarkToImage', body);
	}

	// Return the result as binary data
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		'image/jpeg',
	);

	return [
		{
			json: {
				success: true,
				message: 'Image with watermark created successfully',
				fileName: outputFileName,
				mimeType: 'image/jpeg',
				fileSize: result.length,
				position,
				opacity,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
