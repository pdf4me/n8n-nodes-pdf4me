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
		description: 'Choose how to provide the PDF file to read barcodes from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
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
				operation: [ActionConstants.ReadBarcodeFromPdf],
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
		placeholder: 'JVBERi0xLjQKJcfs...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
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
		description: 'URL to the PDF file to read barcodes from',
		placeholder: 'https://example.com/file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'read_barcode_from_pdf.json',
		description: 'Name for the output barcode data file (JSON)',
		placeholder: 'my-barcode-data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		required: true,
		default: 'all',
		description: 'The type of Barcodes to be detected',
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Unknown', value: 'unknown' },
			{ name: 'Code 11', value: 'code11' },
			{ name: 'Code 39', value: 'code39' },
			{ name: 'Code 93', value: 'code93' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Codabar', value: 'codabar' },
			{ name: 'Interleaved 2 of 5', value: 'inter2of5' },
			{ name: 'Patch Code', value: 'patchCode' },
			{ name: 'EAN-8', value: 'ean8' },
			{ name: 'UPC-E', value: 'upce' },
			{ name: 'EAN-13', value: 'ean13' },
			{ name: 'UPC-A', value: 'upca' },
			{ name: 'Plus 2', value: 'plus2' },
			{ name: 'Plus 5', value: 'plus5' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'QR Code', value: 'qrCode' },
			{ name: 'Postnet', value: 'postnet' },
			{ name: 'Planet', value: 'planet' },
			{ name: 'RM4SCC', value: 'rm4SCC' },
			{ name: 'Australia Post', value: 'australiaPost' },
			{ name: 'Intelligent Mail', value: 'intelligentMail' },
			{ name: 'Code 39 Extended', value: 'code39Extended' },
			{ name: 'Micro QR Code', value: 'microQRCode' },
			{ name: 'All 2D', value: 'all_2D' },
			{ name: 'Pharma Code', value: 'pharmaCode' },
			{ name: 'UCC128', value: 'ucc128' },
			{ name: 'RSS14', value: 'rss14' },
			{ name: 'RSS Limited', value: 'rssLimited' },
			{ name: 'RSS Expanded', value: 'rssExpanded' },
			{ name: 'All 1D', value: 'all_1D' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		required: false,
		default: 'all',
		description: 'Specify page indices as comma-separated values or ranges to process (e.g. "0, 1, 2-" or "1, 2, 3-7").',
		displayOptions: {
			show: {
				operation: [ActionConstants.ReadBarcodeFromPdf],
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
				operation: [ActionConstants.ReadBarcodeFromPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;

	// Main PDF content
	let docContent: string;
	let docName: string = outputFileName.endsWith('.pdf') ? outputFileName : 'output.pdf';
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		docContent = item[0].binary[binaryPropertyName].data;
		docName = item[0].binary[binaryPropertyName].fileName || docName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}
		const options = {
			method: 'GET' as const,
			url: pdfUrl.trim(),
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		const buffer = Buffer.from(response);
		docContent = buffer.toString('base64');
		docName = pdfUrl.split('/').pop() || docName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		barcodeType: [barcodeType],
		pages: pages || 'all',
		IsAsync: true,
	};

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ReadBarcodes', body);

	// Return the result as binary data (JSON)
	const mimeType = 'application/json';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	return [
		{
			json: {
				success: true,
				message: 'Barcode data extracted successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				barcodeType,
				pages,
			},
			binary: {
				data: binaryData,
			},
		},
	];
}