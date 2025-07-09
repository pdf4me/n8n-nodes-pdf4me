import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Upload Feature',
		name: 'uploadFeature',
		type: 'options',
		default: 'uploadFile',
		description: 'Select the upload feature to use',
		options: [
			{ name: 'Upload File', value: 'uploadFile' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
			},
		},
	},
	// Common file input fields
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the file to upload',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'file.pdf or file.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'file.pdf or file.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
				inputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Retention Days',
		name: 'days',
		type: 'number',
		default: 30,
		description: 'Number of days to retain the file on PDF4me',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadFile],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, itemIndex: number) {
	const items = this.getInputData();
	const item = items[itemIndex];
	const uploadFeature = this.getNodeParameter('uploadFeature', itemIndex) as string;

	function getFileContent(this: IExecuteFunctions, paramPrefix: string) {
		const inputType = this.getNodeParameter(paramPrefix + 'InputType', itemIndex, 'binaryData') as string;
		if (inputType === 'binaryData') {
			const binaryPropertyName = this.getNodeParameter(paramPrefix + 'BinaryPropertyName', itemIndex, 'data') as string;
			if (!item.binary || !item.binary[binaryPropertyName]) {
				throw new Error(`No binary data property '${binaryPropertyName}' found on input item!`);
			}
			const fileBuffer = item.binary[binaryPropertyName].data;
			return Buffer.from(fileBuffer, 'base64').toString('base64');
		} else if (inputType === 'base64') {
			return this.getNodeParameter(paramPrefix + 'Base64Content', itemIndex) as string;
		} else if (inputType === 'url') {
			const url = this.getNodeParameter(paramPrefix + 'FileUrl', itemIndex) as string;
			const res = require('sync-request')('GET', url);
			return Buffer.from(res.getBody()).toString('base64');
		} else if (inputType === 'localPath') {
			const path = this.getNodeParameter(paramPrefix + 'LocalFilePath', itemIndex) as string;
			return Buffer.from(readFileSync(path)).toString('base64');
		}
		throw new Error('Unsupported input type');
	}

	if (uploadFeature === 'uploadFile') {
		const docContent = getFileContent.call(this, '');
		const docName = this.getNodeParameter('inputFileName', itemIndex, 'file.pdf');
		const days = this.getNodeParameter('days', itemIndex, 30);
		const payload = {
			docContent,
			docName,
			days,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/UploadFile', payload);
		return this.helpers.returnJsonArray([response]);
	}
	throw new Error('Unsupported upload feature');
}
