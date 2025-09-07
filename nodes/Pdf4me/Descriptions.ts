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
			displayName: 'Action',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				// Barcode
				{
					name: 'Add Barcode To PDF',
					description: 'Add barcodes to existing PDF documents with positioning and styling options',
					value: ActionConstants.AddBarcodeToPdf,
					action: ActionConstants.AddBarcodeToPdf,
				},
				{
					name: 'Generate Barcode',
					description: 'Generate various types of barcodes including QR codes, Code 128, Code 39, and more',
					value: ActionConstants.BarcodeGenerator,
					action: ActionConstants.BarcodeGenerator,
				},
				{
					name: 'Read SwissQR Code',
					description: 'Read Swiss QR code data from PDF documents',
					value: ActionConstants.ReadSwissQrCode,
					action: ActionConstants.ReadSwissQrCode,
				},
				{
					name: 'Read Barcode From PDF',
					description: 'Read single or multiple Barcodes or QR Codes from your PDF file',
					value: ActionConstants.ReadBarcodeFromPdf,
					action: ActionConstants.ReadBarcodeFromPdf,
				},
				{
					name: 'Read Barcode From Image',
					description: 'Read barcodes from images using OCR',
					value: ActionConstants.ReadBarcodeFromImage,
					action: ActionConstants.ReadBarcodeFromImage,
				},
				// Convert
				{
					name: 'Convert JSON To Excel',
					description: 'Convert JSON data to Excel format',
					value: ActionConstants.JsonToExcel,
					action: ActionConstants.JsonToExcel,
				},
				{
					name: 'Convert To PDF',
					description: 'Convert various document formats to PDF',
					value: ActionConstants.ConvertToPdf,
					action: ActionConstants.ConvertToPdf,
				},
				{
					name: 'Convert VISIO',
					description: 'Convert VISIO files (.vsdx, .vsd) to PDF format with advanced conversion options',
					value: ActionConstants.ConvertVisio,
					action: ActionConstants.ConvertVisio,
				},
				{
					name: 'Convert Word to PDF Form',
					description: 'Convert Word documents to PDF forms',
					value: ActionConstants.ConvertWordToPdfForm,
					action: ActionConstants.ConvertWordToPdfForm,
				},
				{
					name: 'Create PDF/A',
					description: 'Convert PDF to PDF/A for long-term archiving and compliance',
					value: ActionConstants.CreatePdfA,
					action: ActionConstants.CreatePdfA,
				},
				{
					name: 'Flatten PDF',
					description: 'Convert interactive PDF elements into static, non-editable content',
					value: ActionConstants.FlattenPdf,
					action: ActionConstants.FlattenPdf,
				},
				{
					name: 'Convert HTML To PDF',
					description: 'Convert HTML files to PDF documents',
					value: ActionConstants.ConvertHtmlToPdf,
					action: ActionConstants.ConvertHtmlToPdf,
				},
				{
					name: 'Linearize PDF',
					description: 'Optimize PDFs for web viewing with faster loading and progressive display',
					value: ActionConstants.LinearizePdf,
					action: ActionConstants.LinearizePdf,
				},
				{
					name: 'Convert Markdown To PDF',
					description: 'Convert Markdown files to PDF documents',
					value: ActionConstants.ConvertMarkdownToPdf,
					action: ActionConstants.ConvertMarkdownToPdf,
				},
				{
					name: 'Convert PDF To Excel',
					description: 'Convert PDF documents to Excel spreadsheets',
					value: ActionConstants.ConvertPdfToExcel,
					action: ActionConstants.ConvertPdfToExcel,
				},
				{
					name: 'Convert PDF To PowerPoint',
					description: 'Convert PDF documents to PowerPoint format with OCR support',
					value: ActionConstants.ConvertPdfToPowerpoint,
					action: ActionConstants.ConvertPdfToPowerpoint,
				},
				{
					name: 'Convert PDF To Word',
					description: 'Convert PDF documents to Word format with OCR support',
					value: ActionConstants.ConvertPdfToWord,
					action: ActionConstants.ConvertPdfToWord,
				},
				{
					name: 'URL to PDF',
					description: 'Convert web pages to PDF while preserving layout, styling, and content',
					value: ActionConstants.UrlToPdf,
					action: ActionConstants.UrlToPdf,
				},
				// Edit
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
					name: 'Add Image Stamp To PDF',
					description: 'Add image stamps or watermarks to PDF documents',
					value: ActionConstants.AddImageStampToPdf,
					action: ActionConstants.AddImageStampToPdf,
				},
				{
					name: 'Sign PDF',
					description: 'Digitally sign PDF documents',
					value: ActionConstants.SignPdf,
					action: ActionConstants.SignPdf,
				},
				{
					name: 'Add Text Stamp To PDF',
					description: 'Add text stamps or watermarks to PDF documents',
					value: ActionConstants.AddTextStampToPdf,
					action: ActionConstants.AddTextStampToPdf,
				},
				// Extract
				{
					name: 'Classify Document',
					description: 'Classify documents using AI to determine document type and extract relevant information',
					value: ActionConstants.ClassifyDocument,
					action: ActionConstants.ClassifyDocument,
				},
				{
					name: 'Extract Attachment From PDF',
					description: 'Extract file attachments from PDF documents',
					value: ActionConstants.ExtractAttachmentFromPdf,
					action: ActionConstants.ExtractAttachmentFromPdf,
				},
				{
					name: 'Extract Form Data From PDF',
					description: 'Extract form field data from PDF documents',
					value: ActionConstants.ExtractFormDataFromPdf,
					action: ActionConstants.ExtractFormDataFromPdf,
				},
				{
					name: 'Extract Resources',
					description: 'Extract text and images from PDF documents',
					value: ActionConstants.ExtractResources,
					action: ActionConstants.ExtractResources,
				},
				{
					name: 'Extract Table From PDF',
					description: 'Extract tables from PDF documents',
					value: ActionConstants.ExtractTableFromPdf,
					action: ActionConstants.ExtractTableFromPdf,
				},
				{
					name: 'Extract Text By Expression',
					description: 'Extract text from PDF using regular expressions',
					value: ActionConstants.ExtractTextByExpression,
					action: ActionConstants.ExtractTextByExpression,
				},
				{
					name: 'Extract Text From Word',
					description: 'Extract text content from Word documents',
					value: ActionConstants.ExtractTextFromWord,
					action: ActionConstants.ExtractTextFromWord,
				},
				{
					name: 'Parse Document',
					description: 'Parse documents to extract structured data using template-based parsing',
					value: ActionConstants.ParseDocument,
					action: ActionConstants.ParseDocument,
				},
				// Find Search
				{
					name: 'Find And Replace Text',
					description: 'Find and replace text in PDF documents',
					value: ActionConstants.FindAndReplaceText,
					action: ActionConstants.FindAndReplaceText,
				},
				{
					name: 'Convert PDF To Editable PDF Using OCR',
					description: 'Convert PDF to editable PDF using OCR for scanned documents',
					value: ActionConstants.ConvertPdfToEditableOcr,
					action: ActionConstants.ConvertPdfToEditableOcr,
				},
				// Forms
				{
					name: 'Add Form Fields To PDF',
					description: 'Add interactive form fields to PDF documents',
					value: ActionConstants.AddFormFieldsToPdf,
					action: ActionConstants.AddFormFieldsToPdf,
				},
				{
					name: 'Fill PDF Form',
					description: 'Fill PDF forms with data or generate multiple documents from templates',
					value: ActionConstants.FillPdfForm,
					action: ActionConstants.FillPdfForm,
				},
				// Generate
				{
					name: 'Create Swiss QR Bill',
					description: 'Create Swiss QR Bills using all compliance standards for digital payment transactions',
					value: ActionConstants.CreateSwissQrBill,
					action: ActionConstants.CreateSwissQrBill,
				},
				{
					name: 'Enable Tracking Changes In Word',
					description: 'Enable tracking changes in Word documents',
					value: ActionConstants.EnableTrackingChangesInWord,
					action: ActionConstants.EnableTrackingChangesInWord,
				},
				{
					name: 'Generate Document Single',
					description: 'Generate a single document from template with data',
					value: ActionConstants.GenerateDocumentSingle,
					action: ActionConstants.GenerateDocumentSingle,
				},
				{
					name: 'Generate Documents Multiple',
					description: 'Generate multiple documents from template with different data sets',
					value: ActionConstants.GenerateDocumentsMultiple,
					action: ActionConstants.GenerateDocumentsMultiple,
				},
				{
					name: 'Get Tracking Changes In Word',
					description: 'Get tracking changes information from Word documents',
					value: ActionConstants.GetTrackingChangesInWord,
					action: ActionConstants.GetTrackingChangesInWord,
				},
				{
					name: 'Replace Text With Image In Word',
					description: 'Replace specific text in Word documents with images',
					value: ActionConstants.ReplaceTextWithImageInWord,
					action: ActionConstants.ReplaceTextWithImageInWord,
				},
				// Image
				{
					name: 'Add Image Watermark To Image',
					description: 'Add image watermark to image documents',
					value: ActionConstants.AddImageWatermarkToImage,
					action: ActionConstants.AddImageWatermarkToImage,
				},
				{
					name: 'Add Text Watermark To Image',
					description: 'Add text watermarks to images with positioning and styling options',
					value: ActionConstants.AddTextWatermarkToImage,
					action: ActionConstants.AddTextWatermarkToImage,
				},
				{
					name: 'Compress Image',
					description: 'Compress image documents',
					value: ActionConstants.CompressImage,
					action: ActionConstants.CompressImage,
				},
				{
					name: 'Convert Image Format',
					description: 'Convert image format (BMP, GIF, JPG, PNG, TIFF)',
					value: ActionConstants.ConvertImageFormat,
					action: ActionConstants.ConvertImageFormat,
				},
				{
					name: 'Create Images From PDF',
					description: 'Create images from PDF pages',
					value: ActionConstants.CreateImagesFromPdf,
					action: ActionConstants.CreateImagesFromPdf,
				},
				{
					name: 'Crop Image',
					description: 'Crop images with border or rectangle cropping options',
					value: ActionConstants.CropImage,
					action: ActionConstants.CropImage,
				},
				{
					name: 'Flip Image',
					description: 'Flip image documents horizontally, vertically, or both',
					value: ActionConstants.FlipImage,
					action: ActionConstants.FlipImage,
				},
				{
					name: 'Get Image Metadata',
					description: 'Extract metadata information from images including EXIF data and properties',
					value: ActionConstants.GetImageMetadata,
					action: ActionConstants.GetImageMetadata,
				},
				{
					name: 'Image Extract Text',
					description: 'Extract text content from images using OCR (Optical Character Recognition)',
					value: ActionConstants.ImageExtractText,
					action: ActionConstants.ImageExtractText,
				},
				{
					name: 'Replace Text With Image',
					description: 'Replace specific text in PDF documents with images',
					value: ActionConstants.ReplaceTextWithImage,
					action: ActionConstants.ReplaceTextWithImage,
				},
				{
					name: 'Resize Image',
					description: 'Resize images by percentage or specific dimensions with aspect ratio control',
					value: ActionConstants.ResizeImage,
					action: ActionConstants.ResizeImage,
				},
				{
					name: 'Rotate Image By EXIF Data',
					description: 'Rotate image automatically based on EXIF orientation metadata',
					value: ActionConstants.RotateImageByExifData,
					action: ActionConstants.RotateImageByExifData,
				},
				{
					name: 'Rotate Image',
					description: 'Rotate images with custom angle, background color, and proportionate resize options',
					value: ActionConstants.RotateImage,
					action: ActionConstants.RotateImage,
				},
				{
					name: 'Remove EXIF Tags From Image',
					description: 'Remove metadata/EXIF tags from images for privacy and file size reduction',
					value: ActionConstants.RemoveExifTagsFromImage,
					action: ActionConstants.RemoveExifTagsFromImage,
				},
				// Merge & Split
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
					name: 'Split PDF Regular',
					description: 'Split PDF documents by regular expression and output as ZIP',
					value: ActionConstants.SplitPdfRegular,
					action: ActionConstants.SplitPdfRegular,
				},
				{
					name: 'Split PDF By Barcode',
					description: 'Split PDF documents by barcode and output as ZIP',
					value: ActionConstants.SplitPdfByBarcode,
					action: ActionConstants.SplitPdfByBarcode,
				},
				{
					name: 'Split PDF By Swiss QR',
					description: 'Split PDF documents by Swiss QR code and output as ZIP',
					value: ActionConstants.SplitPdfBySwissQR,
					action: ActionConstants.SplitPdfBySwissQR,
				},
				{
					name: 'Split PDF By Text',
					description: 'Split PDF documents by text and output as ZIP',
					value: ActionConstants.SplitPdfByText,
					action: ActionConstants.SplitPdfByText,
				},
				// Optimize Compress
				{
					name: 'Compress PDF',
					value: ActionConstants.CompressPdf,
					description: 'Compress and optimize PDF files',
					action: ActionConstants.CompressPdf,
				},
				// Organize
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
					name: 'Extract Pages From PDF',
					description: 'Extract specific pages from PDF documents',
					value: ActionConstants.ExtractPagesFromPdf,
					action: ActionConstants.ExtractPagesFromPdf,
				},
				{
					name: 'Rotate PDF Page',
					description: 'Rotate specific pages in PDF documents by 90, 180, or 270 degrees',
					value: ActionConstants.RotatePage,
					action: ActionConstants.RotatePage,
				},
				{
					name: 'Rotate Document',
					description: 'Rotate entire PDF documents by 90, 180, or 270 degrees',
					value: ActionConstants.RotateDocument,
					action: ActionConstants.RotateDocument,
				},
				// PDF4me
				{
					name: 'Get Document From Pdf4me',
					value: ActionConstants.GetDocumentFromPdf4me,
					description: 'Split PDF documents by barcode and output as ZIP',
					action: ActionConstants.GetDocumentFromPdf4me,
				},
				{
					name: 'Update Hyperlinks Annotation',
					description: 'Update hyperlinks in PDF documents',
					value: ActionConstants.UpdateHyperlinksAnnotation,
					action: ActionConstants.UpdateHyperlinksAnnotation,
				},
				// PDF
				{
					name: 'Get PDF Metadata',
					value: ActionConstants.GetPdfMetadata,
					description: 'Extract metadata from PDF files',
					action: ActionConstants.GetPdfMetadata,
				},
				{
					name: 'Repair PDF Document',
					value: ActionConstants.RepairPdfDocument,
					description: 'Repair corrupted or damaged PDF files',
					action: ActionConstants.RepairPdfDocument,
				},
				// Security
				{
					name: 'Protect PDF',
					description: 'Protect PDF documents with encryption, passwords, and permissions',
					value: ActionConstants.ProtectDocument,
					action: ActionConstants.ProtectDocument,
				},
				{
					name: 'Unlock PDF',
					description: 'Unlock PDF documents by removing encryption',
					value: ActionConstants.UnlockPdf,
					action: ActionConstants.UnlockPdf,
				},
				// Word
				{
					name: 'Disable Tracking Changes In Word',
					description: 'Disable tracking changes in Word documents',
					value: ActionConstants.DisableTrackingChangesInWord,
					action: ActionConstants.DisableTrackingChangesInWord,
				},
				// Workflow
				{
					name: 'Upload File To PDF4me',
					description: 'Upload files to PDF4ME for further processing',
					value: ActionConstants.UploadFile,
					action: ActionConstants.UploadFile,
				},
				// AI Actions (keeping these as they don't fit the main categories)
				{
					name: 'AI-Invoice Parser',
					description: 'Extract structured data from invoices using AI/ML technology for automated data entry',
					value: ActionConstants.AiInvoiceParser,
					action: ActionConstants.AiInvoiceParser,
				},
				{
					name: 'AI-Process HealthCard',
					description: 'Extract structured data from health cards using AI/ML technology for member management',
					value: ActionConstants.AiProcessHealthCard,
					action: ActionConstants.AiProcessHealthCard,
				},
				{
					name: 'AI-Process Contract',
					description: 'Extract structured data from contracts using AI/ML technology for legal document analysis',
					value: ActionConstants.AiProcessContract,
					action: ActionConstants.AiProcessContract,
				},
			],
			default: ActionConstants.BarcodeGenerator,
		},
		...addAttachmentToPdf.description,
		...addBarcodeToPdf.description,
		...addFormFieldsToPdf.description,
		...fillPdfForm.description,
		...addHtmlHeaderFooter.description,
		...addImageStampToPdf.description,
		...addMarginToPdf.description,
		...addPageNumberToPdf.description,
		...addTextStampToPdf.description,
		...addImageWatermarkToImage.description,
		...addTextWatermarkToImage.description,
		...aiInvoiceParser.description,
		...aiProcessHealthCard.description,
		...aiProcessContract.description,
		...barcodeGenerator.description,
		...cropImage.description,
		...deleteBlankPagesFromPdf.description,
		...deleteUnwantedPagesFromPdf.description,
		...jsonToExcel.description,
		...mergeMultiplePDFs.description,
		...overlayPDFs.description,
		...convertPdfToWord.description,
		...convertToPdf.description,
		...rotateDocument.description,
		...rotatePage.description,
		...signPdf.description,
		...urlToPdf.description,
		...compressImage.description,
		...convertImageFormat.description,
		...createImagesFromPdf.description,
		...flipImage.description,
		...getImageMetadata.description,
		...imageExtractText.description,
		...removeExifTagsFromImage.description,
		...replaceTextWithImage.description,
		...resizeImage.description,
		...rotateImage.description,
		...rotateImageByExifData.description,
		...compressPdf.description,
		...getPdfMetadata.description,
		...repairPdfDocument.description,
		...get_document_from_pdf4me.description,
		...update_hyperlinks_annotation.description,
		...protect_document.description,
		...unlock_pdf.description,
		...disabletracking_changes_in_word.description,
		...enableTrackingChangesInWord.description,
		...readBarcodeFromImage.description,
		...readBarcodeFromPdf.description,
		...readSwissQrCode.description,
		...classifyDocument.description,
		...parseDocument.description,
		...linearizePdf.description,
		...flattenPdf.description,
		...extractFormDataFromPdf.description,
		...extractPagesFromPdf.description,
		...extractAttachmentFromPdf.description,
		...extractTextByExpression.description,
		...extractTableFromPdf.description,
		...extractResources.description,
		...extractTextFromWord.description,
		...findAndReplaceText.description,
		...convertPdfToEditableOcr.description,
		...createSwissQrBill.description,
		...replaceTextWithImageInWord.description,
		...generateDocumentSingle.description,
		...generateDocumentsMultiple.description,
		...getTrackingChangesInWord.description,
		...SplitPdfByBarcode.description,
		...SplitPdfBySwissQR.description,
		...SplitPdfByText.description,
		...SplitPdfRegular.description,
		...createPdfA.description,
		...convertHtmlToPdf.description,
		...convertMarkdownToPdf.description,
		...convertPdfToPowerpoint.description,
		...convertPdfToExcel.description,
		...convertVisio.description,
		...convertWordToPdfForm.description,
		...uploadFile.description,
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
