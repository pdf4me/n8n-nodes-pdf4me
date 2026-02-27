import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

// Make Buffer and other Node.js globals available
// declare const URL: any;
// declare const console: any;

export const description: INodeProperties[] = [
	{
		displayName: 'PDF Input Source',
		name: 'pdfInputSource',
		type: 'options',
		default: 'manual',
		description: 'How to provide the PDF files to merge',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
			},
		},
		options: [
			{
				name: 'Add Manually',
				value: 'manual',
				description: 'Add each PDF file one by one (binary, base64, or URL)',
			},
			{
				name: 'From Array',
				value: 'array',
				description: 'Provide an array of PDFs (base64 or URLs) from a previous node',
			},
			{
				name: 'All Input Items',
				value: 'items',
				description: 'Use each input item as a PDF (each item must have binary data)',
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
		description: 'Add multiple PDF files to merge. Each file can use a different input type.',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				pdfInputSource: ['manual'],
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
		displayName: 'PDF Array',
		name: 'pdfArray',
		type: 'string',
		default: '',
		required: true,
		description: 'Expression that returns an array of PDFs. Use base64 strings or URLs. E.g. {{ $json.pdfArray }}',
		placeholder: '{{ $json.pdfArray }}',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				pdfInputSource: ['array'],
			},
		},
		hint: 'Use the <b>Aggregate</b> node to collect PDF URLs or base64 from multiple items: set "Aggregate" to "Aggregate Items Into Array", choose a field name (e.g. <code>pdfArray</code>), then reference it here as <code>{{ $json.pdfArray }}</code>. Each array element should be a base64 string or PDF URL.',
	},
	{
		displayName: 'Array Content Type',
		name: 'arrayContentType',
		type: 'options',
		default: 'url',
		description: 'What each element in the array contains',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				pdfInputSource: ['array'],
			},
		},
		options: [
			{
				name: 'URLs',
				value: 'url',
				description: 'Array of PDF URLs',
			},
			{
				name: 'Base64 Strings',
				value: 'base64',
				description: 'Array of base64-encoded PDF content',
			},
			{
				name: 'Objects with URL or Base64',
				value: 'mixed',
				description: 'Array of objects with "url" or "base64" property per item',
			},
		],
	},
	{
		displayName: 'Binary Property Name',
		name: 'itemsBinaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property containing the PDF on each input item',
		placeholder: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.MergeMultiplePDFs],
				pdfInputSource: ['items'],
			},
		},
		hint: 'Each input item must have a PDF in this binary property. Connect multiple items (e.g. from Read Binary File) directly to merge them in order.',
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
		hint: 'Merge multiple PDFs. See our <b><a href="https://docs.pdf4me.com/integration/n8n/merge-split/merge-multiple-pdfs/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		// Default to 'manual' for backward compatibility with workflows saved before pdfInputSource was added
		const pdfInputSource = (this.getNodeParameter('pdfInputSource', index) as string) || 'manual';

		// When using "All Input Items", only run merge once (index 0) with all items
		if (pdfInputSource === 'items' && index > 0) {
			return [];
		}

		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents from mixed input types
		// Returns array of: blobId (for binary), base64 string (for base64), or URL string (for URL)
		const pdfContents = await getPdfContents.call(this, index);

		// Validate that we have at least 2 PDFs to merge
		if (pdfContents.length < 2) {
			throw new Error('At least 2 PDF files are required for merging');
		}

		// Build the request body for merging multiple PDFs
		// docContent can contain mix of: blobId (for binary), base64 string (for base64), or URL string (for URL)
		// API expects full docName with .pdf extension
		const fullDocName = (docName && docName.trim())
			? (docName.toLowerCase().endsWith('.pdf') ? docName : `${docName.replace(/\.[^.]*$/, '')}.pdf`)
			: (outputFileName && outputFileName.trim()) || 'merged_output.pdf';

		const body: IDataObject = {
			docContent: pdfContents,
			docName: fullDocName,
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
						inputFileCount: pdfContents.length,
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
	} catch (error) {
		// Re-throw the error with additional context
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`PDF merge operation failed: ${errorMessage}`);
	}
}

async function getPdfContents(this: IExecuteFunctions, index: number): Promise<string[]> {
	// Default to 'manual' for backward compatibility with existing workflows
	const pdfInputSource = (this.getNodeParameter('pdfInputSource', index) as string) || 'manual';

	if (pdfInputSource === 'manual') {
		return getPdfContentsFromManual.call(this, index);
	}
	if (pdfInputSource === 'array') {
		return getPdfContentsFromArray.call(this, index);
	}
	if (pdfInputSource === 'items') {
		return getPdfContentsFromItems.call(this, index);
	}

	throw new Error(`Unsupported PDF input source: ${pdfInputSource}`);
}

async function getPdfContentsFromManual(this: IExecuteFunctions, index: number): Promise<string[]> {
	const pdfFiles = this.getNodeParameter('pdfFiles', index) as IDataObject;
	const pdfFileArray = pdfFiles.pdfFile as IDataObject[];

	if (!pdfFileArray || pdfFileArray.length === 0) {
		throw new Error('At least one PDF file is required');
	}

	const pdfContents: string[] = [];
	const item = this.getInputData(index);

	for (const pdfFile of pdfFileArray) {
		const inputType = pdfFile.inputType as string;
		const fileName = pdfFile.fileName as string || 'unnamed.pdf';

		if (inputType === 'binaryData') {
			const binaryPropertyName = pdfFile.binaryPropertyName as string;

			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}' for file '${fileName}'`);
			}

			const binaryData = item[0].binary[binaryPropertyName];
			const inputDocName = binaryData.fileName || fileName;

			const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

			pdfContents.push(`${blobId}`);
		} else if (inputType === 'base64') {
			let base64Content = pdfFile.base64Content as string;
			if (!base64Content || base64Content.trim() === '') {
				throw new Error(`Base64 content is required for file '${fileName}'`);
			}

			if (base64Content.includes(',')) {
				base64Content = base64Content.split(',')[1];
			}

			pdfContents.push(base64Content.trim());
		} else if (inputType === 'url') {
			const pdfUrl = pdfFile.pdfUrl as string;
			if (!pdfUrl || pdfUrl.trim() === '') {
				throw new Error(`PDF URL is required for file '${fileName}'`);
			}

			try {
				new URL(pdfUrl);
			} catch {
				throw new Error(`Invalid URL format for file '${fileName}'. Please provide a valid URL to the PDF file.`);
			}

			pdfContents.push(String(pdfUrl));
		} else {
			throw new Error(`Unsupported input type '${inputType}' for file '${fileName}'`);
		}
	}

	return pdfContents;
}

async function getPdfContentsFromArray(this: IExecuteFunctions, index: number): Promise<string[]> {
	// getNodeParameter resolves expressions like {{ $json.pdfArray }}
	const rawValue = this.getNodeParameter('pdfArray', index);
	const arrayContentType = this.getNodeParameter('arrayContentType', index) as string;

	const pdfArray = Array.isArray(rawValue) ? rawValue : (rawValue != null ? [rawValue] : []);

	if (pdfArray.length === 0) {
		throw new Error('PDF array is empty. Use an expression like {{ $json.pdfArray }} that returns an array of base64 strings or URLs.');
	}

	const pdfContents: string[] = [];

	for (let i = 0; i < pdfArray.length; i++) {
		const elem = pdfArray[i];
		let content: string;

		if (arrayContentType === 'url') {
			content = typeof elem === 'string' ? elem : String(elem);
			try {
				new URL(content);
			} catch {
				throw new Error(`Invalid URL at array index ${i}. Expected a valid PDF URL.`);
			}
		} else if (arrayContentType === 'base64') {
			content = typeof elem === 'string' ? elem : String(elem);
			if (content.includes(',')) {
				content = content.split(',')[1];
			}
			content = content.trim();
			if (!content) {
				throw new Error(`Empty base64 content at array index ${i}.`);
			}
		} else {
			// mixed: object with url or base64
			const obj: IDataObject = typeof elem === 'object' && elem !== null ? (elem as IDataObject) : { url: elem, base64: elem };
			const url = (obj.url ?? obj.pdfUrl) as string | undefined;
			const base64 = (obj.base64 ?? obj.base64Content ?? obj.data) as string | undefined;

			if (url && typeof url === 'string') {
				try {
					new URL(url);
					content = url;
				} catch {
					throw new Error(`Invalid URL at array index ${i}.`);
				}
			} else if (base64 && typeof base64 === 'string') {
				content = base64.includes(',') ? base64.split(',')[1] : base64;
				content = content.trim();
			} else {
				throw new Error(`Array element at index ${i} must have "url" or "base64" property.`);
			}
		}

		pdfContents.push(content);
	}

	return pdfContents;
}

async function getPdfContentsFromItems(this: IExecuteFunctions, index: number): Promise<string[]> {
	const binaryPropertyName = this.getNodeParameter('itemsBinaryPropertyName', index) as string;
	const allItems = this.getInputData();

	if (!allItems || allItems.length === 0) {
		throw new Error('No input items. Connect nodes that output PDF files (each item = one PDF).');
	}

	if (allItems.length < 2) {
		throw new Error('At least 2 input items are required for merging. Each item should contain one PDF in the binary property.');
	}

	const pdfContents: string[] = [];

	for (let i = 0; i < allItems.length; i++) {
		const item = allItems[i];
		if (!item.binary || !item.binary[binaryPropertyName]) {
			throw new Error(`Item ${i + 1} has no binary data in property '${binaryPropertyName}'.`);
		}

		const binaryData = item.binary[binaryPropertyName];
		const inputDocName = binaryData.fileName || `document_${i + 1}.pdf`;

		const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		pdfContents.push(`${blobId}`);
	}

	return pdfContents;
}


