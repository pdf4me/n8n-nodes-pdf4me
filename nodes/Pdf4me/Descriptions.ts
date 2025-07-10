/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/convertFromPdf';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as mergeMultiplePDFs from './actions/MergeMultiplePDFs';
import * as overlayPDFs from './actions/OverlayPDFs';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as extractPages from './actions/extractPages';
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
					name: 'Extract Pages',
					description: 'Extract specific pages from PDF documents to create shorter versions or digital booklets',
					value: ActionConstants.ExtractPages,
					action: ActionConstants.ExtractPages,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...mergeMultiplePDFs.description,
		...overlayPDFs.description,
		...deleteBlankPagesFromPdf.description,
		...deleteUnwantedPagesFromPdf.description,
		...rotateDocument.description,
		...rotatePage.description,
		...extractPages.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
