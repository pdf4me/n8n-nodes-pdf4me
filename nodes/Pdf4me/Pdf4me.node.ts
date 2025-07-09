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
import * as htmlToPdf from './actions/htmlToPdf';
import * as pptxToPdf from './actions/pptxToPdf';
import * as xlsxToPdf from './actions/xlsxToPdf';
import * as pngToPdf from './actions/pngToPdf';
import * as documentToPdf from './actions/documentToPdf';
import * as markdownToPdf from './actions/markdownToPdf';
import * as visioToPdf from './actions/visioToPdf';
import * as wordToPdfForm from './actions/wordToPdfForm';
import * as pdfToExcel from './actions/pdfToExcel';
import * as pdfToPowerpoint from './actions/pdfToPowerpoint';
import * as createPdfA from './actions/createPdfA';
import * as flattenPdf from './actions/flattenPdf';
import * as linearizePdf from './actions/linearizePdf';
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
				} else if (action === ActionConstants.JsonToExcel) {
					operationResult.push(...(await jsonToExcel.execute.call(this, i)));
				} else if (action === ActionConstants.CropImage) {
					operationResult.push(...(await cropImage.execute.call(this, i)));
				} else if (action === ActionConstants.HtmlToPdf) {
					operationResult.push(...(await htmlToPdf.execute.call(this, i)));
				} else if (action === ActionConstants.ConvertToPdf) {
					// Handle Convert to PDF based on conversion type
					const conversionType = this.getNodeParameter('conversionType', i) as string;
					
					if (conversionType === 'DocumentToPdf') {
						operationResult.push(...(await documentToPdf.execute.call(this, i)));
					} else if (conversionType === 'PptxToPdf') {
						operationResult.push(...(await pptxToPdf.execute.call(this, i)));
					} else if (conversionType === 'XlsxToPdf') {
						operationResult.push(...(await xlsxToPdf.execute.call(this, i)));
					} else if (conversionType === 'PngToPdf') {
						operationResult.push(...(await pngToPdf.execute.call(this, i)));
					} else if (conversionType === 'HtmlToPdf') {
						operationResult.push(...(await htmlToPdf.execute.call(this, i)));
					} else if (conversionType === 'MarkdownToPdf') {
						operationResult.push(...(await markdownToPdf.execute.call(this, i)));
					} else if (conversionType === 'VisioToPdf') {
						operationResult.push(...(await visioToPdf.execute.call(this, i)));
					} else if (conversionType === 'WordToPdfForm') {
						operationResult.push(...(await wordToPdfForm.execute.call(this, i)));
					} else if (conversionType === 'UrlToPdf') {
						operationResult.push(...(await urlToPdf.execute.call(this, i)));
					}
				} else if (action === ActionConstants.ConvertFromPdf) {
					const conversionType = this.getNodeParameter('fromPdfConversionType', i) as string;
					if (conversionType === 'PdfToWord') {
						operationResult.push(...(await pdfToWord.execute.call(this, i)));
					} else if (conversionType === 'PdfToExcel') {
						operationResult.push(...(await pdfToExcel.execute.call(this, i)));
					} else if (conversionType === 'PdfToPowerpoint') {
						operationResult.push(...(await pdfToPowerpoint.execute.call(this, i)));
					}
				} else if (action === ActionConstants.OptimizePdf) {
					const optimizationType = this.getNodeParameter('optimizePdfType', i) as string;
					if (optimizationType === 'CreatePdfA') {
						operationResult.push(...(await createPdfA.execute.call(this, i)));
					} else if (optimizationType === 'FlattenPdf') {
						operationResult.push(...(await flattenPdf.execute.call(this, i)));
					} else if (optimizationType === 'LinearizePdf') {
						operationResult.push(...(await linearizePdf.execute.call(this, i)));
					}
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
