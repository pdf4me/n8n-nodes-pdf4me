import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and other Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const console: any;
declare const require: any;
declare const setTimeout: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Split Type',
		name: 'splitType',
		type: 'options',
		required: true,
		default: 'regular',
		description: 'Choose the type of PDF splitting operation',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
			},
		},
		options: [
			{
				name: 'Regular Split',
				value: 'regular',
				description: 'Split PDF by page numbers or ranges',
			},
			{
				name: 'Split by Barcode',
				value: 'barcode',
				description: 'Split PDF based on barcode detection',
			},
			{
				name: 'Split by Swiss QR',
				value: 'swissQr',
				description: 'Split PDF based on Swiss QR code detection',
			},
			{
				name: 'Split by Text',
				value: 'text',
				description: 'Split PDF based on text content',
			},
		],
	},
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF data',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
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
	// Binary Data Input
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				inputDataType: ['binaryData'],
			},
		},
	},
	// Base64 Input
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
				operation: [ActionConstants.SplitPDF],
				inputDataType: ['base64'],
			},
		},
	},
	// URL Input
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
				operation: [ActionConstants.SplitPDF],
				inputDataType: ['url'],
			},
		},
	},
	// File Path Input
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
				operation: [ActionConstants.SplitPDF],
				inputDataType: ['filePath'],
			},
		},
	},
	// Regular Split Options
	{
		displayName: 'Split Action',
		name: 'splitAction',
		type: 'options',
		required: true,
		default: 'SplitAfterPage',
		description: 'Choose how to split the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['regular'],
			},
		},
		options: [
			{
				name: 'Split After Page',
				value: 'SplitAfterPage',
				description: 'Split after a specific page number',
			},
			{
				name: 'Recurring Split After Page',
				value: 'RecurringSplitAfterPage',
				description: 'Split every N pages',
			},
			{
				name: 'Split Sequence',
				value: 'SplitSequence',
				description: 'Split at specific page numbers',
			},
			{
				name: 'Split Ranges',
				value: 'SplitRanges',
				description: 'Extract specific page ranges',
			},
		],
	},
	{
		displayName: 'Split Action Number',
		name: 'splitActionNumber',
		type: 'number',
		required: true,
		default: 1,
		description: 'Page number for split action (e.g., split after page 1)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['regular'],
				splitAction: ['SplitAfterPage', 'RecurringSplitAfterPage'],
			},
		},
	},
	{
		displayName: 'Split Sequence',
		name: 'splitSequence',
		type: 'string',
		required: true,
		default: '1,3,8',
		description: 'Comma-separated page numbers to split at (e.g., 1,3,8)',
		placeholder: '1,3,8',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['regular'],
				splitAction: ['SplitSequence'],
			},
		},
	},
	{
		displayName: 'Split Ranges',
		name: 'splitRanges',
		type: 'string',
		required: true,
		default: '1-4',
		description: 'Page range to extract (e.g., 1-4 for pages 1 through 4)',
		placeholder: '1-4',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['regular'],
				splitAction: ['SplitRanges'],
			},
		},
	},
	// Barcode Split Options
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode'],
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode'],
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode'],
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode'],
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode'],
			},
		},
	},
	// Swiss QR Split Options
	{
		displayName: 'Split QR Page',
		name: 'splitQRPage',
		type: 'options',
		required: true,
		default: 'after',
		description: 'Where to split relative to the Swiss QR page',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['swissQr'],
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
				operation: [ActionConstants.SplitPDF],
				splitType: ['swissQr'],
			},
		},
	},
	{
		displayName: 'Return As ZIP',
		name: 'returnAsZip',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Whether to return files as a ZIP archive',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['swissQr'],
			},
		},
	},
	// Text Split Options
	{
		displayName: 'Text to Search',
		name: 'textToSearch',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to search for splitting',
		placeholder: 'page 1, line 10.',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['text'],
			},
		},
	},
	{
		displayName: 'Split Text Page',
		name: 'splitTextPage',
		type: 'options',
		required: true,
		default: 'after',
		description: 'Where to split relative to the text page',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['text'],
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
	// Common Options
	{
		displayName: 'File Naming',
		name: 'fileNaming',
		type: 'options',
		required: true,
		default: 'NameAsPerOrder',
		description: 'File naming convention for split files',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['regular', 'text'],
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
		displayName: 'PDF Render DPI',
		name: 'pdfRenderDpi',
		type: 'options',
		required: true,
		default: '150',
		description: 'PDF render DPI for processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
				splitType: ['barcode', 'swissQr'],
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
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'split_output',
		description: 'Name of the output document for reference',
		placeholder: 'split-document',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPDF],
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
				operation: [ActionConstants.SplitPDF],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const splitType = this.getNodeParameter('splitType', index) as string;
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		let responseData: Buffer;

		if (splitType === 'regular') {
			responseData = await handleRegularSplit.call(this, index, inputDataType, docName, advancedOptions);
		} else if (splitType === 'barcode') {
			responseData = await handleBarcodeSplit.call(this, index, inputDataType, advancedOptions);
		} else if (splitType === 'swissQr') {
			responseData = await handleSwissQRSplit.call(this, index, inputDataType, advancedOptions);
		} else if (splitType === 'text') {
			responseData = await handleTextSplit.call(this, index, inputDataType, advancedOptions);
		} else {
			throw new Error(`Unsupported split type: ${splitType}`);
		}

		// Handle the binary response (split PDF files data)
		if (responseData) {
			// Generate filename based on split type
			const baseName = docName || 'split_output';
			const fileName = `${baseName}.pdf`;

			// responseData is already binary data (Buffer)
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				fileName,
				'application/pdf',
			);

			return [
				{
					json: {
						fileName,
						mimeType: 'application/pdf',
						fileSize: responseData.length,
						success: true,
						splitType,
						inputFileCount: 1,
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}

		// Error case
		throw new Error('No response data received from PDF4ME API');
	} catch (error) {
		// Re-throw the error with additional context
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`PDF split operation failed: ${errorMessage}`);
	}
}

async function handleRegularSplit(this: IExecuteFunctions, index: number, inputDataType: string, docName: string, advancedOptions: IDataObject): Promise<Buffer> {
	const splitAction = this.getNodeParameter('splitAction', index) as string;
	const fileNaming = this.getNodeParameter('fileNaming', index) as string;

	let pdfContentBase64: string;

	// Get PDF content based on input type
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

	// Build the request body for regular split
	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName,
		splitAction,
		fileNaming,
	};

	// Add split-specific parameters
	if (splitAction === 'SplitAfterPage' || splitAction === 'RecurringSplitAfterPage') {
		const splitActionNumber = this.getNodeParameter('splitActionNumber', index) as number;
		body.splitActionNumber = splitActionNumber;
	} else if (splitAction === 'SplitSequence') {
		const splitSequence = this.getNodeParameter('splitSequence', index) as string;
		const sequenceArray = splitSequence.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
		if (sequenceArray.length === 0) {
			throw new Error('Invalid split sequence. Please provide comma-separated page numbers.');
		}
		body.splitSequence = sequenceArray;
	} else if (splitAction === 'SplitRanges') {
		const splitRanges = this.getNodeParameter('splitRanges', index) as string;
		if (!splitRanges || splitRanges.trim() === '') {
			throw new Error('Split ranges are required');
		}
		body.splitRanges = splitRanges.trim();
	}

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	return await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdf', body);
}

async function handleBarcodeSplit(this: IExecuteFunctions, index: number, inputDataType: string, advancedOptions: IDataObject): Promise<Buffer> {
	const barcodeString = this.getNodeParameter('barcodeString', index) as string;
	const barcodeFilter = this.getNodeParameter('barcodeFilter', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const splitBarcodePage = this.getNodeParameter('splitBarcodePage', index) as string;
	const combinePagesWithSameConsecutiveBarcodes = this.getNodeParameter('combinePagesWithSameConsecutiveBarcodes', index) as boolean;
	const pdfRenderDpi = this.getNodeParameter('pdfRenderDpi', index) as string;

	let pdfContentBase64: string;

	// Get PDF content based on input type
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

	// Build the request body for barcode split
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

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	return await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfByBarcode_old', body);
}

async function handleSwissQRSplit(this: IExecuteFunctions, index: number, inputDataType: string, advancedOptions: IDataObject): Promise<Buffer> {
	const splitQRPage = this.getNodeParameter('splitQRPage', index) as string;
	const pdfRenderDpi = this.getNodeParameter('pdfRenderDpi', index) as string;
	const combinePagesWithSameBarcodes = this.getNodeParameter('combinePagesWithSameBarcodes', index) as boolean;
	const returnAsZip = this.getNodeParameter('returnAsZip', index) as boolean;

	let pdfContentBase64: string;

	// Get PDF content based on input type
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

	// Build the request body for Swiss QR split
	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName: 'SwissQR.pdf',
		splitQRPage,
		pdfRenderDpi,
		combinePagesWithSameBarcodes,
		returnAsZip,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	return await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdfBySwissQR', body);
}

async function handleTextSplit(this: IExecuteFunctions, index: number, inputDataType: string, advancedOptions: IDataObject): Promise<Buffer> {
	const textToSearch = this.getNodeParameter('textToSearch', index) as string;
	const splitTextPage = this.getNodeParameter('splitTextPage', index) as string;
	const fileNaming = this.getNodeParameter('fileNaming', index) as string;

	let pdfContentBase64: string;

	// Get PDF content based on input type
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

	// Build the request body for text split
	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName: 'sample.pdf',
		text: textToSearch,
		splitTextPage,
		fileNaming,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	return await pdf4meAsyncRequest.call(this, '/api/v2/SplitByText', body);
}

/**
 * Download PDF from URL and convert to base64
 */
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	const https = require('https');
	const http = require('http');

	const parsedUrl = new URL(pdfUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	// Set up request options with timeout and user agent
	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000, // 30 seconds timeout
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'application/pdf,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			// Check for redirects
			if (res.statusCode >= 300 && res.statusCode < 400) {
				const location = res.headers.location;
				if (location) {
					reject(new Error(
						`URL redirects to: ${location}\n` +
						`Please use the final URL directly instead of the redirecting URL.`
					));
					return;
				}
			}

			// Check for error status codes
			if (res.statusCode !== 200) {
				reject(new Error(
					`HTTP Error ${res.statusCode}: ${res.statusMessage}\n` +
					`The server returned an error instead of the PDF file. ` +
					`This might indicate:\n` +
					`- The file doesn't exist\n` +
					`- Authentication is required\n` +
					`- The URL is incorrect\n` +
					`- Server is experiencing issues`
				));
				return;
			}

			const chunks: any[] = [];
			let totalSize = 0;

			res.on('data', (chunk: any) => {
				chunks.push(chunk);
				totalSize += chunk.length;
				
				// Check if we're getting too much data (likely HTML error page)
				if (totalSize > 1024 * 1024) { // 1MB limit
					req.destroy();
					reject(new Error(
						`Downloaded content is too large (${totalSize} bytes). ` +
						`This might be an HTML error page instead of a PDF file. ` +
						`Please check the URL and ensure it points directly to a PDF file.`
					));
				}
			});

			res.on('end', () => {
				if (totalSize === 0) {
					reject(new Error('Downloaded file is empty. Please check the URL.'));
					return;
				}

				// Combine chunks and convert to base64
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');

				// Validate the PDF content
				if (base64Content.length < 100) {
					reject(new Error(
						`Downloaded file is too small (${base64Content.length} base64 chars). ` +
						`Please ensure the URL points to a valid PDF file.`
					));
					return;
				}

				// Check if it starts with PDF header
				const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
				if (!decodedContent.startsWith('%PDF')) {
					// Try to get more info about what we actually downloaded
					const first100Chars = Buffer.from(base64Content, 'base64').toString('ascii', 0, 100);
					const isHtml = first100Chars.toLowerCase().includes('<html') || 
								  first100Chars.toLowerCase().includes('<!doctype');
					
					let errorMessage = `The downloaded file does not appear to be a valid PDF file. ` +
						`PDF files should start with "%PDF".\n\n` +
						`Downloaded content starts with: "${decodedContent}"\n\n`;

					if (isHtml) {
						errorMessage += `The downloaded content appears to be HTML (likely an error page). ` +
							`This usually means:\n` +
							`1. The URL requires authentication\n` +
							`2. The file doesn't exist\n` +
							`3. The server is returning an error page\n` +
							`4. The URL is incorrect\n\n` +
							`Please check the URL and ensure it points directly to a PDF file.`;
					} else {
						errorMessage += `This might indicate:\n` +
							`1. The file is corrupted\n` +
							`2. The URL points to a different file type\n` +
							`3. The server is not serving the file correctly\n\n` +
							`Please verify the URL and try again.`;
					}

					reject(new Error(errorMessage));
					return;
				}

				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Download timeout. The server took too long to respond.'));
		});

		req.end();
	});
}

/**
 * Read PDF from local file path and convert to base64
 */
async function readPdfFromFile(filePath: string): Promise<string> {
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');
		
		// Validate the PDF content
		if (base64Content.length < 100) {
			throw new Error('PDF file appears to be too small. Please ensure the file is a valid PDF.');
		}
		
		// Check if it starts with PDF header
		const decodedContent = Buffer.from(base64Content, 'base64').toString('ascii', 0, 10);
		if (!decodedContent.startsWith('%PDF')) {
			throw new Error('The file does not appear to be a valid PDF file. PDF files should start with "%PDF".');
		}
		
		return base64Content;
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
}
