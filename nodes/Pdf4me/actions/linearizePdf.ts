import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';




export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to linearize',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
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
				operation: [ActionConstants.LinearizePdf],
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
				operation: [ActionConstants.LinearizePdf],
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
		description: 'URL to the PDF file to linearize',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'linearized_document.pdf',
		description: 'Name for the output linearized PDF file',
		placeholder: 'my-linearized-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
			},
		},
	},
	{
		displayName: 'Optimization Profile',
		name: 'optimizeProfile',
		type: 'options',
		default: 'web',
		description: 'Optimization profile for PDF linearization',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
			},
		},
		options: [
			{
				name: 'Web',
				value: 'web',
				description: 'Optimized for web viewing (fast loading, progressive display)',
			},
			{
				name: 'Max',
				value: 'Max',
				description: 'Maximum compression (smallest file size, slower processing)',
			},
			{
				name: 'Print',
				value: 'Print',
				description: 'Optimized for printing (correct fonts, colors, resolution)',
			},
			{
				name: 'Default',
				value: 'Default',
				description: 'Standard optimization balance',
			},
			{
				name: 'WebMax',
				value: 'WebMax',
				description: 'Maximum web optimization (best for online viewing)',
			},
			{
				name: 'PrintMax',
				value: 'PrintMax',
				description: 'Maximum print optimization (best quality for printing)',
			},
			{
				name: 'PrintGray',
				value: 'PrintGray',
				description: 'Print optimized with grayscale conversion',
			},
			{
				name: 'Compress',
				value: 'Compress',
				description: 'General compression without specific optimization',
			},
			{
				name: 'CompressMax',
				value: 'CompressMax',
				description: 'Maximum compression with aggressive size reduction',
			},
		],
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
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
		placeholder: 'linearized-pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.LinearizePdf],
			},
		},
	},
];

/**
 * Linearize a PDF document using PDF4ME API
 * Process: Read PDF → Encode to base64 → Send API request → Handle response → Return linearized PDF
 *
 * PDF linearization optimizes documents for web viewing with faster loading and progressive display.
 * Linearized PDFs display progressively as they download, perfect for web applications and online document viewing.
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const optimizeProfile = this.getNodeParameter('optimizeProfile', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		// Use the original filename if available
		if (binaryData.fileName) {
			originalFileName = binaryData.fileName;
		}
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: pdfUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		originalFileName = pdfUrl.split('/').pop() || 'document.pdf';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}

	// Ensure output filename has .pdf extension
	let finalOutputFileName = outputFileName;
	if (!finalOutputFileName.toLowerCase().endsWith('.pdf')) {
		finalOutputFileName = `${finalOutputFileName.replace(/\.[^.]*$/, '')}.pdf`;
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		optimizeProfile,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/LinearizePdf', body);

	// Handle the response
	if (result) {
		// Check if result is already a Buffer (binary PDF data)
		let pdfBuffer: Buffer;

		if (result instanceof Buffer) {
			pdfBuffer = result;
		} else if (typeof result === 'string') {
			// Try to parse as JSON first
			try {
				const jsonResult = JSON.parse(result);

				// Look for PDF data in different possible JSON locations
				let pdfBase64: string | undefined;
				if (jsonResult.document && jsonResult.document.docData) {
					pdfBase64 = jsonResult.document.docData;
				} else if (jsonResult.docData) {
					pdfBase64 = jsonResult.docData;
				} else if (jsonResult.data) {
					pdfBase64 = jsonResult.data;
				}

				if (pdfBase64) {
					pdfBuffer = Buffer.from(pdfBase64, 'base64');
				} else {
					throw new Error('No PDF data found in JSON response');
				}
			} catch (error) {
				// If not JSON, try to treat as base64
				pdfBuffer = Buffer.from(result, 'base64');
			}
		} else {
			// If it's already binary data, convert to buffer
			pdfBuffer = Buffer.from(result as any);
		}

		// Validate that we have a valid PDF
		if (pdfBuffer.length < 100) {
			throw new Error('Response data too small to be a valid PDF');
		}

		// Check if it starts with PDF signature (%PDF)
		const pdfSignature = pdfBuffer.toString('ascii', 0, 4);
		if (pdfSignature !== '%PDF') {
			// Warning: Response does not start with PDF signature, but proceeding anyway
		}

		// Create binary data for output using n8n's helper
		const binaryData = await this.helpers.prepareBinaryData(
			pdfBuffer,
			finalOutputFileName,
			'application/pdf',
		);

		return [
			{
				json: {
					success: true,
					message: 'PDF linearization completed successfully',
					fileName: finalOutputFileName,
					mimeType: 'application/pdf',
					fileSize: pdfBuffer.length,
					optimizeProfile,
					originalFileName,
					description: 'PDF is now optimized for web viewing and faster loading',
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
