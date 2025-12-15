import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ActionConstants, pdf4meAsyncRequest, uploadBlobToPdf4me } from '../GenericFunctions';

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
		hint: 'Generate documents using a template file. See our <b><a href="https://docs.pdf4me.com/n8n/generate/generate-documents-multiple/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
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
		// Returns blobId which is then used in GenerateDocumentMultiple API payload
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
		// Returns blobId which is then used in GenerateDocumentMultiple API payload
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

	// templateFileData can be: blobId (for binary), base64 string (for base64/htmlCode), or URL string (for url)
	// documentDataFile can be: blobId (for binary), base64 string (for base64), or URL string (for url)
	const payload = {
		templateFileType,
		templateFileName,
		templateFileData, // Binary data uses blobId format, base64/htmlCode uses base64 string, URL uses URL string
		documentDataType,
		outputType,
		documentDataFile, // Binary data uses blobId format, base64 uses base64 string, URL uses URL string
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
