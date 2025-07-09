import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeTypeBaseDescription,
	INodeExecutionData
} from 'n8n-workflow';

import { descriptions } from './Descriptions';
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

export class Pdf4me implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...descriptions
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
				} else if (action === ActionConstants.UrlToPdf) {
					operationResult.push(...(await urlToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.PdfToWord) {
					operationResult.push(...(await pdfToWord.execute.call(this, i) as any[]));
				} else if (action === ActionConstants.JsonToExcel) {
					operationResult.push(...(await jsonToExcel.execute.call(this, i)));
				} else if (action === ActionConstants.CropImage) {
					operationResult.push(...(await cropImage.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertToPdf) {
					operationResult.push(...(await convertToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.MergePDF) {
					operationResult.push(...(await mergePDF.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPDF) {
					operationResult.push(...(await splitPDF.execute.call(this, i)));
				} else if (action === ActionConstants.AddAttachmentToPdf) {
					operationResult.push(...(await addAttachmentToPdf.execute.call(this, i)));
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
				} else if (action === ActionConstants.ClassifyDocument) {
					operationResult.push(...(await classifyDocument.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteBlankPagesFromPdf) {
					operationResult.push(...(await deleteBlankPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteUnwantedPagesFromPdf) {
					operationResult.push(...(await deleteUnwantedPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.DocumentToPdf) {
					operationResult.push(...(await documentToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.Edit) {
					operationResult.push(...(await edit.execute.call(this, i)));
				} else if (action === ActionConstants.Extract) {
					operationResult.push(...(await extract.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractAttachmentFromPdf) {
					operationResult.push(...(await extractAttachmentFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractFormDataFromPdf) {
					operationResult.push(...(await extractFormDataFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractPagesFromPdf) {
					operationResult.push(...(await extractPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractResources) {
					operationResult.push(...(await extractResources.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTableFromPdf) {
					operationResult.push(...(await extractTableFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextByExpression) {
					operationResult.push(...(await extractTextByExpression.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextFromWord) {
					operationResult.push(...(await extractTextFromWord.execute.call(this, i)));
				} else if (action === ActionConstants.FindSearch) {
					operationResult.push(...(await findSearch.execute.call(this, i)));
				} else if (action === ActionConstants.Form) {
					operationResult.push(...(await form.execute.call(this, i)));
				} else if (action === ActionConstants.HtmlToPdf) {
					operationResult.push(...(await htmlToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.Image) {
					operationResult.push(...(await image.execute.call(this, i)));
				} else if (action === ActionConstants.MarkdownToPdf) {
					operationResult.push(...(await markdownToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.OptimizeCompress) {
					operationResult.push(...(await optimizeCompress.execute.call(this, i)));
				} else if (action === ActionConstants.Organize) {
					operationResult.push(...(await organize.execute.call(this, i)));
				} else if (action === ActionConstants.Pdf4me) {
					operationResult.push(...(await pdf4me.execute.call(this, i)));
				} else if (action === ActionConstants.PngToPdf) {
					operationResult.push(...(await pngToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.PptxToPdf) {
					operationResult.push(...(await pptxToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ProtectDocument) {
					operationResult.push(...(await protectDocument.execute.call(this, i)));
				} else if (action === ActionConstants.RotateDocument) {
					operationResult.push(...(await rotateDocument.execute.call(this, i)));
				} else if (action === ActionConstants.RotatePage) {
					operationResult.push(...(await rotatePage.execute.call(this, i)));
				} else if (action === ActionConstants.SignPdf) {
					operationResult.push(...(await signPdf.execute.call(this, i)));
				} else if (action === ActionConstants.UnlockPdf) {
					operationResult.push(...(await unlockPdf.execute.call(this, i)));
				} else if (action === ActionConstants.UploadFile) {
					operationResult.push(...(await uploadFile.execute.call(this, i)));
				} else if (action === ActionConstants.VisioToPdf) {
					operationResult.push(...(await visioToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.Word) {
					operationResult.push(...(await word.execute.call(this, i)));
				} else if (action === ActionConstants.WordToPdfForm) {
					operationResult.push(...(await wordToPdfForm.execute.call(this, i)));
				} else if (action === ActionConstants.XlsxToPdf) {
					operationResult.push(...(await xlsxToPdf.execute.call(this, i)));
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
