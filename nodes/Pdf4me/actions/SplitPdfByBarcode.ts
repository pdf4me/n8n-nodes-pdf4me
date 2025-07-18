import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	sanitizeProfiles,
	ActionConstants,
	pdf4meAsyncRequest,
} from '../GenericFunctions';

declare const Buffer: any;

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
				operation: [ActionConstants.SplitPdfByBarcode],
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
				operation: [ActionConstants.SplitPdfByBarcode],
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
				operation: [ActionConstants.SplitPdfByBarcode],
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
				operation: [ActionConstants.SplitPdfByBarcode],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Barcode String',
		name: 'barcodeString',
		type: 'string',
		required: true,
		default: '',
		description: 'Barcode string to search for',
		placeholder: 'Test PDF Barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
			},
		},
	},
	{
		displayName: 'Barcode Filter',
		name: 'barcodeFilter',
		type: 'options',
		required: true,
		default: 'startsWith',
		description: 'Filter type for barcode matching',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
			},
		},
		options: [
			{
				name: 'Starts With',
				value: 'startsWith',
			},
			{
				name: 'Ends With',
				value: 'endsWith',
			},
			{
				name: 'Contains',
				value: 'contains',
			},
			{
				name: 'Exact Match',
				value: 'exact',
			},
		],
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		required: true,
		default: 'any',
		description: 'Type of barcode to detect',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
			},
		},
		options: [
			{
				name: 'Any',
				value: 'any',
			},
			{
				name: 'Data Matrix',
				value: 'datamatrix',
			},
			{
				name: 'QR Code',
				value: 'qrcode',
			},
			{
				name: 'PDF417',
				value: 'pdf417',
			},
		],
	},
	{
		displayName: 'Split Barcode Page',
		name: 'splitBarcodePage',
		type: 'options',
		required: true,
		default: 'after',
		description: 'Where to split relative to the barcode page',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
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
			{
				name: 'Remove',
				value: 'remove',
			},
		],
	},
	{
		displayName: 'Combine Pages With Same Consecutive Barcodes',
		name: 'combinePagesWithSameConsecutiveBarcodes',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether to combine consecutive pages with the same barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
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
				operation: [ActionConstants.SplitPdfByBarcode],
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
				operation: [ActionConstants.SplitPdfByBarcode],
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
	const barcodeString = this.getNodeParameter('barcodeString', index) as string;
	const barcodeFilter = this.getNodeParameter('barcodeFilter', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const splitBarcodePage = this.getNodeParameter('splitBarcodePage', index) as string;
	const combinePagesWithSameConsecutiveBarcodes = this.getNodeParameter('combinePagesWithSameConsecutiveBarcodes', index) as boolean;
	const pdfRenderDpi = this.getNodeParameter('pdfRenderDpi', index) as string;
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
		try {
			const response = await this.helpers.request({
				method: 'GET',
				url: pdfUrl.trim(),
				encoding: null,
			});
			pdfContentBase64 = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download PDF from URL: ${error.message}`);
		}
	} else if (inputDataType === 'filePath') {
		throw new Error('File path input is not supported. Please use binary data, base64 string, or URL instead.');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName: 'output.pdf',
		barcodeString,
		barcodeFilter,
		barcodeType,
		splitBarcodePage,
		combinePagesWithSameConsecutiveBarcodes,
		pdfRenderDpi,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Call the PDF4me SplitPdfByBarcode endpoint
	const response = await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfByBarcode_old', body);

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
	// Debug logging removed due to n8n restrictions
	// --- END: Response Debug Logging ---

	// --- BEGIN: Robust Response Handling ---
	const binaryData: { [key: string]: any } = {};
	const filesSummary: any[] = [];
	let totalFiles = 0;
	let outputDirectory = '';
	let folderName = '';
	const sourcePdf = 'output.pdf';
	let responseType = '';

	// If response is a ZIP (Buffer or base64 string)
	const isZip = (buf: Buffer) => buf.slice(0, 4).toString('hex') === '504b0304';

	const extractZipAndPrepareBinary = async () => {
		throw new Error('ZIP file processing is not supported in this version. Please use an alternative API response format.');
	};

	if (Buffer.isBuffer(response) && isZip(response)) {
		await extractZipAndPrepareBinary.call(this);
	} else if (typeof response === 'string') {
		// Check if base64 ZIP
		try {
			const buffer = Buffer.from(response, 'base64');
			if (isZip(buffer)) {
				await extractZipAndPrepareBinary.call(this);
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
			// Unexpected response: debug logging removed due to n8n restrictions
			throw new Error('Unexpected response format from PDF4me SplitPdfByBarcode API.');
		}
	}

	folderName = `${sourcePdf.replace(/\.pdf$/i, '')}_split_barcode_outputs`;
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


