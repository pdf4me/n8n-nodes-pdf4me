import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer available (it's a Node.js global)
// declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		description: 'Add the text to be generated as Barcode',
		placeholder: 'hello',
		displayOptions: {
			show: {
				operation: [ActionConstants.BarcodeGenerator],
			},
		},
	},
	{
		displayName: 'Barcode Type',
		name: 'barcodeType',
		type: 'options',

		default: 'qrCode',
		description: 'Select the type of barcode to be created',
		displayOptions: {
			show: {
				operation: [ActionConstants.BarcodeGenerator],
			},
		},
		options: [
			{ name: 'Australian Post Custom', value: 'australianPostCustom' },
			{ name: 'Australian Post Custom 2', value: 'australianPostCustom2' },
			{ name: 'Australian Post Custom 3', value: 'australianPostCustom3' },
			{ name: 'Australian Post Redirection', value: 'australianPostRedirection' },
			{ name: 'Australian Post Reply Paid', value: 'australianPostReplyPaid' },
			{ name: 'Australian Post Routing', value: 'australianPostRouting' },
			{ name: 'Aztec', value: 'aztec' },
			{ name: 'CEPNet', value: 'cepNet' },
			{ name: 'Codabar 18', value: 'codabar18' },
			{ name: 'Codabar 2', value: 'codabar2' },
			{ name: 'Codablock F', value: 'codablockF' },
			{ name: 'Code 11', value: 'code11' },
			{ name: 'Code 128', value: 'code128' },
			{ name: 'Code 128 Subset A', value: 'code128SubsetA' },
			{ name: 'Code 128 Subset B', value: 'code128SubsetB' },
			{ name: 'Code 128 Subset C', value: 'code128SubsetC' },
			{ name: 'Code 2 of 5 Data Logic', value: 'code2Of5DataLogic' },
			{ name: 'Code 2 of 5 IATA', value: 'code2Of5Iata' },
			{ name: 'Code 2 of 5 Industry', value: 'code2Of5Industry' },
			{ name: 'Code 2 of 5 Interleaved', value: 'code2Of5Interleaved' },
			{ name: 'Code 2 of 5 Matrix', value: 'code2Of5Matrix' },
			{ name: 'Code 2 of 5 Standard', value: 'code2Of5Standard' },
			{ name: 'Code 32', value: 'code32' },
			{ name: 'Code 39', value: 'code39' },
			{ name: 'Code 39 Extended', value: 'code39Extended' },
			{ name: 'Code 93', value: 'code93' },
			{ name: 'Code 93 Extended', value: 'code93Extended' },
			{ name: 'Data Matrix', value: 'dataMatrix' },
			{ name: 'Deutsche Post Identcode', value: 'deutschePostIdentcode' },
			{ name: 'Deutsche Post Leitcode', value: 'deutschePostLeitcode' },
			{ name: 'DotCode', value: 'dotCode' },
			{ name: 'DPD', value: 'dpd' },
			{ name: 'EAN UCC-128', value: 'eanUcc128' },
			{ name: 'EAN-13', value: 'ean13' },
			{ name: 'EAN-13 with 2 Addon', value: 'ean13With2Addon' },
			{ name: 'EAN-13 with 5 Addon', value: 'ean13With5Addon' },
			{ name: 'EAN-14', value: 'ean14' },
			{ name: 'EAN-8', value: 'ean8' },
			{ name: 'EAN-8 with 2 Addon', value: 'ean8With2Addon' },
			{ name: 'EAN-8 with 5 Addon', value: 'ean8With5Addon' },
			{ name: 'FIM', value: 'fim' },
			{ name: 'Flattermarken', value: 'flattermarken' },
			{ name: 'GS1 DataBar', value: 'gs1DataBar' },
			{ name: 'GS1 DataBar Expanded', value: 'gs1DataBarExpanded' },
			{ name: 'GS1 DataBar Expanded Stacked', value: 'gs1DataBarExpandedStacked' },
			{ name: 'GS1 DataBar Limited', value: 'gs1DataBarLimited' },
			{ name: 'GS1 DataBar Stacked', value: 'gs1DataBarStacked' },
			{ name: 'GS1 DataBar Stacked Omnidirectional', value: 'gs1DataBarStackedOmnidirectional' },
			{ name: 'GS1 DataBar Truncated', value: 'gs1DataBarTruncated' },
			{ name: 'GS1-128', value: 'gs1_128' },
			{ name: 'Han Xin', value: 'hanXin' },
			{ name: 'HIBC LIC 128', value: 'hibcLic128' },
			{ name: 'HIBC LIC 3OF9', value: 'hibcLic3OF9' },
			{ name: 'HIBC LIC Aztec', value: 'hibcLicAztec' },
			{ name: 'HIBC LIC CODABLOCK F', value: 'hibcLicCODABLOCK_F' },
			{ name: 'HIBC LIC Data Matrix', value: 'hibcLicDataMatrix' },
			{ name: 'HIBC LIC MPDF417', value: 'hibcLicMPDF417' },
			{ name: 'HIBC LIC PDF417', value: 'hibcLicPDF417' },
			{ name: 'HIBC LIC QR Code', value: 'hibcLicQRCode' },
			{ name: 'HIBC PAS 128', value: 'hibcPas128' },
			{ name: 'HIBC PAS 3OF9', value: 'hibcPas3OF9' },
			{ name: 'HIBC PAS Aztec', value: 'hibcPasAztec' },
			{ name: 'HIBC PAS CODABLOCK F', value: 'hibcPasCODABLOCK_F' },
			{ name: 'HIBC PAS Data Matrix', value: 'hibcPasDataMatrix' },
			{ name: 'HIBC PAS MPDF417', value: 'hibcPasMPDF417' },
			{ name: 'HIBC PAS PDF417', value: 'hibcPasPDF417' },
			{ name: 'HIBC PAS QR Code', value: 'hibcPasQRCode' },
			{ name: 'ISBN-13', value: 'isbn13' },
			{ name: 'ISBN-13 with 5 Addon', value: 'isbn13With5Addon' },
			{ name: 'ISMN', value: 'ismn' },
			{ name: 'ISSN', value: 'issn' },
			{ name: 'ISSN with 2 Addon', value: 'issnWith2Addon' },
			{ name: 'Italian Postal 2 of 5', value: 'italianPostal2Of5' },
			{ name: 'Italian Postal 3 of 9', value: 'italianPostal3Of9' },
			{ name: 'ITF-14', value: 'itf14' },
			{ name: 'Japanese Postal', value: 'japanesePostal' },
			{ name: 'KIX', value: 'kix' },
			{ name: 'Korean Postal Authority', value: 'koreanPostalAuthority' },
			{ name: 'LOGMARS', value: 'logmars' },
			{ name: 'Mailmark 2D', value: 'mailmark_2D' },
			{ name: 'Mailmark 4-State', value: 'mailmark_4state' },
			{ name: 'MaxiCode', value: 'maxicode' },
			{ name: 'Micro PDF417', value: 'microPdf417' },
			{ name: 'Micro QR Code', value: 'microQRCode' },
			{ name: 'MSI', value: 'msi' },
			{ name: 'None', value: 'none' },
			{ name: 'NTIN', value: 'ntin' },
			{ name: 'NVE-18', value: 'nve18' },
			{ name: 'PDF417', value: 'pdf417' },
			{ name: 'PDF417 Truncated', value: 'pdf417Truncated' },
			{ name: 'Pharmacode One Track', value: 'pharmacodeOneTrack' },
			{ name: 'Pharmacode Two Track', value: 'pharmacodeTwoTrack' },
			{ name: 'Planet 12', value: 'planet12' },
			{ name: 'Planet 14', value: 'planet14' },
			{ name: 'Plessey', value: 'plessey' },
			{ name: 'Plessey Bidirectional', value: 'plesseyBidirectional' },
			{ name: 'PPN', value: 'ppn' },
			{ name: 'PZN-7', value: 'pzn7' },
			{ name: 'PZN-8', value: 'pzn8' },
			{ name: 'QR Code', value: 'qrCode' },
			{ name: 'QR Code 2005', value: 'qrcode2005' },
			{ name: 'RM4SCC', value: 'rm4Scc' },
			{ name: 'SSCC-18', value: 'sscc18' },
			{ name: 'Swedish Postal Shipment ID', value: 'swedishPostalShipmentId' },
			{ name: 'Swiss QR Code', value: 'swissQrCode' },
			{ name: 'Telepen', value: 'telepen' },
			{ name: 'Telepen Alpha', value: 'telepenAlpha' },
			{ name: 'UCC-128', value: 'ucc128' },
			{ name: 'UPC-12', value: 'upc12' },
			{ name: 'UPC-A', value: 'upcA' },
			{ name: 'UPC-A with 2 Addon', value: 'upcAWith2Addon' },
			{ name: 'UPC-A with 5 Addon', value: 'upcAWith5Addon' },
			{ name: 'UPC-E', value: 'upcE' },
			{ name: 'UPC-E with 2 Addon', value: 'upcEWith2Addon' },
			{ name: 'UPC-E with 5 Addon', value: 'upcEWith5Addon' },
			{ name: 'UPU S10', value: 'upuS10' },
			{ name: 'USPS IM Package', value: 'uSPSIMPackage' },
			{ name: 'USPS Intelligent Mail', value: 'uspsIntelligentMail' },
			{ name: 'USPS Postnet 10', value: 'uspsPostnet10' },
			{ name: 'USPS Postnet 11', value: 'uspsPostnet11' },
			{ name: 'USPS Postnet 12', value: 'uspsPostnet12' },
			{ name: 'USPS Postnet 5', value: 'uspsPostnet5' },
			{ name: 'USPS Postnet 6', value: 'uspsPostnet6' },
			{ name: 'USPS Postnet 9', value: 'uspsPostnet9' },
			{ name: 'VIN', value: 'vin' },
		],
	},
	{
		displayName: 'Hide Text',
		name: 'hideText',
		type: 'boolean',

		default: true,
		description: 'Whether to hide or display the text alongside the barcode',
		displayOptions: {
			show: {
				operation: [ActionConstants.BarcodeGenerator],
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
				operation: [ActionConstants.BarcodeGenerator],
			},
		},
		options: [
			{
				displayName: 'Generate Inline URL',
				name: 'inline',
				type: 'boolean',
				default: false,
				description: 'Whether to generate an inline image URL',
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. See https://dev.pdf4me.com/documentation/ for details on available profile options.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const text = this.getNodeParameter('text', index) as string;
	const barcodeType = this.getNodeParameter('barcodeType', index) as string;
	const hideText = this.getNodeParameter('hideText', index) as boolean;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	const body: IDataObject = {
		text,
		barcodeType,
		hideText,
	};

	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	const inline = advancedOptions?.inline as boolean | undefined;
	if (inline !== undefined) body.inline = inline;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/CreateBarcode', body);

	// Handle the binary response (PNG data) directly like Python code
	if (responseData) {
		// Generate filename based on text and barcode type
		const fileName = `${text.replace(/[^a-zA-Z0-9]/g, '_')}_${barcodeType}.png`;

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'image/png',
		);

		return [
			{
				json: {
					fileName,
					mimeType: 'image/png',
					fileSize: responseData.length,
					success: true,
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
