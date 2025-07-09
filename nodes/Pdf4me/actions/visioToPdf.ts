import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Buffer and setTimeout available (Node.js globals)
declare const Buffer: any;
declare const setTimeout: any;
declare const require: any;
declare const URL: any;
declare const console: any;
declare const fetch: any;

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the Visio file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use Visio file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide Visio content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to Visio file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to Visio file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the Visio file',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Visio Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded Visio file content (.vsdx, .vsd, .vsdm)',
		placeholder: 'UEsDBBQAAAAIAA...',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Visio URL',
		name: 'visioUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the Visio file to convert',
		placeholder: 'https://example.com/diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the Visio file to convert',
		placeholder: '/path/to/diagram.vsdx',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'visio_to_pdf_output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'my-visio-converted.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'output',
		description: 'Name for the output file',
		placeholder: 'output',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		default: 'PDF',
		description: 'Desired output format',
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
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
		displayName: 'PDF Options',
		name: 'pdfOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				outputFormat: ['PDF'],
			},
		},
		options: [
			{
				displayName: 'PDF Compliant',
				name: 'isPdfCompliant',
				type: 'boolean',
				default: true,
				description: 'Make PDF compliant with standards',
			},
		],
	},
	{
		displayName: 'Page Settings',
		name: 'pageSettings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
			},
		},
		options: [
			{
				displayName: 'Page Index',
				name: 'pageIndex',
				type: 'number',
				default: 0,
				description: 'Start from page (0-indexed)',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
			},
			{
				displayName: 'Page Count',
				name: 'pageCount',
				type: 'number',
				default: 5,
				description: 'Number of pages to convert (1-100)',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
			{
				displayName: 'Include Hidden Pages',
				name: 'includeHiddenPages',
				type: 'boolean',
				default: true,
				description: 'Include hidden pages',
			},
		],
	},
	{
		displayName: 'Display Options',
		name: 'displayOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
			},
		},
		options: [
			{
				displayName: 'Save Foreground Page',
				name: 'saveForegroundPage',
				type: 'boolean',
				default: true,
				description: 'Save foreground elements',
			},
			{
				displayName: 'Save Toolbar',
				name: 'saveToolBar',
				type: 'boolean',
				default: true,
				description: 'Include toolbar',
			},
			{
				displayName: 'Auto Fit',
				name: 'autoFit',
				type: 'boolean',
				default: true,
				description: 'Auto-fit content to page',
			},
		],
	},
	{
		displayName: 'Image Options',
		name: 'imageOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				outputFormat: ['JPG', 'PNG', 'TIFF'],
			},
		},
		options: [
			{
				displayName: 'JPEG Quality',
				name: 'jpegQuality',
				type: 'number',
				default: 80,
				description: 'Image quality (0-100, higher = better quality)',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				displayOptions: {
					show: {
						'/outputFormat': ['JPG'],
					},
				},
			},
			{
				displayName: 'Image Brightness',
				name: 'imageBrightness',
				type: 'number',
				default: 1.0,
				description: 'Brightness adjustment (1.0 = normal)',
				typeOptions: {
					minValue: 0.1,
					maxValue: 3.0,
					numberStepSize: 0.1,
				},
			},
			{
				displayName: 'Image Contrast',
				name: 'imageContrast',
				type: 'number',
				default: 1.0,
				description: 'Contrast adjustment (1.0 = normal)',
				typeOptions: {
					minValue: 0.1,
					maxValue: 3.0,
					numberStepSize: 0.1,
				},
			},
			{
				displayName: 'Image Color Mode',
				name: 'imageColorMode',
				type: 'options',
				default: 'RGB',
				description: 'Color mode for the image',
				options: [
					{ name: 'RGB', value: 'RGB' },
					{ name: 'Grayscale', value: 'Grayscale' },
					{ name: 'RGBA', value: 'RGBA' },
				],
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'number',
				default: 300,
				description: 'DPI resolution (300 = high quality)',
				typeOptions: {
					minValue: 72,
					maxValue: 600,
				},
			},
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'number',
				default: 1.0,
				description: 'Scaling factor (1.0 = original size)',
				typeOptions: {
					minValue: 0.1,
					maxValue: 5.0,
					numberStepSize: 0.1,
				},
			},
		],
	},
	{
		displayName: 'TIFF Options',
		name: 'tiffOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.VisioToPdf],
				outputFormat: ['TIFF'],
			},
		},
		options: [
			{
				displayName: 'TIFF Compression',
				name: 'tiffCompression',
				type: 'options',
				default: 'LZW',
				description: 'Compression method for TIFF',
				options: [
					{ name: 'LZW', value: 'LZW' },
					{ name: 'None', value: 'None' },
					{ name: 'CCITT4', value: 'CCITT4' },
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
				operation: [ActionConstants.VisioToPdf],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.',
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// Check if this is called from Convert to PDF or standalone
	const operation = this.getNodeParameter('operation', index) as string;
	
	let inputDataType: string;
	let outputFileName: string;
	let docName: string;
	let outputFormat: string;
	let pdfOptions: IDataObject;
	let pageSettings: IDataObject;
	let displayOptions: IDataObject;
	let imageOptions: IDataObject;
	let tiffOptions: IDataObject;
	let advancedOptions: IDataObject;
	
	if (operation === ActionConstants.ConvertToPdf) {
		// Use the parameters from the Convert to PDF action
		inputDataType = this.getNodeParameter('visioInputDataType', index) as string;
		outputFileName = this.getNodeParameter('visioOutputFileName', index) as string;
		docName = this.getNodeParameter('visioDocName', index) as string;
		outputFormat = this.getNodeParameter('visioOutputFormat', index) as string;
		pdfOptions = this.getNodeParameter('visioPdfOptions', index) as IDataObject;
		pageSettings = this.getNodeParameter('visioPageSettings', index) as IDataObject;
		displayOptions = this.getNodeParameter('visioDisplayOptions', index) as IDataObject;
		imageOptions = this.getNodeParameter('visioImageOptions', index) as IDataObject;
		tiffOptions = this.getNodeParameter('visioTiffOptions', index) as IDataObject;
		advancedOptions = this.getNodeParameter('visioAdvancedOptions', index) as IDataObject;
	} else {
		// Use the original parameters (for backward compatibility)
		inputDataType = this.getNodeParameter('inputDataType', index) as string;
		outputFileName = this.getNodeParameter('outputFileName', index) as string;
		docName = this.getNodeParameter('docName', index) as string;
		outputFormat = this.getNodeParameter('outputFormat', index) as string;
		pdfOptions = this.getNodeParameter('pdfOptions', index) as IDataObject;
		pageSettings = this.getNodeParameter('pageSettings', index) as IDataObject;
		displayOptions = this.getNodeParameter('displayOptions', index) as IDataObject;
		imageOptions = this.getNodeParameter('imageOptions', index) as IDataObject;
		tiffOptions = this.getNodeParameter('tiffOptions', index) as IDataObject;
		advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	}

	// Validate outputFormat
	const allowedFormats = ['PDF', 'JPG', 'PNG', 'TIFF'];
	if (!outputFormat || !allowedFormats.includes(outputFormat)) {
		outputFormat = 'PDF'; // Default to PDF if not set or invalid
	}

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get Visio content from binary data
		const binaryPropertyName = operation === ActionConstants.ConvertToPdf 
			? this.getNodeParameter('visioBinaryPropertyName', index) as string
			: this.getNodeParameter('binaryPropertyName', index) as string;
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
		docContent = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('visioBase64Content', index) as string
			: this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Use Visio URL directly - download the file first
		const visioUrl = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('visioUrl', index) as string
			: this.getNodeParameter('visioUrl', index) as string;
		
		// Validate URL format
		try {
			new URL(visioUrl);
		} catch (error) {
			throw new Error('Invalid URL format. Please provide a valid URL to the Visio file.');
		}

		console.log(`Downloading Visio from URL: ${visioUrl}`);
		docContent = await downloadVisioFromUrl(visioUrl);
		console.log('Visio file successfully downloaded and encoded to base64');
	} else if (inputDataType === 'filePath') {
		// Use local file path - read the file and convert to base64
		const filePath = operation === ActionConstants.ConvertToPdf
			? this.getNodeParameter('visioFilePath', index) as string
			: this.getNodeParameter('filePath', index) as string;

		// Validate file path (basic check)
		if (!filePath.includes('/') && !filePath.includes('\\')) {
			throw new Error('Invalid file path. Please provide a complete path to the Visio file.');
		}

		try {
			// Read the file and convert to base64
			const fs = require('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');

			// Validate the Visio content
			if (docContent.length < 100) {
				throw new Error('Visio file appears to be too small. Please ensure the file is a valid Visio file.');
			}

			// Extract filename from path for original filename
			const pathParts = filePath.replace(/\\/g, '/').split('/');
			originalFileName = pathParts[pathParts.length - 1];

		} catch (error) {
			if (error.code === 'ENOENT') {
				throw new Error(`File not found: ${filePath}. Please check the file path and ensure the file exists.`);
			} else if (error.code === 'EACCES') {
				throw new Error(`Permission denied: ${filePath}. Please check file permissions.`);
			} else {
				throw new Error(`Error reading file: ${error.message}`);
			}
		}
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate base64 content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Visio content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		OutputFormat: outputFormat,
		async: true, // Asynchronous processing as per Python sample
	};

	// Add PDF options if provided
	if (pdfOptions && pdfOptions.isPdfCompliant !== undefined) body.IsPdfCompliant = pdfOptions.isPdfCompliant;

	// Add page settings if provided
	if (pageSettings && pageSettings.pageIndex !== undefined) body.PageIndex = pageSettings.pageIndex;
	if (pageSettings && pageSettings.pageCount !== undefined) body.PageCount = pageSettings.pageCount;
	if (pageSettings && pageSettings.includeHiddenPages !== undefined) body.IncludeHiddenPages = pageSettings.includeHiddenPages;

	// Add display options if provided
	if (displayOptions && displayOptions.saveForegroundPage !== undefined) body.SaveForegroundPage = displayOptions.saveForegroundPage;
	if (displayOptions && displayOptions.saveToolBar !== undefined) body.SaveToolBar = displayOptions.saveToolBar;
	if (displayOptions && displayOptions.autoFit !== undefined) body.AutoFit = displayOptions.autoFit;

	// Add image options if provided
	if (imageOptions && imageOptions.jpegQuality !== undefined) body.JpegQuality = imageOptions.jpegQuality;
	if (imageOptions && imageOptions.imageBrightness !== undefined) body.ImageBrightness = imageOptions.imageBrightness;
	if (imageOptions && imageOptions.imageContrast !== undefined) body.ImageContrast = imageOptions.imageContrast;
	if (imageOptions && imageOptions.imageColorMode !== undefined) body.ImageColorMode = imageOptions.imageColorMode;
	if (imageOptions && imageOptions.resolution !== undefined) body.Resolution = imageOptions.resolution;
	if (imageOptions && imageOptions.scale !== undefined) body.Scale = imageOptions.scale;

	// Add TIFF options if provided
	if (tiffOptions && tiffOptions.tiffCompression !== undefined) body.TiffCompression = tiffOptions.tiffCompression;

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use the standard pdf4meAsyncRequest function with schema parameter
	const responseData = await pdf4meAsyncRequest.call(this, `/api/v2/ConvertVisio?schemaVal=${outputFormat}`, body);

	// Handle the binary response (converted file data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'visio_to_pdf_output';
			fileName = `${baseName}.${outputFormat.toLowerCase()}`;
		}

		// Ensure proper extension
		if (!fileName.includes('.')) {
			fileName = `${fileName}.${outputFormat.toLowerCase()}`;
		}

		// Determine MIME type based on output format
		let mimeType = 'application/pdf';
		if (outputFormat === 'JPG') mimeType = 'image/jpeg';
		else if (outputFormat === 'PNG') mimeType = 'image/png';
		else if (outputFormat === 'TIFF') mimeType = 'image/tiff';

		// Ensure responseData is a Buffer
		let outputBuffer: any;
		if (Buffer.isBuffer(responseData)) {
			outputBuffer = responseData;
		} else if (typeof responseData === 'string') {
			// If it's a base64 string, convert to buffer
			outputBuffer = Buffer.from(responseData, 'base64');
		} else {
			// If it's already binary data, convert to buffer
			outputBuffer = Buffer.from(responseData as any);
		}

		// Validate the output buffer
		if (!outputBuffer || outputBuffer.length < 100) {
			throw new Error(`Invalid ${outputFormat} response from API. The converted file appears to be too small or corrupted.`);
		}

		// Create binary data for output using n8n's helper
		const binaryData = await this.helpers.prepareBinaryData(
			outputBuffer,
			fileName,
			mimeType,
		);

		return [
			{
				json: {
					fileName,
					mimeType,
					fileSize: outputBuffer.length,
					success: true,
					outputFormat,
					originalFileName,
					message: `Visio converted to ${outputFormat} successfully`,
				},
				binary: {
					data: binaryData, // Use 'data' as the key for consistency with other nodes
				},
			},
		];
	}

	// Error case
	throw new Error('No response data received from PDF4ME API');
}

async function downloadVisioFromUrl(visioUrl: string): Promise<string> {
	/**
	 * Download Visio from URL and convert to base64
	 * Process: Download file → Convert to base64 → Validate content
	 * 
	 * Args:
	 *   visioUrl (str): URL to the Visio file
	 * 
	 * Returns:
	 *   str: Base64 encoded Visio content
	 * 
	 * Raises:
	 *   Error: For download or encoding errors
	 */
	try {
		// Download the Visio file
		const response = await fetch(visioUrl);
		
		if (!response.ok) {
			throw new Error(`Failed to download Visio from URL: ${response.status} ${response.statusText}`);
		}

		// Get the file as array buffer
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		
		// Convert to base64
		const base64Content = buffer.toString('base64');
		
		// Validate the content
		if (base64Content.length < 100) {
			throw new Error('Downloaded file appears to be too small. Please ensure the URL points to a valid Visio file.');
		}

		return base64Content;
		
	} catch (error) {
		if (error.message.includes('Failed to fetch')) {
			throw new Error(`Network error downloading Visio from URL: ${error.message}`);
		} else if (error.message.includes('Failed to download')) {
			throw new Error(`HTTP error downloading Visio: ${error.message}`);
		} else {
			throw new Error(`Error downloading Visio from URL: ${error.message}`);
		}
	}
} 