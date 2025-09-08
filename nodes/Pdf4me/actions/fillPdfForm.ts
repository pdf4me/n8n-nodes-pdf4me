import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'PDF Input Data Type',
		name: 'pdfInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF template file',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
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
				operation: [ActionConstants.FillPdfForm],
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
				operation: [ActionConstants.FillPdfForm],
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
		placeholder: 'https://example.com/template.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				pdfInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Data Type',
		name: 'dataType',
		type: 'options',
		required: true,
		default: 'single',
		description: 'Choose whether to fill a single document or generate multiple documents',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
		options: [
			{
				name: 'Single Document',
				value: 'single',
				description: 'Fill a single PDF form with JSON data',
			},
			{
				name: 'Multiple Documents',
				value: 'multiple',
				description: 'Generate multiple documents from a list of data',
			},
		],
	},
	{
		displayName: 'Form Data (JSON)',
		name: 'formDataJson',
		type: 'json',
		required: true,
		default: '{"firstname": "John", "lastname": "Doe", "email": "john@example.com"}',
		description: 'JSON object containing form field names and values for single document',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				dataType: ['single'],
			},
		},
	},
	{
		displayName: 'Data List (JSON Array)',
		name: 'dataListJson',
		type: 'json',
		required: true,
		default: '[{"firstname": "John", "lastname": "Doe"}, {"firstname": "Jane", "lastname": "Smith"}]',
		description: 'JSON array containing multiple data objects for generating multiple documents',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				dataType: ['multiple'],
			},
		},
	},
	{
		displayName: 'Output Type',
		name: 'outputType',
		type: 'string',
		required: true,
		default: 'pdf',
		description: 'Output type of the generated file (must be string format)',
		placeholder: 'pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'string',
		required: true,
		default: 'json',
		description: 'Input data type (must be string format)',
		placeholder: 'json',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Meta Data',
		name: 'metaData',
		type: 'string',
		default: '',
		description: 'Additional metadata for the PDF (must be string format)',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Meta Data JSON',
		name: 'metaDataJson',
		type: 'string',
		default: '',
		description: 'Additional JSON metadata for the PDF (must be string format)',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'filled_form_output.pdf',
		description: 'Name for the output PDF file (for single document)',
		placeholder: 'my-filled-form.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				dataType: ['single'],
			},
		},
	},
	{
		displayName: 'Output File Name Prefix',
		name: 'outputFileNamePrefix',
		type: 'string',
		default: 'filled_form_',
		description: 'Prefix for output file names (for multiple documents)',
		placeholder: 'filled_form_',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				dataType: ['multiple'],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Enable asynchronous processing (recommended for multiple documents)',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'filled-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// PDF input
	const pdfInputDataType = this.getNodeParameter('pdfInputDataType', index) as string;
	let docContent: string;
	let docName: string = 'template.pdf';

	if (pdfInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || 'template.pdf';
	} else if (pdfInputDataType === 'base64') {
		docContent = this.getNodeParameter('pdfBase64Content', index) as string;
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const options = {

			method: 'GET' as const,

			url: pdfUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response as Buffer);
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || 'template.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Other parameters
	const dataType = this.getNodeParameter('dataType', index) as string;
	const outputType = this.getNodeParameter('outputType', index) as string;
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const metaData = this.getNodeParameter('metaData', index) as string;
	const metaDataJson = this.getNodeParameter('metaDataJson', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Handle form data based on data type
	let dataArray: string;
	let inputFormData: any[];

	if (dataType === 'single') {
		const formDataJson = this.getNodeParameter('formDataJson', index) as string;
		let formData: IDataObject;

		try {
			formData = JSON.parse(formDataJson);
		} catch (error) {
			throw new Error('Invalid JSON format for form data');
		}

		// Create form fields array
		inputFormData = [];
		for (const [fieldName, fieldValue] of Object.entries(formData)) {
			inputFormData.push({
				fieldName,
				fieldValue: String(fieldValue),
			});
		}

		dataArray = JSON.stringify(formData);
	} else {
		const dataListJson = this.getNodeParameter('dataListJson', index) as string;
		let dataList: IDataObject[];

		try {
			dataList = JSON.parse(dataListJson);
		} catch (error) {
			throw new Error('Invalid JSON format for data list');
		}

		// For multiple documents, use the first item as template
		const firstItem = dataList[0];
		inputFormData = [];
		for (const [fieldName, fieldValue] of Object.entries(firstItem)) {
			inputFormData.push({
				fieldName,
				fieldValue: String(fieldValue),
			});
		}

		dataArray = JSON.stringify(dataList);
	}

	// Build the request body
	const body: IDataObject = {
		templateDocName: docName,
		templateDocContent: docContent,
		dataArray,
		outputType,
		inputDataType,
		metaData: metaData || '',
		metaDataJson: metaDataJson || '',
		InputFormData: inputFormData,
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/FillPdfForm', body);

	// Handle response based on data type
	if (dataType === 'single') {
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;

		// Return single PDF as binary data
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
					message: 'PDF form filled successfully',
					fileName: outputFileName,
					mimeType,
					fileSize: result.length,
					dataType: 'single',
					formFields: inputFormData.length,
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
			},
		];
	} else {
		// For multiple documents, result should be an array
		const outputFileNamePrefix = this.getNodeParameter('outputFileNamePrefix', index) as string;

		if (Array.isArray(result)) {
			// Handle multiple documents
			const results = [];
			for (let i = 0; i < result.length; i++) {
				const doc = result[i];
				const fileName = `${outputFileNamePrefix}${i + 1}.pdf`;

				const mimeType = 'application/pdf';
				const binaryData = await this.helpers.prepareBinaryData(
					Buffer.from(doc.fileContent, 'base64'),
					fileName,
					mimeType,
				);

				results.push({
					json: {
						success: true,
						message: `Document ${i + 1} generated successfully`,
						fileName,
						mimeType,
						fileSize: doc.fileContent.length,
						dataType: 'multiple',
						documentIndex: i + 1,
						totalDocuments: result.length,
					},
					binary: {
						[binaryDataName || 'data']: binaryData,
					},
				});
			}
			return results;
		} else {
			// Fallback: treat as single document
			const fileName = `${outputFileNamePrefix}1.pdf`;
			const mimeType = 'application/pdf';
			const binaryData = await this.helpers.prepareBinaryData(
				result,
				fileName,
				mimeType,
			);

			return [
				{
					json: {
						success: true,
						message: 'PDF form filled successfully (single document mode)',
						fileName,
						mimeType,
						fileSize: result.length,
						dataType: 'multiple',
						formFields: inputFormData.length,
					},
					binary: {
						[binaryDataName || 'data']: binaryData,
					},
				},
			];
		}
	}
}