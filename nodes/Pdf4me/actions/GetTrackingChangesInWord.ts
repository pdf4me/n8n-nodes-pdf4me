import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest, uploadBlobToPdf4me } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the Word document',
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Word document from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded Word document',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the Word document',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
			},
		},
		hint: 'Get tracking changes in Word document. See our <b><a href="https://docs.pdf4me.com/n8n/generate/enable-tracking-changes-word/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'documentName',
		type: 'string',
		default: '',
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Document Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded Word document content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'documentNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the Word document (including extension)',
		placeholder: 'document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the Word document',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetTrackingChangesInWord],
				inputDataType: ['url'],
			},
		},
	},
];

/**
 * Get Tracking Changes in Word - Extract tracking changes and comments from Word documents using PDF4ME
 * Process: Read Word document → Upload/Prepare content → Send API request → Poll for completion → Return tracking changes data
 *
 * This action extracts all tracking changes, comments, and revision history from Word documents:
 * - Returns structured JSON data with all tracked changes
 * - Supports various Word document formats (.docx, .doc)
 * - Always processes asynchronously for optimal performance
 * - Returns the raw API response data directly
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;

	let docContent: string = '';
	let docName: string;
	let blobId: string = '';

	// Handle different input types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const documentName = this.getNodeParameter('documentName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		const inputDocName = documentName || binaryData.fileName || 'document.docx';
		docName = inputDocName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('documentNameRequired', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;
		docName = this.getNodeParameter('documentNameRequired', index) as string;

		// 2. Use URL directly in docContent
		blobId = '';
		docContent = documentUrl;
	} else {
		throw new Error(`Unsupported input type: ${inputDataType}`);
	}

	const payload = {
		docName,
		docContent,
		IsAsync: true,
	};

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GetTrackingChangesInWord', payload);

	if (responseData) {
		// Return both raw data and metadata
		return [
			{
				json: {
					...responseData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Tracking changes extracted successfully',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: docName,
						operation: 'getTrackingChangesInWord',
					},
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case - no response received
	throw new Error('No response data received from PDF4ME API');
}
