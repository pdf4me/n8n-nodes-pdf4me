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
		description: 'Choose how to provide the document to parse',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use document file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide document content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to document file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the document file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Document Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document URL',
		name: 'documentUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the document file to parse',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
				inputDataType: ['url'],
			},
		},

	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'document.pdf',
		description: 'Name of the source document file for reference',
		placeholder: 'original-document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
			},
		},
		hint: 'Parse document. See our <b><a href="https://docs.pdf4me.com/n8n/extract/parse-document/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Parse ID',
		name: 'parseId',
		type: 'string',
		required: true,
		default: '',
		description: 'GUID of the parse configuration to use (will also be used as Template ID)',
		placeholder: '87654321-4321-4321-4321-cba987654321',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		default: 'json',
		description: 'Format for the parsed document output',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Return parsed data as JSON',
			},
			{
				name: 'Text File',
				value: 'text',
				description: 'Return parsed data as a text file',
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'parsed_document.txt',
		description: 'Name for the output file (only used when output format is text)',
		placeholder: 'my-parsed-document.txt',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
				outputFormat: ['text'],
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
				operation: [ActionConstants.ParseDocument],
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
		placeholder: 'parsed-data',
		displayOptions: {
			show: {
				operation: [ActionConstants.ParseDocument],
			},
		},
	},
];

/**
 * Parse documents using PDF4ME API with template-based parsing
 * Process: Read Document → Encode to base64 → Send API request → Poll for completion → Return parsed results
 *
 * This action allows parsing documents to extract structured data using PDF4ME's parsing capabilities.
 * It supports various document formats and returns structured data or text output.
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const parseId = this.getNodeParameter('parseId', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get document content from binary data
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
		const documentUrl = this.getNodeParameter('documentUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: documentUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		originalFileName = documentUrl.split('/').pop() || 'document.pdf';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate document content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Document content is required');
	}

	// Validate required parameters
	if (!parseId || parseId.trim() === '') {
		throw new Error('Parse ID is required');
	}

	// Build the request body according to API specification
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		TemplateId: parseId, // Use parseId as TemplateId
		ParseId: parseId,
		IsAsync: true,
	};


	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Make the API request
	const result: any = await pdf4meAsyncRequest.call(this, '/api/v2/ParseDocument', body);
	
	// Debug: Log the result to understand what we're getting
	// console.log('ParseDocument API result type:', typeof result);
	// console.log('ParseDocument API result:', JSON.stringify(result, null, 2));

	// Process the response
	if (result) {
		let parsedData: any;
		let outputText: string = '';

		// The pdf4meAsyncRequest already parses JSON responses for ParseDocument endpoint
		// So result should already be a parsed object
		if (typeof result === 'object' && result !== null) {
			// Already parsed JSON object from pdf4meAsyncRequest
			parsedData = result;
		} else if (typeof result === 'string') {
			// Fallback: try to parse as JSON if it's still a string
			try {
				parsedData = JSON.parse(result);
			} catch (error) {
				// If not valid JSON, treat as raw text
				parsedData = { 
					rawContent: result,
					contentType: 'text/plain',
				};
			}
		} else {
			// Fallback for other types
			parsedData = { 
				rawContent: result,
				contentType: typeof result,
			};
		}

		// Debug: Log the parsed data
		// console.log('ParseDocument parsed data:', JSON.stringify(parsedData, null, 2));

		// Format output based on user preference
		if (outputFormat === 'text') {
			// Get outputFileName only when needed
			const outputFileName = this.getNodeParameter('outputFileName', index) as string;
			
			// Create formatted text output similar to Python implementation
			outputText = 'Document Parsing Results\n';
			outputText += '========================\n';
			outputText += `Parsed on: ${new Date().toISOString()}\n\n`;

			// Extract key fields
			if (parsedData.traceId) {
				outputText += `Trace ID: ${parsedData.traceId}\n`;
			}
			if (parsedData.documentType) {
				outputText += `Document Type: ${parsedData.documentType}\n`;
			}
			if (parsedData.pageCount) {
				outputText += `Page Count: ${parsedData.pageCount}\n`;
			}

			outputText += '\nFull Response:\n';
			outputText += JSON.stringify(parsedData, null, 2);

			// Create binary output for text file
			const textBuffer = Buffer.from(outputText, 'utf8');
			const binaryData = await this.helpers.prepareBinaryData(
				textBuffer,
				outputFileName,
				'text/plain',
			);

			return [
				{
					json: {
						success: true,
						message: 'Document parsed successfully',
						fileName: outputFileName,
						mimeType: 'text/plain',
						fileSize: textBuffer.length,
						traceId: parsedData.traceId,
						documentType: parsedData.documentType,
						pageCount: parsedData.pageCount,
					},
					binary: {
						[binaryDataName || 'data']: binaryData,
					},
				},
			];
		} else {
			// Return JSON output - return the parsed data directly
			// Ensure we have valid data
			if (!parsedData || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0)) {
				throw new Error('No parsed data received from PDF4ME API');
			}
			
			return [
				{
					json: parsedData, // Return the actual parsed data from API directly
				},
			];
		}
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}
