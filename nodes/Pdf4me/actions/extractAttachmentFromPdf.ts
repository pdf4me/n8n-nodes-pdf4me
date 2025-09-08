import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to extract attachments from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
		description: 'URL to the PDF file to extract attachments from',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the document (used for processing)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
			},
		},
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractAttachmentFromPdf],
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
				operation: [ActionConstants.ExtractAttachmentFromPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use \'JSON\' to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: '{ \'outputDataFormat\': \'json\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;

		// Get binary data from previous node
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are \'data\' for file uploads or the filename without extension.'
			);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		docContent = await downloadPdfFromUrl.call(this, pdfUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName,
		IsAsync: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make API call
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractAttachmentFromPdf', body);

	// Handle the response (extracted attachments)
	if (responseData) {
		let jsonString: string;
		if (Buffer.isBuffer(responseData)) {
			jsonString = responseData.toString('utf8');
		} else if (typeof responseData === 'string') {
			jsonString = Buffer.from(responseData, 'base64').toString('utf8');
		} else if (typeof responseData === 'object') {
			jsonString = JSON.stringify(responseData, null, 2);
		} else {
			throw new Error('Unexpected response type');
		}

		let parsedJson: any;
		try {
			parsedJson = JSON.parse(jsonString);
		} catch (err) {
			throw new Error('Response is not valid JSON');
		}

		// Prepare binary output for attachments
		const binary: { [key: string]: any } = {};
		if (parsedJson.outputDocuments && Array.isArray(parsedJson.outputDocuments)) {
			for (const doc of parsedJson.outputDocuments) {
				// 1. Get fileName and streamFile
				let fileName = doc.fileName || '';
				const streamFile = doc.streamFile;
				if (!streamFile) continue;

				// 2. Decode base64 to Buffer
				const fileContent = Buffer.from(streamFile, 'base64');

				// 3. If fileName or extension is missing, use fallback
				let mimeType = undefined;
				if (!fileName || !fileName.includes('.')) {
					// Fallback since file-type detection is not available in n8n
					if (!fileName) fileName = `attachment_${Date.now()}.bin`;
					else if (!fileName.includes('.')) fileName = `${fileName}.bin`;
					mimeType = 'application/octet-stream';
				}

				// 4. Prepare binary data for n8n output
				binary[fileName] = await this.helpers.prepareBinaryData(
					fileContent,
					fileName,
					mimeType
				);
			}
		}

		// Save the JSON as well
		const fileName = `extracted_attachments_${Date.now()}.json`;
		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(JSON.stringify(parsedJson, null, 2), 'utf8'),
			fileName,
			'application/json',
		);
		return [
			{
				json: {
					fileName,
					mimeType: 'application/json',
					fileSize: Buffer.byteLength(JSON.stringify(parsedJson, null, 2)),
					success: true,
					message: 'Attachment extraction completed successfully',
					docName,
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
					...binary, // All attachments as separate binary properties
				},
			},
		];
	}

	// Error case
	throw new Error('No attachment extraction results received from PDF4ME API');
}

async function downloadPdfFromUrl(this: IExecuteFunctions, pdfUrl: string): Promise<string> {
	try {
		const options = {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		};
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);

		return Buffer.from(response).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download PDF from URL: ${error.message}`);
	}
}

