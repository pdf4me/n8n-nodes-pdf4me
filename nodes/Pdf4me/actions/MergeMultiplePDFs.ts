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
		displayName: 'PDF Files',
		name: 'pdfFiles',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add PDF File',
		default: {},
		description: 'Add multiple PDF files to merge. Each file can use a different input type.',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
		options: [
			{
				displayName: 'PDF File',
				name: 'pdfFile',
				values: [
					{
						displayName: 'Input Type',
						name: 'inputType',
						type: 'options',
						required: true,
						default: 'binaryData',
						description: 'Choose how to provide this PDF file',
						options: [
							{
								name: 'Binary Data',
								value: 'binaryData',
								description: 'Use PDF file from previous nodes',
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
						displayName: 'Binary Property Name',
						name: 'binaryPropertyName',
						type: 'string',
						default: 'data',
						description: 'Name of the binary property containing the PDF file',
						placeholder: 'data',
						displayOptions: {
							show: {
								inputType: ['binaryData'],
							},
						},
					},
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
						displayOptions: {
							show: {
								inputType: ['base64'],
							},
						},
					},
					{
						displayName: 'PDF URL',
						name: 'pdfUrl',
						type: 'string',
						default: '',
						description: 'URL to the PDF file',
						placeholder: 'https://example.com/document.pdf',
						displayOptions: {
							show: {
								inputType: ['url'],
							},
						},
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
		hint: 'Merge multiple PDFs. See our <b><a href="https://docs.pdf4me.com/n8n/merge-split/merge-multiple-pdfs/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'merged-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents from mixed input types
		const pdfContentsBase64 = await getPdfContents.call(this, index);

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
						[binaryDataName || 'data']: binaryData,
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

async function getPdfContents(this: IExecuteFunctions, index: number): Promise<string[]> {
	// Get PDF files with mixed input types
	const pdfFiles = this.getNodeParameter('pdfFiles', index) as IDataObject;
	const pdfFileArray = pdfFiles.pdfFile as IDataObject[];

	if (!pdfFileArray || pdfFileArray.length === 0) {
		throw new Error('At least one PDF file is required');
	}

	const pdfContentsBase64: string[] = [];
	const item = this.getInputData(index);

	for (const pdfFile of pdfFileArray) {
		const inputType = pdfFile.inputType as string;
		const fileName = pdfFile.fileName as string || 'unnamed';

		if (inputType === 'binaryData') {
			// Get PDF content from binary data
			const binaryPropertyName = pdfFile.binaryPropertyName as string;

			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}' for file '${fileName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			const base64Content = buffer.toString('base64');
			pdfContentsBase64.push(base64Content);
		} else if (inputType === 'base64') {
			// Get PDF content from base64 string
			const base64Content = pdfFile.base64Content as string;
			if (!base64Content || base64Content.trim() === '') {
				throw new Error(`Base64 content is required for file '${fileName}'`);
			}
			pdfContentsBase64.push(base64Content.trim());
		} else if (inputType === 'url') {
			// Get PDF content from URL
			const pdfUrl = pdfFile.pdfUrl as string;
			if (!pdfUrl || pdfUrl.trim() === '') {
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
		} else {
			throw new Error(`Unsupported input type '${inputType}' for file '${fileName}'`);
		}
	}

	return pdfContentsBase64;
}


