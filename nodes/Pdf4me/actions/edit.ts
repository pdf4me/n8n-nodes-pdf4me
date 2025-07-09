import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants } from '../GenericFunctions';
import { pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Edit Feature',
		name: 'editFeature',
		type: 'options',
		default: 'addAttachmentToPdf',
		description: 'Select the edit feature to use',
		options: [
			{ name: 'Add Attachment to PDF', value: 'addAttachmentToPdf' },
			{ name: 'Add HTML Header/Footer', value: 'addHtmlHeaderFooter' },
			{ name: 'Add Image Stamp', value: 'addImageStamp' },
			{ name: 'Add Margin', value: 'addMargin' },
			{ name: 'Add Page Number', value: 'addPageNumber' },
			{ name: 'Add Text Stamp', value: 'addTextStamp' },
			{ name: 'Sign PDF', value: 'signPdf' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
			},
		},
	},
	// --- Common input for all features ---
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input PDF file',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				inputType: ['localPath'],
			},
		},
	},
	// --- Add Attachment to PDF ---
	{
		displayName: 'Attachment File (Base64)',
		name: 'attachmentBase64',
		type: 'string',
		default: '',
		description: 'Base64 encoded content of the attachment file',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addAttachmentToPdf'],
			},
		},
	},
	{
		displayName: 'Attachment File Name',
		name: 'attachmentFileName',
		type: 'string',
		default: '',
		description: 'Name of the attachment file (with extension)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addAttachmentToPdf'],
			},
		},
	},
	// --- Add HTML Header/Footer ---
	{
		displayName: 'HTML Content',
		name: 'htmlContent',
		type: 'string',
		default: '',
		description: 'HTML content to add as header/footer',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		description: 'Pages to apply (e.g., "1", "1,3,5", "2-5", "1,3,7-10", "2-")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Location',
		name: 'location',
		type: 'options',
		default: 'Header',
		options: [
			{ name: 'Header', value: 'Header' },
			{ name: 'Footer', value: 'Footer' },
			{ name: 'Both', value: 'Both' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Skip First Page',
		name: 'skipFirstPage',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Margin Left',
		name: 'marginLeft',
		type: 'number',
		default: 20,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Margin Right',
		name: 'marginRight',
		type: 'number',
		default: 20,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Margin Top',
		name: 'marginTop',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	{
		displayName: 'Margin Bottom',
		name: 'marginBottom',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addHtmlHeaderFooter'],
			},
		},
	},
	// --- Add Image Stamp ---
	{
		displayName: 'Image File (Base64)',
		name: 'imageBase64',
		type: 'string',
		default: '',
		description: 'Base64 encoded content of the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Image File Name',
		name: 'imageFileName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Align X',
		name: 'alignX',
		type: 'options',
		default: 'center',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Align Y',
		name: 'alignY',
		type: 'options',
		default: 'Bottom', // or 'Top' or 'Middle'
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Middle', value: 'Middle' },
			{ name: 'Bottom', value: 'Bottom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Height(mm)',
		name: 'heightInMM',
		type: 'number',
		default: 30,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Width(mm)',
		name: 'widthInMM',
		type: 'number',
		default: 30,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Height(px)',
		name: 'heightInPx',
		type: 'number',
		default: 85,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Width(px)',
		name: 'widthInPx',
		type: 'number',
		default: 85,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Margin X(mm)',
		name: 'marginXInMM',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Margin Y(mm)',
		name: 'marginYInMM',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Margin X(px)',
		name: 'marginXInPx',
		type: 'number',
		default: 28,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Margin Y(px)',
		name: 'marginYInPx',
		type: 'number',
		default: 28,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Is Background',
		name: 'isBackground',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	{
		displayName: 'Show Only In Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addImageStamp'],
			},
		},
	},
	// --- Add Margin ---
	{
		displayName: 'Margin Left',
		name: 'marginLeft',
		type: 'number',
		default: 20,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addMargin'],
			},
		},
	},
	{
		displayName: 'Margin Right',
		name: 'marginRight',
		type: 'number',
		default: 20,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addMargin'],
			},
		},
	},
	{
		displayName: 'Margin Top',
		name: 'marginTop',
		type: 'number',
		default: 25,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addMargin'],
			},
		},
	},
	{
		displayName: 'Margin Bottom',
		name: 'marginBottom',
		type: 'number',
		default: 25,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addMargin'],
			},
		},
	},
	// --- Add Page Number ---
	{
		displayName: 'Page Number Format',
		name: 'pageNumberFormat',
		type: 'string',
		default: 'Page 0 of 1',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Align X',
		name: 'alignX',
		type: 'options',
		default: 'right',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Align Y',
		name: 'alignY',
		type: 'options',
		default: 'bottom',
		options: [
			{ name: 'Top', value: 'top' },
			{ name: 'Middle', value: 'middle' },
			{ name: 'Bottom', value: 'bottom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Margin X(mm)',
		name: 'marginXinMM',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Margin Y(mm)',
		name: 'marginYinMM',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 12,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Is Bold',
		name: 'isBold',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Is Italic',
		name: 'isItalic',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	{
		displayName: 'Skip First Page',
		name: 'skipFirstPage',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addPageNumber'],
			},
		},
	},
	// --- Add Text Stamp ---
	{
		displayName: 'Text',
		name: 'text',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: 'all',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Align X',
		name: 'alignX',
		type: 'options',
		default: 'center',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Align Y',
		name: 'alignY',
		type: 'options',
		default: 'middle',
		options: [
			{ name: 'Top', value: 'top' },
			{ name: 'Middle', value: 'middle' },
			{ name: 'Bottom', value: 'bottom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Margin X(mm)',
		name: 'marginXInMM',
		type: 'string',
		default: '50',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Margin Y(mm)',
		name: 'marginYInMM',
		type: 'string',
		default: '50',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Margin X(px)',
		name: 'marginXInPx',
		type: 'string',
		default: '150',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Margin Y(px)',
		name: 'marginYInPx',
		type: 'string',
		default: '150',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'string',
		default: '30',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Font Name',
		name: 'fontName',
		type: 'string',
		default: 'Arial',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'fontSize',
		type: 'number',
		default: 24,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Font Color',
		name: 'fontColor',
		type: 'color',
		default: '#FF0000',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Is Bold',
		name: 'isBold',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Is Italics',
		name: 'isItalics',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Underline',
		name: 'underline',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Rotate',
		name: 'rotate',
		type: 'number',
		default: 45,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Is Background',
		name: 'isBackground',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Show Only In Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Transverse',
		name: 'transverse',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	{
		displayName: 'Fit Text Over Page',
		name: 'fitTextOverPage',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['addTextStamp'],
			},
		},
	},
	// --- Sign PDF ---
	{
		displayName: 'Signature File (Base64)',
		name: 'signatureBase64',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Signature File Name',
		name: 'signatureFileName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Align X',
		name: 'alignX',
		type: 'options',
		default: 'Right',
		options: [
			{ name: 'Left', value: 'Left' },
			{ name: 'Center', value: 'Center' },
			{ name: 'Right', value: 'Right' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Align Y',
		name: 'alignY',
		type: 'options',
		default: 'Bottom',
		options: [
			{ name: 'Top', value: 'Top' },
			{ name: 'Middle', value: 'Middle' },
			{ name: 'Bottom', value: 'Bottom' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Width(mm)',
		name: 'widthInMM',
		type: 'string',
		default: '50',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Height(mm)',
		name: 'heightInMM',
		type: 'string',
		default: '25',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Width(px)',
		name: 'widthInPx',
		type: 'string',
		default: '142',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Height(px)',
		name: 'heightInPx',
		type: 'string',
		default: '71',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Margin X(mm)',
		name: 'marginXInMM',
		type: 'string',
		default: '20',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Margin Y(mm)',
		name: 'marginYInMM',
		type: 'string',
		default: '20',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Margin X(px)',
		name: 'marginXInPx',
		type: 'string',
		default: '57',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Margin Y(px)',
		name: 'marginYInPx',
		type: 'string',
		default: '57',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'string',
		default: '100',
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Show Only In Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
	{
		displayName: 'Is Background',
		name: 'isBackground',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				operation: [ActionConstants.Edit],
				editFeature: ['signPdf'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('editFeature', index) as string;
	if (operation !== ActionConstants.Edit) {
		throw new Error('Unsupported operation for Edit');
	}

	// Get input type and file
	const inputType = this.getNodeParameter('inputType', index) as string;
	let base64Content = '';
	let fileName = this.getNodeParameter('inputFileName', index) as string;

	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		base64Content = binaryDataBuffer.toString('base64');
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'base64') {
		base64Content = this.getNodeParameter('base64Content', index) as string;
		if (!fileName) fileName = 'document.pdf';
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		base64Content = Buffer.from(response).toString('base64');
		if (!fileName) fileName = fileUrl.split('/').pop() || 'document.pdf';
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		base64Content = fileBuffer.toString('base64');
		if (!fileName) fileName = localFilePath.split('/').pop() || 'document.pdf';
	} else {
		throw new Error('Unsupported input type');
	}

	if (feature === 'addAttachmentToPdf') {
		const attachmentBase64 = this.getNodeParameter('attachmentBase64', index) as string;
		const attachmentFileName = this.getNodeParameter('attachmentFileName', index) as string;
		const payload = {
			docName: fileName || 'output.pdf',
			docContent: base64Content,
			attachments: [
				{
					docName: attachmentFileName,
					docContent: attachmentBase64,
				},
			],
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/AddAttachmentToPdf', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'addHtmlHeaderFooter') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			htmlContent: this.getNodeParameter('htmlContent', index) as string,
			pages: this.getNodeParameter('pages', index) as string,
			location: this.getNodeParameter('location', index) as string,
			skipFirstPage: this.getNodeParameter('skipFirstPage', index) as boolean,
			marginLeft: this.getNodeParameter('marginLeft', index) as number,
			marginRight: this.getNodeParameter('marginRight', index) as number,
			marginTop: this.getNodeParameter('marginTop', index) as number,
			marginBottom: this.getNodeParameter('marginBottom', index) as number,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/AddHtmlHeaderFooter', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'addImageStamp') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			alignX: this.getNodeParameter('alignX', index) as string,
			alignY: this.getNodeParameter('alignY', index) as string,
			imageFile: this.getNodeParameter('imageBase64', index) as string,
			imageName: this.getNodeParameter('imageFileName', index) as string,
			pages: this.getNodeParameter('pages', index) as string,
			heightInMM: this.getNodeParameter('heightInMM', index) as number,
			widthInMM: this.getNodeParameter('widthInMM', index) as number,
			heightInPx: this.getNodeParameter('heightInPx', index) as number,
			widthInPx: this.getNodeParameter('widthInPx', index) as number,
			marginXInMM: this.getNodeParameter('marginXInMM', index) as number,
			marginYInMM: this.getNodeParameter('marginYInMM', index) as number,
			marginXInPx: this.getNodeParameter('marginXInPx', index) as number,
			marginYInPx: this.getNodeParameter('marginYInPx', index) as number,
			opacity: this.getNodeParameter('opacity', index) as number,
			isBackground: this.getNodeParameter('isBackground', index) as boolean,
			showOnlyInPrint: this.getNodeParameter('showOnlyInPrint', index) as boolean,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/ImageStamp', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'addMargin') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			marginLeft: this.getNodeParameter('marginLeft', index) as number,
			marginRight: this.getNodeParameter('marginRight', index) as number,
			marginTop: this.getNodeParameter('marginTop', index) as number,
			marginBottom: this.getNodeParameter('marginBottom', index) as number,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/AddMargin', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'addPageNumber') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			pageNumberFormat: this.getNodeParameter('pageNumberFormat', index) as string,
			alignX: this.getNodeParameter('alignX', index) as string,
			alignY: this.getNodeParameter('alignY', index) as string,
			marginXinMM: this.getNodeParameter('marginXinMM', index) as number,
			marginYinMM: this.getNodeParameter('marginYinMM', index) as number,
			fontSize: this.getNodeParameter('fontSize', index) as number,
			isBold: this.getNodeParameter('isBold', index) as boolean,
			isItalic: this.getNodeParameter('isItalic', index) as boolean,
			skipFirstPage: this.getNodeParameter('skipFirstPage', index) as boolean,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/AddPageNumber', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'addTextStamp') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			pages: this.getNodeParameter('pages', index) as string,
			text: this.getNodeParameter('text', index) as string,
			alignX: this.getNodeParameter('alignX', index) as string,
			alignY: this.getNodeParameter('alignY', index) as string,
			marginXInMM: this.getNodeParameter('marginXInMM', index) as string,
			marginYInMM: this.getNodeParameter('marginYInMM', index) as string,
			marginXInPx: this.getNodeParameter('marginXInPx', index) as string,
			marginYInPx: this.getNodeParameter('marginYInPx', index) as string,
			opacity: this.getNodeParameter('opacity', index) as string,
			fontName: this.getNodeParameter('fontName', index) as string,
			fontSize: this.getNodeParameter('fontSize', index) as number,
			fontColor: this.getNodeParameter('fontColor', index) as string,
			isBold: this.getNodeParameter('isBold', index) as boolean,
			isItalics: this.getNodeParameter('isItalics', index) as boolean,
			underline: this.getNodeParameter('underline', index) as boolean,
			rotate: this.getNodeParameter('rotate', index) as number,
			isBackground: this.getNodeParameter('isBackground', index) as boolean,
			showOnlyInPrint: this.getNodeParameter('showOnlyInPrint', index) as boolean,
			transverse: this.getNodeParameter('transverse', index) as boolean,
			fitTextOverPage: this.getNodeParameter('fitTextOverPage', index) as boolean,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/Stamp', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else if (feature === 'signPdf') {
		const payload = {
			docContent: base64Content,
			docName: fileName || 'output.pdf',
			imageFile: this.getNodeParameter('signatureBase64', index) as string,
			imageName: this.getNodeParameter('signatureFileName', index) as string,
			pages: this.getNodeParameter('pages', index) as string,
			alignX: this.getNodeParameter('alignX', index) as string,
			alignY: this.getNodeParameter('alignY', index) as string,
			widthInMM: this.getNodeParameter('widthInMM', index) as string,
			heightInMM: this.getNodeParameter('heightInMM', index) as string,
			widthInPx: this.getNodeParameter('widthInPx', index) as string,
			heightInPx: this.getNodeParameter('heightInPx', index) as string,
			marginXInMM: this.getNodeParameter('marginXInMM', index) as string,
			marginYInMM: this.getNodeParameter('marginYInMM', index) as string,
			marginXInPx: this.getNodeParameter('marginXInPx', index) as string,
			marginYInPx: this.getNodeParameter('marginYInPx', index) as string,
			opacity: this.getNodeParameter('opacity', index) as string,
			showOnlyInPrint: this.getNodeParameter('showOnlyInPrint', index) as boolean,
			isBackground: this.getNodeParameter('isBackground', index) as boolean,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, 'POST', '/api/v2/SignPdf', undefined, payload);
		return this.helpers.returnJsonArray([response]);
	} else {
		throw new Error('Unsupported feature for Edit');
	}
}
