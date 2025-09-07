import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
	sanitizeProfiles,
	ActionConstants,
	pdf4meAsyncRequest,
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
				operation: [ActionConstants.SplitPdfRegular],
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
				operation: [ActionConstants.SplitPdfRegular],
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
				operation: [ActionConstants.SplitPdfRegular],
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
				operation: [ActionConstants.SplitPdfRegular],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'File Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'output.pdf',
		description: 'Name of the file from the source',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
			},
		},
	},
	{
		displayName: 'Split Action',
		name: 'splitAction',
		type: 'options',
		required: true,
		default: 'SplitAfterPage',
		description: 'Choose how to split the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
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
		required: false,
		default: 1,
		description: 'Page number for split action (e.g., split after page 1, or every N pages)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
				splitAction: ['SplitAfterPage', 'RecurringSplitAfterPage'],
			},
		},
	},
	{
		displayName: 'Split Sequence',
		name: 'splitSequence',
		type: 'string',
		required: false,
		default: '',
		description: 'Comma-separated list of page numbers to split at (e.g., 1,3,8)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
				splitAction: ['SplitSequence'],
			},
		},
	},
	{
		displayName: 'Split Ranges',
		name: 'splitRanges',
		type: 'string',
		required: false,
		default: '',
		description: 'Page ranges to extract (e.g., 1-4,10-21)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
				splitAction: ['SplitRanges'],
			},
		},
	},
	{
		displayName: 'File Naming',
		name: 'fileNaming',
		type: 'string',
		required: true,
		default: 'NameAsPerOrder',
		description: 'File naming convention for split files',
		displayOptions: {
			show: {
				operation: [ActionConstants.SplitPdfRegular],
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
				operation: [ActionConstants.SplitPdfRegular],
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

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const splitAction = this.getNodeParameter('splitAction', index) as string;
	const fileNaming = this.getNodeParameter('fileNaming', index) as string;
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
		const options = {

			method: 'GET' as const,

			url: pdfUrl.trim(),

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		pdfContentBase64 = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docContent: pdfContentBase64,
		docName,
		splitAction,
		fileNaming,
		IsAsync: true,
	};

	if (splitAction === 'SplitAfterPage' || splitAction === 'RecurringSplitAfterPage') {
		body.splitActionNumber = this.getNodeParameter('splitActionNumber', index) as number;
	} else if (splitAction === 'SplitSequence') {
		const splitSequence = this.getNodeParameter('splitSequence', index) as string;
		if (!splitSequence) throw new Error('Split Sequence is required for SplitSequence action');
		body.splitSequence = splitSequence.split(',').map((n) => parseInt(n.trim(), 10));
	} else if (splitAction === 'SplitRanges') {
		const splitRanges = this.getNodeParameter('splitRanges', index) as string;
		if (!splitRanges) throw new Error('Split Ranges is required for SplitRanges action');
		body.splitRanges = splitRanges;
	}

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Call the PDF4me SplitPdf endpoint
	const response = await pdf4meAsyncRequest.call(this, '/api/v2/SplitPdf', body);

	// --- BEGIN: Buffer/String Response Parsing ---
	let parsedResponse = response;
	if (Buffer.isBuffer(response)) {
		try {
			parsedResponse = JSON.parse(response.toString('utf8'));
		} catch (e) {
			throw new Error('Failed to parse Buffer response as JSON: ' + e.message);
		}
	} else if (typeof response === 'string') {
		try {
			parsedResponse = JSON.parse(response);
		} catch {
			// If not JSON, leave as string
		}
	}
	// --- END: Buffer/String Response Parsing ---

	// Robust response handling, matching split_pdf.py
	const binaryData: { [key: string]: any } = {};
	const filesSummary: any[] = [];
	let totalFiles = 0;
	let outputDirectory = '';
	let folderName = '';
	const sourcePdf = docName;
	let responseType = '';

	if (Array.isArray(parsedResponse)) {
		// Array of split documents (legacy)
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
			} else {
				// Log problematic document for debugging
			}
		}
		totalFiles = filesSummary.length;
		responseType = 'Multiple PDFs (legacy array)';
	} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.splitedDocuments) {
		// splitedDocuments array
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
			} else {
				// Log problematic document for debugging
			}
		}
		totalFiles = filesSummary.length;
		responseType = 'Multiple PDFs (splitedDocuments)';
	} else if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.docContent && parsedResponse.docName) {
		// Single document (legacy)
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
		// Unexpected response: log for debugging
		throw new Error('Unexpected response format from PDF4me SplitPdf API. Check console for details.');
	}

	// Compose output directory and folder name (for compatibility, not actually used here)
	folderName = `${docName.replace(/\.pdf$/i, '')}_split_outputs`;
	outputDirectory = `/tmp/${folderName}`;

	// Compose the output summary
	const output: INodeExecutionData = {
		json: {
			success: true,
			message: `PDF split into ${totalFiles} file(s) successfully`,
			folderName,
			outputDirectory,
			totalFiles,
			sourcePdf,
			splitAction,
			fileNaming,
			responseType,
			files: filesSummary,
		},
		binary: binaryData,
	};

	return [output];
}

