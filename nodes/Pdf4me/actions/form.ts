import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	// Feature selector
	{
		displayName: 'Form Features',
		name: 'formFeature',
		type: 'options',
		default: 'addFormFields',
		description: 'Select the form feature to use',
		options: [
			{ name: 'Add Form Fields to PDF', value: 'addFormFields' },
			{ name: 'Fill PDF Form', value: 'fillPdfForm' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
			},
		},
	},
	// --- Common PDF input for both features ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input PDF',
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use binary data from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide base64 encoded PDF' },
			{ name: 'URL', value: 'url', description: 'Provide a URL to the PDF' },
			{ name: 'Local Path', value: 'localPath', description: 'Provide a local file path to the PDF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
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
				operation: [ActionConstants.Form],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		required: true,
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				inputType: ['localPath'],
			},
		},
	},
	// --- Add Form Fields to PDF ---
	{
		displayName: 'Form Field Type',
		name: 'formFieldType',
		type: 'options',
		default: 'TextBox',
		description: 'Type of form field to add',
		options: [
			{ name: 'TextBox', value: 'TextBox' },
			{ name: 'CheckBox', value: 'CheckBox' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Field Name',
		name: 'fieldName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the form field',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Initial Value',
		name: 'initialValue',
		type: 'string',
		default: '',
		description: 'Initial value for the form field',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 100,
		description: 'X position of the form field',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 100,
		description: 'Y position of the form field',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Size',
		name: 'size',
		type: 'number',
		default: 4,
		description: 'Size of the form field',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '1',
		description: 'Page indices as comma-separated values or ranges (e.g., "1", "1,2", "1-3")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['addFormFields'],
			},
		},
	},
	// --- Fill PDF Form ---
	{
		displayName: 'Form Data (JSON)',
		name: 'formData',
		type: 'json',
		default: '{}',
		required: true,
		description: 'Key-value pairs for form fields to fill, e.g. { "firstname": "John", "lastname": "Doe" }',
		displayOptions: {
			show: {
				operation: [ActionConstants.Form],
				formFeature: ['fillPdfForm'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('formFeature', index) as string;

	if (operation !== ActionConstants.Form) {
		throw new Error('This action only supports the Form operation.');
	}

	// --- Common PDF input handling ---
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

	if (feature === 'addFormFields') {
		const formFieldType = this.getNodeParameter('formFieldType', index) as string;
		const fieldName = this.getNodeParameter('fieldName', index) as string;
		const initialValue = this.getNodeParameter('initialValue', index) as string;
		const positionX = this.getNodeParameter('positionX', index) as number;
		const positionY = this.getNodeParameter('positionY', index) as number;
		const size = this.getNodeParameter('size', index) as number;
		const pages = this.getNodeParameter('pages', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			initialValue,
			positionX,
			positionY,
			fieldName,
			Size: size,
			pages,
			formFieldType,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/AddFormField', payload);
		if (responseData) {
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				'add_form_fields_PDF_output.pdf',
				'application/pdf',
			);
			return [
				{
					json: {
						fileName: 'add_form_fields_PDF_output.pdf',
						mimeType: 'application/pdf',
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

	if (feature === 'fillPdfForm') {
		const formData = this.getNodeParameter('formData', index) as object;
		const payload = {
			templateDocName: pdfName,
			templateDocContent: pdfContent,
			dataArray: JSON.stringify(formData),
			outputType: 'pdf',
			inputDataType: 'json',
			metaData: '',
			metaDataJson: '',
			InputFormData: Object.entries(formData).map(([fieldName, fieldValue]) => ({ fieldName, fieldValue })),
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/FillPdfForm', payload);
		if (responseData) {
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				'fill_PDF_form_output.pdf',
				'application/pdf',
			);
			return [
				{
					json: {
						fileName: 'fill_PDF_form_output.pdf',
						mimeType: 'application/pdf',
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

	throw new Error(`Unknown form feature: ${feature}`);
}
