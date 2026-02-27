/**
 * Sign Document Action
 * API Endpoint: POST /api/v2/SignDocument
 *
 * Sends a document for e-signature via email. Differs from Sign PDF which adds
 * an image signature - this initiates an e-signature workflow with the signer.
 *
 * Async handling (202 + Location polling) is done by pdf4meAsyncRequest in GenericFunctions.
 */

import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest, uploadBlobToPdf4me } from '../GenericFunctions';

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
				operation: [ActionConstants.SignDocument],
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
				operation: [ActionConstants.SignDocument],
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
				operation: [ActionConstants.SignDocument],
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
				operation: [ActionConstants.SignDocument],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Display name for the document when sent to the signer',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Signer Email',
		name: 'emailTo',
		type: 'string',
		required: true,
		default: '',
		description: 'Email address of the person who will receive and sign the document',
		placeholder: 'signer@example.com',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Email Subject',
		name: 'subject',
		type: 'string',
		default: 'Please sign this document',
		description: 'Subject line of the email sent to the signer',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Email Message',
		name: 'body',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: 'Please review and sign the attached document',
		description: 'Message content included in the email to the signer',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Notify Sender (Callback URL or Email)',
		name: 'callBackURL',
		type: 'string',
		default: '',
		description: 'Callback URL or email address to notify you when the document is signed. Leave empty for no notification.',
		placeholder: 'https://your-webhook.com/sign-complete or notify@example.com',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Custom Metadata',
		name: 'customField',
		type: 'string',
		default: '{}',
		description: 'Additional metadata as JSON (e.g. {"referenceId": "123", "department": "Legal"})',
		placeholder: '{}',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Metadata Key',
		name: 'key',
		type: 'string',
		default: '',
		description: 'Custom key for tracking or integration purposes',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
	{
		displayName: 'Metadata Value',
		name: 'value',
		type: 'string',
		default: '',
		description: 'Custom value associated with the metadata key',
		displayOptions: {
			show: {
				operation: [ActionConstants.SignDocument],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docNameParam = this.getNodeParameter('docName', index) as string;
	const emailTo = this.getNodeParameter('emailTo', index) as string;
	const subject = this.getNodeParameter('subject', index) as string;
	const body = this.getNodeParameter('body', index) as string;
	const callBackURL = this.getNodeParameter('callBackURL', index) as string;
	const customFieldStr = this.getNodeParameter('customField', index) as string;
	const key = this.getNodeParameter('key', index) as string;
	const value = this.getNodeParameter('value', index) as string;

	// Document content handling
	let docContent: string;
	let inputDocName = '';

	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0]?.binary?.[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docNameParam || 'document.pdf';

		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);
		docContent = String(blobId);
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		inputDocName = docNameParam || 'document.pdf';
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}
		docContent = String(pdfUrl);
		inputDocName = pdfUrl.split('/').pop() || docNameParam || 'document.pdf';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	const finalDocName = docNameParam || inputDocName || 'document.pdf';

	// Build signBasicAction
	const signBasicAction: IDataObject = {
		emailTo,
		subject,
		body,
		callBackURL: callBackURL || undefined,
	};

	if (customFieldStr && customFieldStr.trim() !== '' && customFieldStr.trim() !== '{}') {
		try {
			signBasicAction.customField = JSON.parse(customFieldStr);
		} catch {
			throw new Error('Custom Field must be valid JSON');
		}
	}

	// Build request body (isAsync: true - async/polling handled by pdf4meAsyncRequest)
	const bodyPayload: IDataObject = {
		docName: finalDocName,
		docContent,
		signBasicAction,
		isAsync: true,
	};

	if (key && key.trim() !== '') {
		bodyPayload.key = key.trim();
	}
	if (value !== undefined && value !== null && String(value).trim() !== '') {
		bodyPayload.value = String(value).trim();
	}

	// POST to SignDocument (async/polling handled by pdf4meAsyncRequest)
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/SignDocument', bodyPayload);

	if (!responseData || typeof responseData !== 'object') {
		throw new Error('Invalid response from SignDocument API');
	}

	const resp = responseData as IDataObject;

	return [
		{
			json: {
				signBasicData: resp.signBasicData ?? resp,
				jobId: resp.jobId,
				status: resp.status,
				success: true,
			},
			pairedItem: { item: index },
		},
	];
}
