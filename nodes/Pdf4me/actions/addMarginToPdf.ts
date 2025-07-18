import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
// declare const Buffer: any;
// declare const URL: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add margins to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
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
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
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
				operation: [ActionConstants.AddMarginToPdf],
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
		description: 'URL to the PDF file to add margins to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_margins.pdf',
		description: 'Name for the output PDF file with margins',
		placeholder: 'my-document-with-margins.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
			},
		},
	},
	{
		displayName: 'Left Margin (Mm)',
		name: 'marginLeft',
		type: 'number',
		default: 20,
		description: 'Left margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
			},
		},
	},
	{
		displayName: 'Right Margin (Mm)',
		name: 'marginRight',
		type: 'number',
		default: 20,
		description: 'Right margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
			},
		},
	},
	{
		displayName: 'Top Margin (Mm)',
		name: 'marginTop',
		type: 'number',
		default: 25,
		description: 'Top margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
			},
		},
	},
	{
		displayName: 'Bottom Margin (Mm)',
		name: 'marginBottom',
		type: 'number',
		default: 25,
		description: 'Bottom margin in millimeters (0-100)',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddMarginToPdf],
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
				operation: [ActionConstants.AddMarginToPdf],
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
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const marginLeft = this.getNodeParameter('marginLeft', index) as number;
	const marginRight = this.getNodeParameter('marginRight', index) as number;
	const marginTop = this.getNodeParameter('marginTop', index) as number;
	const marginBottom = this.getNodeParameter('marginBottom', index) as number;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Download PDF from URL
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const response = await this.helpers.request({
			method: 'GET',
			url: pdfUrl,
			encoding: null,
		});
		docContent = Buffer.from(response).toString('base64');
	} else if (inputDataType === 'filePath') {
		throw new Error('File path input is not supported. Please use Binary Data, Base64 String, or URL instead.');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName,
		marginLeft,
		marginRight,
		marginTop,
		marginBottom,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/AddMargin', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'document_with_margins';
			fileName = `${baseName}_with_margins.pdf`;
		}

		// Ensure .pdf extension
		if (!fileName.toLowerCase().endsWith('.pdf')) {
			fileName = `${fileName.replace(/\.[^.]*$/, '')}.pdf`;
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
					message: 'Margins added successfully',
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

