import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';


export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to convert to PDF/A',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
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
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
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
		description: 'URL to the PDF file to convert to PDF/A',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'converted_pdfa.pdf',
		description: 'Name for the output PDF/A file',
		placeholder: 'document_pdfa.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
			},
		},
	},
	{
		displayName: 'Binary Output Property Name',
		name: 'binaryOutputPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output PDF/A file',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
			},
		},
	},
	{
		displayName: 'PDF/A Compliance',
		name: 'compliance',
		type: 'options',
		default: 'PdfA1b',
		description: 'PDF/A compliance level for long-term archiving',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreatePdfA],
			},
		},
		options: [
			{
				name: 'PDF/A-1b (Level B Basic)',
				value: 'PdfA1b',
				description: 'Basic conformance for reliable reproduction of document visual appearance',
			},
			{
				name: 'PDF/A-1a (Level A Accessible)',
				value: 'PdfA1a',
				description: 'Includes PDF/A-1b conformance with accessibility features, document structure, and tagging',
			},
			{
				name: 'PDF/A-2b (Basic Compliance)',
				value: 'PdfA2b',
				description: 'Part 2 standard supporting new features, image compression, transparency, and digital signatures',
			},
			{
				name: 'PDF/A-2u (Basic with Unicode)',
				value: 'PdfA2u',
				description: 'PDF/A-2b level with all text as unicode mapped',
			},
			{
				name: 'PDF/A-2a (Accessible Compliance)',
				value: 'PdfA2a',
				description: 'PDF/A-2b level with accessibility features same as PDF/A-1a',
			},
			{
				name: 'PDF/A-3b (Basic Compliance)',
				value: 'PdfA3b',
				description: 'Part 3 standard allowing embedding of files (XML, CSV, CAD, Word) along with Part 2 features',
			},
			{
				name: 'PDF/A-3u (Basic with Unicode)',
				value: 'PdfA3u',
				description: 'PDF/A-3b level with all text as unicode mapped',
			},
			{
				name: 'PDF/A-3a (Accessible Compliance)',
				value: 'PdfA3a',
				description: 'PDF/A-3b level with accessibility features same as PDF/A-1a',
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
				operation: [ActionConstants.CreatePdfA],
			},
		},
		options: [
			{
				displayName: 'Allow Upgrade',
				name: 'allowUpgrade',
				type: 'boolean',
				default: true,
				description: 'Whether to allow upgrading to a higher PDF/A version if needed',
			},
			{
				displayName: 'Allow Downgrade',
				name: 'allowDowngrade',
				type: 'boolean',
				default: true,
				description: 'Whether to allow downgrading to a lower PDF/A version if needed',
			},
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
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryOutputPropertyName = this.getNodeParameter('binaryOutputPropertyName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const compliance = this.getNodeParameter('compliance', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let originalFileName = docName;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
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
		docContent = this.getNodeParameter('base64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		try {
			new URL(pdfUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}
		docContent = await downloadPdfFromUrl.call(this, this.helpers, pdfUrl);
	} else {
		throw new Error('Unsupported input data type: ' + inputDataType);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		compliance,
		allowUpgrade: advancedOptions?.allowUpgrade !== undefined ? advancedOptions.allowUpgrade : true,
		allowDowngrade: advancedOptions?.allowDowngrade !== undefined ? advancedOptions.allowDowngrade : true,
		async: true,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/PdfA', body);

	if (responseData) {
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'pdf_to_pdfa_output';
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
			throw new Error('Invalid PDF/A response from API. The converted file appears to be too small or corrupted.');
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
					compliance,
					originalFileName,
					message: 'PDF converted to PDF/A successfully',
				},
				binary: {
					[binaryOutputPropertyName]: binaryData,
				},
			},
		];
	}
	throw new Error('No response data received from PDF4ME API');
}

const downloadPdfFromUrl = async (helpers: IExecuteFunctions['helpers'], pdfUrl: string): Promise<string> => {
	try {
		const response = await helpers.httpRequest({
			method: 'GET',
			url: pdfUrl,
			encoding: 'arraybuffer',
			returnFullResponse: true,
		});
		
		// Check if response body exists and handle different formats
		if (!response.body) {
			throw new Error('No response body received from URL');
		}

		let buffer: Buffer;
		
		// Handle different response body formats
		if (response.body instanceof Buffer) {
			buffer = response.body;
		} else if (typeof response.body === 'string') {
			// If it's a string, convert to buffer
			buffer = Buffer.from(response.body, 'utf8');
		} else if (response.body instanceof ArrayBuffer) {
			// If it's an ArrayBuffer, convert to Buffer
			buffer = Buffer.from(response.body);
		} else if (ArrayBuffer.isView(response.body)) {
			// If it's a TypedArray or DataView
			buffer = Buffer.from(response.body.buffer, response.body.byteOffset, response.body.byteLength);
		} else {
			// Try to convert using Buffer.from with default encoding
			try {
				buffer = Buffer.from(response.body as any);
			} catch (error) {
				throw new Error(`Unable to convert response body to buffer. Body type: ${typeof response.body}, Body: ${String(response.body).substring(0, 100)}`);
			}
		}

		// Validate the buffer
		if (!buffer || buffer.length === 0) {
			throw new Error('Downloaded file is empty');
		}

		const base64Content = buffer.toString('base64');
		
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid PDF file.');
		}
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
};