/**
 * AI Auto Crop Document Action
 * API Endpoint: POST /api/v2/AiAutoCropDocument
 *
 * Automatically crops a document using AI to remove borders and unwanted areas.
 * Async handling (202 + Location polling) is done by pdf4meAsyncRequest in GenericFunctions.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject  } from 'n8n-workflow';
import {
	ActionConstants,
	pdf4meAsyncRequest,
	sanitizeProfiles,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the document to crop',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use document file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide document content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to document file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the document file',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Document Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the document file to crop',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the document (used for processing)',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
			},
		},
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the cropped document file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AiAutoCropDocument],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description:
					'Use "JSON" to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
				placeholder: '{ "outputDataFormat": "base64" }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docNameParam = this.getNodeParameter('docName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docNameParam || 'document.pdf';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
					'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docNameParam || 'document.pdf';

		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;
		try {
			new URL(documentUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the document file.');
		}
		inputDocName = documentUrl.split('/').pop() || docNameParam || 'document.pdf';
		docContent = documentUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('Document content is required');
	}

	const finalDocName = docNameParam || inputDocName || 'document.pdf';

	const body: IDataObject = {
		docName: finalDocName,
		docContent,
		isAsync: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/AiAutoCropDocument', body);

	if (!responseData) {
		throw new Error('No response data received from AiAutoCropDocument API');
	}

	const fileName = finalDocName;
	const extension = fileName.split('.').pop()?.toLowerCase() || 'pdf';
	const mimeTypeMap: Record<string, string> = {
		pdf: 'application/pdf',
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		bmp: 'image/bmp',
		webp: 'image/webp',
		tiff: 'image/tiff',
	};
	const mimeType = mimeTypeMap[extension] || 'application/pdf';

	let fileBuffer: Buffer;
	if (responseData instanceof Buffer) {
		fileBuffer = responseData;
	} else if (typeof responseData === 'string') {
		fileBuffer = Buffer.from(responseData, 'base64');
	} else {
		fileBuffer = Buffer.from(responseData as Buffer);
	}

	const binaryData = await this.helpers.prepareBinaryData(fileBuffer, fileName, mimeType);

	return [
		{
			json: {
				fileName,
				mimeType,
				fileSize: fileBuffer.length,
				success: true,
				message: 'Document auto-cropped successfully',
				docName: finalDocName,
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
			pairedItem: { item: index },
		},
	];
}
