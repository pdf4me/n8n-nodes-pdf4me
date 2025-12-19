import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

// Make Node.js globals available

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the Word file to extract text from',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Word file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide Word content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Word file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Word file (usually "data" for file uploads)',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Word Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded Word document content',
		placeholder: 'UEsDBBQAAAAIAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Word URL',
		name: 'wordUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Word file to extract text from',
		placeholder: 'https://example.com/document.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.docx',
		description: 'Name of the document (used for processing)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
		hint: 'Extract text from Word document. See our <b><a href="https://docs.pdf4me.com/n8n/extract/extract-text-from-word/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Start Page Number',
		name: 'startPageNumber',
		type: 'number',
		default: 1,
		description: 'Starting page number for text extraction',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
	},
	{
		displayName: 'End Page Number',
		name: 'endPageNumber',
		type: 'number',
		default: 3,
		description: 'Ending page number for text extraction',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
	},
	{
		displayName: 'Extraction Options',
		name: 'extractionOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
		options: [
			{
				displayName: 'Remove Comments',
				name: 'removeComments',
				type: 'boolean',
				default: true,
				description: 'Whether to remove comments from the extracted text',
			},
			{
				displayName: 'Remove Header/Footer',
				name: 'removeHeaderFooter',
				type: 'boolean',
				default: true,
				description: 'Whether to remove headers and footers from the extracted text',
			},
			{
				displayName: 'Accept Changes',
				name: 'acceptChanges',
				type: 'boolean',
				default: true,
				description: 'Whether to accept tracked changes in the document',
			},
		],
	},
	{
		displayName: 'Output Binary Field Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the output file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ExtractTextFromWord],
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
				operation: [ActionConstants.ExtractTextFromWord],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use \'JSON\' to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls and may be specific to certain APIs.',
				placeholder: '{ \'outputDataFormat\': \'json\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const startPageNumber = this.getNodeParameter('startPageNumber', index) as number;
	const endPageNumber = this.getNodeParameter('endPageNumber', index) as number;
	const extractionOptions = this.getNodeParameter('extractionOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string = '';
	let blobId: string = '';

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are \'data\' for file uploads or the filename without extension.'
			);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		const inputDocName = binaryData.fileName || docName || 'document.docx';

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const wordUrl = this.getNodeParameter('wordUrl', index) as string;

		// 2. Use URL directly in docContent
		blobId = '';
		docContent = wordUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Prepare request body
	const body: IDataObject = {
		docContent,
		docName,
		StartPageNumber: startPageNumber,
		EndPageNumber: endPageNumber,
		RemoveComments: extractionOptions?.removeComments !== undefined ? extractionOptions.removeComments : true,
		RemoveHeaderFooter: extractionOptions?.removeHeaderFooter !== undefined ? extractionOptions.removeHeaderFooter : true,
		AcceptChanges: extractionOptions?.acceptChanges !== undefined ? extractionOptions.acceptChanges : true,
		IsAsync: true, // Enable asynchronous processing
	};

	// Add custom profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	// Sanitize profiles
	sanitizeProfiles(body);

	// Make API call
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractTextFromWord', body);

	// Handle the response (text extraction results)
	if (responseData) {
		let jsonString: string;
		if (Buffer.isBuffer(responseData)) {
			jsonString = responseData.toString('utf8');
		} else if (typeof responseData === 'string') {
			// If it's base64, decode it
			jsonString = Buffer.from(responseData, 'base64').toString('utf8');
		} else if (typeof responseData === 'object') {
			// Already JSON
			jsonString = JSON.stringify(responseData, null, 2);
		} else {
			throw new Error('Unexpected response type');
		}

		// Try to parse as JSON
		let parsedJson: any;
		try {
			parsedJson = JSON.parse(jsonString);
		} catch (err) {
			throw new Error('Response is not valid JSON');
		}

		// Save as JSON file
		const fileName = `word_text_extraction_results_${Date.now()}.json`;
		const binaryData = await this.helpers.prepareBinaryData(
			Buffer.from(JSON.stringify(parsedJson, null, 2), 'utf8'),
			fileName,
			'application/json',
		);
		return [
			{
				json: {
					fileName,
					mimeType: 'application/json',
					fileSize: Buffer.byteLength(JSON.stringify(parsedJson, null, 2)),
					success: true,
					message: 'Text extraction from Word completed successfully',
					docName,
					startPage: startPageNumber,
					endPage: endPageNumber,
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
				pairedItem: { item: index },
			},
		];
	}

	// Error case
	throw new Error('No text extraction results received from PDF4ME API');
}

