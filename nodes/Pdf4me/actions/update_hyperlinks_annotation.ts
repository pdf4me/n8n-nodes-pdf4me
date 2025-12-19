import { IExecuteFunctions } from 'n8n-workflow';
import { IDataObject, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { pdf4meAsyncRequest, ActionConstants, uploadBlobToPdf4me } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
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
		default: 'binaryData',
		description: 'How to provide the PDF input',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
				inputDataType: ['binaryData'],
			},
		},
		description: 'Name of the binary property containing the PDF',
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
				inputDataType: ['base64'],
			},
		},
		description: 'Base64-encoded PDF content',
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file to update hyperlinks annotation',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'hyperlinks_updated_PDF_output.pdf',
		description: 'Name for the output PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
		hint: 'Update hyperlinks annotation. See our <b><a href="https://docs.pdf4me.com/n8n/pdf4me/update-hyperlinks-annotation/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Search On',
		name: 'searchOn',
		type: 'options',
		options: [
			{ name: 'Text', value: 'Text' },
			{ name: 'URL', value: 'URL' },
		],
		default: 'Text',
		description: 'Criteria to search for hyperlinks',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Search Value',
		name: 'searchValue',
		type: 'string',
		default: 'http://www.google.com',
		description: 'Text or URL to search for',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Is Expression',
		name: 'isExpression',
		type: 'boolean',
		default: true,
		description: 'Whether to use expression matching',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Text Current Value',
		name: 'textCurrentValue',
		type: 'string',
		default: 'http://www.google.com',
		description: 'Current hyperlinked text to replace',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Text New Value',
		name: 'textNewValue',
		type: 'string',
		default: 'https://pdf4me.com',
		description: 'New display text for the hyperlink',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'URL Current Value',
		name: 'urlCurrentValue',
		type: 'string',
		default: 'http://www.google.com',
		description: 'Current URL destination to replace',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'URL New Value',
		name: 'urlNewValue',
		type: 'string',
		default: 'https://pdf4me.com',
		description: 'New URL destination',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'updated-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.UpdateHyperlinksAnnotation],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	// Main PDF content
	let docContent: string = '';
	let docName: string = outputFileName;
	let blobId: string = '';

	if (inputDataType === 'binaryData') {
		// 1. Validate binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		// 2. Get binary data metadata
		const binaryData = item[0].binary[binaryPropertyName];
		docName = binaryData.fileName || outputFileName;

		// 3. Convert to Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// 4. Upload to UploadBlob
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, docName);

		// 5. Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		docContent = this.getNodeParameter('base64Content', index) as string;
		blobId = '';
	} else if (inputDataType === 'url') {
		// 1. Get URL parameter
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;

		// 2. Extract filename from URL
		docName = pdfUrl.split('/').pop() || outputFileName;

		// 3. Use URL directly in docContent
		blobId = '';
		docContent = pdfUrl;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body
	const body: IDataObject = {
		docName,
		docContent,
		updatehyperlinkannotationlist: [
			{
				SearchOn: this.getNodeParameter('searchOn', index),
				SearchValue: this.getNodeParameter('searchValue', index),
				IsExpression: this.getNodeParameter('isExpression', index),
				TextCurrentValue: this.getNodeParameter('textCurrentValue', index),
				TextNewValue: this.getNodeParameter('textNewValue', index),
				URLCurrentValue: this.getNodeParameter('urlCurrentValue', index),
				URLNewValue: this.getNodeParameter('urlNewValue', index),
			},
		],
		IsAsync: true,
	};

	// Make the API request
	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/UpdateHyperlinkAnnotation', body);

	// Return the result as binary data
	const binaryDataKey = binaryDataName || 'data';
	return [
		{
			binary: {
				[binaryDataKey]: await this.helpers.prepareBinaryData(responseData, outputFileName, 'application/pdf'),
			},
			json: {},
			pairedItem: { item: index },
		},
	];
}
