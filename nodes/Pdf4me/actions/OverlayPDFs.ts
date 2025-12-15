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
		displayName: 'Base PDF Input Type',
		name: 'baseInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the base PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use base PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to base PDF file',
			},
		],

	},
	{
		displayName: 'Layer PDF Input Type',
		name: 'layerInputType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the layer PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use layer PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide layer PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to layer PDF file',
			},
		],
		hint: 'Overlay PDFs. See our <b><a href="https://docs.pdf4me.com/n8n/merge-split/overlay-pdfs/">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Base PDF Binary Field',
		name: 'baseBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the base PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Layer PDF Binary Field',
		name: 'layerBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property containing the layer PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base PDF Base64 Content',
		name: 'baseBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded base PDF content',
		placeholder: 'base64content',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Layer PDF Base64 Content',
		name: 'layerBase64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded layer PDF content',
		placeholder: 'base64content',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Base PDF URL',
		name: 'basePdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the base PDF file',
		placeholder: 'https://example.com/base.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				baseInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Layer PDF URL',
		name: 'layerPdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the layer PDF file',
		placeholder: 'https://example.com/layer.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
				layerInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'overlayed_output.pdf',
		description: 'Name for the output overlayed PDF file',
		placeholder: 'overlayed_document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
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
				operation: [ActionConstants.OverlayPDFs],
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
		placeholder: 'overlayed-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.OverlayPDFs],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const baseInputType = this.getNodeParameter('baseInputType', index) as string;
		const layerInputType = this.getNodeParameter('layerInputType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
		const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		// Get PDF contents based on input data types
		// Returns: blobId (for binary), base64 string (for base64), or URL string (for URL)
		const { baseDocContent, layerDocContent, baseDocName, layerDocName } = await getPdfContents.call(this, index, baseInputType, layerInputType);

		// Build the request body for overlay merging
		// baseDocContent and layerDocContent can be: blobId (for binary), base64 string (for base64), or URL string (for URL)
		const body: IDataObject = {
			baseDocContent,
			baseDocName: baseDocName || 'base.pdf',
			layerDocContent,
			layerDocName: layerDocName || 'layer.pdf',
			IsAsync: true,
		};

		// Add profiles if provided
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;

		sanitizeProfiles(body);

		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/MergeOverlay', body);

		// Handle the binary response (overlayed PDF file data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				fileName = 'overlayed_output.pdf';
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
						inputFileCount: 2,
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
		throw new Error(`PDF overlay operation failed: ${errorMessage}`);
	}
}

async function getPdfContents(
	this: IExecuteFunctions,
	index: number,
	baseInputType: string,
	layerInputType: string,
): Promise<{ baseDocContent: string; layerDocContent: string; baseDocName: string; layerDocName: string }> {
	let baseDocContent: string;
	let layerDocContent: string;
	let baseDocName: string = 'base.pdf';
	let layerDocName: string = 'layer.pdf';

	// Get base PDF content
	if (baseInputType === 'binaryData') {
		const baseBinaryPropertyName = this.getNodeParameter('baseBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[baseBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${baseBinaryPropertyName}'`);
		}

		const binaryData = item[0].binary[baseBinaryPropertyName];
		baseDocName = binaryData.fileName || 'base.pdf';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, baseBinaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in MergeOverlay API payload
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, baseDocName);

		// Use blobId in baseDocContent
		baseDocContent = `${blobId}`;
	} else if (baseInputType === 'base64') {
		baseDocContent = this.getNodeParameter('baseBase64Content', index) as string;
		if (!baseDocContent || baseDocContent.trim() === '') {
			throw new Error('Base PDF base64 content is required');
		}

		// Handle data URLs (remove data: prefix if present)
		if (baseDocContent.includes(',')) {
			baseDocContent = baseDocContent.split(',')[1];
		}
		baseDocContent = baseDocContent.trim();
	} else if (baseInputType === 'url') {
		const basePdfUrl = this.getNodeParameter('basePdfUrl', index) as string;
		if (!basePdfUrl || basePdfUrl.trim() === '') {
			throw new Error('Base PDF URL is required');
		}

		// Validate URL format
		try {
			new URL(basePdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the base PDF file.');
		}

		// Send URL as string directly in baseDocContent - no download or conversion
		baseDocContent = String(basePdfUrl);
		// Extract filename from URL
		baseDocName = basePdfUrl.split('/').pop() || 'base.pdf';
	} else {
		throw new Error(`Unsupported base PDF input type: ${baseInputType}`);
	}

	// Validate base PDF content based on input type
	if (baseInputType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!baseDocContent || typeof baseDocContent !== 'string' || baseDocContent.trim() === '') {
			throw new Error('Base PDF URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (baseInputType === 'base64') {
		// For base64, validate content is not empty
		if (!baseDocContent || baseDocContent.trim() === '') {
			throw new Error('Base PDF content is required');
		}
	} else if (baseInputType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!baseDocContent || baseDocContent.trim() === '') {
			throw new Error('Base PDF content is required');
		}
	}

	// Get layer PDF content
	if (layerInputType === 'binaryData') {
		const layerBinaryPropertyName = this.getNodeParameter('layerBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[layerBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${layerBinaryPropertyName}'`);
		}

		const binaryData = item[0].binary[layerBinaryPropertyName];
		layerDocName = binaryData.fileName || 'layer.pdf';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, layerBinaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in MergeOverlay API payload
		const blobId = await uploadBlobToPdf4me.call(this, fileBuffer, layerDocName);

		// Use blobId in layerDocContent
		layerDocContent = `${blobId}`;
	} else if (layerInputType === 'base64') {
		layerDocContent = this.getNodeParameter('layerBase64Content', index) as string;
		if (!layerDocContent || layerDocContent.trim() === '') {
			throw new Error('Layer PDF base64 content is required');
		}

		// Handle data URLs (remove data: prefix if present)
		if (layerDocContent.includes(',')) {
			layerDocContent = layerDocContent.split(',')[1];
		}
		layerDocContent = layerDocContent.trim();
	} else if (layerInputType === 'url') {
		const layerPdfUrl = this.getNodeParameter('layerPdfUrl', index) as string;
		if (!layerPdfUrl || layerPdfUrl.trim() === '') {
			throw new Error('Layer PDF URL is required');
		}

		// Validate URL format
		try {
			new URL(layerPdfUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the layer PDF file.');
		}

		// Send URL as string directly in layerDocContent - no download or conversion
		layerDocContent = String(layerPdfUrl);
		// Extract filename from URL
		layerDocName = layerPdfUrl.split('/').pop() || 'layer.pdf';
	} else {
		throw new Error(`Unsupported layer PDF input type: ${layerInputType}`);
	}

	// Validate layer PDF content based on input type
	if (layerInputType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!layerDocContent || typeof layerDocContent !== 'string' || layerDocContent.trim() === '') {
			throw new Error('Layer PDF URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (layerInputType === 'base64') {
		// For base64, validate content is not empty
		if (!layerDocContent || layerDocContent.trim() === '') {
			throw new Error('Layer PDF content is required');
		}
	} else if (layerInputType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!layerDocContent || layerDocContent.trim() === '') {
			throw new Error('Layer PDF content is required');
		}
	}

	return { baseDocContent, layerDocContent, baseDocName, layerDocName };
}

