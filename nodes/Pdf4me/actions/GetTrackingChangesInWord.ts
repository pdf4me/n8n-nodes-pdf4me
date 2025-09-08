import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
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
				operation: [ActionConstants.GetTrackingChangesInWord],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'documentName',
		type: 'string',
		default: '',
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Document Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded Word document content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'documentNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the Word document',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'tracking_changes.json',
		description: 'Name for the output JSON file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'tracking-changes-data',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let docName: string;

	// Handle different input types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const documentName = this.getNodeParameter('documentName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		docName = documentName || binaryData.fileName || 'document.docx';
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('documentNameRequired', index) as string;
	} else if (inputDataType === 'url') {
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;
		docName = this.getNodeParameter('documentNameRequired', index) as string;
		const options = { method: 'GET' as const, url: documentUrl, encoding: 'arraybuffer' as const };
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		docContent = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported input type: ${inputDataType}`);
	}

	const payload = {
		docName,
		docContent,
		IsAsync: true,
	};
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GetTrackingChangesInWord', payload);
	if (responseData) {
		const jsonString = typeof responseData === 'string' ? responseData : JSON.stringify(responseData);
		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(jsonString, 'utf8'),
			outputFileName || 'tracking_changes.json',
			'application/json',
		);
		return [
			{
				json: {
					fileName: outputFileName || 'tracking_changes.json',
					mimeType: 'application/json',
					fileSize: jsonString.length,
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