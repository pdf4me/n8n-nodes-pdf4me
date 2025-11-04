/* eslint-disable n8n-nodes-base/node-filename-against-convention, n8n-nodes-base/node-param-default-missing */
import { INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
import * as addBarcodeToPdf from './actions/addBarcodeToPdf';
import * as addFormFieldsToPdf from './actions/addFormFieldsToPdf';
import * as fillPdfForm from './actions/fillPdfForm';
import * as addHtmlHeaderFooter from './actions/addHtmlHeaderFooter';
import * as addImageStampToPdf from './actions/addImageStampToPdf';
import * as addMarginToPdf from './actions/addMarginToPdf';
import * as addPageNumberToPdf from './actions/addPageNumberToPdf';
import * as addTextStampToPdf from './actions/addTextStampToPdf';
import * as addImageWatermarkToImage from './actions/addImageWatermarkToImage';
import * as addTextWatermarkToImage from './actions/addTextWatermarkToImage';
import * as aiInvoiceParser from './actions/aiInvoiceParser';
import * as aiProcessHealthCard from './actions/aiProcessHealthCard';
import * as aiProcessContract from './actions/aiProcessContract';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as cropImage from './actions/cropImage';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
import * as jsonToExcel from './actions/jsonToExcel';
import * as mergeMultiplePDFs from './actions/MergeMultiplePDFs';
import * as overlayPDFs from './actions/OverlayPDFs';
import * as convertPdfToWord from './actions/convertPdfToWord';
import * as convertToPdf from './actions/convertToPdf';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as signPdf from './actions/signPdf';
import * as urlToPdf from './actions/urlToPdf';
import * as compressImage from './actions/compressImage';
import * as convertImageFormat from './actions/convertImageFormat';
import * as createImagesFromPdf from './actions/createImagesFromPdf';
import * as flipImage from './actions/flipImage';
import * as getImageMetadata from './actions/getImageMetadata';
import * as imageExtractText from './actions/imageExtractText';
import * as removeExifTagsFromImage from './actions/removeExifTagsFromImage';
import * as replaceTextWithImage from './actions/replaceTextWithImage';
import * as resizeImage from './actions/resizeImage';
import * as rotateImage from './actions/rotateImage';
import * as rotateImageByExifData from './actions/rotateImageByExifData';
import * as compressPdf from './actions/compressPdf';
import * as getPdfMetadata from './actions/getPdfMetadata';
import * as repairPdfDocument from './actions/repairPdfDocument';
import * as get_document_from_pdf4me from './actions/GetDocumentFromPdf4me';
import * as update_hyperlinks_annotation from './actions/update_hyperlinks_annotation';
import * as protect_document from './actions/protect_document';
import * as unlock_pdf from './actions/unlock_pdf';
import * as disabletracking_changes_in_word from './actions/disabletracking_changes_in_word';
import * as enableTrackingChangesInWord from './actions/enableTrackingChangesInWord';
import * as readBarcodeFromImage from './actions/readBarcodeFromImage';
import * as classifyDocument from './actions/classifyDocument';
import * as extractFormDataFromPdf from './actions/extractFormDataFromPdf';
import * as extractPagesFromPdf from './actions/extractPagesFromPdf';
import * as extractAttachmentFromPdf from './actions/extractAttachmentFromPdf';
import * as extractTextByExpression from './actions/extractTextByExpression';
import * as extractTableFromPdf from './actions/extractTableFromPdf';
import * as extractResources from './actions/extractResources';
import * as extractTextFromWord from './actions/extractTextFromWord';
import * as findAndReplaceText from './actions/findAndReplaceText';
import * as convertPdfToEditableOcr from './actions/convertPdfToEditableOcr';
import * as createSwissQrBill from './actions/createSwissQrBill';
import * as replaceTextWithImageInWord from './actions/replaceTextWithImageInWord';
import * as generateDocumentSingle from './actions/GenerateDocumentSingle';
import * as generateDocumentsMultiple from './actions/GenerateDocumentsMultiple';
import * as getTrackingChangesInWord from './actions/GetTrackingChangesInWord';
import * as SplitPdfByBarcode from './actions/SplitPdfByBarcode';
import * as SplitPdfBySwissQR from './actions/SplitPdfBySwissQR';
import * as SplitPdfByText from './actions/SplitPdfByText';
import * as SplitPdfRegular from './actions/SplitPdfRegular';
import * as readBarcodeFromPdf from './actions/readBarcodeFromPdf';
import * as readSwissQrCode from './actions/readSwissQrCode';
import * as createPdfA from './actions/createPdfA';
import * as convertHtmlToPdf from './actions/convertHtmlToPdf';
import * as convertMarkdownToPdf from './actions/convertMarkdownToPdf';
import * as convertPdfToPowerpoint from './actions/convertPdfToPowerpoint';
import * as convertPdfToExcel from './actions/convertPdfToExcel';
import * as convertVisio from './actions/convertVisio';
import * as convertWordToPdfForm from './actions/convertWordToPdfForm';
import * as uploadFile from './actions/uploadFile';
import * as parseDocument from './actions/parseDocument';
import * as linearizePdf from './actions/linearizePdf';
import * as flattenPdf from './actions/flattenPdf';
import { ActionConstants } from './GenericFunctions';

export const descriptions: INodeTypeDescription = {
	displayName: 'PDF4me',
	name: 'PDF4me',
	description: 'Comprehensive PDF and document processing: generate barcodes, convert files, extract data, manipulate images, and automate workflows with the PDF4ME API',
	defaults: {
		name: 'PDF4me',
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
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'AI',
					value: 'ai',
					description: 'AI-powered document processing and classification',
				},
				{
					name: 'Barcode',
					value: 'barcode',
					description: 'Generate QR codes and barcodes for use in documents',
				},
				{
					name: 'Convert',
					value: 'convert',
					description: 'Convert various document formats to and from PDF',
				},
				{
					name: 'Edit',
					value: 'edit',
					description: 'Edit PDF documents: add attachments, headers, footers, stamps, and signatures',
				},
				{
					name: 'Extract',
					value: 'extract',
					description: 'Extract data, text, tables, and attachments from documents',
				},
				{
					name: 'Find Search',
					value: 'findSearch',
					description: 'Find and replace text, convert PDF to editable format using OCR',
				},
				{
					name: 'Forms',
					value: 'forms',
					description: 'Create, fill, and manage PDF forms',
				},
				{
					name: 'Generate',
					value: 'generate',
					description: 'Generate PDFs from templates with data, manage Word documents',
				},
				{
					name: 'Image',
					value: 'image',
					description: 'Process and manipulate images: resize, crop, rotate, compress, and extract text',
				},
				{
					name: 'Merge & Split',
					value: 'mergeSplit',
					description: 'Merge multiple PDFs or split PDFs by various criteria',
				},
				{
					name: 'Optimize Compress',
					value: 'optimizeCompress',
					description: 'Compress and optimize PDF files',
				},
				{
					name: 'Organize',
					value: 'organize',
					description: 'Organize PDF pages: delete, extract, and rotate pages',
				},
				{
					name: 'PDF4me',
					value: 'pdf4me',
					description: 'PDF4me-specific operations: get documents and update hyperlinks',
				},
				{
					name: 'PDF',
					value: 'pdf',
					description: 'Get PDF metadata and repair PDF documents',
				},
				{
					name: 'Security',
					value: 'security',
					description: 'Protect and unlock PDF documents',
				},
				{
					name: 'Word',
					value: 'word',
					description: 'Manage Word document tracking changes',
				},
			],
			default: 'ai',
			description: 'Choose the type of PDF operation: generate documents, convert formats, process PDFs, extract data, or manage images',
		},

		// AI Operations
		{
			displayName: 'AI Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['ai'],
				},
			},
			options: [
				{
					name: 'AI-Invoice Parser',
					value: ActionConstants.AiInvoiceParser,
					description: 'Extract structured data from invoices using AI/ML technology for automated data entry',
					action: 'AI-Invoice Parser',
				},
				{
					name: 'AI-Process Contract',
					value: ActionConstants.AiProcessContract,
					description: 'Extract structured data from contracts using AI/ML technology for legal document analysis',
					action: 'AI-Process Contract',
				},
				{
					name: 'AI-Process HealthCard',
					value: ActionConstants.AiProcessHealthCard,
					description: 'Extract structured data from health cards using AI/ML technology for member management',
					action: 'AI-Process HealthCard',
				},
			],
			default: ActionConstants.AiInvoiceParser,
		},

		// Barcode Operations
		{
			displayName: 'Barcode Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['barcode'],
				},
			},
			options: [
				{
					name: 'Add Barcode to PDF',
					value: ActionConstants.AddBarcodeToPdf,
					description: 'Add barcodes to existing PDF documents with positioning and styling options',
					action: 'Add barcode to PDF',
				},
				{
					name: 'Create Barcode',
					value: ActionConstants.BarcodeGenerator,
					description: 'Generate various types of barcodes including QR codes, Code 128, Code 39, and more',
					action: 'Create barcode',
				},
				{
					name: 'Read SwissQR Code',
					value: ActionConstants.ReadSwissQrCode,
					description: 'Read Swiss QR code data from PDF documents',
					action: 'Read SwissQR code',
				},
				{
					name: 'Create SwissQR Bill',
					value: ActionConstants.CreateSwissQrBill,
					description: 'Create Swiss QR Bills using all compliance standards for digital payment transactions',
					action: 'Create SwissQR bill',
				},
				{
					name: 'Read Barcode from PDF',
					value: ActionConstants.ReadBarcodeFromPdf,
					description: 'Read single or multiple Barcodes or QR Codes from your PDF file',
					action: 'Read barcode from PDF',
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},

		// Convert Operations
		{
			displayName: 'Convert Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['convert'],
				},
			},
			options: [
				{
					name: 'Convert JSON To Excel',
					value: ActionConstants.JsonToExcel,
					description: 'Convert JSON data to Excel format',
					action: 'Convert JSON to Excel',
				},
				{
					name: 'Convert to PDF',
					value: ActionConstants.ConvertToPdf,
					description: 'Convert various document formats to PDF',
					action: 'Convert to PDF',
				},
				{
					name: 'Convert VISIO',
					value: ActionConstants.ConvertVisio,
					description: 'Convert VISIO files (.vsdx, .vsd) to PDF format with advanced conversion options',
					action: 'Convert VISIO',
				},
				{
					name: 'Convert Word to PDF Form',
					value: ActionConstants.ConvertWordToPdfForm,
					description: 'Convert Word documents to PDF forms',
					action: 'Convert Word to PDF Form',
				},
				{
					name: 'Create PDF/A',
					value: ActionConstants.CreatePdfA,
					description: 'Convert PDF to PDF/A for long-term archiving and compliance',
					action: 'Create PDF/A',
				},
				{
					name: 'Flatten PDF',
					value: ActionConstants.FlattenPdf,
					description: 'Convert interactive PDF elements into static, non-editable content',
					action: 'Flatten PDF',
				},
				{
					name: 'Convert Html to PDF',
					value: ActionConstants.ConvertHtmlToPdf,
					description: 'Convert HTML files to PDF documents',
					action: 'Convert Html to PDF',
				},
				{
					name: 'Linearize PDF',
					value: ActionConstants.LinearizePdf,
					description: 'Optimize PDFs for web viewing with faster loading and progressive display',
					action: 'Linearize PDF',
				},
				{
					name: 'Convert Markdown To PDF',
					value: ActionConstants.ConvertMarkdownToPdf,
					description: 'Convert Markdown files to PDF documents',
					action: 'Convert Markdown To PDF',
				},
				{
					name: 'Convert PDF to Excel',
					value: ActionConstants.ConvertPdfToExcel,
					description: 'Convert PDF documents to Excel spreadsheets',
					action: 'Convert PDF to Excel',
				},
				{
					name: 'Convert PDF to PowerPoint',
					value: ActionConstants.ConvertPdfToPowerpoint,
					description: 'Convert PDF documents to PowerPoint format with OCR support',
					action: 'Convert PDF to PowerPoint',
				},
				{
					name: 'Convert PDF to Word',
					value: ActionConstants.ConvertPdfToWord,
					description: 'Convert PDF documents to Word format with OCR support',
					action: 'Convert PDF to Word',
				},
				{
					name: 'Convert Url to PDF',
					value: ActionConstants.UrlToPdf,
					description: 'Convert web pages to PDF while preserving layout, styling, and content',
					action: 'Convert Url to PDF',
				},
			],
			default: ActionConstants.ConvertToPdf,
		},

		// Edit Operations
		{
			displayName: 'Edit Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['edit'],
				},
			},
			options: [
				{
					name: 'Add Attachment To PDF',
					value: ActionConstants.AddAttachmentToPdf,
					description: 'Add file attachments to PDF documents',
					action: 'Add attachment to PDF',
				},
				{
					name: 'Add HTML Header Footer to PDF',
					value: ActionConstants.AddHtmlHeaderFooter,
					description: 'Add HTML-based headers and footers to PDF documents',
					action: 'Add HTML header footer to PDF',
				},
				{
					name: 'Add Margin to PDF',
					value: ActionConstants.AddMarginToPdf,
					description: 'Add margins to PDF documents',
					action: 'Add margin to PDF',
				},
				{
					name: 'Add Page Number to PDF',
					value: ActionConstants.AddPageNumberToPdf,
					description: 'Add page numbers to PDF documents',
					action: 'Add page number to PDF',
				},
				{
					name: 'Add Image Stamp To PDF',
					value: ActionConstants.AddImageStampToPdf,
					description: 'Add image stamps or watermarks to PDF documents',
					action: 'Add image stamp to PDF',
				},
				{
					name: 'Sign PDF',
					value: ActionConstants.SignPdf,
					description: 'Digitally sign PDF documents',
					action: 'Sign PDF',
				},
				{
					name: 'Add Text Stamp To PDF',
					value: ActionConstants.AddTextStampToPdf,
					description: 'Add text stamps or watermarks to PDF documents',
					action: 'Add text stamp to PDF',
				},
			],
			default: ActionConstants.AddAttachmentToPdf,
		},

		// Extract Operations
		{
			displayName: 'Extract Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['extract'],
				},
			},
			options: [
				{
					name: 'Classify Document',
					value: ActionConstants.ClassifyDocument,
					description: 'Classify documents using AI to determine document type and extract relevant information',
					action: 'Classify document',
				},
				{
					name: 'Extract Attachment From PDF',
					value: ActionConstants.ExtractAttachmentFromPdf,
					description: 'Extract file attachments from PDF documents',
					action: 'Extract attachment from PDF',
				},
				{
					name: 'Extract Form Data From PDF',
					value: ActionConstants.ExtractFormDataFromPdf,
					description: 'Extract form field data from PDF documents',
					action: 'Extract form data from PDF',
				},
				{
					name: 'Extract Resources',
					value: ActionConstants.ExtractResources,
					description: 'Extract text and images from PDF documents',
					action: 'Extract resources',
				},
				{
					name: 'Extract Table From PDF',
					value: ActionConstants.ExtractTableFromPdf,
					description: 'Extract tables from PDF documents',
					action: 'Extract table from PDF',
				},
				{
					name: 'Extract Text by Expression',
					value: ActionConstants.ExtractTextByExpression,
					description: 'Extract text from PDF using regular expressions',
					action: 'Extract text by expression',
				},
				{
					name: 'Extract Text from word',
					value: ActionConstants.ExtractTextFromWord,
					description: 'Extract text content from Word documents',
					action: 'Extract text from word',
				},
				{
					name: 'Parse Document',
					value: ActionConstants.ParseDocument,
					description: 'Parse documents to extract structured data using template-based parsing',
					action: 'Parse document',
				},
			],
			default: ActionConstants.ExtractResources,
		},

		// Find Search Operations
		{
			displayName: 'Find Search Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['findSearch'],
				},
			},
			options: [
				{
					name: 'Find and Replace Text',
					value: ActionConstants.FindAndReplaceText,
					description: 'Find and replace text in PDF documents',
					action: 'Find and replace text',
				},
				{
					name: 'Convert PDF to editable PDF using OCR',
					value: ActionConstants.ConvertPdfToEditableOcr,
					description: 'Convert PDF to editable PDF using OCR for scanned documents',
					action: 'Convert PDF to editable PDF using OCR',
				},
			],
			default: ActionConstants.FindAndReplaceText,
		},

		// Forms Operations
		{
			displayName: 'Forms Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['forms'],
				},
			},
			options: [
				{
					name: 'Add Form Fields To PDF',
					value: ActionConstants.AddFormFieldsToPdf,
					description: 'Add interactive form fields to PDF documents',
					action: 'Add form fields to PDF',
				},
				{
					name: 'Fill a PDF Form',
					value: ActionConstants.FillPdfForm,
					description: 'Fill PDF forms with data or generate multiple documents from templates',
					action: 'Fill a PDF form',
				},
			],
			default: ActionConstants.FillPdfForm,
		},

		// Generate Operations
		{
			displayName: 'Generate Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['generate'],
				},
			},
			options: [
				{
					name: 'Enable Tracking changes in word',
					value: ActionConstants.EnableTrackingChangesInWord,
					description: 'Enable tracking changes in Word documents',
					action: 'Enable tracking changes in word',
				},
				{
					name: 'Generate Document (Single)',
					value: ActionConstants.GenerateDocumentSingle,
					description: 'Generate a single document from template with data',
					action: 'Generate document (single)',
				},
				{
					name: 'Generate Documents (Multiple)',
					value: ActionConstants.GenerateDocumentsMultiple,
					description: 'Generate multiple documents from template with different data sets',
					action: 'Generate documents (multiple)',
				},
				{
					name: 'Get Tracking Changes In Word',
					value: ActionConstants.GetTrackingChangesInWord,
					description: 'Get tracking changes information from Word documents',
					action: 'Get tracking changes in word',
				},
				{
					name: 'Replace Text With Image In Word',
					value: ActionConstants.ReplaceTextWithImageInWord,
					description: 'Replace specific text in Word documents with images',
					action: 'Replace text with image in word',
				},
			],
			default: ActionConstants.GenerateDocumentSingle,
		},

		// Image Operations
		{
			displayName: 'Image Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['image'],
				},
			},
			options: [
				{
					name: 'Add Image watermark To Image',
					value: ActionConstants.AddImageWatermarkToImage,
					description: 'Add image watermark to image documents',
					action: 'Add image watermark to image',
				},
				{
					name: 'Add Text watermark To Image',
					value: ActionConstants.AddTextWatermarkToImage,
					description: 'Add text watermarks to images with positioning and styling options',
					action: 'Add text watermark to image',
				},
				{
					name: 'Compress Image',
					value: ActionConstants.CompressImage,
					description: 'Compress image documents',
					action: 'Compress image',
				},
				{
					name: 'Convert Image Format',
					value: ActionConstants.ConvertImageFormat,
					description: 'Convert image format (BMP, GIF, JPG, PNG, TIFF)',
					action: 'Convert image format',
				},
				{
					name: 'Create Image from PDF',
					value: ActionConstants.CreateImagesFromPdf,
					description: 'Create images from PDF pages',
					action: 'Create image from PDF',
				},
				{
					name: 'Crop Image',
					value: ActionConstants.CropImage,
					description: 'Crop images with border or rectangle cropping options',
					action: 'Crop image',
				},
				{
					name: 'Flip Image',
					value: ActionConstants.FlipImage,
					description: 'Flip image documents horizontally, vertically, or both',
					action: 'Flip image',
				},
				{
					name: 'Get Image Metadata',
					value: ActionConstants.GetImageMetadata,
					description: 'Extract metadata information from images including EXIF data and properties',
					action: 'Get image metadata',
				},
				{
					name: 'Image Extract Text',
					value: ActionConstants.ImageExtractText,
					description: 'Extract text content from images using OCR (Optical Character Recognition)',
					action: 'Image extract text',
				},
				{
					name: 'Replace Text with Image',
					value: ActionConstants.ReplaceTextWithImage,
					description: 'Replace specific text in PDF documents with images',
					action: 'Replace text with image',
				},
				{
					name: 'Resize Image',
					value: ActionConstants.ResizeImage,
					description: 'Resize images by percentage or specific dimensions with aspect ratio control',
					action: 'Resize image',
				},
				{
					name: 'Rotate Image By Exif Data',
					value: ActionConstants.RotateImageByExifData,
					description: 'Rotate image automatically based on EXIF orientation metadata',
					action: 'Rotate image by exif data',
				},
				{
					name: 'Rotate Image',
					value: ActionConstants.RotateImage,
					description: 'Rotate images with custom angle, background color, and proportionate resize options',
					action: 'Rotate image',
				},
				{
					name: 'Read Barcode From Image',
					value: ActionConstants.ReadBarcodeFromImage,
					description: 'Read barcodes from images using OCR',
					action: 'Read barcode from image',
				},
				{
					name: 'Remove EXIF Tags From Image',
					value: ActionConstants.RemoveExifTagsFromImage,
					description: 'Remove metadata/EXIF tags from images for privacy and file size reduction',
					action: 'Remove EXIF tags from image',
				},
			],
			default: ActionConstants.CompressImage,
		},

		// Merge & Split Operations
		{
			displayName: 'Merge & Split Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['mergeSplit'],
				},
			},
			options: [
				{
					name: 'Merge Multiple PDF files into Single PDF',
					value: ActionConstants.MergeMultiplePDFs,
					description: 'Combine multiple PDF files into a single PDF document',
					action: 'Merge multiple PDF files into single PDF',
				},
				{
					name: 'Merge two PDF files one over another as Overlay',
					value: ActionConstants.OverlayPDFs,
					description: 'Merge two PDF files one over another as overlay',
					action: 'Merge two PDF files one over another as overlay',
				},
				{
					name: 'Split PDF',
					value: ActionConstants.SplitPdfRegular,
					description: 'Split PDF documents by regular expression and output as ZIP',
					action: 'Split PDF',
				},
				{
					name: 'Split PDF by Barcode',
					value: ActionConstants.SplitPdfByBarcode,
					description: 'Split PDF documents by barcode and output as ZIP',
					action: 'Split PDF by barcode',
				},
				{
					name: 'Split PDF by Swiss QR',
					value: ActionConstants.SplitPdfBySwissQR,
					description: 'Split PDF documents by Swiss QR code and output as ZIP',
					action: 'Split PDF by Swiss QR',
				},
				{
					name: 'Split PDF by Text',
					value: ActionConstants.SplitPdfByText,
					description: 'Split PDF documents by text and output as ZIP',
					action: 'Split PDF by text',
				},
			],
			default: ActionConstants.MergeMultiplePDFs,
		},

		// Optimize Compress Operations
		{
			displayName: 'Optimize Compress Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['optimizeCompress'],
				},
			},
			options: [
				{
					name: 'Compress PDF',
					value: ActionConstants.CompressPdf,
					description: 'Compress and optimize PDF files',
					action: 'Compress PDF',
				},
			],
			default: ActionConstants.CompressPdf,
		},

		// Organize Operations
		{
			displayName: 'Organize Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['organize'],
				},
			},
			options: [
				{
					name: 'Delete Blank Pages from PDF',
					value: ActionConstants.DeleteBlankPagesFromPdf,
					description: 'Remove blank pages from PDF documents based on specified criteria',
					action: 'Delete blank pages from PDF',
				},
				{
					name: 'Delete unwanted Pages from PDF',
					value: ActionConstants.DeleteUnwantedPagesFromPdf,
					description: 'Remove specific pages from PDF documents by page numbers',
					action: 'Delete unwanted pages from PDF',
				},
				{
					name: 'Extract Pages',
					value: ActionConstants.ExtractPagesFromPdf,
					description: 'Extract specific pages from PDF documents',
					action: 'Extract pages',
				},
				{
					name: 'Rotate Page',
					value: ActionConstants.RotatePage,
					description: 'Rotate specific pages in PDF documents by 90, 180, or 270 degrees',
					action: 'Rotate page',
				},
				{
					name: 'Rotate Document',
					value: ActionConstants.RotateDocument,
					description: 'Rotate entire PDF documents by 90, 180, or 270 degrees',
					action: 'Rotate document',
				},
			],
			default: ActionConstants.DeleteBlankPagesFromPdf,
		},

		// PDF4me Operations
		{
			displayName: 'PDF4me Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['pdf4me'],
				},
			},
			options: [
				{
					name: 'Get Document from PDF4me',
					value: ActionConstants.GetDocumentFromPdf4me,
					description: 'Retrieve a document from PDF4me storage',
					action: 'Get document from PDF4me',
				},
				{
					name: 'Update Hyperlinks Annotation',
					value: ActionConstants.UpdateHyperlinksAnnotation,
					description: 'Update hyperlinks in PDF documents',
					action: 'Update hyperlinks annotation',
				},
			],
			default: ActionConstants.GetDocumentFromPdf4me,
		},

		// PDF Operations
		{
			displayName: 'PDF Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['pdf'],
				},
			},
			options: [
				{
					name: 'Get PDF Information',
					value: ActionConstants.GetPdfMetadata,
					description: 'Extract metadata and information from PDF files',
					action: 'Get PDF information',
				},
				{
					name: 'Get PDF Metadata',
					value: ActionConstants.GetPdfMetadata,
					description: 'Extract metadata from PDF files',
					action: 'Get PDF metadata',
				},
				{
					name: 'Repair PDF Document',
					value: ActionConstants.RepairPdfDocument,
					description: 'Repair corrupted or damaged PDF files',
					action: 'Repair PDF document',
				},
			],
			default: ActionConstants.GetPdfMetadata,
		},

		// Security Operations
		{
			displayName: 'Security Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['security'],
				},
			},
			options: [
				{
					name: 'Protect Document',
					value: ActionConstants.ProtectDocument,
					description: 'Protect PDF documents with encryption, passwords, and permissions',
					action: 'Protect document',
				},
				{
					name: 'Unlock PDF',
					value: ActionConstants.UnlockPdf,
					description: 'Unlock PDF documents by removing encryption',
					action: 'Unlock PDF',
				},
			],
			default: ActionConstants.ProtectDocument,
		},

		// Word Operations
		{
			displayName: 'Word Operations',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: {
				show: {
					resource: ['word'],
				},
			},
			options: [
				{
					name: 'Disable Tracking changes In Word',
					value: ActionConstants.DisableTrackingChangesInWord,
					description: 'Disable tracking changes in Word documents',
					action: 'Disable tracking changes in word',
				},
			],
			default: ActionConstants.DisableTrackingChangesInWord,
		},

		// Spread all action descriptions
		...addAttachmentToPdf.description,
		...addBarcodeToPdf.description,
		...addFormFieldsToPdf.description,
		...addHtmlHeaderFooter.description,
		...addImageStampToPdf.description,
		...addImageWatermarkToImage.description,
		...addMarginToPdf.description,
		...addPageNumberToPdf.description,
		...addTextStampToPdf.description,
		...addTextWatermarkToImage.description,
		...aiInvoiceParser.description,
		...aiProcessContract.description,
		...aiProcessHealthCard.description,
		...classifyDocument.description,
		...compressImage.description,
		...compressPdf.description,
		...convertHtmlToPdf.description,
		...convertImageFormat.description,
		...jsonToExcel.description,
		...convertMarkdownToPdf.description,
		...convertPdfToEditableOcr.description,
		...convertPdfToExcel.description,
		...convertPdfToPowerpoint.description,
		...convertPdfToWord.description,
		...convertToPdf.description,
		...urlToPdf.description,
		...convertVisio.description,
		...convertWordToPdfForm.description,
		...createImagesFromPdf.description,
		...createPdfA.description,
		...createSwissQrBill.description,
		...cropImage.description,
		...deleteBlankPagesFromPdf.description,
		...deleteUnwantedPagesFromPdf.description,
		...disabletracking_changes_in_word.description,
		...enableTrackingChangesInWord.description,
		...extractAttachmentFromPdf.description,
		...extractFormDataFromPdf.description,
		...extractPagesFromPdf.description,
		...extractResources.description,
		...extractTableFromPdf.description,
		...extractTextByExpression.description,
		...extractTextFromWord.description,
		...fillPdfForm.description,
		...findAndReplaceText.description,
		...flipImage.description,
		...flattenPdf.description,
		...barcodeGenerator.description,
		...generateDocumentSingle.description,
		...generateDocumentsMultiple.description,
		...get_document_from_pdf4me.description,
		...getImageMetadata.description,
		...getPdfMetadata.description,
		...getTrackingChangesInWord.description,
		...imageExtractText.description,
		...linearizePdf.description,
		...mergeMultiplePDFs.description,
		...overlayPDFs.description,
		...parseDocument.description,
		...protect_document.description,
		...readBarcodeFromImage.description,
		...readBarcodeFromPdf.description,
		...readSwissQrCode.description,
		...removeExifTagsFromImage.description,
		...repairPdfDocument.description,
		...replaceTextWithImage.description,
		...replaceTextWithImageInWord.description,
		...resizeImage.description,
		...rotateDocument.description,
		...rotateImage.description,
		...rotateImageByExifData.description,
		...rotatePage.description,
		...signPdf.description,
		...SplitPdfByBarcode.description,
		...SplitPdfBySwissQR.description,
		...SplitPdfByText.description,
		...SplitPdfRegular.description,
		...unlock_pdf.description,
		...update_hyperlinks_annotation.description,
		...uploadFile.description,
	],
	subtitle: '={{$parameter["resource"]}} / {{$parameter["operation"]}}',
	version: 1,
};
