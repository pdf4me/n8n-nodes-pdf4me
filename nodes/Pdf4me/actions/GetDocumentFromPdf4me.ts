import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to split by barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
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
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
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
				operation: [ActionConstants.GetDocumentFromPdf4me],
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
		description: 'URL to the PDF file to split by barcode',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Barcode String',
		name: 'barcodeString',
		type: 'string',
		default: '',
		description: 'Barcode string to search for',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'Barcode Filter',
		name: 'barcodeFilter',
		type: 'options',
		default: 'startsWith',
		description: 'Filter type for barcode matching',
		options: [
			{ name: 'Starts With', value: 'startsWith' },
			{ name: 'Contains', value: 'contains' },
			{ name: 'Equals', value: 'equals' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		default: 'qrcode',
		description: 'Type of barcode',
		options: [
			{ name: 'QR Code', value: 'qrcode' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Code 39', value: 'code39' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'Split Barcode Page',
		name: 'splitBarcodePage',
		type: 'options',
		default: 'before',
		description: 'Where to split relative to barcode',
		options: [
			{ name: 'Before', value: 'before' },
			{ name: 'After', value: 'after' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'Combine Pages With Same Consecutive Barcodes',
		name: 'combinePagesWithSameConsecutiveBarcodes',
		type: 'boolean',
		default: true,
		description: 'Whether to combine pages with same consecutive barcodes',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'PDF Render DPI',
		name: 'pdfRenderDpi',
		type: 'number',
		default: 1,
		description: 'DPI for PDF rendering',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'split_result.zip',
		description: 'Name for the output ZIP file containing split PDFs',
		placeholder: 'my-split-pdfs.zip',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
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
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const barcodeString = this.getNodeParameter('barcodeString', index) as string;
	const barcodeFilter = this.getNodeParameter('barcodeFilter', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const splitBarcodePage = this.getNodeParameter('splitBarcodePage', index) as string;
	const combinePagesWithSameConsecutiveBarcodes = this.getNodeParameter('combinePagesWithSameConsecutiveBarcodes', index) as boolean;
	const pdfRenderDpi = this.getNodeParameter('pdfRenderDpi', index) as number;
	const useAsync = this.getNodeParameter('async', index) as boolean;

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
		docContent,
		docName,
		barcodeString,
		barcodeFilter,
		barcodeType,
		splitBarcodePage,
		combinePagesWithSameConsecutiveBarcodes,
		pdfRenderDpi: pdfRenderDpi.toString(),
		async: useAsync,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfByBarcode_old', body);

	// Return the result as binary data (ZIP)
	const mimeType = 'application/zip';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'PDF split by barcode successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}
