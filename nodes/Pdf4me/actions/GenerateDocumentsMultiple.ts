import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Template File Input Type',
		name: 'templateInputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the template file',
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
				templateInputDataType: ['binaryData'],
			},
		},
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
		description: 'Select the Template file type',
		options: [
			{ name: 'Word', value: 'Docx' },
			{ name: 'HTML', value: 'HTML' },
			{ name: 'PDF', value: 'PDF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
			},
		},
	},
	{
		displayName: 'Document Data Type',
		name: 'documentDataType',
		type: 'options',
		default: 'Json',
		required: true,
		description: 'The data type for the template',
		options: [
			{ name: 'JSON', value: 'Json' },
			{ name: 'XML', value: 'XML' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentsMultiple],
			},
		},
	},
	{
		displayName: 'Document Data Text',
		name: 'documentDataText',
		type: 'string',
		default: '',
		required: true,
		description: 'Manual data entry for the template in JSON or XML format (required if documentDataFile is not provided)',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
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
				operation: [ActionConstants.GenerateDocumentsMultiple],
				documentInputDataType: ['url'],
			},
		},
	},

	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: '',
		description: 'Name for the output file(s). If multiple documents are generated, this will be used as a prefix with numbers appended (e.g., "document" becomes "document1.pdf", "document2.pdf", etc.)',
		placeholder: 'generated_document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentsMultiple],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'generated-documents',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentsMultiple],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const templateInputDataType = this.getNodeParameter('templateInputDataType', index) as string;
	const templateFileType = this.getNodeParameter('templateFileType', index) as string;
	const documentInputDataType = this.getNodeParameter('documentInputDataType', index) as string;
	const documentDataType = this.getNodeParameter('documentDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
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

	const payload = {
		templateFileType,
		templateFileName,
		templateFileData,
		documentDataType,
		outputType,
		documentDataFile,
		documentDataText,
		IsAsync: true,
	};

	const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/GenerateDocumentMultiple', payload);

	if (responseData) {
		// Handle different response formats
		let outputDocuments: any[] = [];

		// First, try to parse as JSON (for multiple documents response)
		if (Buffer.isBuffer(responseData)) {
			try {
				const jsonString = responseData.toString('utf8');
				const parsedJson = JSON.parse(jsonString);

				// Check if it's a JSON response with outputDocuments
				if (parsedJson.outputDocuments && Array.isArray(parsedJson.outputDocuments)) {
					outputDocuments = parsedJson.outputDocuments;
				} else if (Array.isArray(parsedJson)) {
					// Direct array response
					outputDocuments = parsedJson;
				} else {
					// Single document in JSON format
					outputDocuments = [parsedJson];
				}
			} catch (parseError) {
				// If JSON parsing fails, treat as single binary document
				if (responseData.length < 100) {
					throw new Error(`Response too small (${responseData.length} bytes). This might indicate an error response.`);
				}

				// Create single document from binary data
				const fileName = outputFileName ?
					`${outputFileName}.${outputType.toLowerCase()}` :
					`generated_document.${outputType.toLowerCase()}`;
				const binaryData = await this.helpers.prepareBinaryData(
					responseData,
					fileName,
					outputType === 'PDF' ? 'application/pdf' :
						outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
							outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
								'text/html',
				);

				return [
					{
						json: {
							fileName,
							mimeType: outputType === 'PDF' ? 'application/pdf' :
								outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
									outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
										'text/html',
							fileSize: responseData.length,
							success: true,
							documentIndex: 1,
							totalDocuments: 1,
						},
						binary: {
							data: binaryData,
						},
					},
				];
			}
		} else if (typeof responseData === 'string') {
			// String response - try to parse as JSON
			try {
				const parsedJson = JSON.parse(responseData);
				if (parsedJson.outputDocuments && Array.isArray(parsedJson.outputDocuments)) {
					outputDocuments = parsedJson.outputDocuments;
				} else if (Array.isArray(parsedJson)) {
					outputDocuments = parsedJson;
				} else {
					outputDocuments = [parsedJson];
				}
			} catch (parseError) {
				throw new Error('Response is not valid JSON and not binary data');
			}
		} else if (typeof responseData === 'object') {
			// Object response
			if (responseData.outputDocuments && Array.isArray(responseData.outputDocuments)) {
				outputDocuments = responseData.outputDocuments;
			} else if (Array.isArray(responseData)) {
				outputDocuments = responseData;
			} else {
				outputDocuments = [responseData];
			}
		} else {
			throw new Error('Unexpected response format');
		}

		// Process the output documents
		if (outputDocuments.length === 0) {
			throw new Error('No documents found in response');
		}


		// Return each document as a separate item
		const returnData = [];

		for (let i = 0; i < outputDocuments.length; i++) {
			const doc = outputDocuments[i];

			// Extract document content and filename
			let documentContent: Buffer;
			let fileName: string;

			// Handle different possible field names for content
			const contentField = doc.streamFile || doc.fileContent || doc.content || doc.data;
			if (!contentField) {
				continue;
			}

			// Handle different possible field names for filename
			if (outputFileName) {
				// Use custom output filename with number suffix for multiple documents
				fileName = outputDocuments.length > 1 ? `${outputFileName}_${i + 1}` : outputFileName;
			} else if (doc.fileName || doc.docName || doc.name) {
				fileName = doc.fileName || doc.docName || doc.name;
			} else {
				fileName = outputDocuments.length > 1 ? `generated_document_${i + 1}` : 'generated_document';
			}

			// Ensure proper file extension
			if (!fileName.toLowerCase().endsWith(`.${outputType.toLowerCase()}`)) {
				fileName = `${fileName.replace(/\.[^.]*$/, '')}.${outputType.toLowerCase()}`;
			}

			// Convert content to Buffer
			if (typeof contentField === 'string') {
				// Assume it's base64 encoded
				try {
					documentContent = Buffer.from(contentField, 'base64');
				} catch (error) {
					continue;
				}
			} else if (Buffer.isBuffer(contentField)) {
				documentContent = contentField;
			} else {
				continue;
			}

			// Validate document content
			if (documentContent.length < 100) {
				continue;
			}

			try {
				const binaryData = await this.helpers.prepareBinaryData(
					documentContent,
					fileName,
					outputType === 'PDF' ? 'application/pdf' :
						outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
							outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
								'text/html',
				);

				returnData.push({
					json: {
						fileName,
						mimeType: outputType === 'PDF' ? 'application/pdf' :
							outputType === 'Docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
								outputType === 'Excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
									'text/html',
						fileSize: documentContent.length,
						success: true,
						documentIndex: i + 1,
						totalDocuments: outputDocuments.length,
					},
					binary: {
						[binaryDataName || 'data']: binaryData,
					},
				});
			} catch (error) {
				continue;
			}
		}

		if (returnData.length === 0) {
			throw new Error('No valid documents could be processed from the response');
		}

		return returnData;
	}

	throw new Error('No response data received from PDF4ME API');
}