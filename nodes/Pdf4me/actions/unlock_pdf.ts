import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { pdf4meAsyncRequest, ActionConstants, uploadBlobToPdf4me } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to unlock',
		options: [
			{ name: 'Binary Data', value: 'binaryData', description: 'Use PDF file from previous node' },
			{ name: 'Base64 String', value: 'base64', description: 'Provide PDF content as base64 encoded string' },
			{ name: 'URL', value: 'url', description: 'Provide URL to PDF file' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
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
				operation: [ActionConstants.UnlockPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: { alwaysOpenEditWindow: true },
		required: true,
		default: '',
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
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
		description: 'URL to the PDF file to unlock',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'unlocked_output.pdf',
		description: 'Name for the output unlocked PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
		hint: 'Unlock PDF. See our <b><a href="https://docs.pdf4me.com/n8n/security/unlock-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: { password: true },
		default: '1234',
		description: 'Password for the protected PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'unlocked-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UnlockPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const password = this.getNodeParameter('password', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main PDF content
	let docContent: string;
	let docName: string = outputFileName;
	let blobId: string = '';
	let inputDocName: string = '';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || outputFileName;
		docName = inputDocName;

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in Unlock API payload
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
		docName = pdfUrl.split('/').pop() || outputFileName;
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
	const finalDocName = docName || inputDocName || outputFileName;
	const body: IDataObject = {
		docName: finalDocName,
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		password,
		IsAsync: true,
	};

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Unlock', body);

	// Return the result as binary data
	const binaryDataKey = binaryDataName || 'data';
	return [
		{
			binary: {
				[binaryDataKey]: await this.helpers.prepareBinaryData(responseData, outputFileName, 'application/pdf'),
			},
			json: {},
			pairedItem: { item: index },
		},
	];
}
