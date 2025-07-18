import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

// declare const Buffer: any;

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
				operation: [ActionConstants.ConvertPdfToEditableOcr],
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
				operation: [ActionConstants.ConvertPdfToEditableOcr],
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
				operation: [ActionConstants.ConvertPdfToEditableOcr],
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
				operation: [ActionConstants.ConvertPdfToEditableOcr],
				pdfInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Quality Type',
		name: 'qualityType',
		type: 'options',
		required: true,
		default: 'Draft',
		description: 'Choose the quality type for OCR processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'Draft',
				description: 'Suitable for normal PDFs, consumes 1 API call per file',
			},
			{
				name: 'High',
				value: 'High',
				description: 'Suitable for PDFs from Images and scanned documents, consumes 2 API calls per page',
			},
		],
	},
	{
		displayName: 'OCR Only When Needed',
		name: 'ocrWhenNeeded',
		type: 'options',
		required: true,
		default: 'true',
		description: 'Set to skip recognition if text is already searchable',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
		options: [
			{
				name: 'True',
				value: 'true',
				description: 'Skip recognition if text is already searchable',
			},
			{
				name: 'False',
				value: 'false',
				description: 'Always perform OCR regardless of existing text',
			},
		],
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'English',
		description: 'Language of the text in the source file. Only use if output is not recognizable',
		placeholder: 'English',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'string',
		required: true,
		default: 'true',
		description: 'Output format (must be in string format)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Merge All Sheets',
		name: 'mergeAllSheets',
		type: 'boolean',
		default: true,
		description: 'Merge all sheets if applicable',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'editable_pdf_output.pdf',
		description: 'Name for the output editable PDF file',
		placeholder: 'my-editable-pdf.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		description: 'Enable asynchronous processing (recommended for large files)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
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
		const buffer = Buffer.from(response as Buffer);
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || 'input.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Other parameters
	const qualityType = this.getNodeParameter('qualityType', index) as string;
	const ocrWhenNeeded = this.getNodeParameter('ocrWhenNeeded', index) as string;
	const language = this.getNodeParameter('language', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const mergeAllSheets = this.getNodeParameter('mergeAllSheets', index) as boolean;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const useAsync = this.getNodeParameter('async', index) as boolean;

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		qualityType,
		ocrWhenNeeded,
		outputFormat,
		mergeAllSheets,
		isAsync: useAsync,
	};

	// Add language only if it's not empty
	if (language && language.trim() !== '') {
		body.language = language;
	}

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertOcrPdf', body);

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
				message: 'PDF converted to editable PDF using OCR successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				qualityType,
				ocrWhenNeeded,
				language: language || 'Not specified',
				mergeAllSheets,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}