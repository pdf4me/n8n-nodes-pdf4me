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
		hint: 'Compress image using various algorithms. See our <b><a href="https://docs.pdf4me.com/n8n/image/compress-image/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'compressed-image',
		displayOptions: {
			show: {
				operation: [ActionConstants.CompressImage],
			},
		},
	},
];


export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const imageType = this.getNodeParameter('imageType', index) as string;
	const compressionLevel = this.getNodeParameter('compressionLevel', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Helper function to extract image type from filename
	const extractImageTypeFromFilename = (filename: string): string => {
		const extension = filename.split('.').pop()?.toLowerCase() || '';
		if (extension === 'png') return 'png';
		if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
		return 'png'; // default
	};

	// Main image content and metadata
	let docContent: string = '';
	let base64Content: string = '';
	let docName: string = outputFileName;
	let blobId: string = '';
	let payloadImageType: string = imageType.toLowerCase();

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// Get binary data from n8n using the proper helper method
		// Flow: Binary Data → Buffer/Stream (via getBinaryDataBuffer) → FormData → UploadBlob → blobId → CompressImage API
		// Note: n8n Cloud uses Filesystem storage by default, which stores files on disk
		// getBinaryDataBuffer() loads the file into memory, but FormData can handle this efficiently
		// for filesystem-stored binary data in n8n Cloud
		const binaryData = item[0].binary[binaryPropertyName];
		docName = binaryData.fileName || outputFileName;

		// Use n8n's helper to get binary data as Buffer
		// In n8n Cloud with Filesystem storage, this efficiently reads from disk
		// The buffer is then passed to FormData which streams it to the API
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Extract input image type from filename for payload
		payloadImageType = extractImageTypeFromFilename(docName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in CompressImage API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

		docContent = `${blobId}`; // Use blobId format when using blob
	} else if (inputDataType === 'base64') {
		base64Content = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
		docContent = base64Content; // Use base64 data directly in docContent
	} else if (inputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;

		docName = imageUrl.split('/').pop() || outputFileName;
		// Extract input image type from URL for payload
		payloadImageType = extractImageTypeFromFilename(docName);

		blobId = '';
		docContent = imageUrl; // Use URL string directly in docContent
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		imageType: payloadImageType,
		compressionLevel,
		IsAsync: true,
		docContent, // Use docContent for all input types (blobId format for binaryData, base64 string for base64, URL string for url)
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/CompressImage', body);

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
				[binaryDataName || 'data']: binaryData,
			},
		},
	];
}