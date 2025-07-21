import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
	INodeExecutionData,
} from 'n8n-workflow';

import { descriptions } from './Descriptions';
import * as barcodeGenerator from './actions/barcodeGenerator';
import * as urlToPdf from './actions/urlToPdf';
import * as convertPdfToWord from './actions/convertPdfToWord';
import * as convertToPdf from './actions/convertToPdf';
import * as jsonToExcel from './actions/jsonToExcel';
import * as cropImage from './actions/cropImage';
import * as mergeMultiplePDFs from './actions/MergeMultiplePDFs';
import * as overlayPDFs from './actions/OverlayPDFs';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as extractPages from './actions/extractPages';
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
import * as addFormFieldsToPdf from './actions/addFormFieldsToPdf';
import * as fillPdfForm from './actions/fillPdfForm';
import * as addHtmlHeaderFooter from './actions/addHtmlHeaderFooter';
import * as addImageStampToPdf from './actions/addImageStampToPdf';
import * as addMarginToPdf from './actions/addMarginToPdf';
import * as addPageNumberToPdf from './actions/addPageNumberToPdf';
import * as addTextStampToPdf from './actions/addTextStampToPdf';
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
import * as get_document_from_pdf4me from './actions/GetDocumentFromPdf4me';
import * as update_hyperlinks_annotation from './actions/update_hyperlinks_annotation';
import * as protect_document from './actions/protect_document';
import * as unlock_pdf from './actions/unlock_pdf';
import * as disabletracking_changes_in_word from './actions/disabletracking_changes_in_word';
import * as enableTrackingChangesInWord from './actions/enableTrackingChangesInWord';
import * as signPdf from './actions/signPdf';
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
import * as uploadFile from './actions/uploadFile';
import { ActionConstants } from './GenericFunctions';

export class Pdf4me implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...descriptions,
		};
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operationResult: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const action = this.getNodeParameter('operation', i);

			try {
				if (action === ActionConstants.BarcodeGenerator) {
					operationResult.push(...(await barcodeGenerator.execute.call(this, i)));
				} else if (action === ActionConstants.ClassifyDocument) {
					operationResult.push(...(await classifyDocument.execute.call(this, i)));
				} else if (action === ActionConstants.UrlToPdf) {
					operationResult.push(...(await urlToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertFromPDF) {
					operationResult.push(...(await convertPdfToWord.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertToPdf) {
					operationResult.push(...(await convertToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.JsonToExcel) {
					operationResult.push(...(await jsonToExcel.execute.call(this, i)));
				} else if (action === ActionConstants.CropImage) {
					operationResult.push(...(await cropImage.execute.call(this, i)));
				} else if (action === ActionConstants.MergeMultiplePDFs) {
					operationResult.push(...(await mergeMultiplePDFs.execute.call(this, i)));
				} else if (action === ActionConstants.OverlayPDFs) {
					operationResult.push(...(await overlayPDFs.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteBlankPagesFromPdf) {
					operationResult.push(...(await deleteBlankPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteUnwantedPagesFromPdf) {
					operationResult.push(...(await deleteUnwantedPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.RotateDocument) {
					operationResult.push(...(await rotateDocument.execute.call(this, i)));
				} else if (action === ActionConstants.RotatePage) {
					operationResult.push(...(await rotatePage.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractPages) {
					operationResult.push(...(await extractPages.execute.call(this, i)));
				} else if (action === ActionConstants.AddAttachmentToPdf) {
					operationResult.push(...(await addAttachmentToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.AddFormFieldsToPdf) {
					operationResult.push(...(await addFormFieldsToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.FillPdfForm) {
					operationResult.push(...(await fillPdfForm.execute.call(this, i)));
				} else if (action === ActionConstants.AddHtmlHeaderFooter) {
					operationResult.push(...(await addHtmlHeaderFooter.execute.call(this, i)));
				} else if (action === ActionConstants.AddImageStampToPdf) {
					operationResult.push(...(await addImageStampToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.AddMarginToPdf) {
					operationResult.push(...(await addMarginToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.AddPageNumberToPdf) {
					operationResult.push(...(await addPageNumberToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.AddTextStampToPdf) {
					operationResult.push(...(await addTextStampToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.AddImageWatermarkToImage) {
					operationResult.push(...(await addImageWatermarkToImage.execute.call(this, i)));
				} else if (action === ActionConstants.AddTextWatermarkToImage) {
					operationResult.push(...(await addTextWatermarkToImage.execute.call(this, i)));
				} else if (action === ActionConstants.CompressImage) {
					operationResult.push(...(await compressImage.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertImageFormat) {
					operationResult.push(...(await convertImageFormat.execute.call(this, i)));
				} else if (action === ActionConstants.CreateImagesFromPdf) {
					operationResult.push(...(await createImagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.FlipImage) {
					operationResult.push(...(await flipImage.execute.call(this, i)));
				} else if (action === ActionConstants.GetImageMetadata) {
					operationResult.push(...(await getImageMetadata.execute.call(this, i)));
				} else if (action === ActionConstants.ImageExtractText) {
					operationResult.push(...(await imageExtractText.execute.call(this, i)));
				} else if (action === ActionConstants.RemoveExifTagsFromImage) {
					operationResult.push(...(await removeExifTagsFromImage.execute.call(this, i)));
				} else if (action === ActionConstants.ReplaceTextWithImage) {
					operationResult.push(...(await replaceTextWithImage.execute.call(this, i)));
				} else if (action === ActionConstants.ResizeImage) {
					operationResult.push(...(await resizeImage.execute.call(this, i)));
				} else if (action === ActionConstants.RotateImage) {
					operationResult.push(...(await rotateImage.execute.call(this, i)));
				} else if (action === ActionConstants.RotateImageByExifData) {
					operationResult.push(...(await rotateImageByExifData.execute.call(this, i)));
				} else if (action === ActionConstants.CompressPdf) {
					operationResult.push(...(await compressPdf.execute.call(this, i)));
				} else if (action === ActionConstants.GetPdfMetadata) {
					operationResult.push(...(await getPdfMetadata.execute.call(this, i)));
				} else if (action === ActionConstants.RepairPdfDocument) {
					operationResult.push(...(await repairPdfDocument.execute.call(this, i)));
				} else if (action === ActionConstants.GetDocumentFromPdf4me) {
					operationResult.push(...(await get_document_from_pdf4me.execute.call(this, i)));
				} else if (action === ActionConstants.UpdateHyperlinksAnnotation) {
					operationResult.push(...(await update_hyperlinks_annotation.execute.call(this, i)));
				} else if (action === ActionConstants.ProtectDocument) {
					operationResult.push(...(await protect_document.execute.call(this, i)));
				} else if (action === ActionConstants.UnlockPdf) {
					operationResult.push(...(await unlock_pdf.execute.call(this, i)));
				} else if (action === ActionConstants.DisableTrackingChangesInWord) {
					operationResult.push(...(await disabletracking_changes_in_word.execute.call(this, i)));
				} else if (action === ActionConstants.EnableTrackingChangesInWord) {
					operationResult.push(...(await enableTrackingChangesInWord.execute.call(this, i)));
				} else if (action === ActionConstants.SignPdf) {
					operationResult.push(...(await signPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ReadBarcodeFromImage) {
					operationResult.push(...(await readBarcodeFromImage.execute.call(this, i)));
				} else if (action === ActionConstants.ReadBarcodeFromPdf) {
					operationResult.push(...(await readBarcodeFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ReadSwissQrCode) {
					operationResult.push(...(await readSwissQrCode.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractFormDataFromPdf) {
					operationResult.push(...(await extractFormDataFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractPagesFromPdf) {
					operationResult.push(...(await extractPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractAttachmentFromPdf) {
					operationResult.push(...(await extractAttachmentFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextByExpression) {
					operationResult.push(...(await extractTextByExpression.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTableFromPdf) {
					operationResult.push(...(await extractTableFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractResources) {
					operationResult.push(...(await extractResources.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextFromWord) {
					operationResult.push(...(await extractTextFromWord.execute.call(this, i)));
				} else if (action === ActionConstants.FindAndReplaceText) {
					operationResult.push(...(await findAndReplaceText.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertPdfToEditableOcr) {
					operationResult.push(...(await convertPdfToEditableOcr.execute.call(this, i)));
				} else if (action === ActionConstants.CreateSwissQrBill) {
					operationResult.push(...(await createSwissQrBill.execute.call(this, i)));
				} else if (action === ActionConstants.ReplaceTextWithImageInWord) {
					operationResult.push(...(await replaceTextWithImageInWord.execute.call(this, i)));
				} else if (action === ActionConstants.GenerateDocumentSingle) {
					operationResult.push(...(await generateDocumentSingle.execute.call(this, i)));
				} else if (action === ActionConstants.GenerateDocumentsMultiple) {
					operationResult.push(...(await generateDocumentsMultiple.execute.call(this, i)));
				} else if (action === ActionConstants.GetTrackingChangesInWord) {
					operationResult.push(...(await getTrackingChangesInWord.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPdfByBarcode) {
					operationResult.push(...(await SplitPdfByBarcode.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPdfBySwissQR) {
					operationResult.push(...(await SplitPdfBySwissQR.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPdfByText) {
					operationResult.push(...(await SplitPdfByText.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPdfRegular) {
					operationResult.push(...(await SplitPdfRegular.execute.call(this, i)));
				} else if (action === ActionConstants.CreatePdfA) {
					operationResult.push(...(await createPdfA.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertHtmlToPdf) {
					operationResult.push(...(await convertHtmlToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertMarkdownToPdf) {
					operationResult.push(...(await convertMarkdownToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertPdfToExcel) {
					operationResult.push(...(await convertPdfToExcel.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertPdfToPowerpoint) {
					operationResult.push(...(await convertPdfToPowerpoint.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertPdfToWord) {
					operationResult.push(...(await convertPdfToWord.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertVisio) {
					operationResult.push(...(await convertVisio.execute.call(this, i)));
				} else if (action === ActionConstants.UploadFile) {
					operationResult.push(...(await uploadFile.execute.call(this, i)));
				}
			} catch (err) {
				if (this.continueOnFail()) {
					operationResult.push({ json: this.getInputData(i)[0].json, error: err });
				} else {
					throw err;
				}
			}
		}

		return [operationResult];
	}
}
