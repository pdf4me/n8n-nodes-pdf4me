import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	// Feature selector
	{
		displayName: 'Find & Search Feature',
		name: 'findSearchFeature',
		type: 'options',
		default: 'convertPdfToEditableOcr',
		description: 'Select the feature to use',
		options: [
			{ name: 'Convert PDF to Editable PDF (OCR)', value: 'convertPdfToEditableOcr' },
			{ name: 'Find and Replace Text', value: 'findAndReplaceText' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
			},
		},
	},
	// --- Common PDF input for both features ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input PDF',
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use binary data from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide base64 encoded PDF' },
			{ name: 'URL', value: 'url', description: 'Provide a URL to the PDF' },
			{ name: 'Local Path', value: 'localPath', description: 'Provide a local file path to the PDF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		required: true,
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				inputType: ['localPath'],
			},
		},
	},
	// --- Convert PDF to Editable PDF (OCR) ---
	{
		displayName: 'Quality Type',
		name: 'qualityType',
		type: 'options',
		default: 'Draft',
		description: 'OCR quality: Draft (normal PDFs) or High (scanned/images)',
		options: [
			{ name: 'Draft', value: 'Draft' },
			{ name: 'High', value: 'High' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['convertPdfToEditableOcr'],
			},
		},
	},
	{
		displayName: 'OCR When Needed',
		name: 'ocrWhenNeeded',
		type: 'boolean',
		default: true,
		description: 'Whether to only perform OCR if text is not already searchable',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['convertPdfToEditableOcr'],
			},
		},
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'string',
		default: 'English',
		description: 'Language of the text in the PDF (e.g., English, Spanish, French)',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['convertPdfToEditableOcr'],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'boolean',
		default: true,
		description: 'Whether to use standard output format',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['convertPdfToEditableOcr'],
			},
		},
	},
	{
		displayName: 'Merge All Sheets',
		name: 'mergeAllSheets',
		type: 'boolean',
		default: true,
		description: 'Whether to merge all sheets if applicable',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['convertPdfToEditableOcr'],
			},
		},
	},
	// --- Find and Replace Text ---
	{
		displayName: 'Old Text',
		name: 'oldText',
		type: 'string',
		default: '',
		required: true,
		description: 'Text to search for in the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['findAndReplaceText'],
			},
		},
	},
	{
		displayName: 'New Text',
		name: 'newText',
		type: 'string',
		default: '',
		required: true,
		description: 'Text to replace with',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['findAndReplaceText'],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: '',
		description: 'Page indices as comma-separated values or ranges (e.g., "0,1,2-" or "1,2,3-7")',
		displayOptions: {
			show: {
				operation: [ActionConstants.FindSearch],
				findSearchFeature: ['findAndReplaceText'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('findSearchFeature', index) as string;

	if (operation !== ActionConstants.FindSearch) {
		throw new Error('This action only supports the Find and Search operation.');
	}

	// --- Common PDF input handling ---
	const inputType = this.getNodeParameter('inputType', index) as string;
	let pdfContent: string;
	let pdfName: string;
	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error('No binary data found in the input.');
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		pdfContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		pdfName = inputFileName || binaryData.fileName || 'document.pdf';
	} else if (inputType === 'base64') {
		pdfContent = this.getNodeParameter('base64Content', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		pdfContent = Buffer.from(response).toString('base64');
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		pdfContent = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported input type: ${inputType}`);
	}

	if (feature === 'convertPdfToEditableOcr') {
		const qualityType = this.getNodeParameter('qualityType', index) as string;
		const ocrWhenNeeded = this.getNodeParameter('ocrWhenNeeded', index) as boolean;
		const language = this.getNodeParameter('language', index) as string;
		const outputFormat = this.getNodeParameter('outputFormat', index) as boolean;
		const mergeAllSheets = this.getNodeParameter('mergeAllSheets', index) as boolean;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			qualityType,
			ocrWhenNeeded: ocrWhenNeeded ? 'true' : 'false',
			language,
			outputFormat: outputFormat ? 'true' : 'false',
			isAsync: true,
			mergeAllSheets,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertOcrPdf', payload);
		if (responseData) {
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				'editable_PDF_output.pdf',
				'application/pdf',
			);
			return [
				{
					json: {
						fileName: 'editable_PDF_output.pdf',
						mimeType: 'application/pdf',
						fileSize: responseData.length,
						success: true,
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}
		throw new Error('No response data received from PDF4ME API');
	}

	if (feature === 'findAndReplaceText') {
		const oldText = this.getNodeParameter('oldText', index) as string;
		const newText = this.getNodeParameter('newText', index) as string;
		const pageSequence = this.getNodeParameter('pageSequence', index) as string;
		const payload = {
			docContent: pdfContent,
			docName: pdfName,
			oldText,
			newText,
			pageSequence,
			async: true,
		};
		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/FindAndReplace', payload);
		if (responseData) {
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				'find_and_replace_PDF_output.pdf',
				'application/pdf',
			);
			return [
				{
					json: {
						fileName: 'find_and_replace_PDF_output.pdf',
						mimeType: 'application/pdf',
						fileSize: responseData.length,
						success: true,
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}
		throw new Error('No response data received from PDF4ME API');
	}

	throw new Error(`Unknown findSearch feature: ${feature}`);
}
