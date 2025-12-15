import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'PDF Input Data Type',
		name: 'pdfInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to PDF file',
			},
		],
	},
	{
		displayName: 'PDF Binary Field',
		name: 'pdfBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
				pdfInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'PDF Base64 Content',
		name: 'pdfBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
				pdfInputDataType: ['base64'],
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
				operation: [ActionConstants.ConvertPdfToEditableOcr],
				pdfInputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Quality Type',
		name: 'qualityType',
		type: 'options',
		required: true,
		default: 'Draft',
		description: 'Choose the quality type for OCR processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
		options: [
			{
				name: 'Draft',
				value: 'Draft',
				description: 'Suitable for normal PDFs, consumes 1 API call per file',
			},
			{
				name: 'High',
				value: 'High',
				description: 'Suitable for PDFs generated from Images and scanned documents. Consumes 2 API calls per page',
			},
		],
		hint: 'Convert PDF to editable PDF using OCR. See our <b><a href="https://docs.pdf4me.com/n8n/find-search/convert-pdf-to-editable-pdf-using-ocr/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'OCR Only When Needed',
		name: 'ocrWhenNeeded',
		type: 'options',
		required: true,
		default: 'true',
		description: 'Set to skip recognition if text is already searchable',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
		options: [
			{
				name: 'True',
				value: 'true',
				description: 'Skip recognition if text is already searchable',
			},
			{
				name: 'False',
				value: 'false',
				description: 'Always perform OCR regardless of existing text',
			},
		],
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'English',
		description: 'Language of the text in the source file. Only use if output is not recognizable',
		placeholder: 'English',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'string',
		required: true,
		default: 'true',
		description: 'Output format (must be in string format)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Merge All Sheets',
		name: 'mergeAllSheets',
		type: 'boolean',
		default: true,
		description: 'Merge all sheets if applicable',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'editable_pdf_output.pdf',
		description: 'Name for the output editable PDF file',
		placeholder: 'my-editable-pdf.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'editable-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertPdfToEditableOcr],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// PDF input
	const pdfInputDataType = this.getNodeParameter('pdfInputDataType', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	let docContent: string;
	let docName: string = 'input.pdf';
	let blobId: string = '';
	let inputDocName: string = '';

	if (pdfInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('pdfBinaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || 'input.pdf';
		docName = inputDocName;

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ConvertOcrPdf API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (pdfInputDataType === 'base64') {
		docContent = this.getNodeParameter('pdfBase64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (pdfInputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(pdfUrl);
		docName = pdfUrl.split('/').pop() || 'input.pdf';
	} else {
		throw new Error(`Unsupported PDF input data type: ${pdfInputDataType}`);
	}

	// Validate content based on input type
	if (pdfInputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (pdfInputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	} else if (pdfInputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	// Other parameters
	const qualityType = this.getNodeParameter('qualityType', index) as string;
	const ocrWhenNeeded = this.getNodeParameter('ocrWhenNeeded', index) as string;
	const language = this.getNodeParameter('language', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const mergeAllSheets = this.getNodeParameter('mergeAllSheets', index) as boolean;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;

	// Build the request body
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'input.pdf';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		qualityType,
		ocrWhenNeeded,
		outputFormat,
		mergeAllSheets,
		IsAsync: true,
	};

	// Add language only if it's not empty
	if (language && language.trim() !== '') {
		body.language = language;
	}

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertOcrPdf', body);

	// Return the result as binary data (PDF)
	const mimeType = 'application/pdf';
	const binaryData = await this.helpers.prepareBinaryData(
		result,
		outputFileName,
		mimeType,
	);

	// Determine the binary data name
	const binaryDataKey = binaryDataName || 'data';

	return [
		{
			json: {
				success: true,
				message: 'PDF converted to editable PDF using OCR successfully',
				fileName: outputFileName,
				mimeType,
				fileSize: result.length,
				qualityType,
				ocrWhenNeeded,
				language: language || 'Not specified',
				mergeAllSheets,
			},
			binary: {
				[binaryDataKey]: binaryData,
			},
		},
	];
}
