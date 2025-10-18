import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { pdf4meAsyncRequest, ActionConstants } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to protect',
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
			{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: { alwaysOpenEditWindow: true },
		required: true,
		default: '',
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file to protect',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'protected_output.pdf',
		description: 'Name for the output protected PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
			},
		},
		hint: 'Protect PDF. See our <b><a href="https://docs.pdf4me.com/n8n/security/protect-document/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		default: '1234',
		description: 'Password to protect the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
			},
		},
	},
	{
		displayName: 'PDF Permission',
		name: 'pdfPermission',
		type: 'options',
		options: [
			{ name: 'All', value: 'All' },
			{ name: 'Print', value: 'Print' },
			{ name: 'Copy', value: 'Copy' },
			{ name: 'Edit', value: 'Edit' },
			{ name: 'Fill Forms', value: 'FillForms' },
			{ name: 'Comment', value: 'Comment' },
			{ name: 'Assemble', value: 'Assemble' },
		],
		default: 'All',
		description: 'Permissions to allow on the protected PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'protected-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ProtectDocument],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const pdfPermission = this.getNodeParameter('pdfPermission', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main PDF content
	let docContent: string;
	let docName: string = outputFileName;
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || outputFileName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const options = {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response, 'binary');
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		password,
		pdfPermission,
		IsAsync: true,
	};

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Protect', body);

	// Return the result as binary data
	const binaryDataKey = binaryDataName || 'data';
	return [
		{
			binary: {
				[binaryDataKey]: await this.helpers.prepareBinaryData(responseData, outputFileName, 'application/pdf'),
			},
			json: {},
		},
	];
}
