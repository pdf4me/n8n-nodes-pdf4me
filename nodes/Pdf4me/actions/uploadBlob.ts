import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
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
		description: 'Choose how to provide the file to upload',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadBlob],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide file content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the file',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadBlob],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 File Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded file content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadBlob],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the file to upload',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadBlob],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: false,
		default: 'output.pdf',
		description: 'Name of the document to upload',
		displayOptions: {
			show: {
				operation: [ActionConstants.UploadBlob],
				inputDataType: ['base64', 'url'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	let result: any;

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const fileName = item[0].binary[binaryPropertyName].fileName || 'output.pdf';

		// Use the existing uploadBlobToPdf4me function for binary data
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, fileName);

		// Return the blobId in a response object
		result = {
			blobId: blobId,
		};
	} else if (inputDataType === 'base64') {
		let docContent = this.getNodeParameter('base64Content', index) as string;
		const docName = this.getNodeParameter('docName', index) as string || 'output.pdf';

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		// Build the request body
		const body: IDataObject = {
			docContent,
			docName,
		};

		// Make the API request to UploadBlobAll endpoint
		const options = {
			url: 'https://api.pdf4me.com/api/v2/UploadBlobAll',
			method: 'POST' as const,
			headers: {
				'Content-Type': 'application/json',
			},
			body: body,
			json: true, // Parse response as JSON
		};

		result = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
	} else if (inputDataType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		const docName = this.getNodeParameter('docName', index) as string || 'output.pdf';

		// Validate URL format
		try {
			new URL(fileUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the file.');
		}

		// Download file from URL using regular httpRequest (not authenticated, as it's external)
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: fileUrl,
			encoding: 'arraybuffer' as const,
			returnFullResponse: true,
		});

		// Convert response to Buffer and then to base64
		let fileBuffer: Buffer;
		if (response.body instanceof Buffer) {
			fileBuffer = response.body;
		} else if (typeof response.body === 'string') {
			fileBuffer = Buffer.from(response.body, 'binary');
		} else {
			fileBuffer = Buffer.from(response.body);
		}

		const docContent = fileBuffer.toString('base64');

		// Build the request body
		const body: IDataObject = {
			docContent,
			docName,
		};

		// Make the API request to UploadBlobAll endpoint
		const options = {
			url: 'https://api.pdf4me.com/api/v2/UploadBlobAll',
			method: 'POST' as const,
			headers: {
				'Content-Type': 'application/json',
			},
			body: body,
			json: true, // Parse response as JSON
		};

		result = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Return full API response
	return [
		{
			json: result,
			pairedItem: { item: index },
		},
	];
}
