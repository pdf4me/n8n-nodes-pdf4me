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
import * as addImageWatermarkToImage from './actions/addImageWatermarkToImage';
import * as addTextWatermarkToImage from './actions/addTextWatermarkToImage';
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
import * as get_document_from_pdf4me from './actions/get_document_from_pdf4me';
import * as update_hyperlinks_annotation from './actions/update_hyperlinks_annotation';
import * as protect_document from './actions/protect_document';
import * as unlock_pdf from './actions/unlock_pdf';
import * as disabletracking_changes_in_word from './actions/disabletracking_changes_in_word';
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
				{
					name: 'Add Image Watermark To Image',
					description: 'Add image watermark to image documents',
					value: ActionConstants.AddImageWatermarkToImage,
					action: ActionConstants.AddImageWatermarkToImage,
				},
				{
					name: 'Add Text Watermark To Image',
					description: 'Add text watermark to image documents',
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
					name: 'Remove EXIF Tags From Image',
					description: 'Remove metadata/EXIF tags from images for privacy and file size reduction',
					value: ActionConstants.RemoveExifTagsFromImage,
					action: ActionConstants.RemoveExifTagsFromImage,
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
					name: 'Rotate Image',
					description: 'Rotate images with custom angle, background color, and proportionate resize options',
					value: ActionConstants.RotateImage,
					action: ActionConstants.RotateImage,
				},
				{
					name: 'Rotate Image By EXIF Data',
					description: 'Rotate image automatically based on EXIF orientation metadata',
					value: ActionConstants.RotateImageByExifData,
					action: ActionConstants.RotateImageByExifData,
				},
				{
					name: 'Compress PDF',
					value: ActionConstants.CompressPdf,
					description: 'Compress and optimize PDF files',
				},
				{
					name: 'Get PDF Metadata',
					value: ActionConstants.GetPdfMetadata,
					description: 'Extract metadata from PDF files',
				},
				{
					name: 'Repair PDF Document',
					value: ActionConstants.RepairPdfDocument,
					description: 'Repair corrupted or damaged PDF files',
				},
				{
					name: 'Get Document From Pdf4me',
					value: ActionConstants.GetDocumentFromPdf4me,
					description: 'Split PDF documents by barcode and output as ZIP',
				},
				{
					name: 'Update Hyperlinks Annotation',
					description: 'Update hyperlinks in PDF documents',
					value: ActionConstants.UpdateHyperlinksAnnotation,
					action: ActionConstants.UpdateHyperlinksAnnotation,
				},
				{
					name: 'Protect Document',
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
				{
					name: 'Disable Tracking Changes In Word',
					description: 'Disable tracking changes in Word documents',
					value: ActionConstants.DisableTrackingChangesInWord,
					action: ActionConstants.DisableTrackingChangesInWord,
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
		...addImageWatermarkToImage.description,
		...addTextWatermarkToImage.description,
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
	],
	subtitle: '={{$parameter["operation"]}}',
	version: 1,
};
