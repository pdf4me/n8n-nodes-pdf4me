import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer available (it's a Node.js global)
declare const Buffer: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Web URL',
		name: 'webUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'Web URL of the page to be converted to PDF',
		placeholder: 'https://example.com',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
	},
	{
		displayName: 'File Name',
		name: 'docName',
		type: 'string',
		default: 'converted_page.pdf',
		description: 'Output PDF file name with extension',
		placeholder: 'my-webpage.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
	},
	{
		displayName: 'Authentication Type',
		name: 'authType',
		type: 'options',
		default: 'NoAuth',
		description: 'Authentication type for the target website',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
		options: [
			{ name: 'No Authentication', value: 'NoAuth' },
			{ name: 'Basic Authentication', value: 'Basic' },
		],
	},
	{
		displayName: 'Username',
		name: 'username',
		type: 'string',
		default: '',
		description: 'Username if authentication is required',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
				authType: ['Basic'],
			},
		},
	},
	{
		displayName: 'Password',
		name: 'password',
		type: 'string',
		typeOptions: {
			password: true,
		},
		default: '',
		description: 'Password if authentication is required',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
				authType: ['Basic'],
			},
		},
	},
	{
		displayName: 'Page Layout',
		name: 'layout',
		type: 'options',
		default: 'portrait',
		description: 'Page orientation for the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
		options: [
			{ name: 'Portrait', value: 'portrait' },
			{ name: 'Landscape', value: 'landscape' },
		],
	},
	{
		displayName: 'Page Format',
		name: 'format',
		type: 'options',
		default: 'A4',
		description: 'Page format for the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
		options: [
			{ name: 'A0', value: 'A0' },
			{ name: 'A1', value: 'A1' },
			{ name: 'A2', value: 'A2' },
			{ name: 'A3', value: 'A3' },
			{ name: 'A4', value: 'A4' },
			{ name: 'A5', value: 'A5' },
			{ name: 'A6', value: 'A6' },
			{ name: 'A7', value: 'A7' },
			{ name: 'A8', value: 'A8' },
			{ name: 'Executive', value: 'Executive' },
			{ name: 'Legal', value: 'Legal' },
			{ name: 'Statement', value: 'Statement' },
			{ name: 'Tabloid', value: 'Tabloid' },
		],
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.UrlToPdf],
			},
		},
		options: [
			{
				displayName: 'Bottom Margin',
				name: 'bottomMargin',
				type: 'string',
				default: '20px',
				description: 'Bottom margin of PDF (e.g., 20px, 1cm, 0.5in)',
				placeholder: '20px',
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
			{
				displayName: 'Display Header Footer',
				name: 'displayHeaderFooter',
				type: 'boolean',
				default: false,
				description: 'Whether to show header and footer in PDF',
			},
			{
				displayName: 'Left Margin',
				name: 'leftMargin',
				type: 'string',
				default: '20px',
				description: 'Left margin of PDF (e.g., 20px, 1cm, 0.5in)',
				placeholder: '20px',
			},
			{
				displayName: 'Print Background',
				name: 'printBackground',
				type: 'boolean',
				default: true,
				description: 'Whether to include background colors and images',
			},
			{
				displayName: 'Right Margin',
				name: 'rightMargin',
				type: 'string',
				default: '20px',
				description: 'Right margin of PDF (e.g., 20px, 1cm, 0.5in)',
				placeholder: '20px',
			},
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'number',
				default: 1.0,
				description: 'Scale factor for the web page (e.g., 0.8 = 80%)',
				typeOptions: {
					minValue: 0.1,
					maxValue: 2.0,
					numberPrecision: 1,
				},
			},
			{
				displayName: 'Top Margin',
				name: 'topMargin',
				type: 'string',
				default: '20px',
				description: 'Top margin of PDF (e.g., 20px, 1cm, 0.5in)',
				placeholder: '20px',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const webUrl = this.getNodeParameter('webUrl', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const authType = this.getNodeParameter('authType', index) as string;
	const layout = this.getNodeParameter('layout', index) as string;
	const format = this.getNodeParameter('format', index) as string;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	// Build the request body
	const body: IDataObject = {
		webUrl,
		authType,
		username: authType === 'Basic' ? (this.getNodeParameter('username', index) as string) : '',
		password: authType === 'Basic' ? (this.getNodeParameter('password', index) as string) : '',
		docContent: '', // Empty for URL conversion
		docName,
		layout,
		format,
		scale: advancedOptions?.scale !== undefined ? advancedOptions.scale : 1.0,
		topMargin: advancedOptions?.topMargin || '20px',
		leftMargin: advancedOptions?.leftMargin || '20px',
		rightMargin: advancedOptions?.rightMargin || '20px',
		bottomMargin: advancedOptions?.bottomMargin || '20px',
		printBackground: advancedOptions?.printBackground !== undefined ? advancedOptions.printBackground : true,
		displayHeaderFooter: advancedOptions?.displayHeaderFooter !== undefined ? advancedOptions.displayHeaderFooter : false,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertUrlToPdf', body);

		// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = docName;
		if (!fileName) {
			// Extract hostname from URL for filename using simple string manipulation
			const hostname = webUrl.replace(/^https?:\/\//, '').split('/')[0].replace(/[^a-zA-Z0-9.-]/g, '_');
			fileName = `${hostname}_${Date.now()}.pdf`;
		}

		// responseData is already binary data (Buffer)
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
					sourceUrl: webUrl,
					layout,
					format,
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
