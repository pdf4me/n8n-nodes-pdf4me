import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';


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

	let docContent: string = '';
	let docName: string = 'uploaded_file';

	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		docName = binaryData.fileName || 'uploaded_file';

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob and use blobId in docContent
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);
		docContent = `${blobId}`;

	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = 'uploaded_file';

	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;

		// 2. Extract filename from URL
		docName = fileUrl.split('/').pop() || 'uploaded_file';

		// 3. Use URL directly in docContent (no upload needed)
		docContent = fileUrl;

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
		url: 'https://api.pdf4me.com/api/v2/UploadFile',
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
