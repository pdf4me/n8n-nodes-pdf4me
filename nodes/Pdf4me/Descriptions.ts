/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as convertToPdf from './actions/convertToPdf';
import * as mergePdf from './actions/MergePDF';
import * as splitPdf from './actions/SplitPDF';
import * as edit from './actions/edit';
import * as extract from './actions/extract';
import * as findSearch from './actions/findSearch';
import * as form from './actions/form';
import * as image from './actions/image';
import * as optimizeCompress from './actions/optimizeCompress';
import * as organize from './actions/organize';
import * as pdf4me from './actions/pdf4me';
import * as uploadFile from './actions/uploadFile';
import * as word from './actions/word';
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
				{
					name: 'Merge PDF',
					description: 'Merge multiple PDFs into one or overlay PDFs',
					value: ActionConstants.MergePDF,
					action: ActionConstants.MergePDF,
				},
				{
					name: 'Split PDF',
					description: 'Split PDFs by pages, barcodes, Swiss QR codes, or text content',
					value: ActionConstants.SplitPDF,
					action: ActionConstants.SplitPDF,
				},
				{
					name: 'Edit',
					description: 'Edit PDFs with attachments, headers/footers, stamps, margins, page numbers, and signatures',
					value: ActionConstants.Edit,
					action: ActionConstants.Edit,
				},
				{
					name: 'Extract',
					description: 'Extract text, images, and other content from PDFs',
					value: ActionConstants.Extract,
					action: ActionConstants.Extract,
				},
				{
					name: 'Find Search',
					description: 'Search and find content within PDFs',
					value: ActionConstants.FindSearch,
					action: ActionConstants.FindSearch,
				},
				{
					name: 'Form',
					description: 'Handle PDF forms and form data',
					value: ActionConstants.Form,
					action: ActionConstants.Form,
				},
				{
					name: 'Image',
					description: 'Process and manipulate images',
					value: ActionConstants.Image,
					action: ActionConstants.Image,
				},
				{
					name: 'Optimize Compress',
					description: 'Optimize and compress PDFs and images',
					value: ActionConstants.OptimizeCompress,
					action: ActionConstants.OptimizeCompress,
				},
				{
					name: 'Organize',
					description: 'Organize and structure PDF documents',
					value: ActionConstants.Organize,
					action: ActionConstants.Organize,
				},
				{
					name: 'Pdf4me',
					description: 'General PDF4ME operations',
					value: ActionConstants.Pdf4me,
					action: ActionConstants.Pdf4me,
				},
				{
					name: 'Upload File',
					description: 'Upload files to PDF4ME for processing',
					value: ActionConstants.UploadFile,
					action: ActionConstants.UploadFile,
				},
				{
					name: 'Word',
					description: 'Convert Word documents and handle Word operations',
					value: ActionConstants.Word,
					action: ActionConstants.Word,
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
				{ name: 'Read Barcode From PDF', value: 'readBarcodeFromPdf', description: 'Extract barcode or QR code data from a PDF' },
				{ name: 'Read Swiss QR Code From PDF', value: 'readSwissQrCodeFromPdf', description: 'Extract Swiss QR bill data from a PDF' },
			],
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...convertToPdf.description,
		...mergePdf.description,
		...splitPdf.description,
		...edit.description,
		...extract.description,
		...findSearch.description,
		...form.description,
		...image.description,
		...optimizeCompress.description,
		...organize.description,
		...pdf4me.description,
		...uploadFile.description,
		...word.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
