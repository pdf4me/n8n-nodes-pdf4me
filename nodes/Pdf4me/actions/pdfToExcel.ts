import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles
} from '../GenericFunctions';

declare const Buffer: any;
declare const setTimeout: any;
declare const require: any;
declare const URL: any;
declare const console: any;
declare const fetch: any;

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('pdfToExcelInputDataType', index) as string;
	const outputFileName = this.getNodeParameter('pdfToExcelOutputFileName', index) as string;
	const docName = this.getNodeParameter('pdfToExcelDocName', index) as string;
	const advancedOptions = this.getNodeParameter('pdfToExcelAdvancedOptions', index) as IDataObject;

	let docContent: string;
	let originalFileName = docName;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfToExcelBinaryPropertyName', index) as string;
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
		docContent = this.getNodeParameter('pdfToExcelBase64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfToExcelUrl', index) as string;
		try {
			new URL(pdfUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}
		console.log(`Downloading PDF from URL: ${pdfUrl}`);
		docContent = await downloadPdfFromUrl(pdfUrl);
		console.log('PDF file successfully downloaded and encoded to base64');
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('pdfToExcelFilePath', index) as string;
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
		qualityType: 'Draft',
		mergeAllSheets: true,
		language: 'English',
		outputFormat: true,
		ocrWhenNeeded: true,
		async: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertPdfToExcel', body);

	if (responseData) {
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'pdf_to_excel_output';
			fileName = `${baseName}.xlsx`;
		}
		if (!fileName.includes('.')) {
			fileName = `${fileName}.xlsx`;
		}
		let excelBuffer: any;
		if (Buffer.isBuffer(responseData)) {
			excelBuffer = responseData;
		} else if (typeof responseData === 'string') {
			excelBuffer = Buffer.from(responseData, 'base64');
		} else {
			excelBuffer = Buffer.from(responseData as any);
		}
		if (!excelBuffer || excelBuffer.length < 100) {
			throw new Error('Invalid Excel response from API. The converted file appears to be too small or corrupted.');
		}
		const binaryData = await this.helpers.prepareBinaryData(
			excelBuffer,
			fileName,
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		return [
			{
				json: {
					fileName,
					fileSize: excelBuffer.length,
					success: true,
					originalFileName,
					message: 'PDF converted to Excel successfully',
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