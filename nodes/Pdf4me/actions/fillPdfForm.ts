import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

function normalizeParsedFormData(parsed: unknown): IDataObject {
	if (parsed === null || parsed === undefined) {
		throw new Error('Form data must be a JSON object with field names and values (got null or empty)');
	}

	if (Array.isArray(parsed)) {
		if (
			parsed.length === 1 &&
			parsed[0] !== null &&
			typeof parsed[0] === 'object' &&
			!Array.isArray(parsed[0])
		) {
			return parsed[0] as IDataObject;
		}
		if (parsed.length === 0) {
			throw new Error(
				'Form data JSON array is empty. Use a single object, e.g. {"firstname": "John", "lastname": "Doe"}',
			);
		}
		throw new Error(
			`Form data must be one JSON object with PDF field names as keys, not an array of ${parsed.length} items`,
		);
	}

	if (typeof parsed !== 'object') {
		throw new Error(
			`Form data must be a JSON object with field names and values (got ${typeof parsed})`,
		);
	}

	return parsed as IDataObject;
}

function parseJsonFormData(raw: unknown): IDataObject {
	let parsed: unknown;

	if (typeof raw === 'string') {
		const trimmed = raw.replace(/^\uFEFF/, '').trim();
		if (!trimmed) {
			throw new Error('Form data is empty');
		}
		try {
			parsed = JSON.parse(trimmed);
		} catch {
			throw new Error('Invalid JSON format for form data');
		}
	} else {
		parsed = raw;
	}

	return normalizeParsedFormData(parsed);
}

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
		displayName: 'Select Input Type',
		name: 'selectInputType',
		type: 'options',
		required: true,
		default: 'json',
		description: 'Choose how form field data is sent to the API',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Send form data as a stringified JSON object in dataArray',
			},
			{
				name: 'Input Form Data',
				value: 'inputFormData',
				description: 'Send form data as an array of field name/value pairs',
			},
		],
		hint: 'Fill a PDF form. See our <b><a href="https://docs.pdf4me.com/integration/n8n/forms/fill-a-pdf-form/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Form Data Input Type',
		name: 'formDataInputType',
		type: 'options',
		required: true,
		default: 'text',
		description: 'Choose how to provide the JSON form data',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				selectInputType: ['json'],
			},
		},
		options: [
			{
				name: 'JSON String',
				value: 'text',
				description: 'Provide JSON content as text or object',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use JSON file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide JSON content as base64 encoded string',
			},
		],
	},
	{
		displayName: 'Form Data (JSON)',
		name: 'formDataJson',
		type: 'json',
		required: true,
		default: '{"firstname": "John", "lastname": "Doe", "email": "john@example.com"}',
		description: 'JSON object containing form field names and values',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				selectInputType: ['json'],
				formDataInputType: ['text'],
			},
		},
	},
	{
		displayName: 'Form Data Binary Field',
		name: 'formDataBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description:
			'Name of the binary property that contains a JSON file with one object of field names and values, e.g. {"firstname": "John"}',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				selectInputType: ['json'],
				formDataInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Form Data Base64 Content',
		name: 'formDataBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded JSON content',
		placeholder: 'eyJmaXJzdG5hbWUiOiJKb2huIn0=',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				selectInputType: ['json'],
				formDataInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Form Fields',
		name: 'formFields',
		placeholder: 'Add Form Field',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		description: 'Form field names and values to fill in the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
				selectInputType: ['inputFormData'],
			},
		},
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name',
						name: 'fieldName',
						type: 'string',
						default: '',
						placeholder: 'e.g., firstname',
						description: 'PDF form field name',
						required: true,
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						placeholder: 'e.g., John',
						description: 'Value to set for this field',
						required: true,
					},
				],
			},
		],
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
		description: 'Name for the output PDF file',
		placeholder: 'my-filled-form.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Keep PDF Editable',
		name: 'keepPdfEditable',
		type: 'boolean',
		default: false,
		description: 'Whether to keep the PDF form fields editable after filling',
		displayOptions: {
			show: {
				operation: [ActionConstants.FillPdfForm],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Whether to enable asynchronous processing',
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
	let inputDocName: string = '';

	if (pdfInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || 'template.pdf';
		docName = inputDocName;

		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);
		docContent = `${blobId}`;
	} else if (pdfInputDataType === 'base64') {
		docContent = this.getNodeParameter('pdfBase64Content', index) as string;

		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		docContent = String(pdfUrl);
		docName = pdfUrl.split('/').pop() || 'template.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	if (pdfInputDataType === 'url') {
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
	} else if (pdfInputDataType === 'base64') {
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	} else if (pdfInputDataType === 'binaryData') {
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	const selectInputType = this.getNodeParameter('selectInputType', index) as string;
	const metaData = this.getNodeParameter('metaData', index) as string;
	const metaDataJson = this.getNodeParameter('metaDataJson', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const isAsync = this.getNodeParameter('async', index, true) as boolean;
	const keepPdfEditable = this.getNodeParameter('keepPdfEditable', index, false) as boolean;

	const finalDocName = docName || inputDocName || 'template.pdf';
	const base: IDataObject = {
		templateDocName: finalDocName,
		templateDocContent: docContent,
		metaData: metaData || '',
		metaDataJson: metaDataJson || '',
		KeepPdfEditable: keepPdfEditable,
		IsAsync: isAsync,
	};

	let body: IDataObject;
	let formFieldCount: number | undefined;

	if (selectInputType === 'json') {
		const formDataInputType = this.getNodeParameter('formDataInputType', index) as string;
		let formData: IDataObject;

		if (formDataInputType === 'text') {
			const formDataJson = this.getNodeParameter('formDataJson', index);
			formData = parseJsonFormData(formDataJson);
		} else if (formDataInputType === 'binaryData') {
			const binaryPropertyName = this.getNodeParameter('formDataBinaryPropertyName', index) as string;
			const item = this.getInputData(index);
			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}'`);
			}

			const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			try {
				formData = parseJsonFormData(fileBuffer.toString('utf-8'));
			} catch (error) {
				if (error instanceof Error && (
					error.message.startsWith('Form data') ||
					error.message === 'Form data is empty'
				)) {
					throw error;
				}
				throw new Error(`Invalid JSON in binary data: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else if (formDataInputType === 'base64') {
			let base64Content = this.getNodeParameter('formDataBase64Content', index) as string;

			if (base64Content.includes(',')) {
				base64Content = base64Content.split(',')[1];
			}

			try {
				const jsonString = Buffer.from(base64Content, 'base64').toString('utf-8');
				formData = parseJsonFormData(jsonString);
			} catch (error) {
				if (error instanceof Error && (
					error.message.startsWith('Form data') ||
					error.message === 'Form data is empty'
				)) {
					throw error;
				}
				throw new Error(`Invalid JSON in base64 content: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		} else {
			throw new Error(`Unsupported form data input type: ${formDataInputType}`);
		}

		formFieldCount = Object.keys(formData).length;
		body = {
			...base,
			dataArray: JSON.stringify(formData),
			outputType: 'pdf',
			inputDataType: 'json',
		};
	} else if (selectInputType === 'inputFormData') {
		const fields = this.getNodeParameter('formFields', index, {}) as IDataObject;
		const rows = (fields.field as Array<{ fieldName: string; fieldValue: string }>) ?? [];

		if (rows.length === 0) {
			throw new Error('At least one form field is required');
		}

		const inputFormData = rows.map(({ fieldName, fieldValue }) => ({
			fieldName,
			fieldValue: String(fieldValue),
		}));

		formFieldCount = inputFormData.length;
		body = {
			...base,
			InputFormData: inputFormData,
		};
	} else {
		throw new Error(`Unsupported select input type: ${selectInputType}`);
	}

	const result = await pdf4meAsyncRequest.call(this, '/api/v2/FillPdfForm', body);

	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
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
				selectInputType,
				...(formFieldCount !== undefined ? { formFields: formFieldCount } : {}),
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
			pairedItem: { item: index },
		},
	];
}
