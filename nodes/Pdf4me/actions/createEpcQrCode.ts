import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Service Tag',
		name: 'serviceTag',
		type: 'options',
		required: true,
		default: 'BCD',
		description: 'Service tag for the EPC QR code',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		options: [
			{ name: 'BCD', value: 'BCD' },
		],
	},
	{
		displayName: 'Version',
		name: 'version',
		type: 'options',
		required: true,
		default: 'V1',
		description: 'Version of the EPC QR code',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		options: [
			{ name: 'V1', value: 'V1' },
			{ name: 'V2', value: 'V2' },
		],
	},
	{
		displayName: 'Character Set',
		name: 'characterSet',
		type: 'options',
		required: true,
		default: 'UTF8',
		description: 'Character encoding for the EPC QR code',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		options: [
			{ name: 'UTF-8', value: 'UTF8' },
			{ name: 'ISO 8859-1', value: 'ISO8859_1' },
			{ name: 'ISO 8859-2', value: 'ISO8859_2' },
			{ name: 'ISO 8859-4', value: 'ISO8859_4' },
			{ name: 'ISO 8859-5', value: 'ISO8859_5' },
			{ name: 'ISO 8859-7', value: 'ISO8859_7' },
			{ name: 'ISO 8859-10', value: 'ISO8859_10' },
			{ name: 'ISO 8859-15', value: 'ISO8859_15' },
		],
	},
	{
		displayName: 'Identification Code',
		name: 'identificationCode',
		type: 'options',
		required: true,
		default: 'SCT',
		description: 'Identification code for the EPC QR code',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		options: [
			{ name: 'SCT', value: 'SCT' },
		],
	},
	{
		displayName: 'BIC',
		name: 'bic',
		type: 'string',
		required: true,
		default: '',
		description: 'Bank Identifier Code (BIC/SWIFT code)',
		placeholder: 'BPOTBEB1',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Receiver Name',
		name: 'receiverName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the payment receiver/beneficiary',
		placeholder: 'Ynoox India',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'IBAN',
		name: 'iban',
		type: 'string',
		required: true,
		default: '',
		description: 'International Bank Account Number',
		placeholder: 'FR1420041010050500013M02606',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		required: true,
		default: 'EUR',
		description: 'Currency for the payment',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		options: [
			{ name: 'EUR', value: 'EUR' },
		],
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Payment amount',
		typeOptions: {
			minValue: 0,
			numberPrecision: 2,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Purpose',
		name: 'purpose',
		type: 'string',
		default: '',
		description: 'Purpose of the payment (optional)',
		placeholder: 'GDDS',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Remittance Reference',
		name: 'remittanceReference',
		type: 'string',
		default: '',
		description: 'Remittance reference (optional)',
		placeholder: 'RF12345',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Remittance Text',
		name: 'remittanceText',
		type: 'string',
		default: '',
		description: 'Remittance text/message (optional)',
		placeholder: 'Payment for services',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Information',
		name: 'information',
		type: 'string',
		default: '',
		description: 'Additional information (optional)',
		placeholder: 'Info',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'epc-qr-code',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
			},
		},
		hint: 'Create EPC QR codes for SEPA payments. See our <b><a href="https://docs.pdf4me.com/n8n/barcode/create-epc-qr-code/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateEpcQrCode],
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
];

export async function execute(this: IExecuteFunctions, index: number) {
	const serviceTag = this.getNodeParameter('serviceTag', index) as string;
	const version = this.getNodeParameter('version', index) as string;
	const characterSet = this.getNodeParameter('characterSet', index) as string;
	const identificationCode = this.getNodeParameter('identificationCode', index) as string;
	const bic = this.getNodeParameter('bic', index) as string;
	const receiverName = this.getNodeParameter('receiverName', index) as string;
	const iban = this.getNodeParameter('iban', index) as string;
	const currency = this.getNodeParameter('currency', index) as string;
	const amount = this.getNodeParameter('amount', index) as number;
	const purpose = this.getNodeParameter('purpose', index) as string | undefined;
	const remittanceReference = this.getNodeParameter('remittanceReference', index) as string | undefined;
	const remittanceText = this.getNodeParameter('remittanceText', index) as string | undefined;
	const information = this.getNodeParameter('information', index) as string | undefined;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	// Validate required fields
	if (!bic || bic.trim() === '') {
		throw new Error('BIC is required');
	}
	if (!receiverName || receiverName.trim() === '') {
		throw new Error('Receiver name is required');
	}
	if (!iban || iban.trim() === '') {
		throw new Error('IBAN is required');
	}
	if (amount < 0) {
		throw new Error('Amount must be greater than or equal to 0');
	}

	// Build epcQrCodeAction object
	const epcQrCodeAction: IDataObject = {
		serviceTag,
		version,
		characterSet,
		identificationCode,
		bic,
		receiverName,
		iban,
		currency,
		amount,
	};

	// Add optional fields only if they are provided
	if (purpose !== undefined && purpose.trim() !== '') {
		epcQrCodeAction.purpose = purpose;
	}
	if (remittanceReference !== undefined && remittanceReference.trim() !== '') {
		epcQrCodeAction.remittanceReference = remittanceReference;
	}
	if (remittanceText !== undefined && remittanceText.trim() !== '') {
		epcQrCodeAction.remittanceText = remittanceText;
	}
	if (information !== undefined && information.trim() !== '') {
		epcQrCodeAction.information = information;
	}

	// Build the request body
	const body: IDataObject = {
		epcQrCodeAction,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/CreateEpcQrCode', body);

	// Handle the binary response (PNG data)
	if (responseData) {
		// Generate filename based on receiver name and IBAN
		const safeReceiverName = receiverName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
		const safeIban = iban.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 10);
		const fileName = `epc_qr_${safeReceiverName}_${safeIban}.png`;

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'image/png',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		return [
			{
				json: {
					fileName,
					mimeType: 'image/png',
					fileSize: responseData.length,
					success: true,
					receiverName,
					iban,
					amount,
					currency,
				},
				binary: {
					[binaryDataKey]: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

