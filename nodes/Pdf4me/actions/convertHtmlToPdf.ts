import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
	uploadBlobToPdf4me,
} from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the HTML file to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use HTML file from previous node (binary data)',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide HTML content already encoded in base64 format',
			},
			{
				name: 'HTML Code',
				value: 'htmlCode',
				description: 'Write raw HTML code manually (will be converted to base64)',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to HTML file (will be downloaded and converted)',
			},
		],
	},
	{
		displayName: 'Binary Property Name',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the HTML file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 HTML Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Provide the HTML content already encoded in base64 format (not raw HTML code). Example: PGEgaHJlZj0iaHR0cDovL2V4YW1wbGUuY29tIj5MaW5rPC9hPg==',
		placeholder: 'PGh0bWw+PGhlYWQ+PHRpdGxlPlNhbXBsZTwvdGl0bGU+PC9oZWFkPjxib2R5PkhlbGxvIFdvcmxkPC9ib2R5PjwvaHRtbD4=',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'HTML Code',
		name: 'htmlCode',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Write your HTML code here. It will be automatically converted to base64.',
		placeholder: '<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Hello World</h1></body></html>',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['htmlCode'],
			},
		},
	},
	{
		displayName: 'HTML URL',
		name: 'htmlUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the HTML file to convert',
		placeholder: 'https://example.com/page.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'HTML File Name',
		name: 'docName',
		type: 'string',
		required: true,
		default: 'document.html',
		description: 'The source HTML file name with .html extension',
		placeholder: 'document.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Index File Path',
		name: 'indexFilePath',
		type: 'string',
		required: false,
		default: '',
		description: 'Index file path required when the input file is ZIP',
		placeholder: 'index.html',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		hint: 'Convert HTML to PDF. See our <b><a href="https://docs.pdf4me.com/n8n/convert/convert-html-to-pdf" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
	{
		displayName: 'Layout',
		name: 'layout',
		type: 'options',
		required: true,
		default: 'Portrait',
		description: 'The layout of the output PDF file',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{
				name: 'Portrait',
				value: 'Portrait',
				description: 'Vertical orientation (taller than wide)',
			},
			{
				name: 'Landscape',
				value: 'Landscape',
				description: 'Horizontal orientation (wider than tall)',
			},
		],
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		required: true,
		default: 'A4',
		description: 'Page size for the PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
		options: [
			{ name: 'A0', value: 'A0' },
			{ name: 'A1', value: 'A1' },
			{ name: 'A2', value: 'A2' },
			{ name: 'A3', value: 'A3' },
			{ name: 'A4', value: 'A4' },
			{ name: 'A5', value: 'A5' },
			{ name: 'A6', value: 'A6' },
			{ name: 'A7', value: 'A7' },
			{ name: 'A8', value: 'A8' },
			{ name: 'Tabloid', value: 'Tabloid' },
			{ name: 'Legal', value: 'Legal' },
			{ name: 'Statement', value: 'Statement' },
			{ name: 'Executive', value: 'Executive' },
		],
	},
	{
		displayName: 'Scale',
		name: 'scale',
		type: 'number',
		required: true,
		default: 0.8,
		description: 'Scaling factor for content (0 to 0.8)',
		typeOptions: {
			minValue: 0,
			maxValue: 0.8,
			numberStepSize: 0.1,
		},
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Top Margin',
		name: 'topMargin',
		type: 'string',
		required: true,
		default: '40px',
		description: 'Top margin spacing (e.g., "40px", "2cm", "1in")',
		placeholder: '40px',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Bottom Margin',
		name: 'bottomMargin',
		type: 'string',
		required: true,
		default: '40px',
		description: 'Bottom margin spacing (e.g., "40px", "2cm", "1in")',
		placeholder: '40px',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Left Margin',
		name: 'leftMargin',
		type: 'string',
		required: true,
		default: '40px',
		description: 'Left margin spacing (e.g., "40px", "2cm", "1in")',
		placeholder: '40px',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Right Margin',
		name: 'rightMargin',
		type: 'string',
		required: true,
		default: '40px',
		description: 'Right margin spacing (e.g., "40px", "2cm", "1in")',
		placeholder: '40px',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Print Background',
		name: 'printBackground',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Select true to PrintBackground in PDF and select false for PrintBackground will not display in PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Display Header Footer',
		name: 'displayHeaderFooter',
		type: 'boolean',
		required: true,
		default: false,
		description: 'Select true to DisplayHeaderFooter in PDF and select false for DisplayHeaderFooter will not display in PDF',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'output.pdf',
		description: 'Name for the output PDF file',
		placeholder: 'output.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'html-pdf-output',
		displayOptions: {
			show: {
				operation: [ActionConstants.ConvertHtmlToPdf],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
	const indexFilePath = this.getNodeParameter('indexFilePath', index) as string;
	const layout = this.getNodeParameter('layout', index) as string;
	const format = this.getNodeParameter('format', index) as string;
	const scale = this.getNodeParameter('scale', index) as number;
	const topMargin = this.getNodeParameter('topMargin', index) as string;
	const bottomMargin = this.getNodeParameter('bottomMargin', index) as string;
	const leftMargin = this.getNodeParameter('leftMargin', index) as string;
	const rightMargin = this.getNodeParameter('rightMargin', index) as string;
	const printBackground = this.getNodeParameter('printBackground', index) as boolean;
	const displayHeaderFooter = this.getNodeParameter('displayHeaderFooter', index) as boolean;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;

	let docContent: string;
	let blobId: string = '';
	let inputDocName: string = '';

	// Handle different input data types:
	// - binaryData: HTML file from previous node (uses UploadBlob → blobId)
	// - base64: HTML content already encoded in base64 (used as-is)
	// - htmlCode: Raw HTML code (converted to base64) - unchanged
	// - url: HTML file from URL (uses URL directly, no download)
	if (inputDataType === 'binaryData') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const binaryData = item[0].binary[binaryPropertyName];
		inputDocName = binaryData.fileName || docName || 'document.html';

		// Get binary data as Buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		// Upload the file to UploadBlob endpoint and get blobId
		// UploadBlob needs binary file (Buffer), not base64 string
		// Returns blobId which is then used in ConvertHtmlToPdf API payload
		blobId = await uploadBlobToPdf4me.call(this, fileBuffer, inputDocName);

		// Use blobId in docContent
		docContent = `${blobId}`;
	} else if (inputDataType === 'base64') {
		const base64Content = this.getNodeParameter('base64Content', index) as string;

		// Validate base64 content
		if (!base64Content || base64Content.trim().length === 0) {
			throw new Error('Base64 content cannot be empty');
		}

		// Validate that it looks like base64 (contains only valid base64 characters)
		const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
		if (!base64Regex.test(base64Content)) {
			throw new Error('Invalid base64 format. Base64 should only contain A-Z, a-z, 0-9, +, /, and = characters');
		}

		// Try to decode to verify it's valid base64
		try {
			const decoded = Buffer.from(base64Content, 'base64').toString('utf8');
			// console.log(`Base64 Content Length: ${base64Content.length}`);
			// console.log(`Decoded Content Length: ${decoded.length}`);
			// console.log(`Decoded Content Preview: ${decoded.substring(0, 100)}...`);

			// Check if decoded content looks like HTML
			if (!decoded.includes('<') || !decoded.includes('>')) {
				// console.log('Warning: Decoded base64 content does not appear to be HTML');
			}
		} catch (error) {
			throw new Error(`Invalid base64 content: ${error.message}`);
		}

		docContent = base64Content;
		blobId = '';
	} else if (inputDataType === 'htmlCode') {
		let htmlCode = this.getNodeParameter('htmlCode', index) as string;

		// Validate HTML code
		if (!htmlCode || htmlCode.trim().length === 0) {
			throw new Error('HTML code cannot be empty');
		}

		// Ensure HTML has basic structure
		if (!htmlCode.includes('<html') && !htmlCode.includes('<!DOCTYPE')) {
			// console.log('Warning: HTML code may not have proper HTML structure');
			// Try to wrap the content in basic HTML structure if it's missing
			if (!htmlCode.includes('<html')) {
				htmlCode = `<!DOCTYPE html><html><head><title>Converted HTML</title></head><body>${htmlCode}</body></html>`;
				// console.log('Wrapped HTML content in basic HTML structure');
			}
		}

		// Debug: Log the HTML code length and first 100 characters
		// console.log(`HTML Code Length: ${htmlCode.length}`);
		// console.log(`HTML Code Preview: ${htmlCode.substring(0, 100)}...`);

		// Convert HTML to base64
		// Ensure proper UTF-8 encoding and handle any potential encoding issues
		try {
			docContent = Buffer.from(htmlCode, 'utf8').toString('base64');
		} catch (error) {
			// console.log('Error converting HTML to base64:', error);
			// Fallback: try with different encoding
			docContent = Buffer.from(htmlCode, 'latin1').toString('base64');
		}

		blobId = '';
	} else if (inputDataType === 'url') {
		const htmlUrl = this.getNodeParameter('htmlUrl', index) as string;

		// Validate URL format
		try {
			new URL(htmlUrl);
		} catch {
			throw new Error('Invalid URL format. Please provide a valid URL to the HTML file.');
		}

		// Send URL as string directly in docContent - no download or conversion
		blobId = '';
		docContent = String(htmlUrl);
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate content based on input type
	if (inputDataType === 'url') {
		// For URLs, validate URL format (but don't modify the URL string)
		if (!docContent || typeof docContent !== 'string' || docContent.trim() === '') {
			throw new Error('URL is required and must be a non-empty string');
		}
		// URL validation already done above
	} else if (inputDataType === 'base64') {
		// For base64, validate content is not empty (already validated above)
		// Additional validation could be added here if needed
	} else if (inputDataType === 'binaryData') {
		// For binary data, validate blobId is set
		if (!docContent || docContent.trim() === '') {
			throw new Error('HTML content is required');
		}
	}

	// Build the request body according to API specification
	// Use inputDocName if docName is not provided, otherwise use docName
	const finalDocName = docName || inputDocName || 'document.html';
	const body: IDataObject = {
		docContent, // Binary data uses blobId format, base64/htmlCode uses base64 string, URL uses URL string
		docName: finalDocName,
		indexFilePath,
		layout,
		format,
		scale,
		topMargin,
		bottomMargin,
		leftMargin,
		rightMargin,
		printBackground,
		displayHeaderFooter,
		IsAsync: true,
		// Note: async flag is automatically added by pdf4meAsyncRequest function
	};

	sanitizeProfiles(body);

	// Call the PDF4ME API
	let responseData;
	try {
		responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertHtmlToPdf', body);
	} catch (error) {
		throw new Error(`Failed to convert HTML to PDF: ${error.message}`);
	}

	// Handle the binary response
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			fileName = 'output.pdf';
		}

		// Ensure proper extension
		if (!fileName.includes('.')) {
			fileName = `${fileName}.pdf`;
		}

		// Ensure responseData is a Buffer
		let pdfBuffer: Buffer;
		if (Buffer.isBuffer(responseData)) {
			pdfBuffer = responseData;
		} else if (typeof responseData === 'string') {
			pdfBuffer = Buffer.from(responseData, 'base64');
		} else if (responseData instanceof ArrayBuffer) {
			pdfBuffer = Buffer.from(responseData);
		} else {
			// Handle any other type by attempting conversion
			pdfBuffer = Buffer.from(responseData as ArrayBuffer);
		}

		// Create binary data for output
		const binaryData = await this.helpers.prepareBinaryData(
			pdfBuffer,
			fileName,
			'application/pdf',
		);

		// Determine the binary data name
		const binaryDataKey = binaryDataName || 'data';

		return [
			{
				json: {
					fileName,
					mimeType: 'application/pdf',
					fileSize: pdfBuffer.length,
					success: true,
					message: 'HTML converted to PDF successfully',
				},
				binary: {
					[binaryDataKey]: binaryData,
				},
			},
		];
	}

	throw new Error('No response data received from PDF4ME API');
}
