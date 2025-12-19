import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

// Make Node.js globals available
// declare const URL: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add page numbers to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
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
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
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
				operation: [ActionConstants.AddPageNumberToPdf],
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
		description: 'URL to the PDF file to add page numbers to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_page_numbers.pdf',
		description: 'Name for the output PDF file with page numbers',
		placeholder: 'my-document-with-page-numbers.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
		hint: 'Add page numbers to your PDF. See our <b><a href="https://docs.pdf4me.com/n8n/edit/add-page-number-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},

	{
		displayName: 'Horizontal Alignment',
		name: 'alignX',
		type: 'options',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
		default: 'right',
		description: 'Horizontal alignment of page numbers',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Vertical Alignment',
		name: 'alignY',
		type: 'options',
		options: [
			{ name: 'Top', value: 'top' },
			{ name: 'Middle', value: 'middle' },
			{ name: 'Bottom', value: 'bottom' },
		],
		default: 'bottom',
		description: 'Vertical alignment of page numbers',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (Mm)',
		name: 'marginXinMM',
		type: 'number',
		default: 2,
		description: 'Horizontal margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (Mm)',
		name: 'marginYinMM',
		type: 'number',
		default: 2,
		description: 'Vertical margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 12,
		description: 'Font size for the page numbering (8-72)',
		typeOptions: {
			minValue: 8,
			maxValue: 72,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Set Bold',
		name: 'isBold',
		type: 'boolean',
		default: true,
		description: 'Whether to set bold for page numbering',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Set Italic',
		name: 'isItalic',
		type: 'boolean',
		default: false,
		description: 'Whether to set italic for page numbering',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
	{
		displayName: 'Skip First Page',
		name: 'skipFirstPage',
		type: 'boolean',
		default: false,
		description: 'Whether to skip numbering in the first page of the document',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
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
				operation: [ActionConstants.AddPageNumberToPdf],
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
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'pdf-with-page-numbers',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddPageNumberToPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const marginXinMM = this.getNodeParameter('marginXinMM', index) as number;
	const marginYinMM = this.getNodeParameter('marginYinMM', index) as number;
	const fontSize = this.getNodeParameter('fontSize', index) as number;
	const isBold = this.getNodeParameter('isBold', index) as boolean;
	const isItalic = this.getNodeParameter('isItalic', index) as boolean;
	const skipFirstPage = this.getNodeParameter('skipFirstPage', index) as boolean;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let blobId: string = '';
	let inputDocName: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName || 'document.pdf';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in AddPageNumber API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
	} else if (inputDataType === 'url') {
		// URL input - send URL as string directly in docContent
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		if (!pdfUrl || pdfUrl.trim() === '') {
			throw new Error('PDF URL is required');
		}

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
		throw new Error(`Unsupported input data type: ${inputDataType}`);
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

	// Build the request body
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'document.pdf';
	const body: IDataObject = {
		alignX,
		alignY,
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		fontSize,
		marginXinMM,
		marginYinMM,
		isBold,
		isItalic,
		skipFirstPage,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/AddPageNumber', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'document_with_page_numbers';
			fileName = `${baseName}_with_page_numbers.pdf`;
		}

		// Ensure .pdf extension
		if (!fileName.toLowerCase().endsWith('.pdf')) {
			fileName = `${fileName.replace(/\.[^.]*$/, '')}.pdf`;
		}

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
					message: 'Page numbers added successfully',
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

