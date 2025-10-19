/**
 * Generate Document (Single) Action
 * 
 * Dynamically generates a document using the PDF4me Generate Document action for API.
 * Supports Word, HTML, or PDF templates using mustache syntax or merge fields as the source.
 * For HTML templates, you can provide HTML code directly or use files/URLs.
 * Data sources can be JSON or XML. This action can be looped to iterate data for generating multiple documents.
 * 
 * API Endpoint: /api/v2/GenerateDocumentSingle
 * Method: POST
 * Content-Type: application/json
 */

import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Template File Input Type',
		name: 'templateInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the template file. Note: This action can be looped to generate multiple documents',
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use template file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded template file',
			},
			{
				name: 'HTML Code',
				value: 'htmlCode',
				description: 'Write raw HTML code manually (only available for HTML template type)',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the template file',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},

	},
	{
		displayName: 'Template Binary Property',
		name: 'templateBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the template file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['binaryData'],
			},
		},
		hint: 'Generate document using a template file. See our <b><a href="https://docs.pdf4me.com/n8n/generate/generate-document-single/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Template File Name',
		name: 'templateFileName',
		type: 'string',
		default: '',
		description: 'Name of the template file (including extension)',
		placeholder: 'template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Template Base64 Content',
		name: 'templateBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded template file content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Template File Name',
		name: 'templateFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the template file (including extension)',
		placeholder: 'template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['base64', 'url', 'htmlCode'],
			},
		},
	},
	{
		displayName: 'Template File URL',
		name: 'templateFileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the template file',
		placeholder: 'https://example.com/template.docx',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'HTML Code',
		name: 'templateHtmlCode',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		required: true,
		description: 'Write your HTML template code here. It will be automatically converted to base64.',
		placeholder: '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{heading}}</h1><p>{{content}}</p></body></html>',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				templateInputDataType: ['htmlCode'],
				templateFileType: ['HTML'],
			},
		},
	},
	{
		displayName: 'Template File Type',
		name: 'templateFileType',
		type: 'options',
		required: true,
		default: 'Docx',
		description: 'Template file type. Set this value when sending a Word, HTML, or PDF template',
		options: [
			{ name: 'Word', value: 'Docx' },
			{ name: 'HTML', value: 'HTML' },
			{ name: 'PDF', value: 'PDF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Input Type',
		name: 'documentInputDataType',
		type: 'options',
		required: true,
		default: 'text',
		description: 'How to provide the document data',
		options: [
			{
				name: 'Text',
				value: 'text',
				description: 'Manually enter JSON or XML data',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use data file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded data file',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the data file',
			},
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Type',
		name: 'documentDataType',
		type: 'options',
		default: 'Json',
		required: true,
		description: 'The data type for the template. Choose JSON or XML format',
		options: [
			{ name: 'JSON', value: 'Json' },
			{ name: 'XML', value: 'XML' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
	{
		displayName: 'Document Data Text',
		name: 'documentDataText',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		description: 'Manual data entry for the template in JSON or XML format (required if Document Data File is not provided)',
		placeholder: 'Enter your JSON or XML data here. Example JSON: {"name": "John Doe", "email": "john@example.com", "items": [{"product": "Widget", "price": 29.99}]}',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['text'],
			},
		},
	},
	{
		displayName: 'Document Binary Property',
		name: 'documentBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the data file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Data File Name',
		name: 'documentDataFileName',
		type: 'string',
		default: '',
		description: 'Name of the data file (including extension)',
		placeholder: 'data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Document Base64 Content',
		name: 'documentBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded data file content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Document Data File Name',
		name: 'documentDataFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the data file (including extension)',
		placeholder: 'data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'Document Data File URL',
		name: 'documentDataFileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the data file',
		placeholder: 'https://example.com/data.json',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
				documentInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'generated-document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentSingle],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const templateInputDataType = this.getNodeParameter('templateInputDataType', index) as string;
	const templateFileType = this.getNodeParameter('templateFileType', index) as string;
	const documentInputDataType = this.getNodeParameter('documentInputDataType', index) as string;
	const documentDataType = this.getNodeParameter('documentDataType', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	
	// Auto-set output type based on template file type
	let outputType: string;
	if (templateFileType === 'HTML') {
		outputType = 'HTML';
	} else if (templateFileType === 'PDF') {
		outputType = 'PDF';
	} else if (templateFileType === 'Docx') {
		outputType = 'Docx';
	} else {
		// Fallback to user selection if template type is not one of the auto-mapped types
		outputType = this.getNodeParameter('outputType', index) as string;
	}

	let templateFileData: string;
	let templateFileName: string;
	let documentDataFile: string = '';
	let documentDataText: string = '';

	// Handle template file input types
	if (templateInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('templateBinaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('templateFileName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		templateFileData = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		templateFileName = inputFileName || binaryData.fileName || 'template.docx';
	} else if (templateInputDataType === 'base64') {
		templateFileData = this.getNodeParameter('templateBase64Content', index) as string;
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
	} else if (templateInputDataType === 'htmlCode') {
		// Validate that template file type is HTML
		if (templateFileType !== 'HTML') {
			throw new Error('HTML Code input type is only available when Template File Type is set to HTML');
		}
		
		let htmlCode = this.getNodeParameter('templateHtmlCode', index) as string;
		
		// Validate HTML code
		if (!htmlCode || htmlCode.trim().length === 0) {
			throw new Error('HTML code cannot be empty');
		}
		
		// Ensure HTML has basic structure
		if (!htmlCode.includes('<html') && !htmlCode.includes('<!DOCTYPE')) {
			// console.log('Warning: HTML code may not have proper HTML structure');
			// Try to wrap the content in basic HTML structure if it's missing
			if (!htmlCode.includes('<html')) {
				htmlCode = `<!DOCTYPE html><html><head><title>Template</title></head><body>${htmlCode}</body></html>`;
				// console.log('Wrapped HTML content in basic HTML structure');
			}
		}
		
		// Convert HTML to base64
		try {
			templateFileData = Buffer.from(htmlCode, 'utf8').toString('base64');
		} catch (error) {
			// console.log('Error converting HTML to base64:', error);
			// Fallback: try with different encoding
			templateFileData = Buffer.from(htmlCode, 'latin1').toString('base64');
		}
		
		// Set default filename for HTML template
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string || 'template.html';
	} else if (templateInputDataType === 'url') {
		const templateFileUrl = this.getNodeParameter('templateFileUrl', index) as string;
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
		const options = {

			method: 'GET' as const,

			url: templateFileUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		templateFileData = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported template input type: ${templateInputDataType}`);
	}

	// Handle document data input types
	if (documentInputDataType === 'text') {
		documentDataText = this.getNodeParameter('documentDataText', index) as string;
	} else if (documentInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('documentBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		documentDataFile = buffer.toString('base64');
	} else if (documentInputDataType === 'base64') {
		documentDataFile = this.getNodeParameter('documentBase64Content', index) as string;
	} else if (documentInputDataType === 'url') {
		const documentDataFileUrl = this.getNodeParameter('documentDataFileUrl', index) as string;
		const options = {

			method: 'GET' as const,

			url: documentDataFileUrl,

			encoding: 'arraybuffer' as const,

		};

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
		documentDataFile = Buffer.from(response).toString('base64');
	} else {
		throw new Error(`Unsupported document input type: ${documentInputDataType}`);
	}

	// Validate that either documentDataFile or documentDataText is provided
	if (!documentDataFile && !documentDataText) {
		throw new Error('Either Document Data File or Document Data Text must be provided');
	}

	// Validate JSON/XML format if text input is provided
	if (documentDataText && documentInputDataType === 'text') {
		if (documentDataType === 'Json') {
			try {
				JSON.parse(documentDataText);
			} catch (error) {
				throw new Error(`Invalid JSON format in Document Data Text: ${error.message}`);
			}
		} else if (documentDataType === 'XML') {
			// Basic XML validation - check for proper XML structure
			if (!documentDataText.trim().startsWith('<') || !documentDataText.trim().includes('>')) {
				throw new Error('Invalid XML format in Document Data Text: XML must start with < and contain proper tags');
			}
		}
	}

	// Validate required parameters
	if (!templateFileName) {
		throw new Error('Template File Name is required');
	}
	if (!templateFileData) {
		throw new Error('Template File Data is required');
	}


	const payload = {
		templateFileType,
		templateFileName,
		templateFileData,
		documentDataType,
		outputType,
		documentDataFile: documentDataFile || undefined,
		documentDataText: documentDataText || undefined,
		IsAsync: true,
	};

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GenerateDocumentSingle', payload);

	if (responseData) {
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			'generated_document_output.' + outputType.toLowerCase(),
			outputType === 'PDF' ? 'application/pdf' :
				outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
					outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
						'text/html',
		);

		return [
			{
				json: {
					fileName: 'generated_document_output.' + outputType.toLowerCase(),
					mimeType: outputType === 'PDF' ? 'application/pdf' :
						outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
							outputType === 'Excel'? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
								'text/html',
					fileSize: responseData.length,
					success: true,
				},
				binary: {
					[binaryDataName || 'data']: binaryData,
				},
			},
		];
	}

	throw new Error('No response data received from PDF4ME API');
}