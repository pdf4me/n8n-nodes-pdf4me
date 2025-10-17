import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'File Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: '',
		description: 'Source PDF file name',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
		hint: 'Get document from PDF4me. See our <b><a href="https://docs.pdf4me.com/n8n/pdf4me/get-document-from-pdf4me/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Callback URL',
		name: 'callBackUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'Please enter any URL (e.g., https://www.google.com)',
		placeholder: 'https://www.google.com',
		displayOptions: {
			show: {
				operation: [ActionConstants.GetDocumentFromPdf4me],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const docName = this.getNodeParameter('docName', index) as string;
	const callBackUrl = this.getNodeParameter('callBackUrl', index) as string;

	// Build the request body according to the API specification
	const body: IDataObject = {
		CallBackUrl: callBackUrl,
		docName: docName,
		IsAsync: true,
	};

	// Make the API request to the webhook subscription endpoint
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/WebhookSubscribe', body);

	// Return the result
	return [
		{
			json: {
				success: true,
				message: 'Webhook subscription created successfully',
				docName: docName,
				callBackUrl: callBackUrl,
				result: result,
			},
		},
	];
}
