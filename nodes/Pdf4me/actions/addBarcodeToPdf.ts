import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
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
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add barcode to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
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
				operation: [ActionConstants.AddBarcodeToPdf],
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
				operation: [ActionConstants.AddBarcodeToPdf],
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
		description: 'URL to the PDF file to add barcode to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Barcode Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'Text to encode in the barcode',
		placeholder: 'PDF4me Barcode Sample',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',
		required: true,
		default: 'qrCode',
		description: 'Select the type of barcode to add to the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{ name: 'QR Code', value: 'qrCode' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'Aztec', value: 'aztec' },
			{ name: 'Han Xin', value: 'hanXin' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'EAN-13', value: 'ean13' },
			{ name: 'UPC-A', value: 'upcA' },
			{ name: 'Code 39', value: 'code39' },
			{ name: 'Code 93', value: 'code93' },
			{ name: 'Codabar', value: 'codabar' },
			{ name: 'Interleaved 2 of 5', value: 'code2Of5Interleaved' },
		],
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		description: 'Page options: empty for all pages, "1", "1,3,5", "2-5", "1,3,7-10", "2-"',
		placeholder: '1-3',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Positioning',
		name: 'positioning',
		type: 'collection',
		placeholder: 'Add Positioning Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{
				displayName: 'Horizontal Alignment',
				name: 'alignX',
				type: 'options',
				default: 'Right',
				options: [
					{ name: 'Left', value: 'Left' },
					{ name: 'Center', value: 'Center' },
					{ name: 'Right', value: 'Right' },
				],
			},
			{
				displayName: 'Vertical Alignment',
				name: 'alignY',
				type: 'options',
				default: 'Bottom',
				options: [
					{ name: 'Top', value: 'Top' },
					{ name: 'Middle', value: 'Middle' },
					{ name: 'Bottom', value: 'Bottom' },
				],
			},
			{
				displayName: 'Horizontal Margin (mm)',
				name: 'marginXInMM',
				type: 'string',
				default: '20',
				description: 'Horizontal margin in millimeters',
			},
			{
				displayName: 'Vertical Margin (mm)',
				name: 'marginYInMM',
				type: 'string',
				default: '20',
				description: 'Vertical margin in millimeters',
			},
		],
	},
	{
		displayName: 'Barcode Size',
		name: 'barcodeSize',
		type: 'collection',
		placeholder: 'Add Size Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{
				displayName: 'Height (mm)',
				name: 'heightInMM',
				type: 'string',
				default: '40',
				description: 'Height in millimeters (0 for auto-detect)',
			},
			{
				displayName: 'Width (mm)',
				name: 'widthInMM',
				type: 'string',
				default: '40',
				description: 'Width in millimeters (0 for auto-detect)',
			},
			{
				displayName: 'Height (points)',
				name: 'heightInPt',
				type: 'string',
				default: '113',
				description: 'Height in points (0 for auto-detect)',
			},
			{
				displayName: 'Width (points)',
				name: 'widthInPt',
				type: 'string',
				default: '113',
				description: 'Width in points (0 for auto-detect)',
			},
		],
	},
	{
		displayName: 'Appearance',
		name: 'appearance',
		type: 'collection',
		placeholder: 'Add Appearance Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{
				displayName: 'Opacity',
				name: 'opacity',
				type: 'number',
				default: 100,
				description: 'Opacity (0-100): 0=transparent, 100=opaque',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
			},
			{
				displayName: 'Display Text',
				name: 'displayText',
				type: 'options',
				default: 'below',
				options: [
					{ name: 'Above', value: 'above' },
					{ name: 'Below', value: 'below' },
				],
			},
			{
				displayName: 'Hide Text',
				name: 'hideText',
				type: 'boolean',
				default: false,
				description: 'Whether to hide the barcode text',
			},
			{
				displayName: 'Show Only in Print',
				name: 'showOnlyInPrint',
				type: 'boolean',
				default: false,
				description: 'Whether to show barcode only when printing',
			},
			{
				displayName: 'Text Above Barcode',
				name: 'isTextAbove',
				type: 'boolean',
				default: false,
				description: 'Whether to position text above the barcode',
			},
		],
	},
	{
		displayName: 'Output Options',
		name: 'outputOptions',
		type: 'collection',
		placeholder: 'Add Output Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				default: 'output_with_barcode.pdf',
				description: 'Name for the output PDF file',
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use JSON to adjust custom properties. See https://dev.pdf4me.com/documentation/ for details.',
				placeholder: '{ "outputDataFormat": "base64" }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const text = this.getNodeParameter('text', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;

	const positioning = this.getNodeParameter('positioning', index) as IDataObject;
	const barcodeSize = this.getNodeParameter('barcodeSize', index) as IDataObject;
	const appearance = this.getNodeParameter('appearance', index) as IDataObject;
	const outputOptions = this.getNodeParameter('outputOptions', index) as IDataObject;

	// Prepare the request body
	const body: IDataObject = {
		text,
		barcodeType,
		async: true, // Enable async processing
	};

	// Add pages if specified
	if (pages) {
		body.pages = pages;
	}

	// Add positioning options
	if (positioning.alignX) body.alignX = positioning.alignX;
	if (positioning.alignY) body.alignY = positioning.alignY;
	if (positioning.marginXInMM) body.marginXInMM = positioning.marginXInMM;
	if (positioning.marginYInMM) body.marginYInMM = positioning.marginYInMM;

	// Add barcode size options
	if (barcodeSize.heightInMM) body.heightInMM = barcodeSize.heightInMM;
	if (barcodeSize.widthInMM) body.widthInMM = barcodeSize.widthInMM;
	if (barcodeSize.heightInPt) body.heightInPt = barcodeSize.heightInPt;
	if (barcodeSize.widthInPt) body.widthInPt = barcodeSize.widthInPt;

	// Add appearance options
	if (appearance.opacity !== undefined) body.opacity = appearance.opacity;
	if (appearance.displayText) body.displayText = appearance.displayText;
	if (appearance.hideText !== undefined) body.hideText = appearance.hideText;
	if (appearance.showOnlyInPrint !== undefined) body.showOnlyInPrint = appearance.showOnlyInPrint;
	if (appearance.isTextAbove !== undefined) body.isTextAbove = appearance.isTextAbove;

	// Add output options
	if (outputOptions.outputFileName) body.docName = outputOptions.outputFileName;

	// Handle input data based on type
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const base64Content = buffer.toString('base64');
		body.docContent = base64Content;
	} else if (inputDataType === 'base64') {
		const base64Content = this.getNodeParameter('base64Content', index) as string;
		body.docContent = base64Content;
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		body.docUrl = pdfUrl;
	}

	// Add custom profiles if specified
	const profiles = outputOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
		sanitizeProfiles(body);
	}

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/addbarcode', body);

	// Handle the response
	if (responseData) {
		// Check if it's a processing status response
		if (typeof responseData === 'object' && responseData.status === 'processing') {
			return [
				{
					json: {
						status: 'processing',
						message: responseData.message,
						pollUrl: responseData.pollUrl,
						context: responseData.context,
					},
				},
			];
		}

		// Handle successful binary response
		if (responseData instanceof Buffer) {
			const fileName = outputOptions?.outputFileName as string || 'output_with_barcode.pdf';

			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				fileName,
				'application/pdf',
			);

			return [
				{
					json: {
						fileName,
						mimeType: 'application/pdf',
						fileSize: responseData.length,
						success: true,
						message: 'Barcode added to PDF successfully',
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
