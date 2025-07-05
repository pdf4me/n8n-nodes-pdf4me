/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
import * as addHtmlHeaderFooter from './actions/addHtmlHeaderFooter';
import * as addImageStampToPdf from './actions/addImageStampToPdf';
import * as addMarginToPdf from './actions/addMarginToPdf';
import * as addPageNumberToPdf from './actions/addPageNumberToPdf';
import * as addTextStampToPdf from './actions/addTextStampToPdf';
import * as signPdf from './actions/signPdf';
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
					name: 'Generate Barcode',
					description: 'Generate various types of barcodes including QR codes, Code 128, Code 39, and more',
					value: ActionConstants.BarcodeGenerator,
					action: ActionConstants.BarcodeGenerator,
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
					name: 'Add Attachment to PDF',
					description: 'Add file attachments to PDF documents for additional document management',
					value: ActionConstants.AddAttachmentToPdf,
					action: ActionConstants.AddAttachmentToPdf,
				},
				{
					name: 'Add HTML Header Footer',
					description: 'Add HTML content as header or footer to PDF documents',
					value: ActionConstants.AddHtmlHeaderFooter,
					action: ActionConstants.AddHtmlHeaderFooter,
				},
				{
					name: 'Add Image Stamp to PDF',
					description: 'Add image stamps/watermarks to PDF documents with customizable positioning and opacity',
					value: ActionConstants.AddImageStampToPdf,
					action: ActionConstants.AddImageStampToPdf,
				},
				{
					name: 'Add Margin to PDF',
					description: 'Add custom margins to PDF documents and change page size accordingly',
					value: ActionConstants.AddMarginToPdf,
					action: ActionConstants.AddMarginToPdf,
				},
				{
					name: 'Add Page Number to PDF',
					description: 'Add customizable page numbers to PDF documents with control over position, format, and styling',
					value: ActionConstants.AddPageNumberToPdf,
					action: ActionConstants.AddPageNumberToPdf,
				},
				{
					name: 'Add Text Stamp to PDF',
					description: 'Add customizable text watermarks/stamps to PDF documents for authorization and piracy prevention',
					value: ActionConstants.AddTextStampToPdf,
					action: ActionConstants.AddTextStampToPdf,
				},
				{
					name: 'Sign PDF',
					description: 'Add signature images to PDF documents with control over position, size, and appearance',
					value: ActionConstants.SignPdf,
					action: ActionConstants.SignPdf,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...addAttachmentToPdf.description,
		...addHtmlHeaderFooter.description,
		...addImageStampToPdf.description,
		...addMarginToPdf.description,
		...addPageNumberToPdf.description,
		...addTextStampToPdf.description,
		...signPdf.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
