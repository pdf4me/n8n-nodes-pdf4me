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
import * as classifyDocument from './actions/classifyDocument';
import * as extractAttachmentFromPdf from './actions/extractAttachmentFromPdf';
import * as extractFormDataFromPdf from './actions/extractFormDataFromPdf';
import * as extractResources from './actions/extractResources';
import * as extractTableFromPdf from './actions/extractTableFromPdf';
import * as extractTextByExpression from './actions/extractTextByExpression';
import * as extractTextFromWord from './actions/extractTextFromWord';
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
				} else if (action === ActionConstants.ClassifyDocument) {
					operationResult.push(...(await classifyDocument.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractAttachmentFromPdf) {
					operationResult.push(...(await extractAttachmentFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractFormDataFromPdf) {
					operationResult.push(...(await extractFormDataFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractResources) {
					operationResult.push(...(await extractResources.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTableFromPdf) {
					operationResult.push(...(await extractTableFromPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextByExpression) {
					operationResult.push(...(await extractTextByExpression.execute.call(this, i)));
				} else if (action === ActionConstants.ExtractTextFromWord) {
					operationResult.push(...(await extractTextFromWord.execute.call(this, i)));
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
