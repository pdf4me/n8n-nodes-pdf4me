import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';
import { readFileSync } from 'fs';

export const description: INodeProperties[] = [
	{
		displayName: 'Template File Input Type',
		name: 'templateInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the template file',
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use template file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded template file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the template file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide a local file path to the template file',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Template Binary Property',
		name: 'templateBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the template file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Template File Name',
		name: 'templateFileName',
		type: 'string',
		default: '',
		description: 'Name of the template file (including extension)',
		placeholder: 'template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Template Base64 Content',
		name: 'templateBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded template file content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Template File Name',
		name: 'templateFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the template file (including extension)',
		placeholder: 'template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['base64', 'filePath', 'url'],
			},
		},
	},
	{
		displayName: 'Template File URL',
		name: 'templateFileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the template file',
		placeholder: 'https://example.com/template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Local Template File Path',
		name: 'templateFilePath',
		type: 'string',
		default: '',
		required: true,
		description: 'Local file path to the template file',
		placeholder: '/path/to/template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Template File Type',
		name: 'templateFileType',
		type: 'options',
		required: true,
		default: 'Docx',
		description: 'Template file type',
		options: [
			{ name: 'Word', value: 'Docx' },
			{ name: 'HTML', value: 'HTML' },
			{ name: 'PDF', value: 'PDF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Input Type',
		name: 'documentInputDataType',
		type: 'options',
		required: true,
		default: 'text',
		description: 'How to provide the document data',
		options: [
			{
				name: 'Text',
				value: 'text',
				description: 'Manually enter JSON or XML data',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use data file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded data file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the data file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide a local file path to the data file',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Type',
		name: 'documentDataType',
		type: 'options',
		default: 'Json',
		required: true,
		description: 'The data type for the template',
		options: [
			{ name: 'JSON', value: 'Json' },
			{ name: 'XML', value: 'XML' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Text',
		name: 'documentDataText',
		type: 'string',
		default: '',
		description: 'Manual data entry for the template in JSON or XML format (required if documentDataFile is not provided)',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['text'],
			},
		},
	},
	{
		displayName: 'Document Binary Property',
		name: 'documentBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the data file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Data File Name',
		name: 'documentDataFileName',
		type: 'string',
		default: '',
		description: 'Name of the data file (including extension)',
		placeholder: 'data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Base64 Content',
		name: 'documentBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded data file content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document Data File Name',
		name: 'documentDataFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the data file (including extension)',
		placeholder: 'data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['base64', 'filePath', 'url'],
			},
		},
	},
	{
		displayName: 'Document Data File URL',
		name: 'documentDataFileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the data file',
		placeholder: 'https://example.com/data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Local Document Data File Path',
		name: 'documentDataFilePath',
		type: 'string',
		default: '',
		required: true,
		description: 'Local file path to the data file',
		placeholder: '/path/to/data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'File Meta Data',
		name: 'fileMetaData',
		type: 'string',
		default: '',
		description: 'Any additional metadata for fields in JSON format',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Output Type',
		name: 'outputType',
		type: 'options',
		default: 'Docx',
		required: true,
		description: 'The file format of the Generated Document',
		options: [
			{ name: 'PDF', value: 'PDF' },
			{ name: 'Word', value: 'Docx' },
			{ name: 'Excel', value: 'Excel' },
			{ name: 'HTML', value: 'HTML' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Meta Data Json',
		name: 'metaDataJson',
		type: 'string',
		default: '',
		required: true,
		description: 'Metadata in JSON format',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const templateInputDataType = this.getNodeParameter('templateInputDataType', index) as string;
	const templateFileType = this.getNodeParameter('templateFileType', index) as string;
	const documentInputDataType = this.getNodeParameter('documentInputDataType', index) as string;
	const documentDataType = this.getNodeParameter('documentDataType', index) as string;
	const fileMetaData = this.getNodeParameter('fileMetaData', index) as string;
	const outputType = this.getNodeParameter('outputType', index) as string;
	const metaDataJson = this.getNodeParameter('metaDataJson', index) as string;

	let templateFileData: string;
	let templateFileName: string;
	let documentDataFile: string = '';
	let documentDataText: string = '';

	// Handle template file input types
	if (templateInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('templateBinaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('templateFileName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		templateFileData = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		templateFileName = inputFileName || binaryData.fileName || 'template.docx';
	} else if (templateInputDataType === 'base64') {
		templateFileData = this.getNodeParameter('templateBase64Content', index) as string;
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
	} else if (templateInputDataType === 'url') {
		const templateFileUrl = this.getNodeParameter('templateFileUrl', index) as string;
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: templateFileUrl, encoding: null });
		templateFileData = Buffer.from(response).toString('base64');
	} else if (templateInputDataType === 'filePath') {
		const templateFilePath = this.getNodeParameter('templateFilePath', index) as string;
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
		const fileBuffer = readFileSync(templateFilePath);
		templateFileData = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported template input type: ${templateInputDataType}`);
	}

	// Handle document data input types
	if (documentInputDataType === 'text') {
		documentDataText = this.getNodeParameter('documentDataText', index) as string;
	} else if (documentInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('documentBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		documentDataFile = buffer.toString('base64');
	} else if (documentInputDataType === 'base64') {
		documentDataFile = this.getNodeParameter('documentBase64Content', index) as string;
	} else if (documentInputDataType === 'url') {
		const documentDataFileUrl = this.getNodeParameter('documentDataFileUrl', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: documentDataFileUrl, encoding: null });
		documentDataFile = Buffer.from(response).toString('base64');
	} else if (documentInputDataType === 'filePath') {
		const documentDataFilePath = this.getNodeParameter('documentDataFilePath', index) as string;
		const fileBuffer = readFileSync(documentDataFilePath);
		documentDataFile = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported document input type: ${documentInputDataType}`);
	}

	// Validate that either documentDataFile or documentDataText is provided
	if (!documentDataFile && !documentDataText) {
		throw new Error('Either Document Data File or Document Data Text must be provided');
	}

	const payload = {
		templateFileType,
		templateFileName,
		templateFileData,
		documentDataType,
		outputType,
		documentDataFile,
		documentDataText,
		fileMetaData,
		metaDataJson,
		async: true,
	};

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GenerateDocumentSingle', payload);

	if (responseData) {
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			'generated_document_output.' + outputType.toLowerCase(),
			outputType === 'PDF' ? 'application/pdf' :
				outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
					outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
						'text/html',
		);

		return [
			{
				json: {
					fileName: 'generated_document_output.' + outputType.toLowerCase(),
					mimeType: outputType === 'PDF' ? 'application/pdf' :
						outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
							outputType === 'Excel'? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
								'text/html',
					fileSize: responseData.length,
					success: true,
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	throw new Error('No response data received from PDF4ME API');
}