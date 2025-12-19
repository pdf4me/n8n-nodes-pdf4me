import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
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
		hint: 'Add barcodes to your PDF. See our <b><a href="https://docs.pdf4me.com/n8n/barcode/add-barcode-to-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',

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
			{ name: 'Code 11', value: 'code11' },
			{ name: 'Code 2 of 5 Standard', value: 'code2Of5Standard' },
			{ name: 'Code 2 of 5 IATA', value: 'code2Of5Iata' },
			{ name: 'Code 2 of 5 Matrix', value: 'code2Of5Matrix' },
			{ name: 'Code 2 of 5 Data Logic', value: 'code2Of5DataLogic' },
			{ name: 'Code 2 of 5 Industry', value: 'code2Of5Industry' },
			{ name: 'Code 39 Extended', value: 'code39Extended' },
			{ name: 'EAN-8', value: 'ean8' },
			{ name: 'EAN-8 with 2 Addon', value: 'ean8With2Addon' },
			{ name: 'EAN-8 with 5 Addon', value: 'ean8With5Addon' },
			{ name: 'EAN-13 with 2 Addon', value: 'ean13With2Addon' },
			{ name: 'EAN-13 with 5 Addon', value: 'ean13With5Addon' },
			{ name: 'EAN UCC 128', value: 'eanUcc128' },
			{ name: 'UPC-12', value: 'upc12' },
			{ name: 'Codabar 2', value: 'codabar2' },
			{ name: 'Codabar 18', value: 'codabar18' },
			{ name: 'Deutsche Post Leitcode', value: 'deutschePostLeitcode' },
			{ name: 'Deutsche Post Identcode', value: 'deutschePostIdentcode' },
			{ name: 'ISBN-13 with 5 Addon', value: 'isbn13With5Addon' },
			{ name: 'ISMN', value: 'ismn' },
			{ name: 'ISSN', value: 'issn' },
			{ name: 'ISSN with 2 Addon', value: 'issnWith2Addon' },
			{ name: 'Flattermarken', value: 'flattermarken' },
			{ name: 'GS1 DataBar', value: 'gs1DataBar' },
			{ name: 'GS1 DataBar Limited', value: 'gs1DataBarLimited' },
			{ name: 'GS1 DataBar Expanded', value: 'gs1DataBarExpanded' },
			{ name: 'Telepen Alpha', value: 'telepenAlpha' },
			{ name: 'UCC-128', value: 'ucc128' },
			{ name: 'UPC-A with 2 Addon', value: 'upcAWith2Addon' },
			{ name: 'UPC-A with 5 Addon', value: 'upcAWith5Addon' },
			{ name: 'UPC-E', value: 'upcE' },
			{ name: 'UPC-E with 2 Addon', value: 'upcEWith2Addon' },
			{ name: 'UPC-E with 5 Addon', value: 'upcEWith5Addon' },
			{ name: 'USPS Postnet 5', value: 'uspsPostnet5' },
			{ name: 'USPS Postnet 6', value: 'uspsPostnet6' },
			{ name: 'USPS Postnet 9', value: 'uspsPostnet9' },
			{ name: 'USPS Postnet 10', value: 'uspsPostnet10' },
			{ name: 'USPS Postnet 11', value: 'uspsPostnet11' },
			{ name: 'USPS Postnet 12', value: 'uspsPostnet12' },
			{ name: 'Plessey', value: 'plessey' },
			{ name: 'MSI', value: 'msi' },
			{ name: 'SSCC-18', value: 'sscc18' },
			{ name: 'FIM', value: 'fim' },
			{ name: 'LOGMARS', value: 'logmars' },
			{ name: 'Pharmacode One Track', value: 'pharmacodeOneTrack' },
			{ name: 'PZN-7', value: 'pzn7' },
			{ name: 'Pharmacode Two Track', value: 'pharmacodeTwoTrack' },
			{ name: 'CEP Net', value: 'cepNet' },
			{ name: 'PDF417 Truncated', value: 'pdf417Truncated' },
			{ name: 'Maxicode', value: 'maxicode' },
			{ name: 'Code 128 Subset A', value: 'code128SubsetA' },
			{ name: 'Code 128 Subset B', value: 'code128SubsetB' },
			{ name: 'Code 128 Subset C', value: 'code128SubsetC' },
			{ name: 'Code 93 Extended', value: 'code93Extended' },
			{ name: 'Australian Post Custom', value: 'australianPostCustom' },
			{ name: 'Australian Post Custom 2', value: 'australianPostCustom2' },
			{ name: 'Australian Post Custom 3', value: 'australianPostCustom3' },
			{ name: 'Australian Post Reply Paid', value: 'australianPostReplyPaid' },
			{ name: 'Australian Post Routing', value: 'australianPostRouting' },
			{ name: 'Australian Post Redirection', value: 'australianPostRedirection' },
			{ name: 'ISBN-13', value: 'isbn13' },
			{ name: 'RM4SCC', value: 'rm4Scc' },
			{ name: 'EAN-14', value: 'ean14' },
			{ name: 'VIN', value: 'vin' },
			{ name: 'Codablock F', value: 'codablockF' },
			{ name: 'NVE-18', value: 'nve18' },
			{ name: 'Japanese Postal', value: 'japanesePostal' },
			{ name: 'Korean Postal Authority', value: 'koreanPostalAuthority' },
			{ name: 'GS1 DataBar Truncated', value: 'gs1DataBarTruncated' },
			{ name: 'GS1 DataBar Stacked', value: 'gs1DataBarStacked' },
			{ name: 'GS1 DataBar Stacked Omnidirectional', value: 'gs1DataBarStackedOmnidirectional' },
			{ name: 'GS1 DataBar Expanded Stacked', value: 'gs1DataBarExpandedStacked' },
			{ name: 'Planet 12', value: 'planet12' },
			{ name: 'Planet 14', value: 'planet14' },
			{ name: 'Micro PDF417', value: 'microPdf417' },
			{ name: 'USPS Intelligent Mail', value: 'uspsIntelligentMail' },
			{ name: 'Plessey Bidirectional', value: 'plesseyBidirectional' },
			{ name: 'Telepen', value: 'telepen' },
			{ name: 'GS1-128', value: 'gs1_128' },
			{ name: 'ITF-14', value: 'itf14' },
			{ name: 'KIX', value: 'kix' },
			{ name: 'Code 32', value: 'code32' },
			{ name: 'Italian Postal 2 of 5', value: 'italianPostal2Of5' },
			{ name: 'Italian Postal 3 of 9', value: 'italianPostal3Of9' },
			{ name: 'DPD', value: 'dpd' },
			{ name: 'Micro QR Code', value: 'microQRCode' },
			{ name: 'HIBC LIC 128', value: 'hibcLic128' },
			{ name: 'HIBC LIC 3OF9', value: 'hibcLic3OF9' },
			{ name: 'HIBC PAS 128', value: 'hibcPas128' },
			{ name: 'HIBC PAS 3OF9', value: 'hibcPas3OF9' },
			{ name: 'HIBC LIC Data Matrix', value: 'hibcLicDataMatrix' },
			{ name: 'HIBC PAS Data Matrix', value: 'hibcPasDataMatrix' },
			{ name: 'HIBC LIC QR Code', value: 'hibcLicQRCode' },
			{ name: 'HIBC PAS QR Code', value: 'hibcPasQRCode' },
			{ name: 'HIBC LIC PDF417', value: 'hibcLicPDF417' },
			{ name: 'HIBC PAS PDF417', value: 'hibcPasPDF417' },
			{ name: 'HIBC LIC MPDF417', value: 'hibcLicMPDF417' },
			{ name: 'HIBC PAS MPDF417', value: 'hibcPasMPDF417' },
			{ name: 'HIBC LIC CODABLOCK_F', value: 'hibcLicCODABLOCK_F' },
			{ name: 'HIBC PAS CODABLOCK_F', value: 'hibcPasCODABLOCK_F' },
			{ name: 'QR Code 2005', value: 'qrcode2005' },
			{ name: 'PZN-8', value: 'pzn8' },
			{ name: 'Dot Code', value: 'dotCode' },
			{ name: 'USPS IM Package', value: 'uSPSIMPackage' },
			{ name: 'Swedish Postal Shipment ID', value: 'swedishPostalShipmentId' },
			{ name: 'Mailmark 2D', value: 'mailmark_2D' },
			{ name: 'UPU S10', value: 'upuS10' },
			{ name: 'Mailmark 4state', value: 'mailmark_4state' },
			{ name: 'HIBC LIC Aztec', value: 'hibcLicAztec' },
			{ name: 'HIBC PAS Aztec', value: 'hibcPasAztec' },
			{ name: 'PPN', value: 'ppn' },
			{ name: 'NTIN', value: 'ntin' },
			{ name: 'Swiss QR Code', value: 'swissQrCode' },
		],
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		required: true,
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
		displayName: 'Horizontal Alignment',
		name: 'alignX',
		type: 'options',
		required: true,
		default: 'Right',
		description: 'Set the horizontal alignment of the Barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
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
		required: true,
		default: 'Bottom',
		description: 'Set the vertical alignment of the Barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Middle', value: 'Middle' },
			{ name: 'Bottom', value: 'Bottom' },
		],
	},
	{
		displayName: 'Height in mm',
		name: 'heightInMM',
		type: 'string',
		required: true,
		default: '40',
		description: 'Height of the barcode in millimeters or "0" for auto-detect',
		placeholder: '40',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Width in mm',
		name: 'widthInMM',
		type: 'string',
		required: true,
		default: '40',
		description: 'Width of the Barcode in millimeters. "0" for auto-detect',
		placeholder: '40',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Margin Horizontal In mm',
		name: 'marginXInMM',
		type: 'string',
		required: true,
		default: '20',
		description: 'Margin from left origin of the Barcode in millimeters',
		placeholder: '20',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Margin Vertical In mm',
		name: 'marginYInMM',
		type: 'string',
		required: true,
		default: '20',
		description: 'Margin from the top origin of the Barcode in millimeters',
		placeholder: '20',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Height In Pt',
		name: 'heightInPt',
		type: 'string',
		required: true,
		default: '113',
		description: 'Height of the barcode in points(pt). or "0" for auto-detect',
		placeholder: '113',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Width In Pt',
		name: 'widthInPt',
		type: 'string',
		required: true,
		default: '113',
		description: 'Width of the Barcode in points(pt). "0" for auto-detect',
		placeholder: '113',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Margin X In Pt',
		name: 'marginXInPt',
		type: 'string',
		required: true,
		default: '10',
		description: 'Margin from top origin of the Barcode in points(pt)',
		placeholder: '10',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Margin Y In Pt',
		name: 'marginYInPt',
		type: 'string',
		required: true,
		default: '10',
		description: 'Margin from left origin of the Barcode in points(pt)',
		placeholder: '10',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		required: true,
		default: 100,
		description: 'Give a value between 0 to 100 where "0" is completely transparent',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Display Text',
		name: 'displayText',
		type: 'options',
		required: true,
		default: 'below',
		description: 'Text will be display of the barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
		options: [
			{ name: 'Above', value: 'above' },
			{ name: 'Below', value: 'below' },
		],
	},
	{
		displayName: 'Hide Text',
		name: 'hideText',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Select "true" to hide the text of the Barcode and "false" to display it alongside the Barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Show Only In Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		required: true,
		default: false,
		description: 'If you want to Show Only In Print, Show only in print. You can choose these two options',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
	{
		displayName: 'Is Text Above',
		name: 'isTextAbove',
		type: 'boolean',
		required: true,
		default: false,
		description: 'If you want to Is Text Above text. You can choose these two options',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
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
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'pdf-with-barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddBarcodeToPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const text = this.getNodeParameter('text', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const heightInMM = this.getNodeParameter('heightInMM', index) as string;
	const widthInMM = this.getNodeParameter('widthInMM', index) as string;
	const marginXInMM = this.getNodeParameter('marginXInMM', index) as string;
	const marginYInMM = this.getNodeParameter('marginYInMM', index) as string;
	const heightInPt = this.getNodeParameter('heightInPt', index) as string;
	const widthInPt = this.getNodeParameter('widthInPt', index) as string;
	const marginXInPt = this.getNodeParameter('marginXInPt', index) as string;
	const marginYInPt = this.getNodeParameter('marginYInPt', index) as string;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const displayText = this.getNodeParameter('displayText', index) as string;
	const hideText = this.getNodeParameter('hideText', index) as boolean;
	const showOnlyInPrint = this.getNodeParameter('showOnlyInPrint', index) as boolean;
	const isTextAbove = this.getNodeParameter('isTextAbove', index) as boolean;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	const outputOptions = this.getNodeParameter('outputOptions', index) as IDataObject;

	// Handle input data based on type
	let docContent: string;
	let docName: string = (outputOptions.outputFileName as string) || 'output_with_barcode.pdf';
	let blobId: string = '';
	let inputDocName: string = '';

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
				'Common property names are "data" for file uploads or the filename without extension.'
			);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || 'document.pdf';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in addbarcode API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;

		// Only use input filename if no output filename is specified
		if (!outputOptions.outputFileName) {
			if (binaryData.fileName) {
				docName = binaryData.fileName.replace(/\.[^/.]+$/, '') + '_with_barcode.pdf';
			}
		}
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}

		blobId = '';
		// Only use default filename if no output filename is specified
		if (!outputOptions.outputFileName) {
			docName = 'document_with_barcode.pdf';
		}
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// Validate URL format
		try {
			new URL(pdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the PDF file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(pdfUrl);
		// Only use URL filename if no output filename is specified
		if (!outputOptions.outputFileName) {
			const urlFileName = pdfUrl.split('/').pop() || 'document.pdf';
			docName = urlFileName.replace(/\.[^/.]+$/, '') + '_with_barcode.pdf';
		}
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
			throw new Error('PDF content is required');
		}
		// Basic validation for base64 content
		try {
			const buffer = Buffer.from(docContent, 'base64');
			if (buffer.length === 0) {
				throw new Error('PDF content is empty after base64 decoding');
			}
			// Check if it starts with PDF signature (%PDF)
			const pdfSignature = buffer.toString('ascii', 0, 4);
			if (pdfSignature !== '%PDF') {
				// Warning: Content does not start with PDF signature (%PDF). This might not be a valid PDF file.
			}
		} catch (error) {
			throw new Error(`Invalid base64 encoded PDF content: ${error.message}`);
		}
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}
	}

	// Prepare the request body with all required parameters
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'output_with_barcode.pdf';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
		docName: finalDocName,
		text,
		barcodeType,
		pages,
		alignX,
		alignY,
		heightInMM,
		widthInMM,
		marginXInMM,
		marginYInMM,
		heightInPt,
		widthInPt,
		marginXInPt,
		marginYInPt,
		opacity,
		displayText,
		hideText,
		showOnlyInPrint,
		isTextAbove,
		IsAsync: true,

	};

	// Add custom profiles if specified
	const profiles = outputOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
		sanitizeProfiles(body);
	}

	// Make the API request using async endpoint (always async)
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/addbarcode', body);

	// Handle the response
	if (responseData) {
		// Handle successful binary response
		if (responseData instanceof Buffer) {
			const fileName = docName;

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
						[binaryDataName || 'data']: binaryData,
					},
					pairedItem: { item: index },
				},
			];
		}
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
