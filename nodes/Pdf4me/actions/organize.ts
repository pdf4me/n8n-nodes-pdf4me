import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Organize Feature',
		name: 'organizeFeature',
		type: 'options',
		default: 'deleteBlankPages',
		description: 'Select the organize feature to use',
		options: [
			{ name: 'Delete Blank Pages', value: 'deleteBlankPages' },
			{ name: 'Delete Unwanted Pages', value: 'deleteUnwantedPages' },
			{ name: 'Extract Pages', value: 'extractPages' },
			{ name: 'Rotate Document', value: 'rotateDocument' },
			{ name: 'Rotate Page', value: 'rotatePage' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
			},
		},
	},
	// Common PDF input fields
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input PDF',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
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
				operation: [ActionConstants.Organize],
				inputType: ['localPath'],
			},
		},
	},
	// Delete Blank Pages option
	{
		displayName: 'Delete Page Option',
		name: 'deletePageOption',
		type: 'options',
		default: 'NoTextNoImages',
		description: 'Criteria for blank page detection',
		options: [
			{ name: 'No Text, No Images', value: 'NoTextNoImages' },
			{ name: 'No Text', value: 'NoText' },
			{ name: 'No Images', value: 'NoImages' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
				organizeFeature: ['deleteBlankPages'],
			},
		},
	},
	// Delete Unwanted Pages & Extract Pages
	{
		displayName: 'Page Numbers',
		name: 'pageNumbers',
		type: 'string',
		default: '',
		description: 'Page numbers to delete or extract (e.g. "2" or "1,3,5" or "2-4")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
				organizeFeature: ['deleteUnwantedPages', 'extractPages'],
			},
		},
	},
	// Rotate Document
	{
		displayName: 'Rotation Type',
		name: 'rotationType',
		type: 'options',
		default: 'UpsideDown',
		description: 'Type of rotation to apply',
		options: [
			{ name: 'No Rotation', value: 'NoRotation' },
			{ name: 'Clockwise', value: 'Clockwise' },
			{ name: 'Counter Clockwise', value: 'CounterClockwise' },
			{ name: 'Upside Down', value: 'UpsideDown' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
				organizeFeature: ['rotateDocument'],
			},
		},
	},
	// Rotate Page
	{
		displayName: 'Rotation Type',
		name: 'rotationType',
		type: 'options',
		default: 'Clockwise',
		description: 'Type of rotation to apply',
		options: [
			{ name: 'No Rotation', value: 'NoRotation' },
			{ name: 'Clockwise', value: 'Clockwise' },
			{ name: 'Counter Clockwise', value: 'CounterClockwise' },
			{ name: 'Upside Down', value: 'UpsideDown' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
				organizeFeature: ['rotatePage'],
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'string',
		default: '',
		description: 'Page numbers to rotate (e.g. "1" or "1,3,5" or "2-4")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Organize],
				organizeFeature: ['rotatePage'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('organizeFeature', index) as string;

	if (operation !== ActionConstants.Organize) {
		throw new Error('This action only supports the Organize operation.');
	}

	// Common PDF input handling
	const inputType = this.getNodeParameter('inputType', index) as string;
	let pdfContent: string;
	let pdfName: string;
	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error('No binary data found in the input.');
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		pdfContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		pdfName = inputFileName || binaryData.fileName || 'document.pdf';
	} else if (inputType === 'base64') {
		pdfContent = this.getNodeParameter('base64Content', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		pdfContent = Buffer.from(response).toString('base64');
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		pdfContent = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported input type: ${inputType}`);
	}

	if (feature === 'deleteBlankPages') {
		const deletePageOption = this.getNodeParameter('deletePageOption', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			deletePageOption,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/DeleteBlankPages', payload);
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, pdfName || 'output.pdf', 'application/pdf'),
				},
			},
		];
	}

	if (feature === 'deleteUnwantedPages') {
		const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			pageNumbers,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/DeletePages', payload);
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, pdfName || 'output.pdf', 'application/pdf'),
				},
			},
		];
	}

	if (feature === 'extractPages') {
		const pageNumbers = this.getNodeParameter('pageNumbers', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			pageNumbers,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/Extract', payload);
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, pdfName || 'output.pdf', 'application/pdf'),
				},
			},
		];
	}

	if (feature === 'rotateDocument') {
		const rotationType = this.getNodeParameter('rotationType', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			rotationType,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/Rotate', payload);
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, pdfName || 'output.pdf', 'application/pdf'),
				},
			},
		];
	}

	if (feature === 'rotatePage') {
		const rotationType = this.getNodeParameter('rotationType', index) as string;
		const page = this.getNodeParameter('page', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			rotationType,
			page,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/RotatePage', payload);
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					success: true,
				},
				binary: {
					data: await this.helpers.prepareBinaryData(response, pdfName || 'output.pdf', 'application/pdf'),
				},
			},
		];
	}

	throw new Error(`Unknown organize feature: ${feature}`);
}
