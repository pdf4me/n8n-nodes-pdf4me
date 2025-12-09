import type { INodeProperties, INodeExecutionData, IDataObject } from 'n8n-workflow';
import type { IExecuteFunctions } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'none',
		description: 'How to provide the input document (optional - only needed if rendering invoice on PDF)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'None',
				value: 'none',
				description: 'No document input required (XML/JSON/CSV only)',
			},
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
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the file to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'Base64 encoded content of the file to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
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
				operation: [ActionConstants.ZugferdInvoice],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'invoice.pdf',
		required: true,
		description: 'Name of the document',
		placeholder: 'invoice.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		hint: 'Create ZUGFeRD compliant invoices from XML, JSON, or CSV data. See our <b><a href="https://docs.pdf4me.com/n8n/invoice/zugferd-invoice/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Output Mode',
		name: 'outputMode',
		type: 'options',
		required: true,
		default: 'XmlWithPdf',
		description: 'Output format for the Zugferd invoice',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'XML Only',
				value: 'XmlOnly',
				description: 'Generate only the XML file',
			},
			{
				name: 'XML With PDF',
				value: 'XmlWithPdf',
				description: 'Generate XML embedded in PDF',
			},
		],
	},
	{
		displayName: 'Conformance Level',
		name: 'conformanceLevel',
		type: 'options',
		required: true,
		default: 'BASIC',
		description: 'Zugferd conformance level',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'BASIC',
				value: 'BASIC',
			},
			{
				name: 'COMFORT',
				value: 'COMFORT',
			},
			{
				name: 'EXTENDED',
				value: 'EXTENDED',
			},
		],
	},
	{
		displayName: 'Zugferd Version',
		name: 'zugferdVersion',
		type: 'string',
		required: true,
		default: '1.0',
		description: 'Zugferd version to use',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
	},
	{
		displayName: 'Language',
		name: 'language',
		type: 'options',
		required: true,
		default: 'de',
		description: 'Language for the Zugferd invoice',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'German',
				value: 'de',
			},
			{
				name: 'French',
				value: 'fr',
			},
			{
				name: 'Italian',
				value: 'it',
			},
			{
				name: 'English',
				value: 'en',
			},
			{
				name: 'Spanish',
				value: 'es',
			},
			{
				name: 'Dutch',
				value: 'nl',
			},
			{
				name: 'Polish',
				value: 'pl',
			},
			{
				name: 'Portuguese',
				value: 'pt',
			},
			{
				name: 'Czech',
				value: 'cs',
			},
		],
	},
	{
		displayName: 'Render Invoice On PDF',
		name: 'renderInvoiceOnPdf',
		type: 'boolean',
		required: true,
		default: true,
		description: 'Whether to render the invoice visually on the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
	},
	{
		displayName: 'Input Format',
		name: 'inputFormat',
		type: 'options',
		required: true,
		default: 'XML',
		description: 'Format of the invoice data input',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'XML',
				value: 'XML',
			},
			{
				name: 'JSON',
				value: 'JSON',
			},
			{
				name: 'CSV',
				value: 'CSV',
			},
		],
	},
	{
		displayName: 'Invoice Data Input Type',
		name: 'invoiceDataInputType',
		type: 'options',
		required: true,
		default: 'directText',
		description: 'How to provide the invoice data (XML/JSON/CSV)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
			},
		},
		options: [
			{
				name: 'Direct Text',
				value: 'directText',
				description: 'Copy and paste the invoice data directly',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide invoice data as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to invoice data file',
			},
		],
	},
	{
		displayName: 'Invoice Binary Property',
		name: 'invoiceBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the invoice data file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				invoiceDataInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Invoice Base64 Content',
		name: 'invoiceBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'Base64 encoded invoice data content',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				invoiceDataInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Invoice Data URL',
		name: 'invoiceDataUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL to the invoice data file (XML/JSON/CSV)',
		placeholder: 'https://example.com/invoice.xml',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				invoiceDataInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Invoice XML Data',
		name: 'invoiceXmlData',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'XML invoice data (paste directly)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				inputFormat: ['XML'],
				invoiceDataInputType: ['directText'],
			},
		},
	},
	{
		displayName: 'Invoice JSON Data',
		name: 'invoiceJsonData',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'JSON invoice data (paste directly)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				inputFormat: ['JSON'],
				invoiceDataInputType: ['directText'],
			},
		},
	},
	{
		displayName: 'Invoice CSV Data',
		name: 'invoiceCsvData',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'CSV invoice data (paste directly)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
				inputFormat: ['CSV'],
				invoiceDataInputType: ['directText'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'zugferd_invoice.pdf',
		description: 'Name for the output Zugferd invoice file',
		placeholder: 'zugferd_invoice.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ZugferdInvoice],
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
				operation: [ActionConstants.ZugferdInvoice],
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
				operation: [ActionConstants.ZugferdInvoice],
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
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const outputMode = this.getNodeParameter('outputMode', index) as string;
	const conformanceLevel = this.getNodeParameter('conformanceLevel', index) as string;
	const zugferdVersion = this.getNodeParameter('zugferdVersion', index) as string;
	const language = this.getNodeParameter('language', index) as string;
	const renderInvoiceOnPdf = this.getNodeParameter('renderInvoiceOnPdf', index) as boolean;
	const inputFormat = this.getNodeParameter('inputFormat', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent = '';
	let fileName = docName;

	// Handle different input types (optional - only if rendering on PDF)
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
		fileName = item[0].binary[binaryPropertyName].fileName || docName;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		fileName = docName;
	} else if (inputDataType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		try {
			new URL(fileUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the file.');
		}
		docContent = await downloadPdfFromUrl.call(this, fileUrl);
		fileName = docName;
	}

	// Get invoice data input type and handle accordingly
	const invoiceDataInputType = this.getNodeParameter('invoiceDataInputType', index) as string;
	let invoiceDataBase64: string;

	if (invoiceDataInputType === 'directText') {
		// Get direct text input based on format
		let invoiceData: string | undefined;
		if (inputFormat === 'XML') {
			invoiceData = this.getNodeParameter('invoiceXmlData', index) as string;
		} else if (inputFormat === 'JSON') {
			invoiceData = this.getNodeParameter('invoiceJsonData', index) as string;
		} else if (inputFormat === 'CSV') {
			invoiceData = this.getNodeParameter('invoiceCsvData', index) as string;
		}

		if (!invoiceData || invoiceData.trim() === '') {
			throw new Error(`Invoice ${inputFormat} data is required`);
		}

		// Convert direct text to base64
		invoiceDataBase64 = Buffer.from(invoiceData, 'utf8').toString('base64');
	} else if (invoiceDataInputType === 'binaryData') {
		// Get invoice data from binary property
		const invoiceBinaryPropertyName = this.getNodeParameter('invoiceBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data for the invoice.');
		}

		if (!item[0].binary[invoiceBinaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${invoiceBinaryPropertyName}' not found for invoice data. Available properties: ${availableProperties || 'none'}.`,
			);
		}

		// Get binary buffer and convert to base64
		const buffer = await this.helpers.getBinaryDataBuffer(index, invoiceBinaryPropertyName);
		invoiceDataBase64 = buffer.toString('base64');
	} else if (invoiceDataInputType === 'base64') {
		// Get base64 content directly
		let base64Content = this.getNodeParameter('invoiceBase64Content', index) as string;

		// Remove data URL prefix if present
		if (base64Content.includes(',')) {
			base64Content = base64Content.split(',')[1];
		}

		if (!base64Content || base64Content.trim() === '') {
			throw new Error('Invoice base64 content is required');
		}

		invoiceDataBase64 = base64Content;
	} else if (invoiceDataInputType === 'url') {
		// Download invoice data from URL
		const invoiceDataUrl = this.getNodeParameter('invoiceDataUrl', index) as string;

		try {
			new URL(invoiceDataUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the invoice data file.');
		}

		// Download and convert to base64
		invoiceDataBase64 = await downloadInvoiceDataFromUrl.call(this, invoiceDataUrl);
	} else {
		throw new Error(`Unsupported invoice data input type: ${invoiceDataInputType}`);
	}

	if (!invoiceDataBase64 || invoiceDataBase64.trim() === '') {
		throw new Error('Invoice data conversion to base64 failed or resulted in empty data');
	}

	// Build ZugferdCreatorAction object
	const ZugferdCreatorAction: IDataObject = {
		OutputMode: outputMode,
		InputFormat: inputFormat,
		ConformanceLevel: conformanceLevel,
		ZugferdVersion: zugferdVersion,
		RenderInvoiceOnPdf: renderInvoiceOnPdf,
		Language: language,
	};

	// Add invoice data based on format (already in base64)
	if (inputFormat === 'XML') {
		ZugferdCreatorAction.InvoiceXmlData = invoiceDataBase64;
	} else if (inputFormat === 'JSON') {
		ZugferdCreatorAction.InvoiceJsonData = invoiceDataBase64;
	} else if (inputFormat === 'CSV') {
		ZugferdCreatorAction.InvoiceCsvData = invoiceDataBase64;
	}

	// Prepare payload
	const payload: IDataObject = {
		docContent: docContent || '',
		docName: fileName,
		isAsync: 'true',
		ZugferdCreatorAction,
	};

	// Apply advanced options if provided
	if (advancedOptions.profiles) {
		payload.profiles = advancedOptions.profiles;
		sanitizeProfiles(payload);
	}

	// Call the PDF4me API to create Zugferd Invoice
	const result = await pdf4meAsyncRequest.call(this, '/api/v2/CreateZugferdInvoice', payload);

	// Determine file extension based on output mode
	const fileExtension = outputMode === 'XmlOnly' ? 'xml' : 'pdf';
	let finalOutputFileName = outputFileName;
	if (!finalOutputFileName || finalOutputFileName.trim() === '') {
		finalOutputFileName = `zugferd_invoice.${fileExtension}`;
	} else if (!finalOutputFileName.includes('.')) {
		finalOutputFileName = `${finalOutputFileName}.${fileExtension}`;
	}

	// Return the result
	const returnData: INodeExecutionData[] = [
		{
			json: {
				fileName: finalOutputFileName,
			},
			binary: {
				[binaryDataName || 'data']: await this.helpers.prepareBinaryData(result, finalOutputFileName),
			},
		},
	];

	return returnData;
}

async function downloadPdfFromUrl(this: IExecuteFunctions, pdfUrl: string): Promise<string> {
	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		});

		return Buffer.from(response).toString('base64');
	} catch (error) {
		throw new Error(`Failed to download file from URL: ${(error as Error).message}`);
	}
}

async function downloadInvoiceDataFromUrl(this: IExecuteFunctions, dataUrl: string): Promise<string> {
	try {
		// Use regular httpRequest for external URLs (XML/JSON/CSV files)
		const response = await this.helpers.httpRequest({
			method: 'GET',
			url: dataUrl,
			encoding: 'arraybuffer',
			returnFullResponse: true,
		});

		// Convert the downloaded data to base64
		let buffer: Buffer;
		if (response.body instanceof Buffer) {
			buffer = response.body;
		} else if (typeof response.body === 'string') {
			buffer = Buffer.from(response.body, 'utf8');
		} else if (response.body instanceof ArrayBuffer) {
			buffer = Buffer.from(response.body);
		} else if (ArrayBuffer.isView(response.body)) {
			buffer = Buffer.from(response.body.buffer, response.body.byteOffset, response.body.byteLength);
		} else {
			buffer = Buffer.from(String(response.body), 'utf8');
		}

		return buffer.toString('base64');
	} catch (error) {
		throw new Error(`Failed to download invoice data from URL: ${(error as Error).message}`);
	}
}
