import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Extract Feature',
		name: 'extractFeature',
		type: 'options',
		default: 'classifyDocument',
		description: 'Select the extract feature to use',
		options: [
			{ name: 'Classify Document', value: 'classifyDocument' },
			{ name: 'Extract Attachments', value: 'extractAttachmentFromPdf' },
			{ name: 'Extract Form Data', value: 'extractFormDataFromPdf' },
			{ name: 'Extract Resources', value: 'extractResources' },
			{ name: 'Extract Table From PDF', value: 'extractTableFromPdf' },
			{ name: 'Extract Text by Expression', value: 'extractTextByExpression' },
			{ name: 'Extract Text From Word', value: 'extractTextFromWord' },
			{ name: 'Parse Document', value: 'parseDocument' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
			},
		},
	},
	// Common PDF input fields
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input PDF',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
			},
		},
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				inputType: ['localPath'],
			},
		},
	},
	// Extract Text by Expression fields
	{
		displayName: 'Expression (Regex)',
		name: 'expression',
		type: 'string',
		default: '',
		required: true,
		description: 'Regular expression pattern to search for',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextByExpression'],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: '',
		description: 'Page range to process (e.g., "1-3", "1,2,3", "1-")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextByExpression'],
			},
		},
	},

	// Extract Text from Word fields
	{
		displayName: 'Start Page Number',
		name: 'startPageNumber',
		type: 'number',
		default: 1,
		description: 'Starting page number',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextFromWord'],
			},
		},
	},
	{
		displayName: 'End Page Number',
		name: 'endPageNumber',
		type: 'number',
		default: 1,
		description: 'Ending page number',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextFromWord'],
			},
		},
	},
	{
		displayName: 'Remove Comments',
		name: 'removeComments',
		type: 'boolean',
		default: true,
		description: 'Whether to remove comments from the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextFromWord'],
			},
		},
	},
	{
		displayName: 'Remove Header/Footer',
		name: 'removeHeaderFooter',
		type: 'boolean',
		default: true,
		description: 'Whether to remove header and footer from the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextFromWord'],
			},
		},
	},
	{
		displayName: 'Accept Changes',
		name: 'acceptChanges',
		type: 'boolean',
		default: true,
		description: 'Whether to accept tracked changes in the Word document',
		displayOptions: {
			show: {
				operation: [ActionConstants.Extract],
				extractFeature: ['extractTextFromWord'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const operation = this.getNodeParameter('operation', index) as string;
	const feature = this.getNodeParameter('extractFeature', index) as string;

	if (operation !== ActionConstants.Extract) {
		throw new Error('This action only supports the Extract operation.');
	}

	// Common PDF input handling
	const inputType = this.getNodeParameter('inputType', index) as string;
	let pdfContent: string;
	let pdfName: string;
	if (inputType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);
		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error('No binary data found in the input.');
		}
		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		pdfContent = buffer.toString('base64');
		const binaryData = item[0].binary[binaryPropertyName];
		pdfName = inputFileName || binaryData.fileName || 'document.pdf';
	} else if (inputType === 'base64') {
		pdfContent = this.getNodeParameter('base64Content', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
	} else if (inputType === 'url') {
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
		pdfContent = Buffer.from(response).toString('base64');
	} else if (inputType === 'localPath') {
		const localFilePath = this.getNodeParameter('localFilePath', index) as string;
		pdfName = this.getNodeParameter('inputFileName', index) as string;
		const fileBuffer = readFileSync(localFilePath);
		pdfContent = fileBuffer.toString('base64');
	} else {
		throw new Error(`Unsupported input type: ${inputType}`);
	}

	if (feature === 'classifyDocument') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ClassifyDocument', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractAttachmentFromPdf') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractAttachmentFromPdf', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractFormDataFromPdf') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractPdfFormData', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractResources') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			extractText: true,
			extractImage: true,
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractResources', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractTableFromPdf') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractTableFromPdf', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractTextByExpression') {
		const expression = this.getNodeParameter('expression', index) as string;
		const pageSequence = this.getNodeParameter('pageSequence', index, '') as string;
		const payload: any = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			expression,
			async: true,
		};
		if (pageSequence) payload.pageSequence = pageSequence;
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractTextByExpression', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'extractTextFromWord') {
		// For this feature, the input is a Word file, not PDF
		// Use the same inputType logic, but the file should be .docx or .doc
		let wordContent: string;
		let wordName: string;
		if (inputType === 'binaryData') {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const inputFileName = this.getNodeParameter('inputFileName', index) as string;
			const item = this.getInputData(index);
			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error('No binary data found in the input.');
			}
			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			wordContent = buffer.toString('base64');
			const binaryData = item[0].binary[binaryPropertyName];
			wordName = inputFileName || binaryData.fileName || 'document.docx';
		} else if (inputType === 'base64') {
			wordContent = this.getNodeParameter('base64Content', index) as string;
			wordName = this.getNodeParameter('inputFileName', index) as string;
		} else if (inputType === 'url') {
			const fileUrl = this.getNodeParameter('fileUrl', index) as string;
			wordName = this.getNodeParameter('inputFileName', index) as string;
			const response = await this.helpers.request({ method: 'GET', url: fileUrl, encoding: null });
			wordContent = Buffer.from(response).toString('base64');
		} else if (inputType === 'localPath') {
			const localFilePath = this.getNodeParameter('localFilePath', index) as string;
			wordName = this.getNodeParameter('inputFileName', index) as string;
			const fileBuffer = readFileSync(localFilePath);
			wordContent = fileBuffer.toString('base64');
		} else {
			throw new Error(`Unsupported input type: ${inputType}`);
		}
		const startPageNumber = this.getNodeParameter('startPageNumber', index) as number;
		const endPageNumber = this.getNodeParameter('endPageNumber', index) as number;
		const removeComments = this.getNodeParameter('removeComments', index) as boolean;
		const removeHeaderFooter = this.getNodeParameter('removeHeaderFooter', index) as boolean;
		const acceptChanges = this.getNodeParameter('acceptChanges', index) as boolean;
		const payload = {
			docContent: wordContent,
			docName: wordName || 'output',
			StartPageNumber: startPageNumber,
			EndPageNumber: endPageNumber,
			RemoveComments: removeComments,
			RemoveHeaderFooter: removeHeaderFooter,
			AcceptChanges: acceptChanges,
			async: false,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ExtractTextFromWord', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: wordName || 'output',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	if (feature === 'parseDocument') {
		const payload = {
			docContent: pdfContent,
			docName: pdfName || 'output.pdf',
			async: true,
		};
		const response = await pdf4meAsyncRequest.call(this, '/api/v2/ParseDocument', payload);
		let jsonData: any;
		try {
			jsonData = JSON.parse(response.toString('utf8'));
		} catch {
			jsonData = response.toString('utf8');
		}
		return [
			{
				json: {
					fileName: pdfName || 'output.pdf',
					data: jsonData,
					success: true,
				},
			},
		];
	}

	throw new Error(`Unknown extract feature: ${feature}`);
}
