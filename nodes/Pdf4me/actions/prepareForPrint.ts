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
		description: 'Choose how to provide the PDF file to prepare for print',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
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
				operation: [ActionConstants.PrepareForPrint],
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
				operation: [ActionConstants.PrepareForPrint],
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
		description: 'URL to the PDF file to prepare for print',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'prepared_for_print.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-prepared-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
			},
		},
		hint: 'Prepare your PDF for printing. See our <b><a href="https://docs.pdf4me.com/n8n/edit/prepare-for-print/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
				operation: [ActionConstants.PrepareForPrint],
			},
		},
	},
	{
		displayName: 'Print Profile',
		name: 'profile',
		type: 'options',
		required: true,
		default: 'Print',
		description: 'Print profile to use for preparing the document',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
			},
		},
		options: [
			{
				name: 'Color',
				value: 'Print',
				description: 'Prepare document for color printing',
			},
			{
				name: 'Grayscale',
				value: 'grayscale',
				description: 'Convert document to grayscale for printing',
			},
		],
	},
	{
		displayName: 'Paper Size',
		name: 'paperSize',
		type: 'options',
		required: true,
		default: 'A4',
		description: 'Paper size for the prepared document',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
			},
		},
		options: [
			{ name: 'Default', value: 'Default' },
			{ name: 'A0', value: 'A0' },
			{ name: 'A1', value: 'A1' },
			{ name: 'A2', value: 'A2' },
			{ name: 'A3', value: 'A3' },
			{ name: 'A4', value: 'A4' },
			{ name: 'A5', value: 'A5' },
			{ name: 'A6', value: 'A6' },
			{ name: 'B5', value: 'B5' },
			{ name: 'Letter', value: 'PageLetter' },
			{ name: 'Legal', value: 'PageLegal' },
			{ name: 'Ledger', value: 'PageLedger' },
			{ name: 'Tabloid', value: 'Tabloid' },
			{ name: 'P11x17', value: 'P11x17' },
			{ name: 'Custom', value: 'Custom' },
		],
	},
	{
		displayName: 'Columns Per Page',
		name: 'columnsPerPage',
		type: 'number',
		default: 0,
		description: 'Number of columns per page (0 = default)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
			},
		},
	},
	{
		displayName: 'Rows Per Page',
		name: 'rowsPerPage',
		type: 'number',
		default: 0,
		description: 'Number of rows per page (0 = default)',
		typeOptions: {
			minValue: 0,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
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
				operation: [ActionConstants.PrepareForPrint],
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
		placeholder: 'prepared-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.PrepareForPrint],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const profile = this.getNodeParameter('profile', index) as string;
	const paperSize = this.getNodeParameter('paperSize', index) as string;
	const columnsPerPage = this.getNodeParameter('columnsPerPage', index) as number;
	const rowsPerPage = this.getNodeParameter('rowsPerPage', index) as number;

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

	// Validate profile
	if (!profile || profile.trim() === '') {
		throw new Error('Print profile is required');
	}

	// Validate paperSize
	if (!paperSize || paperSize.trim() === '') {
		throw new Error('Paper size is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: inputDocName,
		profile,
		paperSize,
		columnsPerPage,
		rowsPerPage,
		isAsync: true,
	};

	// Add profiles if provided (note: this is different from the 'profile' field above)
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/PrepareForPrint', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from inputDocName if available, otherwise use default
			const baseName = inputDocName ? inputDocName.replace(/\.pdf$/i, '') : 'prepared_for_print';
			fileName = `${baseName}_prepared.pdf`;
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
					message: 'PDF prepared for print successfully',
					profile,
					paperSize,
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

