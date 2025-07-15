import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';
import { readFileSync } from 'fs';

// Make Buffer available (it's a Node.js global)
declare const Buffer: any;

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
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide a local file path to the VISIO file',
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
				inputDataType: ['base64', 'filePath', 'url'],
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
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		default: '',
		required: true,
		description: 'Local file path to the VISIO file to convert',
		placeholder: '/path/to/diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertVisio],
				inputDataType: ['filePath'],
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
		displayName: 'Conversion Options',
		name: 'conversionOptions',
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
				displayName: 'Page Index',
				name: 'pageIndex',
				type: 'number',
				default: 0,
				description: 'Starting page index for conversion (0-based)',
			},
			{
				displayName: 'Page Count',
				name: 'pageCount',
				type: 'number',
				default: 0,
				description: 'Number of pages to convert (0 = all pages)',
			},
			{
				displayName: 'Include Hidden Pages',
				name: 'includeHiddenPages',
				type: 'boolean',
				default: true,
				description: 'Whether to include hidden pages in the conversion',
			},
			{
				displayName: 'Save Foreground Page',
				name: 'saveForegroundPage',
				type: 'boolean',
				default: true,
				description: 'Whether to save the foreground page',
			},
			{
				displayName: 'Is PDF Compliant',
				name: 'isPdfCompliant',
				type: 'boolean',
				default: true,
				description: 'Whether to ensure PDF compliance',
			},
			{
				displayName: 'Auto Fit',
				name: 'autoFit',
				type: 'boolean',
				default: true,
				description: 'Whether to auto-fit the content',
			},
			{
				displayName: 'Save Toolbar',
				name: 'saveToolBar',
				type: 'boolean',
				default: false,
				description: 'Whether to save the toolbar',
			},
			{
				displayName: 'JPEG Quality',
				name: 'jpegQuality',
				type: 'number',
				default: 90,
				description: 'JPEG quality setting (1-100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'number',
				default: 96,
				description: 'Resolution setting in DPI',
				typeOptions: {
					minValue: 1,
					maxValue: 600,
				},
			},
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'number',
				default: 1.0,
				description: 'Scale factor for the conversion',
				typeOptions: {
					minValue: 0.1,
					maxValue: 10.0,
					numberStepSize: 0.1,
				},
			},
			{
				displayName: 'Image Brightness',
				name: 'imageBrightness',
				type: 'number',
				default: 0,
				description: 'Image brightness adjustment (-100 to 100)',
				typeOptions: {
					minValue: -100,
					maxValue: 100,
				},
			},
			{
				displayName: 'Image Contrast',
				name: 'imageContrast',
				type: 'number',
				default: 0,
				description: 'Image contrast adjustment (-100 to 100)',
				typeOptions: {
					minValue: -100,
					maxValue: 100,
				},
			},
			{
				displayName: 'Default Font',
				name: 'defaultFont',
				type: 'string',
				default: 'Arial',
				description: 'Default font to use for text elements',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'options',
				default: 'A4',
				description: 'Page size for the output PDF',
				options: [
					{ name: 'A4', value: 'A4' },
					{ name: 'Letter', value: 'Letter' },
					{ name: 'Legal', value: 'Legal' },
					{ name: 'A3', value: 'A3' },
					{ name: 'A5', value: 'A5' },
					{ name: 'Custom', value: 'Custom' },
				],
			},
			{
				displayName: 'Image Color Mode',
				name: 'imageColorMode',
				type: 'options',
				default: 'Color',
				description: 'Color mode for images',
				options: [
					{ name: 'Color', value: 'Color' },
					{ name: 'Grayscale', value: 'Grayscale' },
					{ name: 'Black and White', value: 'BlackAndWhite' },
				],
			},
			{
				displayName: 'Compositing Quality',
				name: 'compositingQuality',
				type: 'options',
				default: 'HighQuality',
				description: 'Compositing quality setting',
				options: [
					{ name: 'High Quality', value: 'HighQuality' },
					{ name: 'High Speed', value: 'HighSpeed' },
					{ name: 'Default', value: 'Default' },
				],
			},
			{
				displayName: 'Interpolation Mode',
				name: 'interpolationMode',
				type: 'options',
				default: 'HighQualityBicubic',
				description: 'Interpolation mode for image scaling',
				options: [
					{ name: 'High Quality Bicubic', value: 'HighQualityBicubic' },
					{ name: 'Bicubic', value: 'Bicubic' },
					{ name: 'Bilinear', value: 'Bilinear' },
					{ name: 'Nearest Neighbor', value: 'NearestNeighbor' },
				],
			},
			{
				displayName: 'Pixel Offset Mode',
				name: 'pixelOffsetMode',
				type: 'options',
				default: 'HighQuality',
				description: 'Pixel offset mode',
				options: [
					{ name: 'High Quality', value: 'HighQuality' },
					{ name: 'High Speed', value: 'HighSpeed' },
					{ name: 'Default', value: 'Default' },
				],
			},
			{
				displayName: 'Smoothing Mode',
				name: 'smoothingMode',
				type: 'options',
				default: 'HighQuality',
				description: 'Smoothing mode for graphics',
				options: [
					{ name: 'High Quality', value: 'HighQuality' },
					{ name: 'High Speed', value: 'HighSpeed' },
					{ name: 'Default', value: 'Default' },
				],
			},
			{
				displayName: 'TIFF Compression',
				name: 'tiffCompression',
				type: 'options',
				default: 'LZW',
				description: 'TIFF compression method',
				options: [
					{ name: 'LZW', value: 'LZW' },
					{ name: 'CCITT3', value: 'CCITT3' },
					{ name: 'CCITT4', value: 'CCITT4' },
					{ name: 'RLE', value: 'RLE' },
					{ name: 'None', value: 'None' },
				],
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
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const conversionOptions = this.getNodeParameter('conversionOptions', index) as IDataObject;
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
			const response = await this.helpers.request({
				method: 'GET',
				url: fileUrl,
				encoding: null,
			});
			docContent = Buffer.from(response).toString('base64');
		} catch (error) {
			throw new Error(`Failed to download file from URL: ${fileUrl}. Error: ${error}`);
		}
	} else if (inputDataType === 'filePath') {
		// Local file path input
		const filePath = this.getNodeParameter('filePath', index) as string;
		docName = this.getNodeParameter('inputFileNameRequired', index) as string;

		if (!docName) {
			throw new Error('Input file name is required for file path input type.');
		}

		// Read the local file and convert to base64
		try {
			const fileBuffer = readFileSync(filePath);
			docContent = fileBuffer.toString('base64');
		} catch (error) {
			throw new Error(`Failed to read local file: ${filePath}. Error: ${error}`);
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Build the request body based on the C# code structure
	const body: IDataObject = {
		docContent,
		docName: docName,
		OutputFormat: 'string',
		PageIndex: conversionOptions.pageIndex || 0,
		PageCount: conversionOptions.pageCount || 0,
		DefaultFont: conversionOptions.defaultFont || 'Arial',
		IncludeHiddenPages: conversionOptions.includeHiddenPages !== false, // Default to true
		PageSize: conversionOptions.pageSize || 'A4',
		JpegQuality: conversionOptions.jpegQuality || 90,
		SaveForegroundPage: conversionOptions.saveForegroundPage !== false, // Default to true
		IsPdfCompliant: conversionOptions.isPdfCompliant !== false, // Default to true
		ImageBrightness: conversionOptions.imageBrightness || 0,
		ImageContrast: conversionOptions.imageContrast || 0,
		ImageColorMode: conversionOptions.imageColorMode || 'Color',
		CompositingQuality: conversionOptions.compositingQuality || 'HighQuality',
		InterpolationMode: conversionOptions.interpolationMode || 'HighQualityBicubic',
		PixelOffsetMode: conversionOptions.pixelOffsetMode || 'HighQuality',
		Resolution: conversionOptions.resolution || 96,
		Scale: conversionOptions.scale || 1.0,
		SmoothingMode: conversionOptions.smoothingMode || 'HighQuality',
		TiffCompression: conversionOptions.tiffCompression || 'LZW',
		SaveToolBar: conversionOptions.saveToolBar || false,
		AutoFit: conversionOptions.autoFit !== false, // Default to true
		async: true, // For big files and too many calls async is recommended to reduce server load
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
		// Validate that we received valid PDF data
		if (!Buffer.isBuffer(responseData)) {
			throw new Error('Invalid response format: Expected Buffer but received ' + typeof responseData);
		}

		// Check if the response looks like a PDF (should start with %PDF)
		const responseString = responseData.toString('utf8', 0, 10);
		if (!responseString.startsWith('%PDF')) {
			// If it doesn't look like a PDF, it might be an error message or base64 encoded
			const errorText = responseData.toString('utf8', 0, 200);
			if (errorText.includes('error') || errorText.includes('Error')) {
				throw new Error(`API returned error: ${errorText}`);
			}
			// Try to decode as base64 if it doesn't look like a PDF
			try {
				const decodedBuffer = Buffer.from(responseData.toString('utf8'), 'base64');
				const decodedString = decodedBuffer.toString('utf8', 0, 10);
				if (decodedString.startsWith('%PDF')) {
					// It was base64 encoded, use the decoded version
					responseData = decodedBuffer;
				} else {
					throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
				}
			} catch (decodeError) {
				throw new Error(`API returned invalid PDF data. Response starts with: ${errorText}`);
			}
		}

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
						pageIndex: body.PageIndex,
						pageCount: body.PageCount,
						includeHiddenPages: body.IncludeHiddenPages,
						saveForegroundPage: body.SaveForegroundPage,
						isPdfCompliant: body.IsPdfCompliant,
						autoFit: body.AutoFit,
						jpegQuality: body.JpegQuality,
						resolution: body.Resolution,
						scale: body.Scale,
					},
				},
				binary: {
					data: binaryData,
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}