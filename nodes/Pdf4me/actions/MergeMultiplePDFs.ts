import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and other Node.js globals available
// declare const URL: any;
// declare const console: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF data',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
		options: [
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF files from previous nodes',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URLs to PDF files',
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFiles',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['binaryData'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'Binary Property Name',
						name: 'binaryPropertyName',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the PDF file',
						placeholder: 'data',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFilesBase64',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['base64'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'Base64 Content',
						name: 'base64Content',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						default: '',
						description: 'Base64 encoded PDF content',
						placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PA...',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'PDF Files',
		name: 'pdfFilesUrl',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				inputDataType: ['url'],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'PDF URL',
						name: 'pdfUrl',
						type: 'string',
						default: '',
						description: 'URL to the PDF file',
						placeholder: 'https://example.com/document.pdf',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						description: 'Optional name for the PDF file (for reference)',
						placeholder: 'document1.pdf',
					},
				],
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'merged_output.pdf',
		description: 'Name for the output merged PDF file',
		placeholder: 'merged_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'merged_output',
		description: 'Name of the output document for reference',
		placeholder: 'merged-document',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
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
				operation: [ActionConstants.MergeMultiplePDFs],
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
	try {
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents based on input data type
		const pdfContentsBase64 = await getPdfContents.call(this, index, inputDataType);

		// Validate that we have at least 2 PDFs to merge
		if (pdfContentsBase64.length < 2) {
			throw new Error('At least 2 PDF files are required for merging');
		}

		// Build the request body for merging multiple PDFs
		const body: IDataObject = {
			docContent: pdfContentsBase64,
			docName,
			IsAsync: true,
		};

		// Add profiles if provided
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;

		sanitizeProfiles(body);

		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/Merge', body);

		// Handle the binary response (merged PDF file data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				// Extract name from docName if available, otherwise use default
				const baseName = docName || 'merged_output';
				fileName = `${baseName}.pdf`;
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
						inputFileCount: pdfContentsBase64.length,
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}

		// Error case
		throw new Error('No response data received from PDF4ME API');
	} catch (error) {
		// Re-throw the error with additional context
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`PDF merge operation failed: ${errorMessage}`);
	}
}

async function getPdfContents(this: IExecuteFunctions, index: number, inputDataType: string): Promise<string[]> {
	let pdfContentsBase64: string[];

	if (inputDataType === 'binaryData') {
		// Get PDF contents from multiple binary files
		const pdfFiles = this.getNodeParameter('pdfFiles', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];

		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		const item = this.getInputData(index);
		pdfContentsBase64 = [];

		for (const pdfFile of pdfFileArray) {
			const binaryPropertyName = pdfFile.binaryPropertyName as string;

			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				const fileName = pdfFile.fileName as string || binaryPropertyName;
				throw new Error(`No binary data found in property '${binaryPropertyName}' for file '${fileName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			const base64Content = buffer.toString('base64');
			pdfContentsBase64.push(base64Content);
		}
	} else if (inputDataType === 'base64') {
		// Get PDF contents from multiple base64 files
		const pdfFiles = this.getNodeParameter('pdfFilesBase64', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];

		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		pdfContentsBase64 = [];
		for (const pdfFile of pdfFileArray) {
			const base64Content = pdfFile.base64Content as string;
			if (!base64Content || base64Content.trim() === '') {
				const fileName = pdfFile.fileName as string || 'unnamed';
				throw new Error(`Base64 content is required for file '${fileName}'`);
			}
			pdfContentsBase64.push(base64Content.trim());
		}
	} else if (inputDataType === 'url') {
		// Get PDF contents from multiple URLs
		const pdfFiles = this.getNodeParameter('pdfFilesUrl', index) as IDataObject;
		const pdfFileArray = pdfFiles.pdfFile as IDataObject[];

		if (!pdfFileArray || pdfFileArray.length === 0) {
			throw new Error('At least one PDF file is required');
		}

		pdfContentsBase64 = [];
		for (const pdfFile of pdfFileArray) {
			const pdfUrl = pdfFile.pdfUrl as string;
			if (!pdfUrl || pdfUrl.trim() === '') {
				const fileName = pdfFile.fileName as string || 'unnamed';
				throw new Error(`PDF URL is required for file '${fileName}'`);
			}
			const options = {

				method: 'GET' as const,

				url: pdfUrl.trim(),

				encoding: 'arraybuffer' as const,

			};

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
			const buffer = Buffer.from(response as Buffer);
			const base64Content = buffer.toString('base64');
			pdfContentsBase64.push(base64Content);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	return pdfContentsBase64;
}


