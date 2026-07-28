/**
 * Generate Document From Template Action
 *
 * Generates a document using a dashboard-stored template and JSON/XML/CSV data.
 * API Endpoint: POST /api/v2/GenerateDocumentSingleV2
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	ActionConstants,
	pdf4meGenerateDocumentV2Request,
	uploadBlobToPdf4me,
} from '../GenericFunctions';
import {
	documentDataFileNameFields,
	documentDataFileUrlFields,
	documentDataTextFields,
} from '../pdf4mePlaceholders';

const API_ENDPOINT = '/api/v2/GenerateDocumentSingleV2';
const generateDocumentFromTemplateOp = ActionConstants.GenerateDocumentFromTemplate;

function inferMimeType(fileName: string): string {
	const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
	switch (ext) {
	case 'pdf':
		return 'application/pdf';
	case 'docx':
		return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
	case 'doc':
		return 'application/msword';
	case 'xlsx':
		return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
	case 'html':
	case 'htm':
		return 'text/html';
	case 'xml':
		return 'application/xml';
	case 'csv':
		return 'text/csv';
	case 'json':
		return 'application/json';
	default:
		return 'application/octet-stream';
	}
}

function stringifyJsonField(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}
	return String(value).trim();
}

export const description: INodeProperties[] = [
	{
		displayName: 'Template Name or ID',
		name: 'templateName',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTemplateNames',
		},
		required: true,
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
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
				description: 'Manually enter JSON, XML, or CSV data',
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
				operation: [ActionConstants.GenerateDocumentFromTemplate],
			},
		},
	},
	{
		displayName: 'Document Data Type',
		name: 'documentDataType',
		type: 'options',
		required: true,
		default: 'Json',
		description: 'The data type for the template. Choose JSON, XML, or CSV format.',
		options: [
			{ name: 'JSON', value: 'Json' },
			{ name: 'XML', value: 'XML' },
			{ name: 'CSV', value: 'Csv' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
			},
		},
	},
	...documentDataTextFields(generateDocumentFromTemplateOp, ['Json', 'XML', 'Csv'], {
		description:
			'Manual data entry for the template in JSON, XML, or CSV format (required if Document Data File is not provided)',
	}),
	{
		displayName: 'Document Binary Property',
		name: 'documentBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the data file',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
				documentInputDataType: ['binaryData'],
			},
		},
	},
	...documentDataFileNameFields(generateDocumentFromTemplateOp, 'documentDataFileName', ['binaryData'], [
		'Json',
		'XML',
		'Csv',
	]),
	{
		displayName: 'Document Base64 Content',
		name: 'documentBase64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded data file content',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
				documentInputDataType: ['base64'],
			},
		},
	},
	...documentDataFileNameFields(
		generateDocumentFromTemplateOp,
		'documentDataFileNameRequired',
		['base64', 'url'],
		['Json', 'XML', 'Csv'],
		true,
	),
	...documentDataFileUrlFields(generateDocumentFromTemplateOp, ['Json', 'XML', 'Csv']),
	{
		displayName: 'Meta Data JSON',
		name: 'metaDataJson',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		default: '',
		description: 'Optional metadata for fields (title, author, subject, custom fields)',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
			},
		},
	},
	{
		displayName: 'Keep PDF Editable',
		name: 'keepPdfEditable',
		type: 'boolean',
		default: false,
		description: 'Whether to keep the generated PDF form fields editable',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
			},
		},
	},
	{
		displayName: 'Output Binary Property',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property to store the generated document',
		displayOptions: {
			show: {
				operation: [ActionConstants.GenerateDocumentFromTemplate],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const templateName = this.getNodeParameter('templateName', index) as string;
	const documentInputDataType = this.getNodeParameter('documentInputDataType', index) as string;
	const documentDataType = this.getNodeParameter('documentDataType', index) as string;
	const metaDataJsonRaw = this.getNodeParameter('metaDataJson', index);
	const keepPdfEditable = this.getNodeParameter('keepPdfEditable', index, false) as boolean;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let documentDataFile = '';
	let documentDataText = '';

	if (documentInputDataType === 'text') {
		documentDataText = stringifyJsonField(this.getNodeParameter('documentDataText', index));
	} else if (documentInputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('documentBinaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new NodeOperationError(
				this.getNode(),
				`No binary data found in property '${binaryPropertyName}'`,
			);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		const inputFileName = this.getNodeParameter('documentDataFileName', index) as string;
		const documentFileName = inputFileName || binaryData.fileName || 'data.json';
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		const documentBlobId = await uploadBlobToPdf4me.call(this, fileBuffer, documentFileName);

		documentDataFile = `${documentBlobId}`;
	} else if (documentInputDataType === 'base64') {
		documentDataFile = this.getNodeParameter('documentBase64Content', index) as string;

		if (documentDataFile.includes(',')) {
			documentDataFile = documentDataFile.split(',')[1];
		}
	} else if (documentInputDataType === 'url') {
		const documentDataFileUrl = this.getNodeParameter('documentDataFileUrl', index) as string;

		try {
			new URL(documentDataFileUrl);
		} catch {
			throw new NodeOperationError(
				this.getNode(),
				'Invalid URL format. Please provide a valid URL to the document data file.',
			);
		}

		documentDataFile = String(documentDataFileUrl);
	} else {
		throw new NodeOperationError(this.getNode(), `Unsupported document input type: ${documentInputDataType}`);
	}

	if (documentInputDataType === 'url') {
		if (!documentDataFile || typeof documentDataFile !== 'string' || documentDataFile.trim() === '') {
			throw new NodeOperationError(
				this.getNode(),
				'Document data file URL is required and must be a non-empty string',
			);
		}
	} else if (documentInputDataType === 'base64') {
		if (!documentDataFile || documentDataFile.trim() === '') {
			throw new NodeOperationError(this.getNode(), 'Document data file content is required');
		}
	} else if (documentInputDataType === 'binaryData') {
		if (!documentDataFile || documentDataFile.trim() === '') {
			throw new NodeOperationError(this.getNode(), 'Document data file content is required');
		}
	}

	if (!documentDataFile && !documentDataText) {
		throw new NodeOperationError(this.getNode(), 'Either Document Data File or Document Data Text must be provided');
	}

	if (documentDataText && documentInputDataType === 'text') {
		if (documentDataType === 'Json') {
			try {
				JSON.parse(documentDataText);
			} catch (error) {
				throw new NodeOperationError(
					this.getNode(),
					`Invalid JSON format in Document Data Text: ${(error as Error).message}`,
				);
			}
		} else if (documentDataType === 'XML') {
			if (!documentDataText.trim().startsWith('<') || !documentDataText.trim().includes('>')) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid XML format in Document Data Text: XML must start with < and contain proper tags',
				);
			}
		} else if (documentDataType === 'Csv') {
			if (!documentDataText.trim()) {
				throw new NodeOperationError(
					this.getNode(),
					'Document Data Text cannot be empty when Document Data Type is CSV',
				);
			}
		}
	}

	const metaDataJson = stringifyJsonField(metaDataJsonRaw);
	if (metaDataJson) {
		try {
			JSON.parse(metaDataJson);
		} catch (error) {
			throw new NodeOperationError(
				this.getNode(),
				`Invalid JSON format in Meta Data JSON: ${(error as Error).message}`,
			);
		}
	}

	const payload: IDataObject = {
		TemplateFileName: templateName,
		DocumentDataType: documentDataType,
		DocumentDataText: documentDataText || '',
		DocumentDataFile: documentDataFile || '',
		MetaDataJson: metaDataJson || '',
		KeepPdfEditable: keepPdfEditable,
		IsAsync: true,
	};

	const document = await pdf4meGenerateDocumentV2Request.call(this, API_ENDPOINT, payload);

	let documentContent: Buffer;
	try {
		documentContent = Buffer.from(document.docData, 'base64');
	} catch {
		throw new NodeOperationError(this.getNode(), 'Failed to decode document data from API response');
	}

	if (documentContent.length === 0) {
		throw new NodeOperationError(this.getNode(), 'Generated document is empty');
	}

	const fileName = document.name;
	const mimeType = inferMimeType(fileName);
	const binaryData = await this.helpers.prepareBinaryData(documentContent, fileName, mimeType);

	return [
		{
			json: {
				fileName,
				mimeType,
				fileSize: documentContent.length,
				success: true,
			},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
			pairedItem: { item: index },
		},
	];
}
