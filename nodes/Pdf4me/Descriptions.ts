/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as pdfToWord from './actions/pdfToWord';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as htmlToPdf from './actions/htmlToPdf';


import { ActionConstants } from './GenericFunctions';

export const descriptions: INodeTypeDescription = {
	displayName: 'PDF4ME',
	name: 'pdf4me',
	description: 'Generate barcodes, convert URLs to PDF, convert PDFs to Word, convert JSON to Excel, crop images, convert HTML/Markdown to PDF, convert documents to PDF, convert Visio to PDF, convert Word to PDF forms, and more using PDF4ME API',
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
			required: true,
			default: ActionConstants.ConvertToPdf,
			options: [
				{
					name: 'Generate Barcode',
					description: 'Generate various types of barcodes including QR codes, Code 128, Code 39, and more',
					value: ActionConstants.BarcodeGenerator,
					action: ActionConstants.BarcodeGenerator,
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
					name: 'URL to PDF',
					description: 'Convert web pages to PDF',
					value: ActionConstants.UrlToPdf,
					action: ActionConstants.UrlToPdf,
				},
				{
					name: 'PDF to Word',
					description: 'Convert PDF documents to Word format',
					value: ActionConstants.PdfToWord,
					action: ActionConstants.PdfToWord,
				},
				{
					name: 'Convert to PDF',
					description: 'Convert various document formats to PDF',
					value: ActionConstants.ConvertToPdf,
					action: ActionConstants.ConvertToPdf,
				},
				{ name: 'Convert from PDF', value: ActionConstants.ConvertFromPdf, description: 'Convert PDF to other formats' },
				{ name: 'Optimize PDF', value: ActionConstants.OptimizePdf, description: 'Optimize and process PDF documents' },
			],
		},
		{
			displayName: 'Optimization Type',
			name: 'optimizePdfType',
			type: 'options',
			required: true,
			default: 'CreatePdfA',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
				},
			},
			options: [
				{ name: 'Create PDF/A', value: 'CreatePdfA', description: 'Convert PDF to PDF/A format for archival' },
				{ name: 'Flatten PDF', value: 'FlattenPdf', description: 'Convert interactive elements to static content' },
				{ name: 'Linearize PDF', value: 'LinearizePdf', description: 'Optimize PDF for web viewing' },
			],
		},
		...barcodeGenerator.description,
		...urlToPdf.description,
		...pdfToWord.description,
		...jsonToExcel.description,
		...cropImage.description,
		...htmlToPdf.description,
		// Add Convert from PDF main action and sub-dropdown
		{
			displayName: 'Conversion Type',
			name: 'fromPdfConversionType',
			type: 'options',
			required: true,
			default: 'PdfToWord',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
				},
			},
			options: [
				{ name: 'PDF to Word', value: 'PdfToWord', description: 'Convert PDF to Word (.docx)' },
				{ name: 'PDF to Excel', value: 'PdfToExcel', description: 'Convert PDF to Excel (.xlsx)' },
				{ name: 'PDF to PowerPoint', value: 'PdfToPowerpoint', description: 'Convert PDF to PowerPoint (.pptx)' },
			],
		},
		// Convert to PDF sub-options
		{
			displayName: 'Conversion Type',
			name: 'conversionType',
			type: 'options',
			required: true,
			default: 'DocumentToPdf',
			description: 'Select the type of document to convert to PDF',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
				},
			},
			options: [
				{
					name: 'Document to PDF (.doc, .docx)',
					value: 'DocumentToPdf',
					description: 'Convert Word documents to PDF',
				},
				{
					name: 'PPTX to PDF (.pptx)',
					value: 'PptxToPdf',
					description: 'Convert PowerPoint presentations to PDF',
				},
				{
					name: 'XLSX to PDF (.xlsx)',
					value: 'XlsxToPdf',
					description: 'Convert Excel spreadsheets to PDF',
				},
				{
					name: 'PNG to PDF (.png)',
					value: 'PngToPdf',
					description: 'Convert PNG images to PDF',
				},
				{
					name: 'HTML to PDF',
					value: 'HtmlToPdf',
					description: 'Convert HTML files to PDF',
				},
				{
					name: 'Markdown to PDF',
					value: 'MarkdownToPdf',
					description: 'Convert Markdown files to PDF',
				},
				{
					name: 'Visio to PDF',
					value: 'VisioToPdf',
					description: 'Convert Visio diagrams to PDF',
				},
				{
					name: 'Word to PDF Form',
					value: 'WordToPdfForm',
					description: 'Convert Word documents to PDF forms',
				},
				{
					name: 'URL to PDF',
					value: 'UrlToPdf',
					description: 'Convert web pages to PDF',
				},
			],
		},
		// Document to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'inputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the Word document to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use Word document from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide Word document content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to Word document',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to Word document',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the Word document',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
					inputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 Document Content',
			name: 'base64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded Word document content (.doc, .docx)',
			placeholder: 'UEsDBBQAAAAIAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
					inputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'Document URL',
			name: 'documentUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the Word document to convert',
			placeholder: 'https://example.com/document.docx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
					inputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'filePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the Word document to convert',
			placeholder: '/path/to/document.docx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
					inputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'outputFileName',
			type: 'string',
			default: 'document_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-document-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'docName',
			type: 'string',
			default: 'output',
			description: 'Name for the output PDF file (used by API)',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'advancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['DocumentToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// PPTX to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'pptxInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PowerPoint file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use PowerPoint file from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide PowerPoint content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to PowerPoint file',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to PowerPoint file',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'pptxBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PowerPoint file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
					pptxInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PowerPoint Content',
			name: 'pptxBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded PowerPoint presentation content (.pptx)',
			placeholder: 'UEsDBBQAAAAIAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
					pptxInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PowerPoint URL',
			name: 'powerpointUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PowerPoint file to convert',
			placeholder: 'https://example.com/presentation.pptx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
					pptxInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'pptxFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PowerPoint file to convert',
			placeholder: '/path/to/presentation.pptx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
					pptxInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'pptxDocName',
			type: 'string',
			default: 'output',
			description: 'Name for the output PDF file (used by API)',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'pptxOutputFileName',
			type: 'string',
			default: 'presentation_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-presentation-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
				},
			},
		},

		{
			displayName: 'Advanced Options',
			name: 'pptxAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PptxToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// XLSX to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'xlsxInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the Excel file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use Excel file from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide Excel content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to Excel file',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to Excel file',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'xlsxBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the Excel file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
					xlsxInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 Excel Content',
			name: 'xlsxBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded Excel spreadsheet content (.xlsx)',
			placeholder: 'UEsDBBQAAAAIAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
					xlsxInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'Excel URL',
			name: 'excelUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the Excel file to convert',
			placeholder: 'https://example.com/spreadsheet.xlsx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
					xlsxInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'xlsxFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the Excel file to convert',
			placeholder: '/path/to/spreadsheet.xlsx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
					xlsxInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'xlsxOutputFileName',
			type: 'string',
			default: 'spreadsheet_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-spreadsheet-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'xlsxDocName',
			type: 'string',
			default: 'output',
			description: 'Name for the output PDF file (used by API)',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'xlsxAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['XlsxToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// PNG to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'pngInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PNG image to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use PNG image from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide PNG content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to PNG image',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to PNG image',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'pngBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PNG image',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
					pngInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PNG Content',
			name: 'pngBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded PNG image content (.png)',
			placeholder: 'iVBORw0KGgoAAAANSUhEUgAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
					pngInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PNG URL',
			name: 'pngUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PNG image to convert',
			placeholder: 'https://example.com/image.png',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
					pngInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'pngFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PNG image to convert',
			placeholder: '/path/to/image.png',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
					pngInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'pngOutputFileName',
			type: 'string',
			default: 'image_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-image-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'pngDocName',
			type: 'string',
			default: 'output',
			description: 'Name for the output PDF file (used by API)',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'pngAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['PngToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// HTML to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'htmlInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the HTML file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use HTML file from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide HTML content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to HTML file',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to HTML file',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'htmlBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the HTML file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
					htmlInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 HTML Content',
			name: 'htmlBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded HTML document content',
			placeholder: '<!DOCTYPE html><html><head><title>Sample</title></head><body>...</body></html>',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
					htmlInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'HTML URL',
			name: 'htmlUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the HTML file to convert',
			placeholder: 'https://example.com/page.html',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
					htmlInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'htmlFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the HTML file to convert',
			placeholder: '/path/to/document.html',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
					htmlInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'htmlOutputFileName',
			type: 'string',
			default: 'html_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-html-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'htmlDocName',
			type: 'string',
			default: 'document.html',
			description: 'Name of the source HTML file for reference',
			placeholder: 'original-file.html',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
		},
		{
			displayName: 'Page Layout',
			name: 'htmlLayout',
			type: 'options',
			default: 'Portrait',
			description: 'Page orientation for the PDF',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{
					name: 'Portrait',
					value: 'Portrait',
					description: 'Vertical orientation (taller than wide)',
				},
				{
					name: 'Landscape',
					value: 'Landscape',
					description: 'Horizontal orientation (wider than tall)',
				},
			],
		},
		{
			displayName: 'Page Format',
			name: 'htmlFormat',
			type: 'options',
			default: 'A4',
			description: 'Page size for the PDF',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{ name: 'A4', value: 'A4' },
				{ name: 'Letter', value: 'Letter' },
				{ name: 'A5', value: 'A5' },
				{ name: 'A6', value: 'A6' },
				{ name: 'Legal', value: 'Legal' },
			],
		},
		{
			displayName: 'Scale',
			name: 'htmlScale',
			type: 'number',
			default: 0.8,
			description: 'Scaling factor for content (0.1 to 2.0)',
			typeOptions: {
				minValue: 0.1,
				maxValue: 2.0,
				numberStepSize: 0.1,
			},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
		},
		{
			displayName: 'Margins',
			name: 'htmlMargins',
			type: 'collection',
			placeholder: 'Add Margin',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{
					displayName: 'Top Margin',
					name: 'topMargin',
					type: 'string',
					default: '40px',
					description: 'Top margin spacing (e.g., "40px", "2cm", "1in")',
				},
				{
					displayName: 'Bottom Margin',
					name: 'bottomMargin',
					type: 'string',
					default: '40px',
					description: 'Bottom margin spacing (e.g., "40px", "2cm", "1in")',
				},
				{
					displayName: 'Left Margin',
					name: 'leftMargin',
					type: 'string',
					default: '40px',
					description: 'Left margin spacing (e.g., "40px", "2cm", "1in")',
				},
				{
					displayName: 'Right Margin',
					name: 'rightMargin',
					type: 'string',
					default: '40px',
					description: 'Right margin spacing (e.g., "40px", "2cm", "1in")',
				},
			],
		},
		{
			displayName: 'PDF Options',
			name: 'htmlPdfOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{
					displayName: 'Print Background',
					name: 'printBackground',
					type: 'boolean',
					default: true,
					description: 'Include background colors and images in the PDF',
				},
				{
					displayName: 'Display Header Footer',
					name: 'displayHeaderFooter',
					type: 'boolean',
					default: true,
					description: 'Show header and footer in the PDF',
				},
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'htmlAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['HtmlToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Markdown to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'mdInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the Markdown file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use Markdown file from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide Markdown content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to Markdown file',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to Markdown file',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'mdBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the Markdown file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
					mdInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 Markdown Content',
			name: 'mdBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded Markdown document content',
			placeholder: '# Sample Markdown\n\nThis is a **bold** text and *italic* text.\n\n- List item 1\n- List item 2',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
					mdInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'Markdown URL',
			name: 'mdUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the Markdown file to convert',
			placeholder: 'https://example.com/readme.md',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
					mdInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'mdFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the Markdown file to convert',
			placeholder: '/path/to/document.md',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
					mdInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'mdOutputFileName',
			type: 'string',
			default: 'markdown_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-markdown-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'mdDocName',
			type: 'string',
			default: 'sample.md',
			description: 'Name of the source Markdown file with extension',
			placeholder: 'original-file.md',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
				},
			},
		},
		{
			displayName: 'Markdown File Path',
			name: 'mdFilePath',
			type: 'string',
			default: '',
			description: 'Path to .md file inside ZIP (empty for single file)',
			placeholder: '',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'mdAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['MarkdownToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Visio to PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'visioInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the Visio file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use Visio file from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide Visio content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to Visio file',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to Visio file',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'visioBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the Visio file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 Visio Content',
			name: 'visioBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded Visio file content (.vsdx, .vsd, .vsdm)',
			placeholder: 'UEsDBBQAAAAIAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'Visio URL',
			name: 'visioUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the Visio file to convert',
			placeholder: 'https://example.com/diagram.vsdx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'visioFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the Visio file to convert',
			placeholder: '/path/to/diagram.vsdx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'visioOutputFileName',
			type: 'string',
			default: 'visio_to_pdf_output.pdf',
			description: 'Name for the output PDF file',
			placeholder: 'my-visio-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'visioDocName',
			type: 'string',
			default: 'output',
			description: 'Name for the output file',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
		},
		{
			displayName: 'Output Format',
			name: 'visioOutputFormat',
			type: 'options',
			default: 'PDF',
			description: 'Desired output format',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
			options: [
				{ name: 'PDF', value: 'PDF' },
				{ name: 'JPG', value: 'JPG' },
				{ name: 'PNG', value: 'PNG' },
				{ name: 'TIFF', value: 'TIFF' },
			],
		},
		{
			displayName: 'PDF Options',
			name: 'visioPdfOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioOutputFormat: ['PDF'],
				},
			},
			options: [
				{
					displayName: 'PDF Compliant',
					name: 'isPdfCompliant',
					type: 'boolean',
					default: true,
					description: 'Make PDF compliant with standards',
				},
			],
		},
		{
			displayName: 'Page Settings',
			name: 'visioPageSettings',
			type: 'collection',
			placeholder: 'Add Setting',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
			options: [
				{
					displayName: 'Page Index',
					name: 'pageIndex',
					type: 'number',
					default: 0,
					description: 'Start from page (0-indexed)',
					typeOptions: {
						minValue: 0,
						maxValue: 100,
					},
				},
				{
					displayName: 'Page Count',
					name: 'pageCount',
					type: 'number',
					default: 5,
					description: 'Number of pages to convert (1-100)',
					typeOptions: {
						minValue: 1,
						maxValue: 100,
					},
				},
				{
					displayName: 'Include Hidden Pages',
					name: 'includeHiddenPages',
					type: 'boolean',
					default: true,
					description: 'Include hidden pages',
				},
			],
		},
		{
			displayName: 'Display Options',
			name: 'visioDisplayOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
			options: [
				{
					displayName: 'Save Foreground Page',
					name: 'saveForegroundPage',
					type: 'boolean',
					default: true,
					description: 'Save foreground elements',
				},
				{
					displayName: 'Save Toolbar',
					name: 'saveToolBar',
					type: 'boolean',
					default: true,
					description: 'Include toolbar',
				},
				{
					displayName: 'Auto Fit',
					name: 'autoFit',
					type: 'boolean',
					default: true,
					description: 'Auto-fit content to page',
				},
			],
		},
		{
			displayName: 'Image Options',
			name: 'visioImageOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioOutputFormat: ['JPG', 'PNG', 'TIFF'],
				},
			},
			options: [
				{
					displayName: 'JPEG Quality',
					name: 'jpegQuality',
					type: 'number',
					default: 80,
					description: 'Image quality (0-100, higher = better quality)',
					typeOptions: {
						minValue: 0,
						maxValue: 100,
					},
					displayOptions: {
						show: {
							'/visioOutputFormat': ['JPG'],
						},
					},
				},
				{
					displayName: 'Image Brightness',
					name: 'imageBrightness',
					type: 'number',
					default: 1.0,
					description: 'Brightness adjustment (1.0 = normal)',
					typeOptions: {
						minValue: 0.1,
						maxValue: 3.0,
						numberStepSize: 0.1,
					},
				},
				{
					displayName: 'Image Contrast',
					name: 'imageContrast',
					type: 'number',
					default: 1.0,
					description: 'Contrast adjustment (1.0 = normal)',
					typeOptions: {
						minValue: 0.1,
						maxValue: 3.0,
						numberStepSize: 0.1,
					},
				},
				{
					displayName: 'Image Color Mode',
					name: 'imageColorMode',
					type: 'options',
					default: 'RGB',
					description: 'Color mode for the image',
					options: [
						{ name: 'RGB', value: 'RGB' },
						{ name: 'Grayscale', value: 'Grayscale' },
						{ name: 'RGBA', value: 'RGBA' },
					],
				},
				{
					displayName: 'Resolution',
					name: 'resolution',
					type: 'number',
					default: 300,
					description: 'DPI resolution (300 = high quality)',
					typeOptions: {
						minValue: 72,
						maxValue: 600,
					},
				},
				{
					displayName: 'Scale',
					name: 'scale',
					type: 'number',
					default: 1.0,
					description: 'Scaling factor (1.0 = original size)',
					typeOptions: {
						minValue: 0.1,
						maxValue: 5.0,
						numberStepSize: 0.1,
					},
				},
			],
		},
		{
			displayName: 'TIFF Options',
			name: 'visioTiffOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
					visioOutputFormat: ['TIFF'],
				},
			},
			options: [
				{
					displayName: 'TIFF Compression',
					name: 'tiffCompression',
					type: 'options',
					default: 'LZW',
					description: 'Compression method for TIFF',
					options: [
						{ name: 'LZW', value: 'LZW' },
						{ name: 'None', value: 'None' },
						{ name: 'CCITT4', value: 'CCITT4' },
					],
				},
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'visioAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['VisioToPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Word to PDF Form parameters
		{
			displayName: 'Input Data Type',
			name: 'wordFormInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the Word document to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
				},
			},
			options: [
				{
					name: 'Binary Data',
					value: 'binaryData',
					description: 'Use Word document from previous node',
				},
				{
					name: 'Base64 String',
					value: 'base64',
					description: 'Provide Word content as base64 encoded string',
				},
				{
					name: 'URL',
					value: 'url',
					description: 'Provide URL to Word document',
				},
				{
					name: 'File Path',
					value: 'filePath',
					description: 'Provide local file path to Word document',
				},
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'wordFormBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the Word document',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
					wordFormInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 Word Content',
			name: 'wordFormBase64Content',
			type: 'string',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			required: true,
			default: '',
			description: 'Base64 encoded Word document content (.docx, .doc)',
			placeholder: 'UEsDBBQAAAAIAA...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
					wordFormInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'Word URL',
			name: 'wordFormUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the Word document to convert',
			placeholder: 'https://example.com/document.docx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
					wordFormInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'wordFormFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the Word document to convert',
			placeholder: '/path/to/document.docx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
					wordFormInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'wordFormOutputFileName',
			type: 'string',
			default: 'word_to_pdf_form_output.pdf',
			description: 'Name for the output PDF form file',
			placeholder: 'my-word-form.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'wordFormDocName',
			type: 'string',
			default: 'output.pdf',
			description: 'Name for the output PDF file (used by API)',
			placeholder: 'output.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'wordFormAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['WordToPdfForm'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// URL to PDF parameters
		{
			displayName: 'Web URL',
			name: 'urlWebUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'Web URL of the page to be converted to PDF',
			placeholder: 'https://example.com',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
		},
		{
			displayName: 'File Name',
			name: 'urlDocName',
			type: 'string',
			default: 'converted_page.pdf',
			description: 'Output PDF file name with extension',
			placeholder: 'my-webpage.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
		},
		{
			displayName: 'Authentication Type',
			name: 'urlAuthType',
			type: 'options',
			default: 'NoAuth',
			description: 'Authentication type for the target website',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
			options: [
				{ name: 'No Authentication', value: 'NoAuth' },
				{ name: 'Basic Authentication', value: 'Basic' },
			],
		},
		{
			displayName: 'Username',
			name: 'urlUsername',
			type: 'string',
			default: '',
			description: 'Username if authentication is required',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
					urlAuthType: ['Basic'],
				},
			},
		},
		{
			displayName: 'Password',
			name: 'urlPassword',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password if authentication is required',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
					urlAuthType: ['Basic'],
				},
			},
		},
		{
			displayName: 'Page Layout',
			name: 'urlLayout',
			type: 'options',
			default: 'portrait',
			description: 'Page orientation for the PDF',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
			options: [
				{ name: 'Portrait', value: 'portrait' },
				{ name: 'Landscape', value: 'landscape' },
			],
		},
		{
			displayName: 'Page Format',
			name: 'urlFormat',
			type: 'options',
			default: 'A4',
			description: 'Page format for the PDF',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
			options: [
				{ name: 'A0', value: 'A0' },
				{ name: 'A1', value: 'A1' },
				{ name: 'A2', value: 'A2' },
				{ name: 'A3', value: 'A3' },
				{ name: 'A4', value: 'A4' },
				{ name: 'A5', value: 'A5' },
				{ name: 'A6', value: 'A6' },
				{ name: 'A7', value: 'A7' },
				{ name: 'A8', value: 'A8' },
				{ name: 'Executive', value: 'Executive' },
				{ name: 'Legal', value: 'Legal' },
				{ name: 'Statement', value: 'Statement' },
				{ name: 'Tabloid', value: 'Tabloid' },
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'urlAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertToPdf],
					conversionType: ['UrlToPdf'],
				},
			},
			options: [
				{
					displayName: 'Bottom Margin',
					name: 'bottomMargin',
					type: 'string',
					default: '20px',
					description: 'Bottom margin of PDF (e.g., 20px, 1cm, 0.5in)',
					placeholder: '20px',
				},
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
				{
					displayName: 'Display Header Footer',
					name: 'displayHeaderFooter',
					type: 'boolean',
					default: false,
					description: 'Whether to show header and footer in PDF',
				},
				{
					displayName: 'Left Margin',
					name: 'leftMargin',
					type: 'string',
					default: '20px',
					description: 'Left margin of PDF (e.g., 20px, 1cm, 0.5in)',
					placeholder: '20px',
				},
				{
					displayName: 'Print Background',
					name: 'printBackground',
					type: 'boolean',
					default: true,
					description: 'Whether to include background colors and images',
				},
				{
					displayName: 'Right Margin',
					name: 'rightMargin',
					type: 'string',
					default: '20px',
					description: 'Right margin of PDF (e.g., 20px, 1cm, 0.5in)',
					placeholder: '20px',
				},
				{
					displayName: 'Scale',
					name: 'scale',
					type: 'number',
					default: 1.0,
					description: 'Scale factor for the web page (e.g., 0.8 = 80%)',
					typeOptions: {
						minValue: 0.1,
						maxValue: 2.0,
						numberPrecision: 1,
					},
				},
				{
					displayName: 'Top Margin',
					name: 'topMargin',
					type: 'string',
					default: '20px',
					description: 'Top margin of PDF (e.g., 20px, 1cm, 0.5in)',
					placeholder: '20px',
				},
			],
		},
		// PDF to Word parameters
		{
			displayName: 'Input Data Type',
			name: 'pdfToWordInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'pdfToWordBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
					pdfToWordInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'pdfToWordBase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
					pdfToWordInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'pdfToWordUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to convert',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
					pdfToWordInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'pdfToWordFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to convert',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
					pdfToWordInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'pdfToWordOutputFileName',
			type: 'string',
			default: 'pdf_to_word_output.docx',
			description: 'Name for the output Word file',
			placeholder: 'my-pdf-converted.docx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'pdfToWordDocName',
			type: 'string',
			default: 'output.pdf',
			description: 'Name of the source PDF file for reference',
			placeholder: 'original-file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
		},
		{
			displayName: 'Quality Type',
			name: 'pdfToWordQualityType',
			type: 'options',
			required: true,
			default: 'Quality',
			description: 'Conversion quality setting',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
			options: [
				{ name: 'Draft', value: 'Draft', description: 'Faster conversion, good for simple PDFs with clear text' },
				{ name: 'Quality', value: 'Quality', description: 'Slower but more accurate, better for complex layouts' },
			],
		},
		{
			displayName: 'Language',
			name: 'pdfToWordLanguage',
			type: 'options',
			required: true,
			default: 'en',
			description: 'Language for OCR processing',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
			options: [
				{ name: 'English', value: 'en' },
				{ name: 'German', value: 'de' },
				{ name: 'French', value: 'fr' },
				{ name: 'Spanish', value: 'es' },
				{ name: 'Italian', value: 'it' },
				{ name: 'Portuguese', value: 'pt' },
				{ name: 'Dutch', value: 'nl' },
				{ name: 'Russian', value: 'ru' },
				{ name: 'Chinese', value: 'zh' },
				{ name: 'Japanese', value: 'ja' },
				{ name: 'Korean', value: 'ko' },
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'pdfToWordAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToWord'],
				},
			},
			options: [
				{
					displayName: 'Use Async Processing',
					name: 'useAsync',
					type: 'boolean',
					default: true,
					description: 'Whether to use asynchronous processing for better handling of large files',
				},
				{
					displayName: 'Merge All Sheets',
					name: 'mergeAllSheets',
					type: 'boolean',
					default: true,
					description: 'Whether to merge all PDF pages into a single document flow',
				},
				{
					displayName: 'Output Format',
					name: 'outputFormat',
					type: 'boolean',
					default: true,
					description: 'Whether to maintain original formatting in the output',
				},
				{
					displayName: 'OCR When Needed',
					name: 'ocrWhenNeeded',
					type: 'boolean',
					default: true,
					description: 'Whether to use OCR for scanned PDFs or PDFs with image-based text',
				},
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// PDF to Excel parameters
		{
			displayName: 'Input Data Type',
			name: 'pdfToExcelInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'pdfToExcelBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
					pdfToExcelInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'pdfToExcelBase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
					pdfToExcelInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'pdfToExcelUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to convert',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
					pdfToExcelInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'pdfToExcelFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to convert',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
					pdfToExcelInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'pdfToExcelOutputFileName',
			type: 'string',
			default: 'pdf_to_excel_output.xlsx',
			description: 'Name for the output Excel file',
			placeholder: 'my-pdf-converted.xlsx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'pdfToExcelDocName',
			type: 'string',
			default: 'output.pdf',
			description: 'Name of the source PDF file for reference',
			placeholder: 'original-file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'pdfToExcelAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToExcel'],
				},
			},
			options: [
				{
					displayName: 'Use Async Processing',
					name: 'useAsync',
					type: 'boolean',
					default: true,
					description: 'Whether to use asynchronous processing for better handling of large files',
				},
				{
					displayName: 'Merge All Sheets',
					name: 'mergeAllSheets',
					type: 'boolean',
					default: true,
					description: 'Whether to merge all PDF pages into a single document flow',
				},
				{
					displayName: 'Output Format',
					name: 'outputFormat',
					type: 'boolean',
					default: true,
					description: 'Whether to maintain original formatting in the output',
				},
				{
					displayName: 'OCR When Needed',
					name: 'ocrWhenNeeded',
					type: 'boolean',
					default: true,
					description: 'Whether to use OCR for scanned PDFs or PDFs with image-based text',
				},
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// PDF to PowerPoint parameters
		{
			displayName: 'Input Data Type',
			name: 'pdfToPowerpointInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'pdfToPowerpointBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
					pdfToPowerpointInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'pdfToPowerpointBase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
					pdfToPowerpointInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'pdfToPowerpointUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to convert',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
					pdfToPowerpointInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'pdfToPowerpointFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to convert',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
					pdfToPowerpointInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'pdfToPowerpointOutputFileName',
			type: 'string',
			default: 'pdf_to_powerpoint_output.pptx',
			description: 'Name for the output PowerPoint file',
			placeholder: 'my-pdf-converted.pptx',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'pdfToPowerpointDocName',
			type: 'string',
			default: 'output.pdf',
			description: 'Name of the source PDF file for reference',
			placeholder: 'original-file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'pdfToPowerpointAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.ConvertFromPdf],
					fromPdfConversionType: ['PdfToPowerpoint'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Create PDF/A parameters
		{
			displayName: 'Input Data Type',
			name: 'createPdfAInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to convert',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'createPdfABinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
					createPdfAInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'createPdfABase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
					createPdfAInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'createPdfAUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to convert',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
					createPdfAInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'createPdfAFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to convert',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
					createPdfAInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'createPdfAOutputFileName',
			type: 'string',
			default: 'pdf_to_pdfa_output.pdf',
			description: 'Name for the output PDF/A file',
			placeholder: 'my-pdfa-converted.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'createPdfADocName',
			type: 'string',
			default: 'output',
			description: 'Name for the output file',
			placeholder: 'output',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
				},
			},
		},
		{
			displayName: 'PDF/A Compliance Level',
			name: 'createPdfACompliance',
			type: 'options',
			default: 'PdfA1b',
			description: 'PDF/A compliance level for archival',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
				},
			},
			options: [
				{ name: 'PDF/A-1b (Basic)', value: 'PdfA1b', description: 'Level B basic conformance - Most common' },
				{ name: 'PDF/A-1a (Accessible)', value: 'PdfA1a', description: 'Level A accessible conformance' },
				{ name: 'PDF/A-2b (Part 2 Basic)', value: 'PdfA2b', description: 'Part 2 basic compliance' },
				{ name: 'PDF/A-2u (Part 2 Unicode)', value: 'PdfA2u', description: 'Part 2 with Unicode mapping' },
				{ name: 'PDF/A-2a (Part 2 Accessible)', value: 'PdfA2a', description: 'Part 2 accessible compliance' },
				{ name: 'PDF/A-3b (Part 3 Basic)', value: 'PdfA3b', description: 'Part 3 basic - allows file embedding' },
				{ name: 'PDF/A-3u (Part 3 Unicode)', value: 'PdfA3u', description: 'Part 3 with Unicode mapping' },
				{ name: 'PDF/A-3a (Part 3 Accessible)', value: 'PdfA3a', description: 'Part 3 accessible compliance' },
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'createPdfAAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['CreatePdfA'],
				},
			},
			options: [
				{
					displayName: 'Allow Upgrade',
					name: 'allowUpgrade',
					type: 'boolean',
					default: true,
					description: 'Allow upgrading to higher compliance level',
				},
				{
					displayName: 'Allow Downgrade',
					name: 'allowDowngrade',
					type: 'boolean',
					default: true,
					description: 'Allow downgrading to lower compliance level',
				},
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Flatten PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'flattenPdfInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to flatten',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'flattenPdfBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
					flattenPdfInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'flattenPdfBase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
					flattenPdfInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'flattenPdfUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to flatten',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
					flattenPdfInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'flattenPdfFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to flatten',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
					flattenPdfInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'flattenPdfOutputFileName',
			type: 'string',
			default: 'flattened_pdf_output.pdf',
			description: 'Name for the output flattened PDF file',
			placeholder: 'my-flattened-pdf.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'flattenPdfDocName',
			type: 'string',
			default: 'Flatten_output.pdf',
			description: 'Name for the output file',
			placeholder: 'Flatten_output.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
				},
			},
		},
		{
			displayName: 'Advanced Options',
			name: 'flattenPdfAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['FlattenPdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
		// Linearize PDF parameters
		{
			displayName: 'Input Data Type',
			name: 'linearizePdfInputDataType',
			type: 'options',
			required: true,
			default: 'binaryData',
			description: 'Choose how to provide the PDF file to linearize',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
				},
			},
			options: [
				{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
				{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
				{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
				{ name: 'File Path', value: 'filePath', description: 'Provide local file path to PDF file' },
			],
		},
		{
			displayName: 'Input Binary Field',
			name: 'linearizePdfBinaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			description: 'Name of the binary property that contains the PDF file',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
					linearizePdfInputDataType: ['binaryData'],
				},
			},
		},
		{
			displayName: 'Base64 PDF Content',
			name: 'linearizePdfBase64Content',
			type: 'string',
			typeOptions: { alwaysOpenEditWindow: true },
			required: true,
			default: '',
			description: 'Base64 encoded PDF document content',
			placeholder: 'JVBERi0xLjQKJ...',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
					linearizePdfInputDataType: ['base64'],
				},
			},
		},
		{
			displayName: 'PDF URL',
			name: 'linearizePdfUrl',
			type: 'string',
			required: true,
			default: '',
			description: 'URL to the PDF file to linearize',
			placeholder: 'https://example.com/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
					linearizePdfInputDataType: ['url'],
				},
			},
		},
		{
			displayName: 'Local File Path',
			name: 'linearizePdfFilePath',
			type: 'string',
			required: true,
			default: '',
			description: 'Local file path to the PDF file to linearize',
			placeholder: '/path/to/file.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
					linearizePdfInputDataType: ['filePath'],
				},
			},
		},
		{
			displayName: 'Output File Name',
			name: 'linearizePdfOutputFileName',
			type: 'string',
			default: 'linearized_pdf_output.pdf',
			description: 'Name for the output linearized PDF file',
			placeholder: 'my-linearized-pdf.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
				},
			},
		},
		{
			displayName: 'Document Name',
			name: 'linearizePdfDocName',
			type: 'string',
			default: 'output.pdf',
			description: 'Name for the output file',
			placeholder: 'output.pdf',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
				},
			},
		},
		{
			displayName: 'Optimization Profile',
			name: 'linearizePdfOptimizeProfile',
			type: 'options',
			default: 'web',
			description: 'Optimization profile for web viewing',
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
				},
			},
			options: [
				{ name: 'Web', value: 'web', description: 'Optimized for web viewing (fast loading)' },
				{ name: 'Max', value: 'Max', description: 'Maximum compression (smallest file size)' },
				{ name: 'Print', value: 'Print', description: 'Optimized for printing' },
				{ name: 'Default', value: 'Default', description: 'Standard optimization balance' },
				{ name: 'WebMax', value: 'WebMax', description: 'Maximum web optimization' },
				{ name: 'PrintMax', value: 'PrintMax', description: 'Maximum print optimization' },
				{ name: 'PrintGray', value: 'PrintGray', description: 'Print optimized with grayscale' },
				{ name: 'Compress', value: 'Compress', description: 'General compression' },
				{ name: 'CompressMax', value: 'CompressMax', description: 'Maximum compression' },
			],
		},
		{
			displayName: 'Advanced Options',
			name: 'linearizePdfAdvancedOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: {
				show: {
					operation: [ActionConstants.OptimizePdf],
					optimizePdfType: ['LinearizePdf'],
				},
			},
			options: [
				{
					displayName: 'Custom Profiles',
					name: 'profiles',
					type: 'string',
					default: '',
					description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
					placeholder: `{ 'outputDataFormat': 'base64' }`,
				},
			],
		},
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
