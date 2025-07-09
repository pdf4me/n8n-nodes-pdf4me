import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Word Feature',
		name: 'wordFeature',
		type: 'options',
		default: 'disableTrackingChanges',
		description: 'Select the Word feature to use',
		options: [
			{ name: 'Disable Tracking Changes', value: 'disableTrackingChanges' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
			},
		},
	},
	// Common Word input fields
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input Word document',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
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
				operation: [ActionConstants.Word],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
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
				operation: [ActionConstants.Word],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.Word],
				inputType: ['localPath'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('wordFeature', index) as string;

	if (operation !== ActionConstants.Word) {
		throw new Error('This action only supports the Word operation.');
	}

	// Common Word input handling
	const inputType = this.getNodeParameter('inputType', index) as string;
	let wordContent: string;
	let wordName: string;
	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error('No binary data found in the input.');
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		wordContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		wordName = inputFileName || binaryData.fileName || 'document.docx';
	} else if (inputType === 'base64') {
		wordContent = this.getNodeParameter('base64Content', index) as string;
		wordName = this.getNodeParameter('inputFileName', index) as string;
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		wordName = this.getNodeParameter('inputFileName', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		wordContent = Buffer.from(response).toString('base64');
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		wordName = this.getNodeParameter('inputFileName', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		wordContent = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported input type: ${inputType}`);
	}

	if (feature === 'disableTrackingChanges') {
		const payload = {
			docContent: wordContent,
			docName: wordName || 'output.docx',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/DisableTrackingChangesInWord', payload);
		return [
			{
				json: {
					fileName: wordName || 'output.docx',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, wordName || 'output.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
				},
			},
		];
	}

	throw new Error(`Unknown word feature: ${feature}`);
}
