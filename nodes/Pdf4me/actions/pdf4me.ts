import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Pdf4me Feature',
		name: 'pdf4meFeature',
		type: 'options',
		default: 'splitPdfByBarcode',
		description: 'Select the PDF4me feature to use',
		options: [
			{ name: 'Split PDF by Barcode', value: 'splitPdfByBarcode' },
			{ name: 'Update Hyperlinks Annotation', value: 'updateHyperlinksAnnotation' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
			},
		},
	},
	// --- Common input for all features ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input PDF file',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
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
				operation: [ActionConstants.Pdf4me],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				inputType: ['base64'],
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
				operation: [ActionConstants.Pdf4me],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				inputType: ['localPath'],
			},
		},
	},
	// --- Split PDF by Barcode ---
	{
		displayName: 'Barcode String',
		name: 'barcodeString',
		type: 'string',
		default: '',
		description: 'Barcode string to search for',
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	{
		displayName: 'Barcode Filter',
		name: 'barcodeFilter',
		type: 'options',
		default: 'startsWith',
		options: [
			{ name: 'Starts With', value: 'startsWith' },
			{ name: 'Contains', value: 'contains' },
			{ name: 'Equals', value: 'equals' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		default: 'qrcode',
		options: [
			{ name: 'QR Code', value: 'qrcode' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Code 39', value: 'code39' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	{
		displayName: 'Split Barcode Page',
		name: 'splitBarcodePage',
		type: 'options',
		default: 'before',
		options: [
			{ name: 'Before', value: 'before' },
			{ name: 'After', value: 'after' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	{
		displayName: 'Combine Pages With Same Consecutive Barcodes',
		name: 'combinePagesWithSameConsecutiveBarcodes',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	{
		displayName: 'PDF Render DPI',
		name: 'pdfRenderDpi',
		type: 'number',
		default: 1,
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['splitPdfByBarcode'],
			},
		},
	},
	// --- Update Hyperlinks Annotation ---
	{
		displayName: 'Hyperlink Updates',
		name: 'updatehyperlinkannotationlist',
		type: 'fixedCollection',
		placeholder: 'Add Hyperlink Update',
		default: {},
		options: [
			{
				name: 'hyperlink',
				displayName: 'Hyperlink',
				values: [
					{
						displayName: 'Is Expression',
						name: 'Is Expression',
						type: 'boolean',
						default: true,
					},
					{
						displayName: 'Search On',
						name: 'Search On',
						type: 'options',
						options: [
							{
								name: 'Text',
								value: 'Text',
							},
						],
						default: 'Text',
					},
					{
						displayName: 'Search Value',
						name: 'Search Value',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Text Current Value',
						name: 'Text Current Value',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Text New Value',
						name: 'Text New Value',
						type: 'string',
						default: '',
					},
					{
						displayName: 'URL Current Value',
						name: 'URL Current Value',
						type: 'string',
						default: '',
					},
					{
						displayName: 'URL New Value',
						name: 'URL New Value',
						type: 'string',
						default: '',
					},
			],
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Pdf4me],
				pdf4meFeature: ['updateHyperlinksAnnotation'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('pdf4meFeature', index) as string;
	if (operation !== ActionConstants.Pdf4me) {
		throw new Error('Unsupported operation for Pdf4me');
	}

	// Get input type and file
	const inputType = this.getNodeParameter('inputType', index) as string;
	let base64Content = '';
	let fileName = this.getNodeParameter('inputFileName', index) as string;

	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		base64Content = binaryDataBuffer.toString('base64');
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'base64') {
		base64Content = this.getNodeParameter('base64Content', index) as string;
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		base64Content = Buffer.from(response).toString('base64');
		if (!fileName) fileName = fileUrl.split('/').pop() || 'document.pdf';
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		base64Content = fileBuffer.toString('base64');
		if (!fileName) fileName = localFilePath.split('/').pop() || 'document.pdf';
	} else {
		throw new Error('Unsupported input type');
	}

	if (feature === 'splitPdfByBarcode') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			barcodeString: this.getNodeParameter('barcodeString', index) as string,
			barcodeFilter: this.getNodeParameter('barcodeFilter', index) as string,
			barcodeType: this.getNodeParameter('barcodeType', index) as string,
			splitBarcodePage: this.getNodeParameter('splitBarcodePage', index) as string,
			combinePagesWithSameConsecutiveBarcodes: this.getNodeParameter('combinePagesWithSameConsecutiveBarcodes', index) as boolean,
			pdfRenderDpi: this.getNodeParameter('pdfRenderDpi', index) as number,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/SplitPdfByBarcode_old', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'updateHyperlinksAnnotation') {
		const updateList = this.getNodeParameter('updatehyperlinkannotationlist.hyperlink', index, []) as any[];
		const updatehyperlinkannotationlist = updateList.map((item) => ({
			SearchOn: item['Search On'],
			SearchValue: item['Search Value'],
			IsExpression: item['Is Expression'],
			TextCurrentValue: item['Text Current Value'],
			TextNewValue: item['Text New Value'],
			URLCurrentValue: item['URL Current Value'],
			URLNewValue: item['URL New Value'],
		}));
		const payload = {
			docName: fileName || 'output.pdf',
			docContent: base64Content,
			updatehyperlinkannotationlist,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/UpdateHyperlinkAnnotation', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else {
		throw new Error('Unsupported feature for Pdf4me');
	}
}
