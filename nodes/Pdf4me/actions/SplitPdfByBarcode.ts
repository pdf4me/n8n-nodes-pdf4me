import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	sanitizeProfiles,
	ActionConstants,
	pdf4meAsyncRequest,
	uploadBlobToPdf4me,
} from '../GenericFunctions';


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
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		description: 'Name of the input file (including extension). If not provided, will use the filename from binary data.',
		placeholder: 'document.pdf',
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
		default: '',
		required: true,
		description: 'Base64 encoded content of the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the PDF file',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input file (including extension)',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
				inputDataType: ['base64', 'url'],
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
		hint: 'Split PDF by barcode. See our <b><a href="https://docs.pdf4me.com/n8n/merge-split/split-pdf-barcode/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		displayName: 'File Naming',
		name: 'fileNaming',
		type: 'options',
		required: true,
		default: 'NameAsPerOrder',
		description: 'File naming convention for split files',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
			},
		},
		options: [
			{
				name: 'Name As Per Order',
				value: 'NameAsPerOrder',
			},
			{
				name: 'Name As Per Page',
				value: 'NameAsPerPage',
			},
		],
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfByBarcode],
			},
		},
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
	const fileNaming = this.getNodeParameter('fileNaming', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main document content and metadata
	let pdfContentBase64: string = '';
	let inputDocName: string = '';
	let blobId: string = '';

	// Handle different input types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);

		// Check if item exists and has data
		if (!item || !item[0]) {
			throw new Error('No input data found. Please ensure the previous node provides data.');
		}

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = inputFileName || binaryData.fileName || 'document';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in SplitPdfByBarcode API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in pdfContentBase64
		pdfContentBase64 = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Base64 input
		pdfContentBase64 = this.getNodeParameter('base64Content', index) as string;
		inputDocName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!inputDocName) {
			throw new Error('Input file name is required for base64 input type.');
		}

		if (!pdfContentBase64 || pdfContentBase64.trim() === '') {
			throw new Error('Base64 content is required');
		}

		// Handle data URLs (remove data: prefix if present)
		if (pdfContentBase64.includes(',')) {
			pdfContentBase64 = pdfContentBase64.split(',')[1];
		}
		pdfContentBase64 = pdfContentBase64.trim();

		blobId = '';
	} else if (inputDataType === 'url') {
		// URL input - send URL as string directly in docContent
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		inputDocName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!inputDocName) {
			throw new Error('Input file name is required for URL input type.');
		}

		if (!fileUrl || fileUrl.trim() === '') {
			throw new Error('File URL is required');
		}

		// Validate URL format
		try {
			new URL(fileUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in pdfContentBase64 - no download or conversion
		blobId = '';
		pdfContentBase64 = String(fileUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!pdfContentBase64 || typeof pdfContentBase64 !== 'string' || pdfContentBase64.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!pdfContentBase64 || pdfContentBase64.trim() === '') {
			throw new Error('Document content is required');
		}
		// Validate base64 format for base64 input
			try {
				const testBuffer = Buffer.from(pdfContentBase64, 'base64');
				if (testBuffer.length === 0 && pdfContentBase64.length > 0) {
					throw new Error('Invalid base64 content: Unable to decode base64 string');
				}
			} catch (error) {
				if (error instanceof Error && error.message.includes('Invalid base64')) {
					throw error;
				}
				throw new Error('Invalid base64 content format');
			}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!pdfContentBase64 || pdfContentBase64.trim() === '') {
			throw new Error('Document content is required');
		}
	}

	// Use inputDocName for docName in the request
	const docNameForRequest = inputDocName || 'output.pdf';

	const body: IDataObject = {
		docContent: pdfContentBase64, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: docNameForRequest,
		barcodeString,
		barcodeFilter,
		barcodeType,
		splitBarcodePage,
		combinePagesWithSameConsecutiveBarcodes,
		pdfRenderDpi,
		fileNaming,
		IsAsync: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	// Call the PDF4me SplitPdfByBarcode endpoint
	let response;
	try {
		response = await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfByBarcode_old', body);
	} catch (error: unknown) {
		// Provide better error messages with debugging information
		const errorObj = error as { statusCode?: number; message?: string };
		if (errorObj.statusCode === 500) {
			throw new Error(
				`PDF4Me server error (500): ${errorObj.message || 'The service was not able to process your request.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${docNameForRequest}, ` +
				`docContentLength=${pdfContentBase64?.length || 0}, ` +
				`docContentType=${typeof pdfContentBase64 === 'string' && pdfContentBase64.startsWith('http') ? 'URL' : inputDataType === 'binaryData' ? 'blobId' : 'base64'}`
			);
		} else if (errorObj.statusCode === 400) {
			throw new Error(
				`Bad request (400): ${errorObj.message || 'Please check your parameters.'} ` +
				`| Debug: inputDataType=${inputDataType}, docName=${docNameForRequest}`
			);
		}
		throw error;
	}

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
	const sourcePdf = inputDocName || docNameForRequest || 'output.pdf';
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
					const binaryKey = `${binaryDataName || 'data'}_${idx}`;
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
					const binaryKey = `${binaryDataName || 'data'}_${idx}`;
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
			binaryData[`${binaryDataName || 'data'}_1`] = await this.helpers.prepareBinaryData(buffer, parsedResponse.docName, 'application/pdf');
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
			// Debug logging removed due to n8n restrictions
			throw new Error('Unexpected response format from PDF4me SplitPdfByBarcode API. Raw response saved to /tmp/pdf4me_split_barcode_raw_response.json');
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


