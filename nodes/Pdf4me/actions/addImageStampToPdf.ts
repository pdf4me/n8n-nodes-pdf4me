import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
// declare const Buffer: any;
// declare const URL: any;
// declare const console: any;

// Simplified debug configuration
interface DebugConfig {
	enabled: boolean;
	logLevel: 'none' | 'basic' | 'detailed';
	logToConsole?: boolean;
}

// Simplified debug logger class
class DebugLogger {
	private config: DebugConfig;

	constructor(config: DebugConfig) {
		this.config = config;
	}

	log(level: string, message: string, data?: any): void {
		if (!this.config.enabled) return;



		if (this.config.logToConsole !== false) {
			if (data) {
				// Log data if needed
			}
		}
	}
}

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the PDF file to add image stamp to',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use PDF file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide PDF content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to PDF file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to PDF file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 PDF Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded PDF document content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'PDF URL',
		name: 'pdfUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the PDF file to add image stamp to',
		placeholder: 'https://example.com/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
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
		description: 'Local file path to the PDF file to add image stamp to',
		placeholder: '/path/to/document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				inputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'document_with_image_stamp.pdf',
		description: 'Name for the output PDF file with image stamp',
		placeholder: 'my-document-with-image-stamp.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',
		default: 'document.pdf',
		description: 'Name of the source PDF file for reference',
		placeholder: 'original-file.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Image Input Data Type',
		name: 'imageInputDataType',
		type: 'options',
		required: true,
		default: 'base64',
		description: 'Choose how to provide the image file for stamp',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
		options: [
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide image content as base64 encoded string',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use image file from previous node',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to image file',
			},
			{
				name: 'File Path',
				value: 'filePath',
				description: 'Provide local file path to image file',
			},
		],
	},
	{
		displayName: 'Image Binary Field',
		name: 'imageBinaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				imageInputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Image Content',
		name: 'imageContent',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded image content for stamp',
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				imageInputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the image file for stamp',
		placeholder: 'https://example.com/stamp.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				imageInputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Image File Path',
		name: 'imageFilePath',
		type: 'string',
		required: true,
		default: '',
		description: 'Local file path to the image file for stamp',
		placeholder: '/path/to/stamp.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
				imageInputDataType: ['filePath'],
			},
		},
	},
	{
		displayName: 'Image Name',
		name: 'imageName',
		type: 'string',
		default: 'stamp.png',
		description: 'The image file name with proper extension - .png or .jpeg',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Pages',
		name: 'pages',
		type: 'string',
		default: '1',
		description: 'Specify page indices as comma-separated values or ranges to process (e.g. "0, 1, 2-" or "1, 2, 3-7"). If not specified, the default configuration processes all pages. The input must be in string format',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Alignment',
		name: 'alignX',
		type: 'options',
		options: [
			{ name: 'Left', value: 'left' },
			{ name: 'Center', value: 'center' },
			{ name: 'Right', value: 'right' },
		],
		default: 'center',
		description: 'Horizontal alignment of image. The allowed values are: Left - left edge of the page, Center - equal distance from left and right edge of the page, Right - right edge of the page.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Vertical Alignment',
		name: 'alignY',
		type: 'options',
		options: [
			{ name: 'Top', value: 'top' },
			{ name: 'Middle', value: 'middle' },
			{ name: 'Bottom', value: 'bottom' },
		],
		default: 'middle',
		description: 'Vertical alignment of image. The allowed values are: Top - top edge of the page, Middle - equal distance from top and bottom edge of the page, Bottom - bottom edge of the page.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Height (Mm)',
		name: 'heightInMM',
		type: 'number',
		default: 30,
		description: 'Image height in millimeters (mm). If 0, default height or aspect ratio sized height will be taken.',
		typeOptions: {
			minValue: 0,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Width (Mm)',
		name: 'widthInMM',
		type: 'number',
		default: 30,
		description: 'Image width in millimeters (mm). If 0, default width or aspect ratio sized width will be taken.',
		typeOptions: {
			minValue: 0,
			maxValue: 200,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Height (Px)',
		name: 'heightInPx',
		type: 'number',
		default: 85,
		description: 'Height of the image stamp in points(px). Example- 40pt.',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Width (Px)',
		name: 'widthInPx',
		type: 'number',
		default: 85,
		description: 'Width of the image stamp in points(px). Example- 40pt.',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (Mm)',
		name: 'marginXInMM',
		type: 'number',
		default: 10,
		description: 'Horizontal margin in millimeters (mm). Default value is 0. If horizontal alignment is Left, it will give gap from left edge of page. If Right, it will give gap from right edge of page. If Center, this field is ignored',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (Mm)',
		name: 'marginYInMM',
		type: 'number',
		default: 10,
		description: 'Vertical margin in millimeters (mm). Default value is 0. If vertical alignment is Top, it will give gap from top edge of page. If Bottom, it will give gap from bottom edge of page. If Middle, this field is ignored',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Horizontal Margin (Px)',
		name: 'marginXInPx',
		type: 'number',
		default: 28,
		description: 'Margin from left origin of the image stamp in millimeters',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Vertical Margin (Px)',
		name: 'marginYInPx',
		type: 'number',
		default: 28,
		description: 'Margin from top origin of the image stamp in millimeters',
		typeOptions: {
			minValue: 0,
			maxValue: 300,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 50,
		description: 'Values between 0 to 100. \'0\' is entirely transparent—100 for full opacity.',
		typeOptions: {
			minValue: 0,
			maxValue: 100,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Background Stamp',
		name: 'isBackground',
		type: 'boolean',
		default: true,
		description: 'Whether to use the image as a background stamp. Default: true.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
			},
		},
	},
	{
		displayName: 'Show Only in Print',
		name: 'showOnlyInPrint',
		type: 'boolean',
		default: true,
		description: 'Whether to show the stamp only in print. Default: true.',
		displayOptions: {
			show: {
				operation: [ActionConstants.AddImageStampToPdf],
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
				operation: [ActionConstants.AddImageStampToPdf],
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
			{
				displayName: 'Enable Debug Mode',
				name: 'enableDebug',
				type: 'boolean',
				default: false,
				description: 'Enable debugging and logging',
			},
		],
	},
];

/**
 * Add image stamp to a PDF document using PDF4Me API
 * Process: Read PDF & Image → Encode to base64 → Send API request → Return PDF with image stamp
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const imageInputDataType = this.getNodeParameter('imageInputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const imageName = this.getNodeParameter('imageName', index) as string;
	const alignX = this.getNodeParameter('alignX', index) as string;
	const alignY = this.getNodeParameter('alignY', index) as string;
	const pages = this.getNodeParameter('pages', index) as string;
	const heightInMM = this.getNodeParameter('heightInMM', index) as number;
	const widthInMM = this.getNodeParameter('widthInMM', index) as number;
	const heightInPx = this.getNodeParameter('heightInPx', index) as number;
	const widthInPx = this.getNodeParameter('widthInPx', index) as number;
	const marginXInMM = this.getNodeParameter('marginXInMM', index) as number;
	const marginYInMM = this.getNodeParameter('marginYInMM', index) as number;
	const marginXInPx = this.getNodeParameter('marginXInPx', index) as number;
	const marginYInPx = this.getNodeParameter('marginYInPx', index) as number;
	const opacity = this.getNodeParameter('opacity', index) as number;
	const isBackground = this.getNodeParameter('isBackground', index) as boolean;
	const showOnlyInPrint = this.getNodeParameter('showOnlyInPrint', index) as boolean;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	// Initialize debug logger
	const debugConfig: DebugConfig = {
		enabled: advancedOptions?.enableDebug === true,
		logLevel: 'basic',
		logToConsole: true,
	};

	const logger = new DebugLogger(debugConfig);
	logger.log('info', 'Starting Add Image Stamp to PDF operation', {
		inputDataType,
		imageInputDataType,
		outputFileName,
		alignX,
		alignY,
	});

	try {
		let docContent: string;

		// Handle different input data types for PDF
		if (inputDataType === 'binaryData') {
			logger.log('debug', 'Processing PDF as binary data');
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const item = this.getInputData(index);

			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			docContent = buffer.toString('base64');
			logger.log('debug', 'PDF binary data extracted', { size: buffer.length });
		} else if (inputDataType === 'base64') {
			logger.log('debug', 'Processing PDF as base64');
			docContent = this.getNodeParameter('base64Content', index) as string;

			// Remove data URL prefix if present
			if (docContent.includes(',')) {
				docContent = docContent.split(',')[1];
			}
			logger.log('debug', 'PDF base64 content processed', { length: docContent.length });
		} else if (inputDataType === 'url') {
			logger.log('debug', 'Processing PDF from URL');
			const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
			const response = await this.helpers.request({
				method: 'GET',
				url: pdfUrl,
				encoding: null,
			});
			const buffer = Buffer.from(response as Buffer);
			docContent = buffer.toString('base64');
			logger.log('debug', 'PDF downloaded from URL', { length: docContent.length });
		} else if (inputDataType === 'filePath') {
			throw new Error('File path input is not supported in this environment');
		} else {
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}

		// Validate PDF content
		if (!docContent || docContent.trim() === '') {
			throw new Error('PDF content is required');
		}

		// Handle different image input data types
		let imageContent: string;

		if (imageInputDataType === 'binaryData') {
			logger.log('debug', 'Processing image as binary data');
			const imageBinaryPropertyName = this.getNodeParameter('imageBinaryPropertyName', index) as string;
			const item = this.getInputData(index);

			if (!item[0].binary || !item[0].binary[imageBinaryPropertyName]) {
				throw new Error(`No binary data found in property '${imageBinaryPropertyName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, imageBinaryPropertyName);
			imageContent = buffer.toString('base64');
			logger.log('debug', 'Image binary data extracted', { size: buffer.length });
		} else if (imageInputDataType === 'base64') {
			logger.log('debug', 'Processing image as base64');
			imageContent = this.getNodeParameter('imageContent', index) as string;

			// Remove data URL prefix if present
			if (imageContent.includes(',')) {
				imageContent = imageContent.split(',')[1];
			}

			// Clean up whitespace
			imageContent = imageContent.replace(/\s/g, '');
			logger.log('debug', 'Image base64 content processed', { length: imageContent.length });
		} else if (imageInputDataType === 'url') {
			logger.log('debug', 'Processing image from URL');
			const imageUrl = this.getNodeParameter('imageUrl', index) as string;
			const response = await this.helpers.request({
				method: 'GET',
				url: imageUrl,
				encoding: null,
			});
			const buffer = Buffer.from(response as Buffer);
			imageContent = buffer.toString('base64');
			logger.log('debug', 'Image downloaded from URL', { length: imageContent.length });
		} else if (imageInputDataType === 'filePath') {
			throw new Error('File path input is not supported in this environment');
		} else {
			throw new Error(`Unsupported image input data type: ${imageInputDataType}`);
		}

		// Validate image content
		if (!imageContent || imageContent.trim() === '') {
			throw new Error('Image content is required');
		}

		// Validate that image content is valid base64
		try {
			Buffer.from(imageContent, 'base64');
			logger.log('debug', 'Image base64 validation passed');
		} catch {
			throw new Error('Invalid base64 image content. Please ensure the image is properly encoded.');
		}

		// Build the request body according to API specification
		const body: IDataObject = {
			// Horizontal alignment of image
			alignX,
			// Vertical alignment of image
			alignY,
			// The content of the input file (base64)
			docContent,
			// Source PDF file name with .pdf extension
			docName,
			// The image file name with proper extension
			imageName,
			// Map stamp image content from source action (base64)
			imageFile: imageContent,
			// Specify page indices as comma-separated values or ranges
			pages,
			// Image height in millimeters (mm)
			heightInMM: String(heightInMM),
			// Image width in millimeters (mm)
			widthInMM: String(widthInMM),
			// Height of the image stamp in points(px)
			heightInPx: String(heightInPx),
			// Width of the image stamp in points(px)
			widthInPx: String(widthInPx),
			// Horizontal margin in millimeters (mm)
			marginXInMM: String(marginXInMM),
			// Vertical margin in millimeters (mm)
			marginYInMM: String(marginYInMM),
			// Margin from left origin of the image stamp in millimeters
			marginXInPx: String(marginXInPx),
			// Margin from top origin of the image stamp in millimeters
			marginYInPx: String(marginYInPx),
			// Values between 0 to 100. '0' is entirely transparent—100 for full opacity
			opacity,
			// Default: true
			isBackground,
			// Default: true
			showOnlyInPrint,
		};

		logger.log('debug', 'Request body prepared', {
			alignX,
			alignY,
			docContentLength: docContent.length,
			imageContentLength: imageContent.length,
			pages,
		});

		// Add custom profiles if provided
		if (advancedOptions.profiles) {
			logger.log('debug', 'Processing custom profiles');
			try {
				const profiles = JSON.parse(advancedOptions.profiles as string);
				sanitizeProfiles(profiles);
				Object.assign(body, profiles);
				logger.log('debug', 'Custom profiles applied successfully');
			} catch (error) {
				logger.log('error', 'Failed to parse custom profiles', { error: error.message });
				throw new Error(`Invalid custom profiles JSON: ${error}`);
			}
		}

		// Make the API request
		logger.log('debug', 'Making API request', { endpoint: '/api/v2/ImageStamp' });

		const responseData = await pdf4meApiRequest.call(this, '/api/v2/ImageStamp', body);

		logger.log('debug', 'API request completed successfully', {
			responseType: typeof responseData,
			responseLength: responseData?.length || 0,
		});

		// Handle the binary response (PDF data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'document_with_image_stamp';
				fileName = `${baseName}_with_image_stamp.pdf`;
			}

			// Ensure .pdf extension
			if (!fileName.toLowerCase().endsWith('.pdf')) {
				fileName = `${fileName.replace(/\.[^.]*$/, '')}.pdf`;
			}

			// Prepare binary data
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				fileName,
				'application/pdf',
			);

			logger.log('info', 'Add Image Stamp to PDF operation completed successfully', {
				fileName,
				fileSize: responseData.length,
			});

			return [
				{
					json: {
						fileName,
						mimeType: 'application/pdf',
						fileSize: responseData.length,
						success: true,
						message: 'Image stamp added successfully',
					},
					binary: {
						data: binaryData,
					},
				},
			];
		}

		throw new Error('No response data received from PDF4ME API');
	} catch (error) {
		logger.log('error', 'Add Image Stamp to PDF operation failed', {
			error: error.message,
			stack: error.stack,
		});

		throw error;
	}
}

/**
 * Download PDF from URL and convert to base64
 */

/**
 * Read PDF from local file path and convert to base64
 */

/**
 * Download image from URL and convert to base64
 */

/**
 * Read image from local file path and convert to base64
 */
