/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as convertToPdf from './actions/convertToPdf';
import { ActionConstants } from './GenericFunctions';

export const descriptions: INodeTypeDescription = {
	displayName: 'PDF4ME',
	name: 'pdf4me',
	description: 'Generate barcodes, convert URLs to PDF, convert PDFs to Word, convert JSON to Excel, crop images, and more using PDF4ME API',
	defaults: {
		name: 'PDF4ME',
	},
	group: ['transform'],
	icon: 'file:300.svg',
	inputs: [NodeConnectionType.Main],
	outputs: [NodeConnectionType.Main],
	credentials: [
		{
			name: 'pdf4meApi',
			required: true,
		},
	], // eslint-disable-line n8n-nodes-base/node-param-default-missing
	properties: [
		{
			displayName: 'Action',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Barcode',
					description: 'All barcode-related features: create, add to PDF, read from PDF, read Swiss QR',
					value: ActionConstants.Barcode,
					action: ActionConstants.Barcode,
				},
				{
					name: 'URL to PDF',
					description: 'Convert web pages to PDF while preserving layout, styling, and content',
					value: ActionConstants.UrlToPdf,
					action: ActionConstants.UrlToPdf,
				},
				{
					name: 'PDF to Word',
					description: 'Convert PDF documents to editable Word format with OCR support',
					value: ActionConstants.PdfToWord,
					action: ActionConstants.PdfToWord,
				},
				{
					name: 'JSON to Excel',
					description: 'Convert JSON data to Excel spreadsheet with customizable formatting',
					value: ActionConstants.JsonToExcel,
					action: ActionConstants.JsonToExcel,
				},
				{
					name: 'Crop Image',
					description: 'Crop images with border or rectangle cropping options',
					value: ActionConstants.CropImage,
					action: ActionConstants.CropImage,
				},
				{
					name: 'Convert to PDF',
					description: 'Convert documents and emails to PDF format',
					value: ActionConstants.ConvertToPdf,
					action: ActionConstants.ConvertToPdf,
				},
			],
			default: ActionConstants.Barcode,
		},
		{
			displayName: 'Barcode Feature',
			name: 'barcodeFeature',
			type: 'options',
			required: true,
			default: 'createBarcode',
			description: 'Select the barcode feature to use',
			displayOptions: {
				show: {
					operation: [ActionConstants.Barcode],
				},
			},
			options: [
				{ name: 'Create Barcode', value: 'createBarcode', description: 'Create a standalone barcode image' },
				{ name: 'Add Barcode to PDF', value: 'addBarcodeToPdf', description: 'Add a barcode to an existing PDF' },
				{ name: 'Read Barcode from PDF', value: 'readBarcodeFromPdf', description: 'Extract barcode or QR code data from a PDF' },
				{ name: 'Read Swiss QR Code from PDF', value: 'readSwissQrCodeFromPdf', description: 'Extract Swiss QR bill data from a PDF' },
			],
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...convertToPdf.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
