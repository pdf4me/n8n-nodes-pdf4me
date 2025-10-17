import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to resize',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
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
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
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
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
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
		description: 'URL to the image file to resize',
		placeholder: 'https://example.com/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
				inputDataType: ['url'],
			},
		},
		hint: 'Resize image. See our <b><a href="https://docs.pdf4me.com/n8n/image/resize-image/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'resize_image_output.jpg',
		description: 'Name for the output resized image file',
		placeholder: 'my-resized-image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
			},
		},
	},
	{
		displayName: 'Resize Type',
		name: 'resizeType',
		type: 'options',
		required: true,
		default: 'Percentage',
		description: 'Resize type: by percentage or specific dimensions',
		options: [
			{ name: 'Percentage', value: 'Percentage' },
			{ name: 'Specific', value: 'Specific' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
			},
		},
	},
	{
		displayName: 'Resize Percentage',
		name: 'resizePercentage',
		type: 'number',
		default: 50.0,
		description: 'Resize percentage (used if Resize Type is Percentage)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
				resizeType: ['Percentage'],
			},
		},
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: 800,
		description: 'Width in pixels (used if Resize Type is Specific)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
				resizeType: ['Specific'],
			},
		},
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: 600,
		description: 'Height in pixels (used if Resize Type is Specific)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
				resizeType: ['Specific'],
			},
		},
	},
	{
		displayName: 'Maintain Aspect Ratio',
		name: 'maintainAspectRatio',
		type: 'boolean',
		default: true,
		description: 'Maintain aspect ratio when resizing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Enable asynchronous processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'resized-image',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizeImage],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const resizeType = this.getNodeParameter('resizeType', index) as string;
	const maintainAspectRatio = this.getNodeParameter('maintainAspectRatio', index) as boolean;
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
		const buffer = Buffer.from(response as Buffer);
		docContent = buffer.toString('base64');
		docName = imageUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		ImageResizeType: resizeType,
		MaintainAspectRatio: maintainAspectRatio,
		IsAsync: true,
	};
	if (resizeType === 'Percentage') {
		const resizePercentage = this.getNodeParameter('resizePercentage', index);
		body.ResizePercentage = (resizePercentage ?? 50).toString();
	} else if (resizeType === 'Specific') {
		body.Width = this.getNodeParameter('width', index);
		body.Height = this.getNodeParameter('height', index);
	}

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ResizeImage', body);

	// Return the result as binary data (image)
	const mimeType = 'image/jpeg';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'Image resized successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				resizeType,
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
		},
	];
}
