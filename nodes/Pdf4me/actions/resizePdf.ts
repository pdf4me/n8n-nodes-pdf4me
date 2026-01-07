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
		description: 'Choose how to provide the PDF file to resize',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
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
				operation: [ActionConstants.ResizePdf],
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
				operation: [ActionConstants.ResizePdf],
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
		description: 'URL to the PDF file to resize',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'resized_document.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-resized-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
		hint: 'Resize your PDF. See our <b><a href="https://docs.pdf4me.com/n8n/edit/resize-pdf/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: '1-10',
		description: 'Page sequence/range to resize (e.g., "1-10", "1,3,5", "all")',
		placeholder: '1-10',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Measurement Unit',
		name: 'measurementIn',
		type: 'options',
		default: 'mm',
		description: 'Unit of measurement for padding and page size',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
		options: [
			{ name: 'Millimeters', value: 'mm' },
			{ name: 'Centimeters', value: 'cm' },
			{ name: 'Inches', value: 'in' },
			{ name: 'Points', value: 'pt' },
		],
	},
	{
		displayName: 'Page Size Requested',
		name: 'isPageSizeRequested',
		type: 'boolean',
		default: true,
		description: 'Whether to resize to a specific page size',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Page Size Type',
		name: 'pageSizeType',
		type: 'options',
		default: 'A4',
		description: 'Standard page size type',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
				isPageSizeRequested: [true],
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
			{ name: 'Letter', value: 'Letter' },
			{ name: 'Statement', value: 'Statement' },
			{ name: 'Tabloid', value: 'Tabloid' },
			{ name: 'Custom', value: 'Custom' },
		],
	},
	{
		displayName: 'Custom Width',
		name: 'customWidth',
		type: 'number',
		default: 0,
		description: 'Custom page width (must be >= 0). Only used when Page Size Type is "Custom"',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
				isPageSizeRequested: [true],
				pageSizeType: ['Custom'],
			},
		},
	},
	{
		displayName: 'Custom Height',
		name: 'customHeight',
		type: 'number',
		default: 0,
		description: 'Custom page height (must be >= 0). Only used when Page Size Type is "Custom"',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
				isPageSizeRequested: [true],
				pageSizeType: ['Custom'],
			},
		},
	},
	{
		displayName: 'Padding Top',
		name: 'paddingTop',
		type: 'number',
		default: 10.0,
		description: 'Top padding (must be >= 0)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Padding Bottom',
		name: 'paddingBottom',
		type: 'number',
		default: 10.0,
		description: 'Bottom padding (must be >= 0)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Padding Left',
		name: 'paddingLeft',
		type: 'number',
		default: 10.0,
		description: 'Left padding (must be >= 0)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
	{
		displayName: 'Padding Right',
		name: 'paddingRight',
		type: 'number',
		default: 10.0,
		description: 'Right padding (must be >= 0)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
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
				operation: [ActionConstants.ResizePdf],
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
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'resized-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ResizePdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const pageSequence = this.getNodeParameter('pageSequence', index) as string;
	const measurementIn = this.getNodeParameter('measurementIn', index) as string;
	const isPageSizeRequested = this.getNodeParameter('isPageSizeRequested', index) as boolean;
	const paddingTop = this.getNodeParameter('paddingTop', index) as number;
	const paddingBottom = this.getNodeParameter('paddingBottom', index) as number;
	const paddingLeft = this.getNodeParameter('paddingLeft', index) as number;
	const paddingRight = this.getNodeParameter('paddingRight', index) as number;
	const pageSizeType = this.getNodeParameter('pageSizeType', index) as string;

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let inputDocName: string = docName;
	let blobId: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// 2. Extract filename from URL
		inputDocName = pdfUrl.split('/').pop() || docName;

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = pdfUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Build pageSize object
	const pageSize: IDataObject = {
		type: pageSizeType,
		customWidth: 0.0,
		customHeight: 0.0,
	};

	// Set custom dimensions if Custom page size is selected
	if (pageSizeType === 'Custom' && isPageSizeRequested) {
		pageSize.customWidth = this.getNodeParameter('customWidth', index, 0) as number;
		pageSize.customHeight = this.getNodeParameter('customHeight', index, 0) as number;
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: inputDocName,
		pageSequence,
		measurementIn,
		isPageSizeRequested,
		paddingTop,
		paddingBottom,
		paddingLeft,
		paddingRight,
		pageSize,
		isAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ResizePdf', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from inputDocName if available, otherwise use default
			const baseName = inputDocName ? inputDocName.replace(/\.pdf$/i, '') : 'resized_document';
			fileName = `${baseName}_resized.pdf`;
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
					message: 'PDF resized successfully',
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

