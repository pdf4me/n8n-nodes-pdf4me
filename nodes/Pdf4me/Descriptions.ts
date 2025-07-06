/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as classifyDocument from './actions/classifyDocument';
import * as extractAttachmentFromPdf from './actions/extractAttachmentFromPdf';
import * as extractFormDataFromPdf from './actions/extractFormDataFromPdf';
import * as extractResources from './actions/extractResources';
import * as extractTableFromPdf from './actions/extractTableFromPdf';
import * as extractTextByExpression from './actions/extractTextByExpression';
import * as extractTextFromWord from './actions/extractTextFromWord';
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
					name: 'Classify Document',
					description: 'Classify or identify documents based on file content using AI analysis',
					value: ActionConstants.ClassifyDocument,
					action: ActionConstants.ClassifyDocument,
				},
				{
					name: 'Extract Attachment From PDF',
					description: 'Extract all file attachments embedded within PDF documents',
					value: ActionConstants.ExtractAttachmentFromPdf,
					action: ActionConstants.ExtractAttachmentFromPdf,
				},
				{
					name: 'Extract Form Data From PDF',
					description: 'Extract form field data and values from PDF documents containing fillable forms',
					value: ActionConstants.ExtractFormDataFromPdf,
					action: ActionConstants.ExtractFormDataFromPdf,
				},
				{
					name: 'Extract Resources',
					description: 'Extract text content and embedded images from PDF documents',
					value: ActionConstants.ExtractResources,
					action: ActionConstants.ExtractResources,
				},
				{
					name: 'Extract Table From PDF',
					description: 'Extract table data and structures from PDF documents',
					value: ActionConstants.ExtractTableFromPdf,
					action: ActionConstants.ExtractTableFromPdf,
				},
				{
					name: 'Extract Text by Expression',
					description: 'Extract specific text from PDF documents using regular expressions',
					value: ActionConstants.ExtractTextByExpression,
					action: ActionConstants.ExtractTextByExpression,
				},
				{
					name: 'Extract Text from Word',
					description: 'Extract text content from Word documents with page range and filtering options',
					value: ActionConstants.ExtractTextFromWord,
					action: ActionConstants.ExtractTextFromWord,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...classifyDocument.description,
		...extractAttachmentFromPdf.description,
		...extractFormDataFromPdf.description,
		...extractResources.description,
		...extractTableFromPdf.description,
		...extractTextByExpression.description,
		...extractTextFromWord.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
