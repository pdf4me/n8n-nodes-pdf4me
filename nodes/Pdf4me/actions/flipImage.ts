import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to flip',
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
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
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
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
				operation: [ActionConstants.FlipImage],
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
		description: 'URL to the image file to flip',
		placeholder: 'https://example.com/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
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
		description: 'Local file path to the image file to flip',
		placeholder: '/path/to/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'flipped_image.jpg',
		description: 'Name for the output flipped image file',
		placeholder: 'my-flipped-image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
			},
		},
	},
	{
		displayName: 'Orientation Type',
		name: 'orientationType',
		type: 'options',
		required: true,
		default: 'Vertical',
		description: 'Orientation to flip the image',
		options: [
			{ name: 'Horizontal', value: 'Horizontal' },
			{ name: 'Vertical', value: 'Vertical' },
			{ name: 'Horizontal and Vertical', value: 'HorizontalAndVertical' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.FlipImage],
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
				operation: [ActionConstants.FlipImage],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const orientationType = this.getNodeParameter('orientationType', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

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
		const axios = require('axios');
		const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
		const buffer = Buffer.from(response.data, 'binary');
		docContent = buffer.toString('base64');
		docName = imageUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		orientationType,
		async: useAsync,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/FlipImage', body);

	// Return the result as binary data
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
				message: 'Image flipped successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				orientationType,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
