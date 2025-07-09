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
