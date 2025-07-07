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
import * as extractPagesFromPdf from './actions/extractPagesFromPdf';
import * as rotateDocument from './actions/rotateDocument';
import * as rotatePage from './actions/rotatePage';
import * as deleteBlankPagesFromPdf from './actions/deleteBlankPagesFromPdf';
import * as deleteUnwantedPagesFromPdf from './actions/deleteUnwantedPagesFromPdf';
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
				} else if (action === ActionConstants.ExtractPagesFromPdf) {
					operationResult.push(...(await extractPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.RotateDocument) {
					operationResult.push(...(await rotateDocument.execute.call(this, i)));
				} else if (action === ActionConstants.RotatePage) {
					operationResult.push(...(await rotatePage.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteBlankPagesFromPdf) {
					operationResult.push(...(await deleteBlankPagesFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.DeleteUnwantedPagesFromPdf) {
					operationResult.push(...(await deleteUnwantedPagesFromPdf.execute.call(this, i)));
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
