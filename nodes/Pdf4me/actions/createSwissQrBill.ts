import type { INodeProperties, INodeExecutionData } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input data',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use binary data from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded content',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to the file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to the file',
			},
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded content of the file to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL to the file to process',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'File Path',
		name: 'filePath',
		type: 'string',
		default: '',
		required: true,
		description: 'Local file path to the file to process',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		required: true,
		description: 'Input file name from the source',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		default: '',
		required: true,
		description: 'The amount needs to be entered without leading zeroes',
		placeholder: '1000',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Currency',
		name: 'currency',
		type: 'options',
		required: true,
		default: 'CHF',
		description: 'Currency type',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Swiss Franc',
				value: 'CHF',
			},
			{
				name: 'Euro',
				value: 'EUR',
			},
		],
	},
	{
		displayName: 'IBAN',
		name: 'iban',
		type: 'string',
		default: '',
		required: true,
		description: 'IBAN of the creditor',
		placeholder: 'CH0200700110003765824',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor Name',
		name: 'crName',
		type: 'string',
		default: '',
		required: true,
		description: 'The Creditor\'s name or company according to the account name',
		placeholder: 'Test AG',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor Address Type',
		name: 'crAddressType',
		type: 'options',
		required: true,
		default: 'S',
		description: 'Type of the Creditor\'s address',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Structured',
				value: 'S',
			},
			{
				name: 'Combined',
				value: 'K',
			},
		],
	},
	{
		displayName: 'Creditor Address Line 1',
		name: 'crStreetOrAddressLine1',
		type: 'string',
		default: '',
		required: true,
		description: 'The creditor\'s address line with max 70 characters',
		placeholder: 'Test Strasse',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor Address Line 2',
		name: 'crStreetOrAddressLine2',
		type: 'string',
		default: '',
		description: 'The creditor\'s address line - For S type 16 characters and for K type 70 characters',
		placeholder: '1',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor Postal Code',
		name: 'crPostalCode',
		type: 'string',
		default: '',
		required: true,
		description: 'The Creditor\'s postal code with a max of 16 characters',
		placeholder: '8000',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor City',
		name: 'crCity',
		type: 'string',
		default: '',
		required: true,
		description: 'The Creditor\'s Town/City with max 35 characters',
		placeholder: 'Zurich',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Debtor Name',
		name: 'udName',
		type: 'string',
		default: '',
		required: true,
		description: 'Debtor\'s name or company according to account name',
		placeholder: 'Test Debt AG',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Debtor Address Type',
		name: 'udAddressType',
		type: 'options',
		required: true,
		default: 'S',
		description: 'Debtor\'s address type',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Structured',
				value: 'S',
			},
			{
				name: 'Combined',
				value: 'K',
			},
		],
	},
	{
		displayName: 'Ultimate Debtor Address Line 1',
		name: 'udStreetOrAddressLine1',
		type: 'string',
		default: '',
		required: true,
		description: 'Debtor\'s address line with max 70 characters',
		placeholder: 'Test Deb Strasse',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Debtor Address Line 2',
		name: 'udStreetOrAddressLine2',
		type: 'string',
		default: '',
		required: true,
		description: 'Debtor\'s address line - For S type 16 characters and for K type 70 characters',
		placeholder: '2',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Debtor Postal Code',
		name: 'udPostalCode',
		type: 'string',
		default: '',
		required: true,
		description: 'Debtor\'s postal code',
		placeholder: '8000',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Debtor City',
		name: 'udCity',
		type: 'string',
		default: '',
		required: true,
		description: 'Debtor\'s Town/City',
		placeholder: 'Zurich',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},

	{
		displayName: 'Reference Type',
		name: 'referenceType',
		type: 'options',
		required: true,
		default: 'NON',
		description: 'Reference Type',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'No Reference',
				value: 'NON',
			},
			{
				name: 'QR Reference',
				value: 'QRR',
			},
			{
				name: 'Creditor Reference',
				value: 'SCOR',
			},
		],
	},
	{
		displayName: 'Language Type',
		name: 'languageType',
		type: 'options',
		required: true,
		default: 'English',
		description: 'Bill language type',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'English',
				value: 'English',
			},
			{
				name: 'German',
				value: 'German',
			},
			{
				name: 'French',
				value: 'French',
			},
			{
				name: 'Italian',
				value: 'Italian',
			},
		],
	},
	{
		displayName: 'Separator Line',
		name: 'seperatorLine',
		type: 'options',
		required: true,
		default: 'LineWithScissor',
		description: 'Separator in QR Bill',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Line With Scissor',
				value: 'LineWithScissor',
			},
			{
				name: 'Dotted Line',
				value: 'DottedLine',
			},
			{
				name: 'Solid Line',
				value: 'SolidLine',
			},
		],
	},




	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'swissqr_bill.pdf',
		description: 'Name for the output Swiss QR Bill PDF file',
		placeholder: 'swissqr_bill.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
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
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Reference, maximum 27 characters',
				placeholder: 'REF123456789',
			},
			{
				displayName: 'Unstructured Message',
				name: 'unstructuredMessage',
				type: 'string',
				default: '',
				description: 'Unstructured Message, maximum 140 characters permitted',
				placeholder: 'Thank you for your business',
			},
			{
				displayName: 'Billing Info',
				name: 'billingInfo',
				type: 'string',
				default: '',
				description: 'Billing info of the customer',
				placeholder: 'Invoice for services rendered',
			},
			{
				displayName: 'AV1 Parameter',
				name: 'av1',
				type: 'string',
				default: '',
				description: 'Alternative scheme parameter',
				placeholder: 'AV1',
			},
			{
				displayName: 'AV2 Parameter',
				name: 'av2',
				type: 'string',
				default: '',
				description: 'Alternative scheme parameter',
				placeholder: 'AV2',
			},
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
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const fileName = this.getNodeParameter('fileName', index) as string;
	const amount = this.getNodeParameter('amount', index) as string;
	const currency = this.getNodeParameter('currency', index) as string;
	const iban = this.getNodeParameter('iban', index) as string;
	const crName = this.getNodeParameter('crName', index) as string;
	const crAddressType = this.getNodeParameter('crAddressType', index) as string;
	const crStreetOrAddressLine1 = this.getNodeParameter('crStreetOrAddressLine1', index) as string;
	const crStreetOrAddressLine2 = this.getNodeParameter('crStreetOrAddressLine2', index) as string;
	const crPostalCode = this.getNodeParameter('crPostalCode', index) as string;
	const crCity = this.getNodeParameter('crCity', index) as string;
	const udName = this.getNodeParameter('udName', index) as string;
	const udAddressType = this.getNodeParameter('udAddressType', index) as string;
	const udStreetOrAddressLine1 = this.getNodeParameter('udStreetOrAddressLine1', index) as string;
	const udStreetOrAddressLine2 = this.getNodeParameter('udStreetOrAddressLine2', index) as string;
	const udPostalCode = this.getNodeParameter('udPostalCode', index) as string;
	const udCity = this.getNodeParameter('udCity', index) as string;
	const referenceType = this.getNodeParameter('referenceType', index) as string;
	const languageType = this.getNodeParameter('languageType', index) as string;
	const seperatorLine = this.getNodeParameter('seperatorLine', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let docName: string;

	// Handle different input types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		docName = fileName || item[0].binary[binaryPropertyName].fileName || 'document.pdf';
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = fileName || 'document.pdf';
	} else if (inputDataType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		docContent = await downloadPdfFromUrl.call(this, fileUrl);
		docName = fileName || 'document.pdf';
	} else if (inputDataType === 'filePath') {
		throw new Error('File path input is not supported in this environment');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare payload with all required parameters for Swiss QR Bill creation (following Python logic)
	const payload: IDataObject = {
		docContent,							  // Base64 encoded PDF content (Required)
		docName,								 // Document name (Required)
		iban,									// Swiss IBAN for the creditor (Required)
		crName,								  // Creditor name (Required)
		crAddressType,						   // Creditor address type (S = Structured) (Required)
		crStreetOrAddressLine1,				  // Creditor street (Required)
		crStreetOrAddressLine2,				  // Creditor street number (Required)
		crPostalCode,							// Creditor postal code (Required)
		crCity,								  // Creditor city (Required)
		amount,								  // Payment amount (Required)
		currency,								// Currency (Swiss Franc) (Required)
		udName,								  // Ultimate debtor name (Required)
		udAddressType,						   // Ultimate debtor address type (Required)
		udStreetOrAddressLine1,				  // Ultimate debtor street (Required)
		udStreetOrAddressLine2,				  // Ultimate debtor street number (Required)
		udPostalCode,							// Ultimate debtor postal code (Required)
		udCity,								  // Ultimate debtor city (Required)
		referenceType,						   // Reference type (NON = No reference) (Required)
		languageType,							// Language for the QR bill (Required)
		seperatorLine,						   // Separator line style (Required)
		async: true,							 // Asynchronous processing as requested
	};

	// Add optional parameters from advanced options if provided
	if (advancedOptions.reference) {
		payload.reference = advancedOptions.reference as string;
	}
	if (advancedOptions.unstructuredMessage) {
		payload.unstructuredMessage = advancedOptions.unstructuredMessage as string;
	}
	if (advancedOptions.billingInfo) {
		payload.billingInfo = advancedOptions.billingInfo as string;
	}
	if (advancedOptions.av1) {
		payload.av1 = advancedOptions.av1 as string;
	}
	if (advancedOptions.av2) {
		payload.av2 = advancedOptions.av2 as string;
	}

	// Apply advanced options if provided
	if (advancedOptions.profiles) {
		sanitizeProfiles(payload);
	}

	// Call the PDF4me API to create Swiss QR Bill
	const result = await pdf4meAsyncRequest.call(this, '/api/v2/CreateSwissQrBill', payload);

	// Return the result
	const returnData: INodeExecutionData[] = [
		{
			json: {
				fileName: outputFileName,
			},
			binary: {
				data: await this.helpers.prepareBinaryData(result, outputFileName),
			},
		},
	];

	return returnData;
}

async function downloadPdfFromUrl(this: IExecuteFunctions, pdfUrl: string): Promise<string> {
	try {
		const response = await this.helpers.request({
			method: 'GET',
			url: pdfUrl,
			encoding: null,
		});

		return Buffer.from(response).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download PDF from URL: ${error.message}`);
	}
}

