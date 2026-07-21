/**
 * AI Document Parser Action
 * API Endpoint: POST /api/v2/AiDocumentParser
 *
 * Parses documents using a PDF4me AI analyzer configuration.
 * Resolves customisationNote from the selected AI Analyzer Id (GetAnalyzerId list item).
 */

import type { INodeProperties, IExecuteFunctions, IDataObject  } from 'n8n-workflow';
import {
	ActionConstants,
	pdf4meAsyncRequest,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the document to parse',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiDocumentParser],
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
				operation: [ActionConstants.AiDocumentParser],
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
				operation: [ActionConstants.AiDocumentParser],
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
		description: 'URL to the document file to parse',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiDocumentParser],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'document.pdf',
		description: 'Name of the source document file for reference',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiDocumentParser],
			},
		},
	},
	{
		displayName: 'AI Analyzer Name or ID',
		name: 'aiAnalyzerId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAnalyzerIds',
		},
		required: true,
		default: '',
		description: 'Choose the AI analyzer configuration from your PDF4me account. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiDocumentParser],
			},
		},
		hint: 'Parse documents using AI analyzer configurations. The analyzer customization note is resolved automatically from your selection.',
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docNameParam = this.getNodeParameter('docName', index) as string;
	const aiAnalyzerId = this.getNodeParameter('aiAnalyzerId', index) as string;

	if (!aiAnalyzerId || aiAnalyzerId.trim() === '') {
		throw new Error('AI Analyzer Id is required');
	}

	let docContent = '';
	let inputDocName = docNameParam || 'document.pdf';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
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
	const customisationNote = aiAnalyzerId.trim();

	const body: IDataObject = {
		docName: finalDocName,
		docContent,
		customisationNote,
		IsAsync: true,
	};

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/AiDocumentParser', body);

	if (!responseData) {
		throw new Error('No response data received from AiDocumentParser API');
	}

	let processedData: IDataObject;
	if (typeof responseData === 'string') {
		try {
			processedData = JSON.parse(responseData) as IDataObject;
		} catch {
			processedData = { rawContent: responseData };
		}
	} else {
		processedData = responseData as IDataObject;
	}

	return [
		{
			json: {
				...processedData,
				_metadata: {
					success: true,
					message: 'Document parsed successfully using AI Document Parser',
					processingTimestamp: new Date().toISOString(),
					sourceFileName: finalDocName,
					aiAnalyzerId: aiAnalyzerId.trim(),
					operation: 'aiDocumentParser',
				},
			},
			pairedItem: { item: index },
		},
	];
}
