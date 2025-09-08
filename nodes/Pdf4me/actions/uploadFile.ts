import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	ActionConstants,
} from '../GenericFunctions';
import config from '../../../config/config';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the file to upload',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide file content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the file',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 File Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded file content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the file to upload',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'File Retention Hours',
		name: 'hours',
		type: 'number',
		default: 2,
		description: 'Number of hours to keep the file available (1-24)',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 24,
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const hours = this.getNodeParameter('hours', index) as number;

	let docContent: string;
	let docName: string;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || 'uploaded_file';
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = 'uploaded_file';
	} else if (inputDataType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: fileUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		docName = fileUrl.split('/').pop() || 'uploaded_file';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		hours,
		IsAsync: true,
	};

	// Make the API request using the new httpRequestWithAuthentication helper
	const options = {
		url: config.baseUrl+'/api/v2/UploadFile',
		method: 'POST' as const,
		headers: {
			'Content-Type': 'application/json',
		},
		body: body,
		json: true, // Parse response as JSON
	};
	const result: any = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);

	// Extract document URL from response
	let documentUrl;
	if (result.documents && result.documents.length > 0) {
		documentUrl = result.documents[0].documentUrl;
	} else if (result.documentUrl) {
		documentUrl = result.documentUrl;
	}
	if (!documentUrl) {
		throw new Error('No document URL found in response');
	}
	return [
		{
			json: {
				documentUrl: documentUrl,
			},
		},
	];
}
