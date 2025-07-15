import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	sanitizeProfiles,
	ActionConstants,
	pdf4meAsyncRequest,
} from '../GenericFunctions';
import JSZip from 'jszip';
const fs = require('fs');
const path = require('path');

declare const Buffer: any;
declare const require: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF data',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
			},
		},
		options: [
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF file from previous nodes',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to PDF file',
			},
		],
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the PDF file',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Split QR Page',
		name: 'splitQRPage',
		type: 'options',
		required: true,
		default: 'after',
		description: 'Where to split relative to the Swiss QR page',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
			},
		},
		options: [
			{
				name: 'After',
				value: 'after',
			},
			{
				name: 'Before',
				value: 'before',
			},
		],
	},
	{
		displayName: 'Combine Pages With Same Barcodes',
		name: 'combinePagesWithSameBarcodes',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether to combine consecutive pages with the same QR code',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
			},
		},
	},
	{
		displayName: 'PDF Render DPI',
		name: 'pdfRenderDpi',
		type: 'options',
		required: true,
		default: '150',
		description: 'PDF render DPI for processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
			},
		},
		options: [
			{
				name: '100 DPI',
				value: '100',
			},
			{
				name: '150 DPI',
				value: '150',
			},
			{
				name: '200 DPI',
				value: '200',
			},
			{
				name: '250 DPI',
				value: '250',
			},
		],
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfBySwissQR],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const splitQRPage = this.getNodeParameter('splitQRPage', index) as string;
	const pdfRenderDpi = this.getNodeParameter('pdfRenderDpi', index) as string;
	const combinePagesWithSameBarcodes = this.getNodeParameter('combinePagesWithSameBarcodes', index) as boolean;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let pdfContentBase64: string;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		pdfContentBase64 = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		pdfContentBase64 = this.getNodeParameter('base64Content', index) as string;
		if (!pdfContentBase64 || pdfContentBase64.trim() === '') {
			throw new Error('Base64 content is required');
		}
		pdfContentBase64 = pdfContentBase64.trim();
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}
		pdfContentBase64 = await downloadPdfFromUrl(pdfUrl.trim());
	} else if (inputDataType === 'filePath') {
		const filePath = this.getNodeParameter('filePath', index) as string;
		if (!filePath || filePath.trim() === '') {
			throw new Error('File path is required');
		}
		pdfContentBase64 = await readPdfFromFile(filePath.trim());
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName: 'SwissQR.pdf',
		splitQRPage,
		pdfRenderDpi,
		combinePagesWithSameBarcodes,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Call the PDF4me SplitPdfBySwissQR endpoint
	const response = await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfBySwissQR', body);

	// --- BEGIN: Buffer/String Response Parsing ---
	let parsedResponse = response;
	if (Buffer.isBuffer(response)) {
		try {
			parsedResponse = JSON.parse(response.toString('utf8'));
		} catch (e) {
			parsedResponse = response;
		}
	} else if (typeof response === 'string') {
		try {
			parsedResponse = JSON.parse(response);
		} catch {
			parsedResponse = response;
		}
	}
	// --- END: Buffer/String Response Parsing ---

	// --- BEGIN: Response Debug Logging ---
	const debugLog: any = {
		timestamp: new Date().toISOString(),
		typeof: typeof parsedResponse,
	};
	if (Buffer.isBuffer(response)) {
		debugLog.type = 'Buffer';
		debugLog.firstBytesHex = response.slice(0, 8).toString('hex');
		debugLog.firstBytesAscii = response.slice(0, 8).toString('ascii');
		debugLog.length = response.length;
	} else if (typeof response === 'string') {
		debugLog.type = 'string';
		debugLog.length = response.length;
		debugLog.first200 = response.substring(0, 200);
		try {
			const buffer = Buffer.from(response, 'base64');
			debugLog.base64FirstBytesHex = buffer.slice(0, 8).toString('hex');
			debugLog.base64FirstBytesAscii = buffer.slice(0, 8).toString('ascii');
		} catch {
			// Ignore buffer conversion errors for debugging
		}
	} else if (Array.isArray(parsedResponse)) {
		debugLog.type = 'array';
		debugLog.length = parsedResponse.length;
		debugLog.firstItemKeys = parsedResponse[0] ? Object.keys(parsedResponse[0]) : [];
	} else if (typeof parsedResponse === 'object' && parsedResponse !== null) {
		debugLog.type = 'object';
		debugLog.keys = Object.keys(parsedResponse);
		debugLog.preview = JSON.stringify(parsedResponse, null, 2).substring(0, 500);
	} else {
		debugLog.type = typeof parsedResponse;
	}
	const debugPath = path.join('/tmp', 'pdf4me_split_swissqr_response_debug.json');
	try {
		fs.writeFileSync(debugPath, JSON.stringify(debugLog, null, 2));
	} catch (e) {
		// Ignore file write errors for debugging
	}
	// --- END: Response Debug Logging ---

	// --- BEGIN: Robust Response Handling ---
	const binaryData: { [key: string]: any } = {};
	const filesSummary: any[] = [];
	let totalFiles = 0;
	let outputDirectory = '';
	let folderName = '';
	const sourcePdf = 'SwissQR.pdf';
	let responseType = '';

	// If response is a ZIP (Buffer or base64 string)
	const isZip = (buf: Buffer) => buf.slice(0, 4).toString('hex') === '504b0304';

	const extractZipAndPrepareBinary = async (zipBuffer: Buffer) => {
		const zip = await JSZip.loadAsync(zipBuffer);
		let idx = 1;
		for (const fileName of Object.keys(zip.files)) {
			const file = zip.files[fileName];
			if (!file.dir && fileName.toLowerCase().endsWith('.pdf')) {
				const buffer = await file.async('nodebuffer');
				const binaryKey = `file_${idx}`;
				binaryData[binaryKey] = await this.helpers.prepareBinaryData(buffer, fileName, 'application/pdf');
				filesSummary.push({
					fileName,
					pageIndex: idx,
					binaryProperty: binaryKey,
					mimeType: 'application/pdf',
					fileType: 'PDF file',
					fileSize: buffer.length,
				});
				idx++;
			}
		}
		totalFiles = filesSummary.length;
		responseType = 'ZIP of PDFs';
	};

	if (Buffer.isBuffer(response) && isZip(response)) {
		await extractZipAndPrepareBinary.call(this, response);
	} else if (typeof response === 'string') {
		// Check if base64 ZIP
		try {
			const buffer = Buffer.from(response, 'base64');
			if (isZip(buffer)) {
				await extractZipAndPrepareBinary.call(this, buffer);
			}
		} catch {
			// Ignore base64 conversion errors
		}
	}

	if (filesSummary.length === 0) {
		// Try legacy array/object response
		if (Array.isArray(parsedResponse)) {
			let idx = 1;
			for (const doc of parsedResponse) {
				if (doc.docContent && doc.docName) {
					const buffer = Buffer.from(doc.docContent, 'base64');
					const binaryKey = `file_${idx}`;
					binaryData[binaryKey] = await this.helpers.prepareBinaryData(buffer, doc.docName, 'application/pdf');
					filesSummary.push({
						fileName: doc.docName,
						pageIndex: idx,
						binaryProperty: binaryKey,
						mimeType: 'application/pdf',
						fileType: 'PDF file',
						fileSize: buffer.length,
					});
					idx++;
				}
			}
			totalFiles = filesSummary.length;
			responseType = 'Multiple PDFs (legacy array)';
		} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.splitedDocuments) {
			let idx = 1;
			for (const doc of parsedResponse.splitedDocuments) {
				if (doc.streamFile && doc.fileName) {
					const buffer = Buffer.from(doc.streamFile, 'base64');
					const binaryKey = `file_${idx}`;
					binaryData[binaryKey] = await this.helpers.prepareBinaryData(buffer, doc.fileName, 'application/pdf');
					filesSummary.push({
						fileName: doc.fileName,
						pageIndex: idx,
						binaryProperty: binaryKey,
						mimeType: 'application/pdf',
						fileType: 'PDF file',
						fileSize: buffer.length,
					});
					idx++;
				}
			}
			totalFiles = filesSummary.length;
			responseType = 'Multiple PDFs (splitedDocuments)';
		} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.docContent && parsedResponse.docName) {
			const buffer = Buffer.from(parsedResponse.docContent, 'base64');
			binaryData['file_1'] = await this.helpers.prepareBinaryData(buffer, parsedResponse.docName, 'application/pdf');
			filesSummary.push({
				fileName: parsedResponse.docName,
				pageIndex: 1,
				binaryProperty: 'file_1',
				mimeType: 'application/pdf',
				fileType: 'PDF file',
				fileSize: buffer.length,
			});
			totalFiles = 1;
			responseType = 'Single PDF (legacy)';
		} else {
			// Unexpected response: save for debugging
			const debugPath = path.join('/tmp', 'pdf4me_split_swissqr_raw_response.json');
			try {
				fs.writeFileSync(debugPath, JSON.stringify(parsedResponse, null, 2));
			} catch (e) {
				// Ignore file write errors for debugging
			}
			throw new Error('Unexpected response format from PDF4me SplitPdfBySwissQR API. Raw response saved to /tmp/pdf4me_split_swissqr_raw_response.json');
		}
	}

	folderName = `${sourcePdf.replace(/\.pdf$/i, '')}_split_swissqr_outputs`;
	outputDirectory = `/tmp/${folderName}`;

	const output = {
		json: {
			success: true,
			message: `PDF split into ${totalFiles} file(s) successfully`,
			folderName,
			outputDirectory,
			totalFiles,
			sourcePdf,
			responseType,
			files: filesSummary,
		},
		binary: binaryData,
	};

	return [output];
}

// Helper functions for downloading and reading files
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	try {
		const axios = require('axios');
		const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
		return Buffer.from(response.data).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download PDF from URL: ${error.message}`);
	}
}

async function readPdfFromFile(filePath: string): Promise<string> {
	try {
		const fs = require('fs');
		const fileBuffer = fs.readFileSync(filePath);
		return fileBuffer.toString('base64');
	} catch (error) {
		throw new Error(`Failed to read PDF file from path: ${error.message}`);
	}
}