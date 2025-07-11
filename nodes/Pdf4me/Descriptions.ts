/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
import * as addHtmlHeaderFooter from './actions/addHtmlHeaderFooter';
import * as addImageStampToPdf from './actions/addImageStampToPdf';
import * as addMarginToPdf from './actions/addMarginToPdf';
import * as addPageNumberToPdf from './actions/addPageNumberToPdf';
import * as addTextStampToPdf from './actions/addTextStampToPdf';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as cropImage from './actions/cropImage';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
import * as extractPages from './actions/extractPages';
import * as jsonToExcel from './actions/jsonToExcel';
import * as mergeMultiplePDFs from './actions/MergeMultiplePDFs';
import * as overlayPDFs from './actions/OverlayPDFs';
import * as pdfToWord from './actions/convertFromPdf';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as signPdf from './actions/signPdf';
import * as urlToPdf from './actions/urlToPdf';
import { ActionConstants } from './GenericFunctions';

export const descriptions: INodeTypeDescription = {
	displayName: 'PDF4ME',
	name: 'pdf4me',
	description: 'Generate barcodes, convert URLs to PDF, convert PDFs to Word, convert JSON to Excel, crop images, extract pages, and more using PDF4ME API',
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
					name: 'Add Attachment To PDF',
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
					name: 'Add Image Stamp To PDF',
					description: 'Add image stamps or watermarks to PDF documents',
					value: ActionConstants.AddImageStampToPdf,
					action: ActionConstants.AddImageStampToPdf,
				},
				{
					name: 'Add Margin To PDF',
					description: 'Add margins to PDF documents',
					value: ActionConstants.AddMarginToPdf,
					action: ActionConstants.AddMarginToPdf,
				},
				{
					name: 'Add Page Number To PDF',
					description: 'Add page numbers to PDF documents',
					value: ActionConstants.AddPageNumberToPdf,
					action: ActionConstants.AddPageNumberToPdf,
				},
				{
					name: 'Add Text Stamp To PDF',
					description: 'Add text stamps or watermarks to PDF documents',
					value: ActionConstants.AddTextStampToPdf,
					action: ActionConstants.AddTextStampToPdf,
				},
				{
					name: 'Generate Barcode',
					description: 'Generate various types of barcodes including QR codes, Code 128, Code 39, and more',
					value: ActionConstants.BarcodeGenerator,
					action: ActionConstants.BarcodeGenerator,
				},
				{
					name: 'Convert From PDF',
					description: 'Convert PDF documents to Word, Excel, or other formats with OCR support',
					value: ActionConstants.ConvertFromPDF,
					action: ActionConstants.ConvertFromPDF,
				},
				{
					name: 'Crop Image',
					description: 'Crop images with border or rectangle cropping options',
					value: ActionConstants.CropImage,
					action: ActionConstants.CropImage,
				},
				{
					name: 'Delete Blank Pages From PDF',
					description: 'Remove blank pages from PDF documents based on specified criteria',
					value: ActionConstants.DeleteBlankPagesFromPdf,
					action: ActionConstants.DeleteBlankPagesFromPdf,
				},
				{
					name: 'Delete Unwanted Pages From PDF',
					description: 'Remove specific pages from PDF documents by page numbers',
					value: ActionConstants.DeleteUnwantedPagesFromPdf,
					action: ActionConstants.DeleteUnwantedPagesFromPdf,
				},
				{
					name: 'Extract Pages',
					description: 'Extract specific pages from PDF documents to create shorter versions or digital booklets',
					value: ActionConstants.ExtractPages,
					action: ActionConstants.ExtractPages,
				},
				{
					name: 'Merge Multiple PDFs',
					description: 'Combine multiple PDF files into a single PDF document',
					value: ActionConstants.MergeMultiplePDFs,
					action: ActionConstants.MergeMultiplePDFs,
				},
				{
					name: 'Overlay PDFs',
					description: 'Merge two PDF files one over another as overlay',
					value: ActionConstants.OverlayPDFs,
					action: ActionConstants.OverlayPDFs,
				},
				{
					name: 'Rotate Document',
					description: 'Rotate entire PDF documents by 90, 180, or 270 degrees',
					value: ActionConstants.RotateDocument,
					action: ActionConstants.RotateDocument,
				},
				{
					name: 'Rotate Page',
					description: 'Rotate specific pages in PDF documents by 90, 180, or 270 degrees',
					value: ActionConstants.RotatePage,
					action: ActionConstants.RotatePage,
				},
				{
					name: 'Sign PDF',
					description: 'Digitally sign PDF documents',
					value: ActionConstants.SignPdf,
					action: ActionConstants.SignPdf,
				},
				{
					name: 'URL to PDF',
					description: 'Convert web pages to PDF while preserving layout, styling, and content',
					value: ActionConstants.UrlToPdf,
					action: ActionConstants.UrlToPdf,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...addAttachmentToPdf.description,
		...addHtmlHeaderFooter.description,
		...addImageStampToPdf.description,
		...addMarginToPdf.description,
		...addPageNumberToPdf.description,
		...addTextStampToPdf.description,
		...barcodeGenerator.description,
		...cropImage.description,
		...deleteBlankPagesFromPdf.description,
		...deleteUnwantedPagesFromPdf.description,
		...extractPages.description,
		...jsonToExcel.description,
		...mergeMultiplePDFs.description,
		...overlayPDFs.description,
		...pdfToWord.description,
		...rotateDocument.description,
		...rotatePage.description,
		...signPdf.description,
		...urlToPdf.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
