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
import { ActionConstants, pdf4meAsyncRequest, uploadBlobToPdf4me } from '../GenericFunctions';

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
	let templateBlobId: string = '';
	let documentBlobId: string = '';

	// Handle template file input types
	if (templateInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('templateBinaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('templateFileName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		templateFileName = inputFileName || binaryData.fileName || 'template.docx';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in GenerateDocumentSingle API payload
		templateBlobId = await uploadBlobToPdf4me.call(this, fileBuffer, templateFileName);

		// Use blobId in templateFileData
		templateFileData = `${templateBlobId}`;
	} else if (templateInputDataType === 'base64') {
		templateFileData = this.getNodeParameter('templateBase64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (templateFileData.includes(',')) {
			templateFileData = templateFileData.split(',')[1];
		}

		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
		templateBlobId = '';
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
			// Try to wrap the content in basic HTML structure if it's missing
			if (!htmlCode.includes('<html')) {
				htmlCode = `<!DOCTYPE html><html><head><title>Template</title></head><body>${htmlCode}</body></html>`;
			}
		}

		// Convert HTML to base64
		try {
			templateFileData = Buffer.from(htmlCode, 'utf8').toString('base64');
		} catch (error) {
			// Fallback: try with different encoding
			templateFileData = Buffer.from(htmlCode, 'latin1').toString('base64');
		}

		// Set default filename for HTML template
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string || 'template.html';
		templateBlobId = '';
	} else if (templateInputDataType === 'url') {
		const templateFileUrl = this.getNodeParameter('templateFileUrl', index) as string;

		// Validate URL format
		try {
			new URL(templateFileUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the template file.');
		}

		// Send URL as string directly in templateFileData - no download or conversion
		templateBlobId = '';
		templateFileData = String(templateFileUrl);
		templateFileName = this.getNodeParameter('templateFileNameRequired', index) as string;
	} else {
		throw new Error(`Unsupported template input type: ${templateInputDataType}`);
	}

	// Validate template content based on input type
	if (templateInputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!templateFileData || typeof templateFileData !== 'string' || templateFileData.trim() === '') {
			throw new Error('Template file URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (templateInputDataType === 'base64' || templateInputDataType === 'htmlCode') {
		// For base64/HTML, validate content is not empty
		if (!templateFileData || templateFileData.trim() === '') {
			throw new Error('Template file content is required');
		}
	} else if (templateInputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!templateFileData || templateFileData.trim() === '') {
			throw new Error('Template file content is required');
		}
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

		const binaryData = item[0].binary[binaryPropertyName];
		const inputFileName = this.getNodeParameter('documentDataFileName', index) as string;
		const documentFileName = inputFileName || binaryData.fileName || 'data.json';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in GenerateDocumentSingle API payload
		documentBlobId = await uploadBlobToPdf4me.call(this, fileBuffer, documentFileName);

		// Use blobId in documentDataFile
		documentDataFile = `${documentBlobId}`;
	} else if (documentInputDataType === 'base64') {
		documentDataFile = this.getNodeParameter('documentBase64Content', index) as string;

		// Handle data URLs (remove data: prefix if present)
		if (documentDataFile.includes(',')) {
			documentDataFile = documentDataFile.split(',')[1];
		}

		documentBlobId = '';
	} else if (documentInputDataType === 'url') {
		const documentDataFileUrl = this.getNodeParameter('documentDataFileUrl', index) as string;

		// Validate URL format
		try {
			new URL(documentDataFileUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the document data file.');
		}

		// Send URL as string directly in documentDataFile - no download or conversion
		documentBlobId = '';
		documentDataFile = String(documentDataFileUrl);
	} else {
		throw new Error(`Unsupported document input type: ${documentInputDataType}`);
	}

	// Validate document data content based on input type
	if (documentInputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!documentDataFile || typeof documentDataFile !== 'string' || documentDataFile.trim() === '') {
			throw new Error('Document data file URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (documentInputDataType === 'base64') {
		// For base64, validate content is not empty
		if (!documentDataFile || documentDataFile.trim() === '') {
			throw new Error('Document data file content is required');
		}
	} else if (documentInputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!documentDataFile || documentDataFile.trim() === '') {
			throw new Error('Document data file content is required');
		}
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


	// templateFileData can be: blobId (for binary), base64 string (for base64/htmlCode), or URL string (for url)
	// documentDataFile can be: blobId (for binary), base64 string (for base64), or URL string (for url)
	const payload = {
		templateFileType,
		templateFileName,
		templateFileData, // Binary data uses blobId format, base64/htmlCode uses base64 string, URL uses URL string
		documentDataType,
		outputType,
		documentDataFile: documentDataFile || undefined, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
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
