import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Optimize Compress Feature',
		name: 'optimizeCompressFeature',
		type: 'options',
		default: 'compressPdf',
		description: 'Select the optimize/compress feature to use',
		options: [
			{ name: 'Compress PDF', value: 'compressPdf' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.OptimizeCompress],
			},
		},
	},
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input PDF file',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.OptimizeCompress],
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
				operation: [ActionConstants.OptimizeCompress],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OptimizeCompress],
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
				operation: [ActionConstants.OptimizeCompress],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OptimizeCompress],
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
				operation: [ActionConstants.OptimizeCompress],
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
				operation: [ActionConstants.OptimizeCompress],
				inputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Optimize Profile',
		name: 'optimizeProfile',
		type: 'options',
		default: 'Web',
		description: 'Optimization profile for compression',
		options: [
			{ name: 'Web', value: 'Web' },
			{ name: 'Print', value: 'Print' },
			{ name: 'Screen', value: 'Screen' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.OptimizeCompress],
				optimizeCompressFeature: ['compressPdf'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('optimizeCompressFeature', index) as string;
	if (operation !== ActionConstants.OptimizeCompress || feature !== 'compressPdf') {
		throw new Error('Unsupported feature for Optimize Compress');
	}

	// Get input type and file
	const inputType = this.getNodeParameter('inputType', index) as string;
	let base64Content = '';
	let fileName = this.getNodeParameter('inputFileName', index) as string;

	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		base64Content = binaryDataBuffer.toString('base64');
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'base64') {
		base64Content = this.getNodeParameter('base64Content', index) as string;
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'url') {
		// Download file from URL and convert to base64
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		base64Content = Buffer.from(response).toString('base64');
		if (!fileName) fileName = fileUrl.split('/').pop() || 'document.pdf';
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		base64Content = fileBuffer.toString('base64');
		if (!fileName) fileName = localFilePath.split('/').pop() || 'document.pdf';
	} else {
		throw new Error('Unsupported input type');
	}

	const optimizeProfile = this.getNodeParameter('optimizeProfile', index) as string;

	const payload = {
		docContent: base64Content,
		docName: fileName,
		optimizeProfile,
		async: true,
	};

	const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/Optimize', undefined, payload);
	return this.helpers.returnJsonArray([response]);
}
