/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as convertToPdf from './actions/convertToPdf';
import * as mergePDF from './actions/MergePDF';
import * as splitPDF from './actions/SplitPDF';
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
import * as addHtmlHeaderFooter from './actions/addHtmlHeaderFooter';
import * as addImageStampToPdf from './actions/addImageStampToPdf';
import * as addMarginToPdf from './actions/addMarginToPdf';
import * as addPageNumberToPdf from './actions/addPageNumberToPdf';
import * as addTextStampToPdf from './actions/addTextStampToPdf';
import * as classifyDocument from './actions/classifyDocument';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
import * as documentToPdf from './actions/documentToPdf';
import * as edit from './actions/edit';
import * as extract from './actions/extract';
import * as extractAttachmentFromPdf from './actions/extractAttachmentFromPdf';
import * as extractFormDataFromPdf from './actions/extractFormDataFromPdf';
import * as extractPagesFromPdf from './actions/extractPagesFromPdf';
import * as extractResources from './actions/extractResources';
import * as extractTableFromPdf from './actions/extractTableFromPdf';
import * as extractTextByExpression from './actions/extractTextByExpression';
import * as extractTextFromWord from './actions/extractTextFromWord';
import * as findSearch from './actions/findSearch';
import * as form from './actions/form';
import * as htmlToPdf from './actions/htmlToPdf';
import * as image from './actions/image';
import * as markdownToPdf from './actions/markdownToPdf';
import * as optimizeCompress from './actions/optimizeCompress';
import * as organize from './actions/organize';
import * as pdf4me from './actions/pdf4me';
import * as pngToPdf from './actions/pngToPdf';
import * as pptxToPdf from './actions/pptxToPdf';
import * as protectDocument from './actions/protectDocument';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as signPdf from './actions/signPdf';
import * as unlockPdf from './actions/unlockPdf';
import * as uploadFile from './actions/uploadFile';
import * as visioToPdf from './actions/visioToPdf';
import * as word from './actions/word';
import * as wordToPdfForm from './actions/wordToPdfForm';
import * as xlsxToPdf from './actions/xlsxToPdf';
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
					name: 'Convert to PDF',
					description: 'Convert documents and emails to PDF format',
					value: ActionConstants.ConvertToPdf,
					action: ActionConstants.ConvertToPdf,
				},
				{
					name: 'Merge PDF',
					description: 'Merge multiple PDFs into single PDF or overlay two PDFs',
					value: ActionConstants.MergePDF,
					action: ActionConstants.MergePDF,
				},
				{
					name: 'Split PDF',
					description: 'Split PDF documents by pages, barcodes, or text content',
					value: ActionConstants.SplitPDF,
					action: ActionConstants.SplitPDF,
				},
				{
					name: 'Add Attachment to PDF',
					description: 'Add file attachments to PDF documents',
					value: ActionConstants.AddAttachmentToPdf,
					action: ActionConstants.AddAttachmentToPdf,
				},
				{
					name: 'Add HTML Header Footer',
					description: 'Add HTML-based headers and footers to PDF documents',
					value: ActionConstants.AddHtmlHeaderFooter,
					action: ActionConstants.AddHtmlHeaderFooter,
				},
				{
					name: 'Add Image Stamp to PDF',
					description: 'Add image stamps or watermarks to PDF documents',
					value: ActionConstants.AddImageStampToPdf,
					action: ActionConstants.AddImageStampToPdf,
				},
				{
					name: 'Add Margin to PDF',
					description: 'Add margins to PDF documents',
					value: ActionConstants.AddMarginToPdf,
					action: ActionConstants.AddMarginToPdf,
				},
				{
					name: 'Add Page Number to PDF',
					description: 'Add page numbers to PDF documents',
					value: ActionConstants.AddPageNumberToPdf,
					action: ActionConstants.AddPageNumberToPdf,
				},
				{
					name: 'Add Text Stamp to PDF',
					description: 'Add text stamps or watermarks to PDF documents',
					value: ActionConstants.AddTextStampToPdf,
					action: ActionConstants.AddTextStampToPdf,
				},
				{
					name: 'Classify Document',
					description: 'Classify documents based on content and structure',
					value: ActionConstants.ClassifyDocument,
					action: ActionConstants.ClassifyDocument,
				},

				{
					name: 'Delete Blank Pages from PDF',
					description: 'Remove blank pages from PDF documents',
					value: ActionConstants.DeleteBlankPagesFromPdf,
					action: ActionConstants.DeleteBlankPagesFromPdf,
				},
				{
					name: 'Delete Unwanted Pages from PDF',
					description: 'Remove specific pages from PDF documents',
					value: ActionConstants.DeleteUnwantedPagesFromPdf,
					action: ActionConstants.DeleteUnwantedPagesFromPdf,
				},
				{
					name: 'Document to PDF',
					description: 'Convert various document formats to PDF',
					value: ActionConstants.DocumentToPdf,
					action: ActionConstants.DocumentToPdf,
				},
				{
					name: 'Edit',
					description: 'Edit PDF documents with various tools',
					value: ActionConstants.Edit,
					action: ActionConstants.Edit,
				},
				{
					name: 'Extract',
					description: 'Extract content from PDF documents',
					value: ActionConstants.Extract,
					action: ActionConstants.Extract,
				},
				{
					name: 'Extract Attachment from PDF',
					description: 'Extract file attachments from PDF documents',
					value: ActionConstants.ExtractAttachmentFromPdf,
					action: ActionConstants.ExtractAttachmentFromPdf,
				},
				{
					name: 'Extract Form Data from PDF',
					description: 'Extract form field data from PDF documents',
					value: ActionConstants.ExtractFormDataFromPdf,
					action: ActionConstants.ExtractFormDataFromPdf,
				},
				{
					name: 'Extract Pages from PDF',
					description: 'Extract specific pages from PDF documents',
					value: ActionConstants.ExtractPagesFromPdf,
					action: ActionConstants.ExtractPagesFromPdf,
				},
				{
					name: 'Extract Resources',
					description: 'Extract resources from PDF documents',
					value: ActionConstants.ExtractResources,
					action: ActionConstants.ExtractResources,
				},
				{
					name: 'Extract Table from PDF',
					description: 'Extract table data from PDF documents',
					value: ActionConstants.ExtractTableFromPdf,
					action: ActionConstants.ExtractTableFromPdf,
				},
				{
					name: 'Extract Text by Expression',
					description: 'Extract text from PDF using custom expressions',
					value: ActionConstants.ExtractTextByExpression,
					action: ActionConstants.ExtractTextByExpression,
				},
				{
					name: 'Extract Text from Word',
					description: 'Extract text content from Word documents',
					value: ActionConstants.ExtractTextFromWord,
					action: ActionConstants.ExtractTextFromWord,
				},
				{
					name: 'Find Search',
					description: 'Search for content within PDF documents',
					value: ActionConstants.FindSearch,
					action: ActionConstants.FindSearch,
				},

				{
					name: 'Form',
					description: 'Work with PDF forms',
					value: ActionConstants.Form,
					action: ActionConstants.Form,
				},
				{
					name: 'HTML to PDF',
					description: 'Convert HTML content to PDF format',
					value: ActionConstants.HtmlToPdf,
					action: ActionConstants.HtmlToPdf,
				},
				{
					name: 'Image',
					description: 'Process and manipulate images',
					value: ActionConstants.Image,
					action: ActionConstants.Image,
				},

				{
					name: 'Markdown to PDF',
					description: 'Convert Markdown content to PDF format',
					value: ActionConstants.MarkdownToPdf,
					action: ActionConstants.MarkdownToPdf,
				},
				{
					name: 'Optimize Compress',
					description: 'Optimize and compress PDF documents',
					value: ActionConstants.OptimizeCompress,
					action: ActionConstants.OptimizeCompress,
				},
				{
					name: 'Organize',
					description: 'Organize PDF documents',
					value: ActionConstants.Organize,
					action: ActionConstants.Organize,
				},
				{
					name: 'PDF4ME',
					description: 'General PDF4ME operations',
					value: ActionConstants.Pdf4me,
					action: ActionConstants.Pdf4me,
				},

				{
					name: 'PNG to PDF',
					description: 'Convert PNG images to PDF format',
					value: ActionConstants.PngToPdf,
					action: ActionConstants.PngToPdf,
				},
				{
					name: 'PPTX to PDF',
					description: 'Convert PowerPoint presentations to PDF format',
					value: ActionConstants.PptxToPdf,
					action: ActionConstants.PptxToPdf,
				},
				{
					name: 'Protect Document',
					description: 'Add password protection to PDF documents',
					value: ActionConstants.ProtectDocument,
					action: ActionConstants.ProtectDocument,
				},
				{
					name: 'Rotate Document',
					description: 'Rotate entire PDF documents',
					value: ActionConstants.RotateDocument,
					action: ActionConstants.RotateDocument,
				},
				{
					name: 'Rotate Page',
					description: 'Rotate specific pages in PDF documents',
					value: ActionConstants.RotatePage,
					action: ActionConstants.RotatePage,
				},
				{
					name: 'Sign PDF',
					description: 'Add digital signatures to PDF documents',
					value: ActionConstants.SignPdf,
					action: ActionConstants.SignPdf,
				},
				{
					name: 'Unlock PDF',
					description: 'Remove password protection from PDF documents',
					value: ActionConstants.UnlockPdf,
					action: ActionConstants.UnlockPdf,
				},
				{
					name: 'Upload File',
					description: 'Upload files to PDF4ME service',
					value: ActionConstants.UploadFile,
					action: ActionConstants.UploadFile,
				},
				{
					name: 'Visio to PDF',
					description: 'Convert Visio diagrams to PDF format',
					value: ActionConstants.VisioToPdf,
					action: ActionConstants.VisioToPdf,
				},
				{
					name: 'Word',
					description: 'Work with Word documents',
					value: ActionConstants.Word,
					action: ActionConstants.Word,
				},
				{
					name: 'Word to PDF Form',
					description: 'Convert Word documents to PDF forms',
					value: ActionConstants.WordToPdfForm,
					action: ActionConstants.WordToPdfForm,
				},
				{
					name: 'XLSX to PDF',
					description: 'Convert Excel spreadsheets to PDF format',
					value: ActionConstants.XlsxToPdf,
					action: ActionConstants.XlsxToPdf,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...convertToPdf.description,
		...mergePDF.description,
		...splitPDF.description,
		...addAttachmentToPdf.description,
		...addHtmlHeaderFooter.description,
		...addImageStampToPdf.description,
		...addMarginToPdf.description,
		...addPageNumberToPdf.description,
		...addTextStampToPdf.description,
		...classifyDocument.description,
		...deleteBlankPagesFromPdf.description,
		...deleteUnwantedPagesFromPdf.description,
		...documentToPdf.description,
		...edit.description,
		...extract.description,
		...extractAttachmentFromPdf.description,
		...extractFormDataFromPdf.description,
		...extractPagesFromPdf.description,
		...extractResources.description,
		...extractTableFromPdf.description,
		...extractTextByExpression.description,
		...extractTextFromWord.description,
		...findSearch.description,
		...form.description,
		...htmlToPdf.description,
		...image.description,
		...markdownToPdf.description,
		...optimizeCompress.description,
		...organize.description,
		...pdf4me.description,
		...pngToPdf.description,
		...pptxToPdf.description,
		...protectDocument.description,
		...rotateDocument.description,
		...rotatePage.description,
		...signPdf.description,
		...unlockPdf.description,
		...uploadFile.description,
		...visioToPdf.description,
		...word.description,
		...wordToPdfForm.description,
		...xlsxToPdf.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
