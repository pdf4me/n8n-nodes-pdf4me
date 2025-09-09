import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Word Document Input Type',
		name: 'wordInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the Word document',
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Word document from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded Word document',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the Word document',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
	{
		displayName: 'Word Document Binary Property',
		name: 'wordBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				wordInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Word Document Name',
		name: 'wordDocumentName',
		type: 'string',
		default: '',
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				wordInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Word Document Content',
		name: 'wordBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded Word document content',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				wordInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Word Document Name',
		name: 'wordDocumentNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				wordInputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Word Document URL',
		name: 'wordDocumentUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the Word document',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				wordInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Image Input Type',
		name: 'imageInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the image file',
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use image file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded image file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the image file',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
	{
		displayName: 'Image Binary Property',
		name: 'imageBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				imageInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Image File Name',
		name: 'imageFileName',
		type: 'string',
		default: '',
		description: 'Name of the image file (including extension)',
		placeholder: 'image.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				imageInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Image Content',
		name: 'imageBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded image content',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				imageInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Image File Name',
		name: 'imageFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the image file (including extension)',
		placeholder: 'image.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				imageInputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the image file',
		placeholder: 'https://example.com/image.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
				imageInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Is First Page Skip',
		name: 'isFirstPageSkip',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
	{
		displayName: 'Page Numbers',
		name: 'pageNumbers',
		type: 'string',
		default: '1',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
	{
		displayName: 'Search Text',
		name: 'searchText',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output Word file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReplaceTextWithImageInWord],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const wordInputDataType = this.getNodeParameter('wordInputDataType', index) as string;
	const imageInputDataType = this.getNodeParameter('imageInputDataType', index) as string;
	const isFirstPageSkip = this.getNodeParameter('isFirstPageSkip', index) as boolean;
	const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
	const searchText = this.getNodeParameter('searchText', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let docName: string;
	let imageContent: string;
	let imageFileName: string;

	// Handle Word document input types
	if (wordInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('wordBinaryPropertyName', index) as string;
		const documentName = this.getNodeParameter('wordDocumentName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		docName = documentName || binaryData.fileName || 'document.docx';
	} else if (wordInputDataType === 'base64') {
		docContent = this.getNodeParameter('wordBase64Content', index) as string;
		docName = this.getNodeParameter('wordDocumentNameRequired', index) as string;
	} else if (wordInputDataType === 'url') {
		const documentUrl = this.getNodeParameter('wordDocumentUrl', index) as string;
		docName = this.getNodeParameter('wordDocumentNameRequired', index) as string;
		const options = { method: 'GET' as const, url: documentUrl, encoding: 'arraybuffer' as const };
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		docContent = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported Word document input type: ${wordInputDataType}`);
	}

	// Handle image input types
	if (imageInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('imageBinaryPropertyName', index) as string;
		const inputImageName = this.getNodeParameter('imageFileName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		imageContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		imageFileName = inputImageName || binaryData.fileName || 'image.png';
	} else if (imageInputDataType === 'base64') {
		imageContent = this.getNodeParameter('imageBase64Content', index) as string;
		imageFileName = this.getNodeParameter('imageFileNameRequired', index) as string;
	} else if (imageInputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		imageFileName = this.getNodeParameter('imageFileNameRequired', index) as string;
		const options = { method: 'GET' as const, url: imageUrl, encoding: 'arraybuffer' as const };
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		imageContent = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported image input type: ${imageInputDataType}`);
	}

	const payload = {
		docName,
		docContent,
		ImageFileName: imageFileName,
		ImageFileContent: imageContent,
		IsFirstPageSkip: isFirstPageSkip,
		PageNumbers: pageNumbers,
		SearchText: searchText,
		IsAsync: true,
	};
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ReplaceTextWithImageInWord', payload);
	if (responseData) {
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			'replace_text_with_image_output.docx',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		);
		return [
			{
				json: {
					fileName: 'replace_text_with_image_output.docx',
					mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					fileSize: responseData.length,
					success: true,
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
			},
		];
	}
	throw new Error('No response data received from PDF4ME API');
}