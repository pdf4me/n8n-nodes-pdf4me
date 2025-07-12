import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Pdf4meApi implements ICredentialType {
	name = 'pdf4meApi';
	displayName = 'PDF4ME API';
	documentationUrl = 'https://dev.pdf4me.com/apiv2/documentation/';
	properties: INodeProperties[] = [
		{
			displayName: 'PDF4ME API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your PDF4ME API key. Get it from your PDF4ME account settings.',
			placeholder: 'Enter your API key here',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Basic {{$credentials?.apiKey}}',
				'Content-Type': 'application/json',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.pdf4me.com',
			url: '/api/v2/CreateBarcode',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: {
				text: 'test',
				barcodeType: 'qrCode',
				hideText: true,
				async: true,
			},
		},
	};
}
