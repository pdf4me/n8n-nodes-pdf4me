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
import * as addAttachmentToPdf from './actions/addAttachmentToPdf';
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
				} else if (action === ActionConstants.ConvertFromPDF) {
					operationResult.push(...(await pdfToWord.execute.call(this, i) as any[]));
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
