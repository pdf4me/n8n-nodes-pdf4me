import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { pdf4meAsyncRequest, ActionConstants } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the Word document to process',
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use Word document from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide Word document content as base64 encoded string' },
			{ name: 'URL', value: 'url', description: 'Provide URL to Word document' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Word document (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Word Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: { alwaysOpenEditWindow: true },
		required: true,
		default: '',
		description: 'Base64 encoded Word document content',
		placeholder: 'UEsDBBQABgAIAAAAIQ...',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Word Document URL',
		name: 'docUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Word document to process',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the Word document to process',
		placeholder: '/path/to/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'tracking_disabled_output.docx',
		description: 'Name for the output processed Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Process asynchronously',
		displayOptions: {
			show: {
				operation: [ActionConstants.DisableTrackingChangesInWord],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

	// Main document content
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
		const docUrl = this.getNodeParameter('docUrl', index) as string;
		const response = await this.helpers.request({
			method: 'GET',
			url: docUrl,
			encoding: null,
		});
		const buffer = Buffer.from(response, 'binary');
		docContent = buffer.toString('base64');
		docName = docUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		async: useAsync,
	};

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/DisableTrackingChangesInWord', body);

	// Return the result as binary data
	return [
		{
			binary: {
				data: await this.helpers.prepareBinaryData(responseData, outputFileName, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
			},
			json: {},
		},
	];
}
