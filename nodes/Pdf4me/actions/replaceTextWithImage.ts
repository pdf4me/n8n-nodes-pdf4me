import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'PDF Input Data Type',
		name: 'pdfInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
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
		],
	},
	{
		displayName: 'PDF Binary Field',
		name: 'pdfBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
				pdfInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'PDF Base64 Content',
		name: 'pdfBase64Content',
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
				operation: [ActionConstants.ReplaceTextWithImage],
				pdfInputDataType: ['base64'],
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
				operation: [ActionConstants.ReplaceTextWithImage],
				pdfInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Image Input Data Type',
		name: 'imageInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the replacement image',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
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
		displayName: 'Image Binary Field',
		name: 'imageBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
				imageInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Image Base64 Content',
		name: 'imageBase64Content',
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
				operation: [ActionConstants.ReplaceTextWithImage],
				imageInputDataType: ['base64'],
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
		placeholder: 'https://example.com/image.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
				imageInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Text to Replace',
		name: 'replaceText',
		type: 'string',
		required: true,
		default: '',
		description: 'Text in the PDF to be replaced with the image',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: 'all',
		description: 'Pages to apply the replacement (e.g., "all", "1", "1,3,5", "2-5")',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
			},
		},
	},
	{
		displayName: 'Image Height',
		name: 'imageHeight',
		type: 'number',
		default: 50,
		description: 'Height of the replacement image (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
			},
		},
	},
	{
		displayName: 'Image Width',
		name: 'imageWidth',
		type: 'number',
		default: 100,
		description: 'Width of the replacement image (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'replace_text_with_image.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-replaced-pdf.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImage],
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
				operation: [ActionConstants.ReplaceTextWithImage],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// PDF input
	const pdfInputDataType = this.getNodeParameter('pdfInputDataType', index) as string;
	let docContent: string;
	let docName: string = 'input.pdf';
	if (pdfInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || 'input.pdf';
	} else if (pdfInputDataType === 'base64') {
		docContent = this.getNodeParameter('pdfBase64Content', index) as string;
	} else if (pdfInputDataType === 'filePath') {
		throw new Error('File path input is not supported. Please use binary data, base64 string, or URL instead.');
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		try {
			const response = await this.helpers.request({
				method: 'GET',
				url: pdfUrl,
				encoding: null,
			});
			const buffer = Buffer.from(response, 'binary');
			docContent = buffer.toString('base64');
			docName = pdfUrl.split('/').pop() || 'input.pdf';
		} catch (error) {
			throw new Error(`Failed to fetch PDF from URL: ${error.message}`);
		}
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Image input
	const imageInputDataType = this.getNodeParameter('imageInputDataType', index) as string;
	let imageContent: string;
	if (imageInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('imageBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		imageContent = item[0].binary[binaryPropertyName].data;
	} else if (imageInputDataType === 'base64') {
		imageContent = this.getNodeParameter('imageBase64Content', index) as string;
	} else if (imageInputDataType === 'filePath') {
		throw new Error('File path input is not supported. Please use binary data, base64 string, or URL instead.');
	} else if (imageInputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		try {
			const response = await this.helpers.request({
				method: 'GET',
				url: imageUrl,
				encoding: null,
			});
			const buffer = Buffer.from(response, 'binary');
			imageContent = buffer.toString('base64');
		} catch (error) {
			throw new Error(`Failed to fetch image from URL: ${error.message}`);
		}
	} else {
		throw new Error(`Unsupported image input data type: ${imageInputDataType}`);
	}

	// Other parameters
	const replaceText = this.getNodeParameter('replaceText', index) as string;
	const pageSequence = this.getNodeParameter('pageSequence', index) as string;
	const imageHeight = this.getNodeParameter('imageHeight', index) as number;
	const imageWidth = this.getNodeParameter('imageWidth', index) as number;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		replaceText,
		pageSequence,
		imageContent,
		imageHeight,
		imageWidth,
		async: useAsync,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ReplaceTextWithImage', body);

	// Return the result as binary data (PDF)
	const mimeType = 'application/pdf';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'Text replaced with image successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
