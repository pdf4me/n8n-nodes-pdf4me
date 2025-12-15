import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Image Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertImageFormat],
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
				operation: [ActionConstants.ConvertImageFormat],
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
				operation: [ActionConstants.ConvertImageFormat],
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
				operation: [ActionConstants.ConvertImageFormat],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'converted_image.png',
		description: 'Name for the output converted image file',
		placeholder: 'my-converted-image.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertImageFormat],
			},
		},
		hint: 'Convert image format. See our <b><a href="https://docs.pdf4me.com/n8n/image/convert-image-format/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Current Image Format',
		name: 'currentImageFormat',
		type: 'options',
		default: 'JPG',
		description: 'Current format of the input image',
		options: [
			{ name: 'BMP', value: 'BMP' },
			{ name: 'GIF', value: 'GIF' },
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
			{ name: 'TIFF', value: 'TIFF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertImageFormat],
			},
		},
	},
	{
		displayName: 'New Image Format',
		name: 'newImageFormat',
		type: 'options',
		default: 'PNG',
		description: 'Format to convert the image to',
		options: [
			{ name: 'BMP', value: 'BMP' },
			{ name: 'GIF', value: 'GIF' },
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
			{ name: 'TIFF', value: 'TIFF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertImageFormat],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'converted-image',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertImageFormat],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const currentImageFormat = this.getNodeParameter('currentImageFormat', index) as string;
	const newImageFormat = this.getNodeParameter('newImageFormat', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main image content
	let docContent: string = '';
	let docName: string = outputFileName;
	let blobId: string = '';

	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		const imageFileName = binaryData.fileName || outputFileName;
		docName = imageFileName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, imageFileName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;

		// 2. Extract filename from URL
		docName = imageUrl.split('/').pop() || outputFileName;

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = imageUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		currentImageFormat,
		newImageFormat,
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertImageFormat', body);

	// Return the result as binary data
	let mimeType = 'image/png';
	switch (newImageFormat) {
	case 'JPG': mimeType = 'image/jpeg'; break;
	case 'PNG': mimeType = 'image/png'; break;
	case 'GIF': mimeType = 'image/gif'; break;
	case 'BMP': mimeType = 'image/bmp'; break;
	case 'TIFF': mimeType = 'image/tiff'; break;
	}
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	// Determine the binary data name
	const binaryDataKey = binaryDataName || 'data';

	return [
		{
			json: {
				success: true,
				message: 'Image format converted successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				currentImageFormat,
				newImageFormat,
			},
			binary: {
				[binaryDataKey]: binaryData,
			},
		},
	];
}
