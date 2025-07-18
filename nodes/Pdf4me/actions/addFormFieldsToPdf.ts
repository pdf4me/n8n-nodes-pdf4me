import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'PDF Input Data Type',
		name: 'pdfInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to PDF file',
			},
		],
	},
	{
		displayName: 'PDF Binary Field',
		name: 'pdfBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
				pdfInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'PDF Base64 Content',
		name: 'pdfBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
				pdfInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
				pdfInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Initial Value',
		name: 'initialValue',
		type: 'string',
		required: true,
		default: 'input text',
		description: 'Initial value for the form field (must be a string)',
		placeholder: 'input text',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		required: true,
		default: 300,
		description: 'X position of the form field. If horizontal alignment is Left, gives gap from left edge. If Right, gives gap from right edge. If Center, this field is ignored.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		required: true,
		default: 300,
		description: 'Y position of the form field. If vertical alignment is Top, gives gap from top edge. If Bottom, gives gap from bottom edge. If Middle, this field is ignored.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Field Name',
		name: 'fieldName',
		type: 'string',
		required: true,
		default: 'Input Field Name',
		description: 'Name of the form field (must be a string)',
		placeholder: 'Input Field Name',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'number',
		required: true,
		default: 4,
		description: 'Size of the form field (integer)',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		required: true,
		default: '1',
		description: 'Page indices as comma-separated values or ranges (e.g., "0, 1, 2-" or "1, 2, 3-7"). Leave empty to process all pages.',
		placeholder: '1, 2, 3-7',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Form Field Type',
		name: 'formFieldType',
		type: 'options',
		required: true,
		default: 'TextBox',
		description: 'Type of form field to add',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
		options: [
			{
				name: 'Text Box',
				value: 'TextBox',
				description: 'Text input field',
			},
			{
				name: 'Check Box',
				value: 'CheckBox',
				description: 'Checkbox field',
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'form_fields_output.pdf',
		description: 'Name for the output PDF file with form fields',
		placeholder: 'my-form-pdf.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Enable asynchronous processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddFormFieldsToPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// PDF input
	const pdfInputDataType = this.getNodeParameter('pdfInputDataType', index) as string;
	let docContent: string;
	let docName: string = 'input.pdf';

	if (pdfInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || 'input.pdf';
	} else if (pdfInputDataType === 'base64') {
		docContent = this.getNodeParameter('pdfBase64Content', index) as string;
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const response = await this.helpers.request({
			method: 'GET',
			url: pdfUrl,
			encoding: null,
		});
		const buffer = Buffer.from(response, 'binary');
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || 'input.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Other parameters
	const initialValue = this.getNodeParameter('initialValue', index) as string;
	const positionX = this.getNodeParameter('positionX', index) as number;
	const positionY = this.getNodeParameter('positionY', index) as number;
	const fieldName = this.getNodeParameter('fieldName', index) as string;
	const size = this.getNodeParameter('size', index) as number;
	const pages = this.getNodeParameter('pages', index) as string;
	const formFieldType = this.getNodeParameter('formFieldType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		initialValue,
		positionX,
		positionY,
		fieldName,
		Size: size, // Note: API expects "Size" with capital S
		pages,
		formFieldType,
		async: useAsync,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/AddFormField', body);

	// Return the result as binary data (PDF)
	const mimeType = 'application/pdf';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'Form fields added to PDF successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				fieldName,
				formFieldType,
				initialValue,
				position: { x: positionX, y: positionY },
				size,
				pages,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}