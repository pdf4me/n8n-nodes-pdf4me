import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';


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
				operation: [ActionConstants.FindAndReplaceText],
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
				operation: [ActionConstants.FindAndReplaceText],
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
				operation: [ActionConstants.FindAndReplaceText],
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
				operation: [ActionConstants.FindAndReplaceText],
				pdfInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Old Text',
		name: 'oldText',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to be searched and replaced in the PDF',
		placeholder: 'input_old_text',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindAndReplaceText],
			},
		},
	},
	{
		displayName: 'New Text',
		name: 'newText',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to replace the old text with',
		placeholder: 'output_new_text',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindAndReplaceText],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: '',
		description: 'Specify page indices as comma-separated values or ranges (e.g., "0, 1, 2-" or "1, 2, 3-7"). Leave empty to process all pages.',
		placeholder: '1, 2, 3-7',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindAndReplaceText],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'find_and_replace_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-find-replace-pdf.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindAndReplaceText],
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
				operation: [ActionConstants.FindAndReplaceText],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'updated-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindAndReplaceText],
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
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const options = {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response as Buffer);
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || 'input.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Other parameters
	const oldText = this.getNodeParameter('oldText', index) as string;
	const newText = this.getNodeParameter('newText', index) as string;
	const pageSequence = this.getNodeParameter('pageSequence', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		oldText,
		newText,
		IsAsync: true,
	};

	// Add pageSequence only if it's not empty
	if (pageSequence && pageSequence.trim() !== '') {
		body.pageSequence = pageSequence;
	}

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/FindAndReplace', body);

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
				message: 'Find and replace text operation completed successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				oldText,
				newText,
				pageSequence: pageSequence || 'all pages',
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
		},
	];
}