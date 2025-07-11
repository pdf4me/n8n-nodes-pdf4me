import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meApiRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';

// Make Node.js globals available
declare const Buffer: any;
declare const URL: any;
declare const require: any;

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
				placeholder: `{ 'outputDataFormat': 'base64' }`,
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	// Debug: Log function entry
	console.log('=== PDF4ME AddImageStampToPdf Debug ===');
	console.log(`[${new Date().toISOString()}] Starting execution...`);

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

	// Debug: Log all parameters
	console.log('Parameters:');
	console.log(`  - inputDataType: ${inputDataType}`);
	console.log(`  - imageInputDataType: ${imageInputDataType}`);
	console.log(`  - outputFileName: ${outputFileName}`);
	console.log(`  - docName: ${docName}`);
	console.log(`  - imageName: ${imageName}`);
	console.log(`  - alignX: ${alignX} (type: ${typeof alignX})`);
	console.log(`  - alignY: ${alignY} (type: ${typeof alignY})`);
	console.log(`  - pages: ${pages}`);
	console.log(`  - heightInMM: ${heightInMM}`);
	console.log(`  - widthInMM: ${widthInMM}`);
	console.log(`  - heightInPx: ${heightInPx}`);
	console.log(`  - widthInPx: ${widthInPx}`);
	console.log(`  - marginXInMM: ${marginXInMM}`);
	console.log(`  - marginYInMM: ${marginYInMM}`);
	console.log(`  - marginXInPx: ${marginXInPx}`);
	console.log(`  - marginYInPx: ${marginYInPx}`);
	console.log(`  - opacity: ${opacity}`);
	console.log(`  - isBackground: ${isBackground}`);
	console.log(`  - showOnlyInPrint: ${showOnlyInPrint}`);
	console.log(`  - advancedOptions:`, JSON.stringify(advancedOptions, null, 2));

	let docContent: string;

	// Debug: Log PDF input processing
	console.log('\n=== PDF Input Processing ===');
	console.log(`Processing PDF with inputDataType: ${inputDataType}`);

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get PDF content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		console.log(`  - binaryPropertyName: ${binaryPropertyName}`);
		
		const item = this.getInputData(index);
		console.log(`  - input items count: ${item.length}`);
		console.log(`  - first item has binary: ${!!item[0]?.binary}`);
		console.log(`  - available binary properties: ${item[0]?.binary ? Object.keys(item[0].binary).join(', ') : 'none'}`);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
		console.log(`  - PDF binary size: ${buffer.length} bytes`);
		console.log(`  - PDF base64 length: ${docContent.length} characters`);
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;
		console.log(`  - Original base64 length: ${docContent.length} characters`);

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			const originalLength = docContent.length;
			docContent = docContent.split(',')[1];
			console.log(`  - Removed data URL prefix, length changed from ${originalLength} to ${docContent.length}`);
		}
	} else if (inputDataType === 'url') {
		// Download PDF from URL
		const pdfUrl = this.getNodeParameter('pdfUrl', index) as string;
		console.log(`  - PDF URL: ${pdfUrl}`);
		docContent = await downloadPdfFromUrl(pdfUrl);
		console.log(`  - Downloaded PDF base64 length: ${docContent.length} characters`);
	} else if (inputDataType === 'filePath') {
		// Read PDF from local file path
		const filePath = this.getNodeParameter('filePath', index) as string;
		console.log(`  - PDF file path: ${filePath}`);
		docContent = await readPdfFromFile(filePath);
		console.log(`  - Read PDF base64 length: ${docContent.length} characters`);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate PDF content
	if (!docContent || docContent.trim() === '') {
		throw new Error('PDF content is required');
	}
	
	console.log(`  - Final PDF content length: ${docContent.length} characters`);
	console.log(`  - PDF content starts with: ${docContent.substring(0, 50)}...`);

	// Handle different image input data types
	let imageContent: string;

	// Debug: Log image input processing
	console.log('\n=== Image Input Processing ===');
	console.log(`Processing image with imageInputDataType: ${imageInputDataType}`);

	if (imageInputDataType === 'binaryData') {
		// Get image content from binary data
		const imageBinaryPropertyName = this.getNodeParameter('imageBinaryPropertyName', index) as string;
		console.log(`  - imageBinaryPropertyName: ${imageBinaryPropertyName}`);
		
		const item = this.getInputData(index);
		console.log(`  - input items count: ${item.length}`);
		console.log(`  - first item has binary: ${!!item[0]?.binary}`);
		console.log(`  - available binary properties: ${item[0]?.binary ? Object.keys(item[0].binary).join(', ') : 'none'}`);

		if (!item[0].binary || !item[0].binary[imageBinaryPropertyName]) {
			throw new Error(`No binary data found in property '${imageBinaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, imageBinaryPropertyName);
		imageContent = buffer.toString('base64');
		console.log(`  - Image binary size: ${buffer.length} bytes`);
		console.log(`  - Image base64 length: ${imageContent.length} characters`);
	} else if (imageInputDataType === 'base64') {
		// Use base64 content directly
		imageContent = this.getNodeParameter('imageContent', index) as string;
		console.log(`  - Original image base64 length: ${imageContent.length} characters`);

		// Remove data URL prefix if present (e.g., "data:image/png;base64,")
		if (imageContent.includes(',')) {
			const originalLength = imageContent.length;
			imageContent = imageContent.split(',')[1];
			console.log(`  - Removed data URL prefix, length changed from ${originalLength} to ${imageContent.length}`);
		}

		// Clean up any whitespace or newlines that might be present
		const beforeCleanup = imageContent.length;
		imageContent = imageContent.replace(/\s/g, '');
		console.log(`  - Cleaned whitespace, length changed from ${beforeCleanup} to ${imageContent.length}`);
	} else if (imageInputDataType === 'url') {
		// Download image from URL
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		console.log(`  - Image URL: ${imageUrl}`);
		imageContent = await downloadImageFromUrl(imageUrl);
		console.log(`  - Downloaded image base64 length: ${imageContent.length} characters`);
	} else if (imageInputDataType === 'filePath') {
		// Read image from local file path
		const imageFilePath = this.getNodeParameter('imageFilePath', index) as string;
		console.log(`  - Image file path: ${imageFilePath}`);
		imageContent = await readImageFromFile(imageFilePath);
		console.log(`  - Read image base64 length: ${imageContent.length} characters`);
	} else {
		throw new Error(`Unsupported image input data type: ${imageInputDataType}`);
	}

	// Validate image content
	if (!imageContent || imageContent.trim() === '') {
		throw new Error('Image content is required');
	}

	// Validate that image content is valid base64
	try {
		// Check if the content is valid base64 by attempting to decode it
		const decodedBuffer = Buffer.from(imageContent, 'base64');
		console.log(`  - Image base64 validation: SUCCESS (decoded ${decodedBuffer.length} bytes)`);
	} catch (error) {
		console.log(`  - Image base64 validation: FAILED - ${error.message}`);
		throw new Error('Invalid base64 image content. Please ensure the image is properly encoded.');
	}
	
	console.log(`  - Final image content length: ${imageContent.length} characters`);
	console.log(`  - Image content starts with: ${imageContent.substring(0, 50)}...`);

	// Build the request body
	console.log('\n=== Request Body Construction ===');
	
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

	// Debug: Log request body (without sensitive data)
	const debugBody = { ...body };
	debugBody.docContent = `[PDF_BASE64_${(body.docContent as string)?.length || 0}_CHARS]`;
	debugBody.imageFile = `[IMAGE_BASE64_${(body.imageFile as string)?.length || 0}_CHARS]`;
	console.log('Request body structure:');
	console.log(JSON.stringify(debugBody, null, 2));

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) {
		body.profiles = profiles;
		console.log(`  - Added profiles: ${profiles}`);
	}

	console.log('\n=== API Call ===');
	console.log(`  - Endpoint: /api/v2/ImageStamp`);
	console.log(`  - Request body keys: ${Object.keys(body).join(', ')}`);
	console.log(`  - alignX value: "${alignX}" (type: ${typeof alignX})`);
	console.log(`  - alignY value: "${alignY}" (type: ${typeof alignY})`);

	sanitizeProfiles(body);
	console.log(`  - After sanitizeProfiles, body keys: ${Object.keys(body).join(', ')}`);

	let responseData: any;
	try {
		console.log(`  - Using sync processing mode (no async flag in API spec)`);
		responseData = await pdf4meApiRequest.call(this, '/api/v2/ImageStamp', body);
		console.log(`  - API call successful`);
		console.log(`  - Response data type: ${typeof responseData}`);
		console.log(`  - Response data length: ${responseData?.length || 'undefined'}`);
	} catch (error) {
		console.log(`  - API call failed: ${error.message}`);
		console.log(`  - Error details:`, error);
		throw error;
	}

	// Handle the binary response (PDF data)
	console.log('\n=== Response Handling ===');
	
	if (responseData) {
		console.log(`  - Response data received: ${responseData ? 'YES' : 'NO'}`);
		console.log(`  - Response data type: ${typeof responseData}`);
		console.log(`  - Response data length: ${responseData?.length || 'undefined'}`);
		
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from docName if available, otherwise use default
			const baseName = docName ? docName.replace(/\.pdf$/i, '') : 'document_with_image_stamp';
			fileName = `${baseName}_with_image_stamp.pdf`;
			console.log(`  - Generated filename: ${fileName}`);
		} else {
			console.log(`  - Using provided filename: ${fileName}`);
		}

		// Ensure .pdf extension
		if (!fileName.toLowerCase().endsWith('.pdf')) {
			const originalFileName = fileName;
			fileName = `${fileName.replace(/\.[^.]*$/, '')}.pdf`;
			console.log(`  - Added .pdf extension: ${originalFileName} -> ${fileName}`);
		}

		console.log(`  - Final filename: ${fileName}`);
		console.log(`  - Preparing binary data...`);

		// responseData is already binary data (Buffer)
		const binaryData = await this.helpers.prepareBinaryData(
			responseData,
			fileName,
			'application/pdf',
		);

		console.log(`  - Binary data prepared successfully`);
		console.log(`  - File size: ${responseData.length} bytes`);
		console.log('=== Execution completed successfully ===\n');

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

	// Error case
	console.log(`  - No response data received`);
	console.log('=== Execution failed: No response data ===\n');
	throw new Error('No response data received from PDF4ME API');
}

/**
 * Download PDF from URL and convert to base64
 */
async function downloadPdfFromUrl(pdfUrl: string): Promise<string> {
	console.log(`    [downloadPdfFromUrl] Starting download from: ${pdfUrl}`);
	
	const https = require('https');
	const http = require('http');

	const parsedUrl = new URL(pdfUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	console.log(`    [downloadPdfFromUrl] Protocol: ${parsedUrl.protocol}, Host: ${parsedUrl.hostname}, Port: ${parsedUrl.port || (isHttps ? 443 : 80)}`);

	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'application/pdf,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
				return;
			}

			const chunks: any[] = [];
			res.on('data', (chunk: any) => {
				chunks.push(chunk);
			});

			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');
				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Download timeout'));
		});

		req.end();
	});
}

/**
 * Read PDF from local file path and convert to base64
 */
async function readPdfFromFile(filePath: string): Promise<string> {
	console.log(`    [readPdfFromFile] Reading file: ${filePath}`);
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');
		console.log(`    [readPdfFromFile] File read successfully: ${fileBuffer.length} bytes -> ${base64Content.length} base64 chars`);
		return base64Content;
	} catch (error) {
		console.log(`    [readPdfFromFile] Error reading file: ${error.message}`);
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageFromUrl(imageUrl: string): Promise<string> {
	console.log(`    [downloadImageFromUrl] Starting download from: ${imageUrl}`);
	
	const https = require('https');
	const http = require('http');

	const parsedUrl = new URL(imageUrl);
	const isHttps = parsedUrl.protocol === 'https:';
	const client = isHttps ? https : http;

	console.log(`    [downloadImageFromUrl] Protocol: ${parsedUrl.protocol}, Host: ${parsedUrl.hostname}, Port: ${parsedUrl.port || (isHttps ? 443 : 80)}`);

	const options = {
		hostname: parsedUrl.hostname,
		port: parsedUrl.port || (isHttps ? 443 : 80),
		path: parsedUrl.pathname + parsedUrl.search,
		method: 'GET',
		timeout: 30000,
		headers: {
			'User-Agent': 'Mozilla/5.0 (compatible; n8n-pdf4me-node)',
			'Accept': 'image/*,application/octet-stream,*/*',
		},
	};

	return new Promise((resolve, reject) => {
		const req = client.request(options, (res: any) => {
			if (res.statusCode !== 200) {
				reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
				return;
			}

			const chunks: any[] = [];
			res.on('data', (chunk: any) => {
				chunks.push(chunk);
			});

			res.on('end', () => {
				const buffer = Buffer.concat(chunks);
				const base64Content = buffer.toString('base64');
				resolve(base64Content);
			});

			res.on('error', (error: any) => {
				reject(new Error(`Download error: ${error.message}`));
			});
		});

		req.on('error', (error: any) => {
			reject(new Error(`Request error: ${error.message}`));
		});

		req.on('timeout', () => {
			req.destroy();
			reject(new Error('Download timeout'));
		});

		req.end();
	});
}

/**
 * Read image from local file path and convert to base64
 */
async function readImageFromFile(filePath: string): Promise<string> {
	console.log(`    [readImageFromFile] Reading file: ${filePath}`);
	const fs = require('fs');
	
	try {
		const fileBuffer = fs.readFileSync(filePath);
		const base64Content = fileBuffer.toString('base64');
		console.log(`    [readImageFromFile] File read successfully: ${fileBuffer.length} bytes -> ${base64Content.length} base64 chars`);
		return base64Content;
	} catch (error) {
		console.log(`    [readImageFromFile] Error reading file: ${error.message}`);
		if (error.code === 'ENOENT') {
			throw new Error(`File not found: ${filePath}`);
		} else if (error.code === 'EACCES') {
			throw new Error(`Permission denied: ${filePath}`);
		} else {
			throw new Error(`Error reading file: ${error.message}`);
		}
	}
} 