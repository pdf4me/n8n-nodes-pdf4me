import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	// --- Create Barcode ---
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to encode in the barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['createBarcode'],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		default: 'qrCode',
		description: 'Type of barcode to create',
		options: [
			{ name: 'Aztec', value: 'aztec' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'QR Code', value: 'qrCode' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['createBarcode'],
			},
		},
	},
	{
		displayName: 'Hide Text',
		name: 'hideText',
		type: 'boolean',
		default: false,
		description: 'Whether to hide the barcode text (true=hide, false=show text alongside barcode)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['createBarcode'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'Barcode_create_output.png',
		description: 'Name for the output barcode image',
		placeholder: 'output.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['createBarcode'],
			},
		},
	},
	// --- Add Barcode to PDF ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use binary data from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide base64 encoded PDF' },
			{ name: 'URL', value: 'url', description: 'Provide a URL to the PDF' },
			{ name: 'Local Path', value: 'localPath', description: 'Provide a local file path to the PDF' },
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
				inputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Barcode Text',
		name: 'barcodeText',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to encode in the barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		default: 'qrCode',
		description: 'Type of barcode to add',
		options: [
			{ name: 'Aztec', value: 'aztec' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'QR Code', value: 'qrCode' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		description: 'Pages to apply the barcode (e.g., "1", "1-3", "2-", empty for all)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	{
		displayName: 'Align X',
		name: 'alignX',
		type: 'options',
		default: 'Right',
		options: [
			{ name: 'Left', value: 'Left' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Right', value: 'Right' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	{
		displayName: 'Align Y',
		name: 'alignY',
		type: 'options',
		default: 'Bottom',
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Middle', value: 'Middle' },
			{ name: 'Bottom', value: 'Bottom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'Add_barcode_to_PDF_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'output.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['addBarcodeToPdf'],
			},
		},
	},
	// --- Read Barcode from PDF ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
			},
		},
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use binary data from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide base64 encoded PDF' },
			{ name: 'URL', value: 'url', description: 'Provide a URL to the PDF' },
			{ name: 'Local Path', value: 'localPath', description: 'Provide a local file path to the PDF' },
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
				inputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Barcode Types',
		name: 'barcodeTypes',
		type: 'multiOptions',
		default: ['all'],
		options: [
			{ name: 'All', value: 'all' },
			{ name: 'Aztec', value: 'aztec' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'QR Code', value: 'qrCode' },
		],
		description: 'Types of barcodes to read',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: 'all',
		description: 'Pages to scan for barcodes (e.g., "all", "1", "1-3", "2-", etc.)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'Read_barcode_output.json',
		description: 'Name for the output JSON file',
		placeholder: 'output.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readBarcodeFromPdf'],
			},
		},
	},
	// --- Read Swiss QR Code from PDF ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
			},
		},
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use binary data from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide base64 encoded PDF' },
			{ name: 'URL', value: 'url', description: 'Provide a URL to the PDF' },
			{ name: 'Local Path', value: 'localPath', description: 'Provide a local file path to the PDF' },
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
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
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
				inputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'read_swissqr_code_output.json',
		description: 'Name for the output JSON file',
		placeholder: 'output.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.Barcode],
				barcodeFeature: ['readSwissQrCodeFromPdf'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const barcodeFeature = this.getNodeParameter('barcodeFeature', index) as string;

	if (operation !== ActionConstants.Barcode) {
		throw new Error('This action only supports the Barcode operation.');
	}

	if (barcodeFeature === 'createBarcode') {
	const text = this.getNodeParameter('text', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const hideText = this.getNodeParameter('hideText', index) as boolean;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const payload = {
		text,
		barcodeType,
		hideText,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/CreateBarcode', payload);
	if (responseData) {
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
				outputFileName || 'Barcode_create_output.png',
			'image/png',
		);
		return [
			{
				json: {
						fileName: outputFileName || 'Barcode_create_output.png',
					mimeType: 'image/png',
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

	if (barcodeFeature === 'addBarcodeToPdf') {
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
		const barcodeText = this.getNodeParameter('barcodeText', index) as string;
		const barcodeType = this.getNodeParameter('barcodeType', index) as string;
		const pages = this.getNodeParameter('pages', index) as string;
		const alignX = this.getNodeParameter('alignX', index) as string;
		const alignY = this.getNodeParameter('alignY', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			text: barcodeText,
			barcodeType,
			pages,
			alignX,
			alignY,
			heightInMM: '40',
			widthInMM: '40',
			marginXInMM: '20',
			marginYInMM: '20',
			heightInPt: '20',
			widthInPt: '20',
			marginXInPt: '10',
			marginYInPt: '10',
			opacity: 100,
			displayText: 'above',
			hideText: true,
			showOnlyInPrint: false,
			isTextAbove: true,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/addbarcode', payload);
		if (responseData) {
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				outputFileName || 'Add_barcode_to_PDF_output.pdf',
				'application/pdf',
			);
			return [
				{
					json: {
						fileName: outputFileName || 'Add_barcode_to_PDF_output.pdf',
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

	if (barcodeFeature === 'readBarcodeFromPdf') {
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
		const barcodeTypes = this.getNodeParameter('barcodeTypes', index) as string[];
		const pages = this.getNodeParameter('pages', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			barcodeType: barcodeTypes,
			pages,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ReadBarcodes', payload);
		if (responseData) {
			let jsonData: any;
			try {
				jsonData = JSON.parse(responseData.toString('utf8'));
			} catch {
				jsonData = responseData.toString('utf8');
			}
			return [
				{
					json: {
						outputFileName: outputFileName || 'Read_barcode_output.json',
						data: jsonData,
						success: true,
					},
				},
			];
		}
		throw new Error('No response data received from PDF4ME API');
	}

	if (barcodeFeature === 'readSwissQrCodeFromPdf') {
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
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ReadSwissQRBill', payload);
		if (responseData) {
			let jsonData: any;
			try {
				jsonData = JSON.parse(responseData.toString('utf8'));
			} catch {
				jsonData = responseData.toString('utf8');
			}
			return [
				{
					json: {
						outputFileName: outputFileName || 'read_swissqr_code_output.json',
						data: jsonData,
						success: true,
					},
				},
			];
		}
	throw new Error('No response data received from PDF4ME API');
	}

	throw new Error(`Unknown barcode feature: ${barcodeFeature}`);
}
