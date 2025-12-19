import type { IExecuteFunctions, IDataObject, INodeProperties } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
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
		hint: 'Convert PDF to PDF/A. See our <b><a href="https://docs.pdf4me.com/n8n/convert/create-pdfa/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
	let blobId: string = '';
	let inputDocName: string = '';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName || 'document';
		originalFileName = inputDocName;

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in PdfA API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (inputDataType === 'url') {
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
	} else {
		throw new Error('Unsupported input data type: ' + inputDataType);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	// Use inputDocName if originalFileName is not provided, otherwise use originalFileName
	const finalDocName = originalFileName || inputDocName || docName || 'document.pdf';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		compliance,
		allowUpgrade: advancedOptions?.allowUpgrade !== undefined ? advancedOptions.allowUpgrade : true,
		allowDowngrade: advancedOptions?.allowDowngrade !== undefined ? advancedOptions.allowDowngrade : true,
		IsAsync: true,
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
				pairedItem: { item: index },
			},
		];
	}
	throw new Error('No response data received from PDF4ME API');
}
