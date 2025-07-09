import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

declare const Buffer: any;
declare const setTimeout: any;
declare const require: any;
declare const URL: any;
declare const console: any;
declare const fetch: any;

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	let inputDataType: string;
	let outputFileName: string;
	let docName: string;
	let advancedOptions: IDataObject;

	if (operation === ActionConstants.OptimizePdf) {
		inputDataType = this.getNodeParameter('flattenPdfInputDataType', index) as string;
		outputFileName = this.getNodeParameter('flattenPdfOutputFileName', index) as string;
		docName = this.getNodeParameter('flattenPdfDocName', index) as string;
		advancedOptions = this.getNodeParameter('flattenPdfAdvancedOptions', index) as IDataObject;
	} else {
		inputDataType = this.getNodeParameter('inputDataType', index) as string;
		outputFileName = this.getNodeParameter('outputFileName', index) as string;
		docName = this.getNodeParameter('docName', index) as string;
		advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	}

	let docContent: string;
	let originalFileName = docName;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = operation === ActionConstants.OptimizePdf
			? this.getNodeParameter('flattenPdfBinaryPropertyName', index) as string
			: this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		const binaryData = item[0].binary[binaryPropertyName];
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		if (binaryData.fileName) {
			originalFileName = binaryData.fileName;
		}
	} else if (inputDataType === 'base64') {
		docContent = operation === ActionConstants.OptimizePdf
			? this.getNodeParameter('flattenPdfBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const pdfUrl = operation === ActionConstants.OptimizePdf
			? this.getNodeParameter('flattenPdfUrl', index) as string
			: this.getNodeParameter('pdfUrl', index) as string;
		try {
			new URL(pdfUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}
		console.log(`Downloading PDF from URL: ${pdfUrl}`);
		docContent = await downloadPdfFromUrl(pdfUrl);
		console.log('PDF file successfully downloaded and encoded to base64');
	} else if (inputDataType === 'filePath') {
		const filePath = operation === ActionConstants.OptimizePdf
			? this.getNodeParameter('flattenPdfFilePath', index) as string
			: this.getNodeParameter('filePath', index) as string;
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the PDF file.');
		}
		try {
			const fs = require('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');
			if (docContent.length < 100) {
				throw new Error('PDF file appears to be too small. Please ensure the file is a valid PDF.');
			}
			const pathParts = filePath.replace(/\\/g, '/').split('/');
			originalFileName = pathParts[pathParts.length - 1];
		} catch (error) {
			if (error.code === 'ENOENT') {
				throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
			} else if (error.code === 'EACCES') {
				throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
			} else {
				throw new Error(`Error reading file: ${error.message}`);
			}
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		async: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/FlattenPdf', body);

	if (responseData) {
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'flattened_pdf_output';
			fileName = `${baseName}.pdf`;
		}
		if (!fileName.includes('.')) {
			fileName = `${fileName}.pdf`;
		}
		let pdfBuffer: any;
		if (Buffer.isBuffer(responseData)) {
			pdfBuffer = responseData;
		} else if (typeof responseData === 'string') {
			pdfBuffer = Buffer.from(responseData, 'base64');
		} else {
			pdfBuffer = Buffer.from(responseData as any);
		}
		if (!pdfBuffer || pdfBuffer.length < 100) {
			throw new Error('Invalid flattened PDF response from API. The converted file appears to be too small or corrupted.');
		}
		const binaryData = await this.helpers.prepareBinaryData(
			pdfBuffer,
			fileName,
			'application/pdf',
		);
		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: pdfBuffer.length,
					success: true,
					originalFileName,
					message: 'PDF flattened successfully - all interactive elements converted to static content',
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}
	throw new Error('No response data received from PDF4ME API');
}

async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	try {
		const response = await fetch(pdfUrl);
		if (!response.ok) {
			throw new Error(`Failed to download PDF from URL: ${response.status} ${response.statusText}`);
		}
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const base64Content = buffer.toString('base64');
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid PDF file.');
		}
		console.log(`PDF downloaded successfully: ${buffer.length} bytes`);
		return base64Content;
	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading PDF from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading PDF: ${error.message}`);
		} else {
			throw new Error(`Error downloading PDF from URL: ${error.message}`);
		}
	}
} 