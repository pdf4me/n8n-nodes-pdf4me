import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	uploadBlobToPdf4me,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available

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
				description: 'Provide watermark image content as base64 encoded string',
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
		hint: 'Add image watermark to your image. See our <b><a href="https://docs.pdf4me.com/n8n/image/add-image-watermark-to-image/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'watermarked-image',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageWatermarkToImage],
			},
		},
	},
];

// Add a helper function to download image from URL and convert to base64



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
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main image content
	let docContent: string = '';
	let docName: string = outputFileName;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// Get binary data metadata for filename
		const binaryData = item[0].binary[binaryPropertyName];
		docName = binaryData.fileName || outputFileName;

		// Convert to Buffer and upload to UploadBlob
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		// Use URL directly in docContent - no upload required
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		docName = imageUrl.split('/').pop() || outputFileName;
		docContent = imageUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Watermark image content
	let watermarkContent: string = '';
	let watermarkFileName: string = 'watermark.png';

	if (watermarkDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('watermarkBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}' for watermark`);
		}

		// Get binary data metadata for filename
		const binaryData = item[0].binary[binaryPropertyName];
		watermarkFileName = binaryData.fileName || 'watermark.png';

		// Convert to Buffer and upload to UploadBlob
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, watermarkFileName);
		watermarkContent = `${blobId}`;
	} else if (watermarkDataType === 'base64') {
		watermarkContent = this.getNodeParameter('watermarkBase64Content', index) as string;
	} else if (watermarkDataType === 'url') {
		// Use URL directly - no upload required
		const watermarkImageUrl = this.getNodeParameter('watermarkImageUrl', index) as string;
		watermarkFileName = watermarkImageUrl.split('/').pop() || 'watermark.png';
		watermarkContent = watermarkImageUrl;
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
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/AddImageWatermarkToImage', body);

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
				[binaryDataName || 'data']: binaryData,
			},
		},
	];
}
