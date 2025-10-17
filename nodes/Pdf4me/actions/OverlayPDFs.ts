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
		hint: 'Overlay PDFs. See our <b><a href="https://docs.pdf4me.com/n8n/merge-split/overlay-pdfs/ target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		const { basePdfBase64, layerPdfBase64 } = await getPdfContents.call(this, index, baseInputType, layerInputType);

		// Build the request body for overlay merging
		const body: IDataObject = {
			baseDocContent: basePdfBase64,
			baseDocName: 'base.pdf',
			layerDocContent: layerPdfBase64,
			layerDocName: 'layer.pdf',
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

async function getPdfContents(this: IExecuteFunctions, index: number, baseInputType: string, layerInputType: string): Promise<{ basePdfBase64: string; layerPdfBase64: string }> {
	let basePdfBase64: string;
	let layerPdfBase64: string;

	// Get base PDF content
	if (baseInputType === 'binaryData') {
		const baseBinaryPropertyName = this.getNodeParameter('baseBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[baseBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${baseBinaryPropertyName}'`);
		}
		const baseBuffer = await this.helpers.getBinaryDataBuffer(index, baseBinaryPropertyName);
		basePdfBase64 = baseBuffer.toString('base64');
	} else if (baseInputType === 'base64') {
		basePdfBase64 = this.getNodeParameter('baseBase64Content', index) as string;
		if (!basePdfBase64) {
			throw new Error('Base PDF base64 content is required');
		}
	} else if (baseInputType === 'url') {
		const basePdfUrl = this.getNodeParameter('basePdfUrl', index) as string;
		if (!basePdfUrl) {
			throw new Error('Base PDF URL is required');
		}
		const options = {

			method: 'GET' as const,

			url: basePdfUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		basePdfBase64 = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported base PDF input type: ${baseInputType}`);
	}

	// Get layer PDF content
	if (layerInputType === 'binaryData') {
		const layerBinaryPropertyName = this.getNodeParameter('layerBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[layerBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${layerBinaryPropertyName}'`);
		}
		const layerBuffer = await this.helpers.getBinaryDataBuffer(index, layerBinaryPropertyName);
		layerPdfBase64 = layerBuffer.toString('base64');
	} else if (layerInputType === 'base64') {
		layerPdfBase64 = this.getNodeParameter('layerBase64Content', index) as string;
		if (!layerPdfBase64) {
			throw new Error('Layer PDF base64 content is required');
		}
	} else if (layerInputType === 'url') {
		const layerPdfUrl = this.getNodeParameter('layerPdfUrl', index) as string;
		if (!layerPdfUrl) {
			throw new Error('Layer PDF URL is required');
		}
		const options = {

			method: 'GET' as const,

			url: layerPdfUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		layerPdfBase64 = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported layer PDF input type: ${layerInputType}`);
	}

	return { basePdfBase64, layerPdfBase64 };
}

