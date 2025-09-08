import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';


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
				operation: [ActionConstants.AddTextWatermarkToImage],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'image_with_text_watermark.jpg',
		description: 'Name for the output image file with watermark',
		placeholder: 'my-image-with-text-watermark.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Watermark Text',
		name: 'watermarkText',
		type: 'string',
		default: 'PDF4me Sample Text',
		description: 'Text to be used as watermark',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Text Position',
		name: 'textPosition',
		type: 'options',
		default: 'bottomleft',
		description: 'Position of the watermark text on the image',
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
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Font Family',
		name: 'textFontFamily',
		type: 'string',
		default: 'Arial',
		description: 'Font family for the watermark text',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'textFontSize',
		type: 'number',
		default: 50,
		description: 'Font size for the watermark text (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Text Color',
		name: 'textColour',
		type: 'color',
		default: '#b4351a',
		description: 'Text color in hex format',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Underline',
		name: 'isUnderline',
		type: 'boolean',
		default: false,
		description: 'Make text underlined',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Italic',
		name: 'isItalic',
		type: 'boolean',
		default: true,
		description: 'Make text italic',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 1.0,
		description: 'Text opacity (0.0 to 1.0)',
		typeOptions: {
			minValue: 0,
			maxValue: 1,
			step: 0.01,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
	{
		displayName: 'Rotation Angle',
		name: 'rotationAngle',
		type: 'number',
		default: 0.0,
		description: 'Rotation angle for the text (float)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddTextWatermarkToImage],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
				textPosition: ['custom'],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
				textPosition: ['custom'],
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
				operation: [ActionConstants.AddTextWatermarkToImage],
			},
		},
	},
];

// Helper function to download image from URL and convert to base64



export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const watermarkText = this.getNodeParameter('watermarkText', index) as string;
	const textPosition = this.getNodeParameter('textPosition', index) as string;
	const textFontFamily = this.getNodeParameter('textFontFamily', index) as string;
	const textFontSize = this.getNodeParameter('textFontSize', index) as number;
	const textColour = this.getNodeParameter('textColour', index) as string;
	const isBold = this.getNodeParameter('isBold', index) as boolean;
	const isUnderline = this.getNodeParameter('isUnderline', index) as boolean;
	const isItalic = this.getNodeParameter('isItalic', index) as boolean;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const rotationAngle = this.getNodeParameter('rotationAngle', index) as number;
	const positionX = this.getNodeParameter('positionX', index, 0.0) as number;
	const positionY = this.getNodeParameter('positionY', index, 0.0) as number;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

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
	} else if (inputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const options = {

			method: 'GET' as const,

			url: imageUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response, 'binary');
		docContent = buffer.toString('base64');
		docName = imageUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		WatermarkText: watermarkText,
		TextPosition: textPosition,
		TextFontFamily: textFontFamily,
		TextFontSize: textFontSize,
		TextColour: textColour,
		IsBold: isBold,
		IsUnderline: isUnderline,
		IsItalic: isItalic,
		Opacity: opacity,
		RotationAngle: rotationAngle,
		PositionX: textPosition === 'custom' ? positionX : 0.0,
		PositionY: textPosition === 'custom' ? positionY : 0.0,
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/AddTextWatermarkToImage', body);

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
				message: 'Image with text watermark created successfully',
				fileName: outputFileName,
				mimeType: 'image/jpeg',
				fileSize: result.length,
				textPosition,
				watermarkText,
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
		},
	];
}
