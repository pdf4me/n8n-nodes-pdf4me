import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer available (it's a Node.js global)

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'How to provide the input VISIO file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use binary data from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide base64 encoded VISIO content',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide a URL to the VISIO file to convert',
			},
		],
	},
	{
		displayName: 'Binary Property',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		description: 'Name of the binary property containing the VISIO file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		description: 'Name of the input VISIO file (including extension). If not provided, will use the filename from binary data.',
		placeholder: 'diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Content',
		name: 'base64Content',
		type: 'string',
		default: '',
		required: true,
		description: 'Base64 encoded content of the VISIO file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileNameRequired',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the input VISIO file (including extension)',
		placeholder: 'diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['base64', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		required: true,
		description: 'URL of the VISIO file to convert to PDF',
		placeholder: 'https://example.com/diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'converted_diagram.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		default: 'PDF',
		required: true,
		description: 'Desired output format',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
		options: [
			{ name: 'PDF', value: 'PDF' },
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
			{ name: 'TIFF', value: 'TIFF' },
		],
	},
	{
		displayName: 'Is PDF Compliant',
		name: 'isPdfCompliant',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Make PDF compliant with standards',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Page Index',
		name: 'pageIndex',
		type: 'number',
		default: 0,
		required: true,
		description: 'Start from first page (0-indexed)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Page Count',
		name: 'pageCount',
		type: 'number',
		default: 5,
		required: true,
		description: 'Number of pages to convert (1-100)',
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Include Hidden Pages',
		name: 'includeHiddenPages',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Include hidden pages (True/False)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Save Foreground Page',
		name: 'saveForegroundPage',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Save foreground elements (True/False)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Save Tool Bar',
		name: 'saveToolBar',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Include toolbar (True/False)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Auto Fit',
		name: 'autoFit',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Auto-fit content to page (True/False)',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
	{
		displayName: 'Async',
		name: 'async',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Enable asynchronous processing',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
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
				operation: [ActionConstants.ConvertVisio],
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
		placeholder: 'converted-visio',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const isPdfCompliant = this.getNodeParameter('isPdfCompliant', index) as boolean;
	const pageIndex = this.getNodeParameter('pageIndex', index) as number;
	const pageCount = this.getNodeParameter('pageCount', index) as number;
	const includeHiddenPages = this.getNodeParameter('includeHiddenPages', index) as boolean;
	const saveForegroundPage = this.getNodeParameter('saveForegroundPage', index) as boolean;
	const saveToolBar = this.getNodeParameter('saveToolBar', index) as boolean;
	const autoFit = this.getNodeParameter('autoFit', index) as boolean;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let docName: string;

	// Handle different input types
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const inputFileName = this.getNodeParameter('inputFileName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary) {
			throw new Error('No binary data found in the input. Please ensure the previous node provides binary data.');
		}

		if (!item[0].binary[binaryPropertyName]) {
			const availableProperties = Object.keys(item[0].binary).join(', ');
			throw new Error(
				`Binary property '${binaryPropertyName}' not found. Available properties: ${availableProperties || 'none'}. ` +
				'Common property names are "data" for file uploads or the filename without extension.',
			);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');

		// Use provided input filename or extract from binary data
		const binaryData = item[0].binary[binaryPropertyName];
		docName = inputFileName || binaryData.fileName || 'document';
	} else if (inputDataType === 'base64') {
		// Base64 input
		docContent = this.getNodeParameter('base64Content', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for base64 input type.');
		}
	} else if (inputDataType === 'url') {
		// URL input
		const fileUrl = this.getNodeParameter('fileUrl', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for URL input type.');
		}

		// Download the file from URL and convert to base64
		try {
			const options = {

				method: 'GET' as const,

				url: fileUrl,

				encoding: 'arraybuffer' as const,

			};

			const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', options);
			docContent = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download file from URL: ${fileUrl}. Error: ${error}`);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body based on the simplified API specification
	const body: IDataObject = {
		docContent,
		docName: 'output',
		OutputFormat: outputFormat,
		IsPdfCompliant: isPdfCompliant,
		PageIndex: pageIndex,
		PageCount: pageCount,
		IncludeHiddenPages: includeHiddenPages,
		SaveForegroundPage: saveForegroundPage,
		SaveToolBar: saveToolBar,
		AutoFit: autoFit,
		IsAsync: true,
	};

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
	}

	sanitizeProfiles(body);

	// Make the API request to convert VISIO to PDF
	let responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertVisio?schemaVal=PDF', body);

	// Handle the binary response (PDF data)
	if (responseData) {
		let pdfBuffer: Buffer;

		// Handle different response formats
		if (Buffer.isBuffer(responseData)) {
			pdfBuffer = responseData;
		} else if (typeof responseData === 'string') {
			// If it's a string, it might be base64 encoded
			try {
				pdfBuffer = Buffer.from(responseData, 'base64');
			} catch (error) {
				// If base64 decoding fails, treat as raw string
				pdfBuffer = Buffer.from(responseData, 'utf8');
			}
		} else {
			// Convert other types to string first, then to buffer
			pdfBuffer = Buffer.from(String(responseData), 'utf8');
		}

		// Check if the response looks like a PDF (should start with %PDF)
		const responseString = pdfBuffer.toString('utf8', 0, 10);
		if (!responseString.startsWith('%PDF')) {
			// If it doesn't look like a PDF, it might be an error message or base64 encoded
			const errorText = pdfBuffer.toString('utf8', 0, 200);
			
			// Check if it's an error message
			if (errorText.includes('error') || errorText.includes('Error') || errorText.includes('exception')) {
				throw new Error(`API returned error: ${errorText}`);
			}
			
			// Try to decode as base64 if it doesn't look like a PDF
			try {
				const decodedBuffer = Buffer.from(pdfBuffer.toString('utf8'), 'base64');
				const decodedString = decodedBuffer.toString('utf8', 0, 10);
				if (decodedString.startsWith('%PDF')) {
					// It was base64 encoded, use the decoded version
					pdfBuffer = decodedBuffer;
				} else {
					// If still not a PDF, check if it's a JSON error response
					try {
						const jsonResponse = JSON.parse(pdfBuffer.toString('utf8'));
						if (jsonResponse.error || jsonResponse.message) {
							throw new Error(`API returned error: ${jsonResponse.error || jsonResponse.message}`);
						}
					} catch (jsonError) {
						// Not JSON, so it's likely invalid data
						throw new Error(`API returned invalid PDF data. Response starts with: ${errorText.substring(0, 100)}...`);
					}
				}
			} catch (decodeError) {
				// If base64 decoding fails, check if it's a JSON error
				try {
					const jsonResponse = JSON.parse(pdfBuffer.toString('utf8'));
					if (jsonResponse.error || jsonResponse.message) {
						throw new Error(`API returned error: ${jsonResponse.error || jsonResponse.message}`);
					}
				} catch (jsonError) {
					throw new Error(`API returned invalid PDF data. Response starts with: ${errorText.substring(0, 100)}...`);
				}
			}
		}

		// Use the validated PDF buffer
		responseData = pdfBuffer;

		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName) {
			fileName = `converted_visio_${Date.now()}.pdf`;
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
					inputDataType,
					sourceFileName: docName,
					conversionOptions: {
						outputFormat: outputFormat,
						pageIndex: pageIndex,
						pageCount: pageCount,
						includeHiddenPages: includeHiddenPages,
						saveForegroundPage: saveForegroundPage,
						isPdfCompliant: isPdfCompliant,
						saveToolBar: saveToolBar,
						autoFit: autoFit,
					},
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