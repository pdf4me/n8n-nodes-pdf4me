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
		description: 'Choose how to provide the PDF file to sign',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
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
		description: 'URL to the PDF file to sign',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'signed_document.pdf',
		description: 'Name for the output signed PDF file',
		placeholder: 'my-signed-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
		hint: 'Sign PDF. See our <b><a href="https://docs.pdf4me.com/n8n/edit/sign-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Signature Image Input Type',
		name: 'signatureImageInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the signature image',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use signature image from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide signature image content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to signature image file',
			},
		],
	},
	{
		displayName: 'Signature Image Binary Field',
		name: 'signatureBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the signature image',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Signature Image Content',
		name: 'signatureBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded signature image content',
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Signature Image URL',
		name: 'signatureImageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the signature image file',
		placeholder: 'https://example.com/signature.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
				signatureImageInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Image Name',
		name: 'imageName',
		type: 'string',
		default: 'signature.png',
		description: 'Name of the signature image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '1',
		description: 'Page numbers to add signature (e.g., 1, 1-3, 1,3,5)',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Alignment',
		name: 'alignX',
		type: 'options',
		options: [
			{ name: 'Left', value: 'Left' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Right', value: 'Right' },
		],
		default: 'Center',
		description: 'Horizontal alignment of the signature',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Alignment',
		name: 'alignY',
		type: 'options',
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Bottom', value: 'Bottom' },
		],
		default: 'Bottom',
		description: 'Vertical alignment of the signature',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Width (Mm)',
		name: 'widthInMM',
		type: 'number',
		default: 50,
		description: 'Signature width in millimeters (10-200)',
		typeOptions: {
			minValue: 10,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Height (Mm)',
		name: 'heightInMM',
		type: 'number',
		default: 25,
		description: 'Signature height in millimeters (10-200)',
		typeOptions: {
			minValue: 10,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Width (Px)',
		name: 'widthInPx',
		type: 'number',
		default: 142,
		description: 'Signature width in pixels (20-600)',
		typeOptions: {
			minValue: 20,
			maxValue: 600,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Height (Px)',
		name: 'heightInPx',
		type: 'number',
		default: 71,
		description: 'Signature height in pixels (20-600)',
		typeOptions: {
			minValue: 20,
			maxValue: 600,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (Mm)',
		name: 'marginXInMM',
		type: 'number',
		default: 20,
		description: 'Horizontal margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (Mm)',
		name: 'marginYInMM',
		type: 'number',
		default: 20,
		description: 'Vertical margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (Px)',
		name: 'marginXInPx',
		type: 'number',
		default: 57,
		description: 'Horizontal margin in pixels (0-300)',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (Px)',
		name: 'marginYInPx',
		type: 'number',
		default: 57,
		description: 'Vertical margin in pixels (0-300)',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 100,
		description: 'Opacity (0-100): 0=invisible, 100=fully opaque',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Show Only in Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: true,
		description: 'Whether to show the signature in view and print',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
	{
		displayName: 'Background Signature',
		name: 'isBackground',
		type: 'boolean',
		default: false,
		description: 'Whether to place the signature in the background',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
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
				operation: [ActionConstants.SignPdf],
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
		placeholder: 'signed-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const signatureImageInputType = this.getNodeParameter('signatureImageInputType', index) as string;
	const imageName = this.getNodeParameter('imageName', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const widthInMM = this.getNodeParameter('widthInMM', index) as number;
	const heightInMM = this.getNodeParameter('heightInMM', index) as number;
	const widthInPx = this.getNodeParameter('widthInPx', index) as number;
	const heightInPx = this.getNodeParameter('heightInPx', index) as number;
	const marginXInMM = this.getNodeParameter('marginXInMM', index) as number;
	const marginYInMM = this.getNodeParameter('marginYInMM', index) as number;
	const marginXInPx = this.getNodeParameter('marginXInPx', index) as number;
	const marginYInPx = this.getNodeParameter('marginYInPx', index) as number;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const showOnlyInPrint = this.getNodeParameter('showOnlyInPrint', index) as boolean;
	const isBackground = this.getNodeParameter('isBackground', index) as boolean;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let pdfBlobId: string = '';
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
		// Returns blobId which is then used in SignPdf API payload
		pdfBlobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${pdfBlobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		pdfBlobId = '';
	} else if (inputDataType === 'url') {
		// URL input - send URL as string directly in docContent
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		pdfBlobId = '';
		docContent = String(pdfUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content based on input type
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

	// Handle signature image input
	let imageFile: string;
	let imageBlobId: string = '';
	let inputImageName: string = '';

	if (signatureImageInputType === 'binaryData') {
		// Get signature image from binary data
		const signatureBinaryPropertyName = this.getNodeParameter('signatureBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[signatureBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${signatureBinaryPropertyName}'`);
		}

		const binaryData = item[0].binary[signatureBinaryPropertyName];
		inputImageName = binaryData.fileName || imageName || 'signature.png';

		// Get binary data as Buffer
		const imageBuffer = await this.helpers.getBinaryDataBuffer(index, signatureBinaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in SignPdf API payload
		imageBlobId = await uploadBlobToPdf4me.call(this, imageBuffer, inputImageName);

		// Use blobId in imageFile
		imageFile = `${imageBlobId}`;
	} else if (signatureImageInputType === 'base64') {
		// Use base64 content directly
		imageFile = this.getNodeParameter('signatureBase64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (imageFile.includes(',')) {
			imageFile = imageFile.split(',')[1];
		}

		imageBlobId = '';
	} else if (signatureImageInputType === 'url') {
		// URL input - send URL as string directly in imageFile
		const signatureImageUrl = this.getNodeParameter('signatureImageUrl', index) as string;

		// Validate URL format
		try {
			new URL(signatureImageUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the signature image file.');
		}

		// Send URL as string directly in imageFile - no download or conversion
		imageBlobId = '';
		imageFile = String(signatureImageUrl);
	} else {
		throw new Error(`Unsupported signature image input type: ${signatureImageInputType}`);
	}

	// Validate signature image content based on input type
	if (signatureImageInputType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!imageFile || typeof imageFile !== 'string' || imageFile.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (signatureImageInputType === 'base64') {
		// For base64, validate content is not empty
		if (!imageFile || imageFile.trim() === '') {
			throw new Error('Signature image content is required');
		}
	} else if (signatureImageInputType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!imageFile || imageFile.trim() === '') {
			throw new Error('Signature image content is required');
		}
	}

	// Build the request body
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'document.pdf';
	// Use inputImageName if imageName is not provided, otherwise use imageName
	const finalImageName = imageName || inputImageName || 'signature.png';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		imageFile, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		imageName: finalImageName,
		pages,
		alignX,
		alignY,
		widthInMM,
		heightInMM,
		widthInPx,
		heightInPx,
		marginXInMM,
		marginYInMM,
		marginXInPx,
		marginYInPx,
		opacity,
		showOnlyInPrint,
		isBackground,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/SignPdf', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'signed_document';
			fileName = `${baseName}_signed.pdf`;
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
					message: 'PDF signed successfully',
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

