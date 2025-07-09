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
import * as mergePdf from './actions/MergePDF';
import * as splitPdf from './actions/SplitPDF';
import * as edit from './actions/edit';
import * as extract from './actions/extract';
import * as findSearch from './actions/findSearch';
import * as form from './actions/form';
import * as image from './actions/image';
import * as optimizeCompress from './actions/optimizeCompress';
import * as organize from './actions/organize';
import * as pdf4me from './actions/pdf4me';
import * as uploadFile from './actions/uploadFile';
import * as word from './actions/word';
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
				if (action === ActionConstants.Barcode) {
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
					operationResult.push(...(await mergePdf.execute.call(this, i)));
				} else if (action === ActionConstants.SplitPDF) {
					operationResult.push(...(await splitPdf.execute.call(this, i)));
				} else if (action === ActionConstants.Edit) {
					operationResult.push(...(await edit.execute.call(this, i)));
				} else if (action === ActionConstants.Extract) {
					operationResult.push(...(await extract.execute.call(this, i)));
				} else if (action === ActionConstants.FindSearch) {
					operationResult.push(...(await findSearch.execute.call(this, i)));
				} else if (action === ActionConstants.Form) {
					operationResult.push(...(await form.execute.call(this, i)));
				} else if (action === ActionConstants.Image) {
					operationResult.push(...(await image.execute.call(this, i)));
				} else if (action === ActionConstants.OptimizeCompress) {
					operationResult.push(...(await optimizeCompress.execute.call(this, i)));
				} else if (action === ActionConstants.Organize) {
					operationResult.push(...(await organize.execute.call(this, i)));
				} else if (action === ActionConstants.Pdf4me) {
					operationResult.push(...(await pdf4me.execute.call(this, i)));
				} else if (action === ActionConstants.UploadFile) {
					operationResult.push(...(await uploadFile.execute.call(this, i)));
				} else if (action === ActionConstants.Word) {
					operationResult.push(...(await word.execute.call(this, i)));
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
