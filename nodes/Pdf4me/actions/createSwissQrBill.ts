import { NodeOperationError } from 'n8n-workflow';
import type { INodeProperties, INodeExecutionData, IExecuteFunctions, IDataObject  } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';
import {
	COLLECTION_PLACEHOLDER,
	CUSTOM_PROFILES_PLACEHOLDER,
	PDF_FILE,
	pdfFileUrlField,
	swissQrOutputFileNameFields,
	SWISS_QR_BILL,
} from '../pdf4mePlaceholders';

const createSwissQrBillOp = ActionConstants.CreateSwissQrBill;

// Make Node.js globals available

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
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide file content as base64 encoded string',
			},
{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use file from previous node',
			},
{
				name: 'None',
				value: 'none',
				description: 'Do not provide an input document',
			},
{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to file',
			},
		],
		hint: 'Create Swiss QR Bill. See our <b><a href="https://docs.pdf4me.com/integration/n8n/barcode/create-swiss-qr-bill/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
	pdfFileUrlField(createSwissQrBillOp, 'fileUrl', 'inputDataType'),
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		description: 'Input file name from the source',
		placeholder: PDF_FILE.documentName,
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				inputDataType: ['binaryData', 'base64', 'url'],
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
		placeholder: SWISS_QR_BILL.amount,
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
				name: 'Euro',
				value: 'EUR',
			},
{
				name: 'Swiss Franc',
				value: 'CHF',
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
		placeholder: SWISS_QR_BILL.iban,
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
		placeholder: SWISS_QR_BILL.creditorName,
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
				name: 'Combined',
				value: 'K',
			},
{
				name: 'Structured',
				value: 'S',
			},
		],
	},
	{
		displayName: 'Creditor Street Name or Address Line 1',
		name: 'crStreetOrAddressLine1',
		type: 'string',
		default: '',
		description: 'The creditor\'s address line with max 70 characters',
		placeholder: SWISS_QR_BILL.creditorStreet,
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Creditor Building Number or Address Line 2',
		name: 'crStreetOrAddressLine2',
		type: 'string',
		default: '',
		description: 'The creditor\'s address line - For S type 16 characters and for K type 70 characters',
		placeholder: SWISS_QR_BILL.creditorBuilding,
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
		description: 'The Creditor\'s postal code with a max of 16 characters',
		placeholder: SWISS_QR_BILL.postalCode,
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
		description: 'The Creditor\'s Town/City with max 35 characters',
		placeholder: SWISS_QR_BILL.city,
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
		description: 'Debtor\'s name or company according to account name',
		placeholder: SWISS_QR_BILL.debtorName,
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
				name: 'Combined',
				value: 'K',
			},
{
				name: 'Structured',
				value: 'S',
			},
		],
	},
	{
		displayName: 'Ultimate Debtor Street Name or Address Line 1',
		name: 'udStreetOrAddressLine1',
		type: 'string',
		default: '',
		description: 'Debtor\'s address line with max 70 characters',
		placeholder: SWISS_QR_BILL.debtorStreet,
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
	},
	{
		displayName: 'Ultimate Building Number or Address Line 2',
		name: 'udStreetOrAddressLine2',
		type: 'string',
		default: '',
		description: 'Debtor\'s address line - For S type 16 characters and for K type 70 characters',
		placeholder: SWISS_QR_BILL.debtorBuilding,
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
		description: 'Debtor\'s postal code',
		placeholder: SWISS_QR_BILL.postalCode,
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
		description: 'Debtor\'s Town/City',
		placeholder: SWISS_QR_BILL.city,
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
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Creditor Reference',
				value: 'SCOR',
			},
{
				name: 'No Reference',
				value: 'NON',
			},
{
				name: 'QR Reference',
				value: 'QRR',
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
				name: 'French',
				value: 'French',
			},
{
				name: 'German',
				value: 'German',
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
				name: 'Dotted Line',
				value: 'DottedLine',
			},
{
				name: 'Line With Scissor',
				value: 'LineWithScissor',
			},
{
				name: 'Solid Line',
				value: 'SolidLine',
			},
		],
	},
	{
		displayName: 'Format Type',
		name: 'formatType',
		type: 'options',
		required: true,
		default: 'pdf',
		description: 'Output format type',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				name: 'Empty (Null)',
				value: '',
			},
{
				name: 'JPEG',
				value: 'jpeg',
			},
{
				name: 'PDF',
				value: 'pdf',
			},
{
				name: 'PNG',
				value: 'png',
			},
{
				name: 'TIFF',
				value: 'tiff',
			},
		],
	},
	{
		displayName: 'Paging Options',
		name: 'pagingOptions',
		type: 'options',
		required: true,
		default: 'first',
		description: 'Where to place the Swiss QR bill page',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				formatType: ['pdf'],
			},
		},
		options: [
			{
				name: 'Add Page At End',
				value: 'AddPageAtEnd',
			},
{
				name: 'Custom',
				value: 'custom',
			},
{
				name: 'First',
				value: 'first',
			},
{
				name: 'Last',
				value: 'last',
			},
		],
	},
	{
		displayName: 'Custom Page',
		name: 'pageNumber',
		type: 'number',
		default: 1,
		typeOptions: {
			minValue: 1,
			numberPrecision: 0,
		},
		description: 'Custom page number (only one page allowed)',
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
				formatType: ['pdf'],
				pagingOptions: ['custom'],
			},
		},
	},




	...swissQrOutputFileNameFields(createSwissQrBillOp),
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output PDF file',
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
		placeholder: COLLECTION_PLACEHOLDER.addOption,
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CreateSwissQrBill],
			},
		},
		options: [
			{
				displayName: 'AV1 Parameter',
				name: 'av1',
				type: 'string',
				default: '',
				description: 'Alternative scheme parameter',
				placeholder: SWISS_QR_BILL.av1,
			},
{
				displayName: 'AV2 Parameter',
				name: 'av2',
				type: 'string',
				default: '',
				description: 'Alternative scheme parameter',
				placeholder: SWISS_QR_BILL.av2,
			},
{
				displayName: 'Billing Info',
				name: 'billingInfo',
				type: 'string',
				default: '',
				description: 'Billing info of the customer',
				placeholder: SWISS_QR_BILL.billingInfo,
			},
{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: CUSTOM_PROFILES_PLACEHOLDER,
			},
{
				displayName: 'Reference',
				name: 'reference',
				type: 'string',
				default: '',
				description: 'Reference, maximum 27 characters',
				placeholder: SWISS_QR_BILL.reference,
			},
{
				displayName: 'Unstructured Message',
				name: 'unstructuredMessage',
				type: 'string',
				default: '',
				description: 'Unstructured Message, maximum 140 characters permitted',
				placeholder: SWISS_QR_BILL.unstructuredMessage,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const fileName =
		inputDataType === 'none' ? '' : (this.getNodeParameter('fileName', index) as string);
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
	const formatType = this.getNodeParameter('formatType', index) as string;
	const pagingOptions = this.getNodeParameter('pagingOptions', index, 'first') as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let docName: string;
	let blobId: string = '';
	let inputDocName: string = '';

	// Handle different input types
	if (inputDataType === 'none') {
		blobId = '';
		docContent = '';
		docName = '';
	} else if (inputDataType === 'binaryData') {
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

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = fileName || binaryData.fileName || 'document.pdf';
		docName = inputDocName;

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in CreateSwissQrBill API payload
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
		docName = fileName || 'document.pdf';
	} else if (inputDataType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;

		// Validate URL format
		try {
			new URL(fileUrl);
		} catch {
						throw new NodeOperationError(this.getNode(), 'Invalid URL format. Please provide a valid URL to the file.', { itemIndex: index });
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(fileUrl);
		docName = fileName || fileUrl.split('/').pop() || 'document.pdf';
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
			throw new Error('File content is required');
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('File content is required');
		}
	} else if (inputDataType === 'none') {
		// No input content is expected when input type is none
	}

	// Prepare payload with all required parameters for Swiss QR Bill creation (following Python logic)
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = inputDataType === 'none' ? '' : (docName || inputDocName || fileName || 'document.pdf');
	let pageNumber: number | undefined;
	if (formatType === 'pdf' && pagingOptions === 'custom') {
		pageNumber = this.getNodeParameter('pageNumber', index, 1) as number;
		if (!Number.isInteger(pageNumber) || pageNumber < 1) {
			throw new Error('Custom Page must be a single positive integer.');
		}
	}

	const payload: IDataObject = {
		docContent,							  // Binary data uses blobId format, base64 uses base64 string, URL uses URL string (Required)
		docName: finalDocName,					// Empty when input type is none
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
		formatType: formatType || null,		  // Output format type (pdf/png/jpeg/tiff or null)
		pagingOptions: formatType === 'pdf' ? pagingOptions : null, // Page insertion behavior for PDF only
		IsAsync: true,							 // Asynchronous processing as requested
	};
	if (formatType === 'pdf' && pagingOptions === 'custom') {
		payload.pageNumber = pageNumber;
	}

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
		sanitizeProfiles.call(this, payload);
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
				[binaryDataName || 'data']: await this.helpers.prepareBinaryData(result, outputFileName),
			},
			pairedItem: { item: index },
		},
	];

	return returnData;
}

