import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	sanitizeProfiles,
	ActionConstants,
	pdf4meAsyncRequest,
} from '../GenericFunctions';




export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the image file to crop',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use image file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide image content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to image file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Image Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded image content',
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Image URL',
		name: 'imageUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the image file to crop',
		placeholder: 'https://example.com/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',

		default: 'cropped_image.jpg',
		description: 'Name for the output cropped image file',
		placeholder: 'my-cropped-image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',

		default: 'image.jpg',
		description: 'Name of the source image file for reference',
		placeholder: 'original-image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
			},
		},
	},
	{
		displayName: 'Crop Type',
		name: 'cropType',
		type: 'options',

		default: 'Border',
		description: 'Type of cropping to perform',
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
			},
		},
		options: [
			{
				name: 'Border',
				value: 'Border',
				description: 'Crop by removing borders from all sides',
			},
			{
				name: 'Rectangle',
				value: 'Rectangle',
				description: 'Crop to a specific rectangular area',
			},
		],
	},
	{
		displayName: 'Border Cropping Options',
		name: 'borderOptions',
		type: 'collection',
		placeholder: 'Add Border Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
				cropType: ['Border'],
			},
		},
		options: [
			{
				displayName: 'Left Border',
				name: 'leftBorder',
				type: 'number',
				default: 10,
				description: 'Number of pixels to crop from the left border',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Right Border',
				name: 'rightBorder',
				type: 'number',
				default: 10,
				description: 'Number of pixels to crop from the right border',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Top Border',
				name: 'topBorder',
				type: 'number',
				default: 20,
				description: 'Number of pixels to crop from the top border',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Bottom Border',
				name: 'bottomBorder',
				type: 'number',
				default: 20,
				description: 'Number of pixels to crop from the bottom border',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
		],
	},
	{
		displayName: 'Rectangle Cropping Options',
		name: 'rectangleOptions',
		type: 'collection',
		placeholder: 'Add Rectangle Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.CropImage],
				cropType: ['Rectangle'],
			},
		},
		options: [
			{
				displayName: 'Upper Left X',
				name: 'upperLeftX',
				type: 'number',
				default: 10,
				description: 'X coordinate of the upper left corner of the crop rectangle',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Upper Left Y',
				name: 'upperLeftY',
				type: 'number',
				default: 10,
				description: 'Y coordinate of the upper left corner of the crop rectangle',
				typeOptions: {
					minValue: 0,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Width',
				name: 'width',
				type: 'number',
				default: 50,
				description: 'Width of the crop rectangle in pixels',
				typeOptions: {
					minValue: 1,
					maxValue: 10000,
				},
			},
			{
				displayName: 'Height',
				name: 'height',
				type: 'number',
				default: 50,
				description: 'Height of the crop rectangle in pixels',
				typeOptions: {
					minValue: 1,
					maxValue: 10000,
				},
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
				operation: [ActionConstants.CropImage],
			},
		},
		options: [
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const cropType = this.getNodeParameter('cropType', index) as string;

	// Only get the relevant options based on crop type
	let borderOptions: IDataObject = {};
	let rectangleOptions: IDataObject = {};

	if (cropType === 'Border') {
		borderOptions = this.getNodeParameter('borderOptions', index) as IDataObject;
	} else if (cropType === 'Rectangle') {
		rectangleOptions = this.getNodeParameter('rectangleOptions', index) as IDataObject;
	}

	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get image content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
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
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: imageUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		originalFileName = imageUrl.split('/').pop() || outputFileName;
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate base64 content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Image content is required');
	}

	// Build the request body
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		CropType: cropType,
		IsAsync: true
	};

	// Add crop-specific parameters
	if (cropType === 'Border') {
		body.LeftBorder = String(borderOptions?.leftBorder !== undefined ? borderOptions.leftBorder : 10);
		body.RightBorder = String(borderOptions?.rightBorder !== undefined ? borderOptions.rightBorder : 10);
		body.TopBorder = String(borderOptions?.topBorder !== undefined ? borderOptions.topBorder : 20);
		body.BottomBorder = String(borderOptions?.bottomBorder !== undefined ? borderOptions.bottomBorder : 20);
	} else if (cropType === 'Rectangle') {
		body.UpperLeftX = rectangleOptions?.upperLeftX !== undefined ? rectangleOptions.upperLeftX : 10;
		body.UpperLeftY = rectangleOptions?.upperLeftY !== undefined ? rectangleOptions.upperLeftY : 10;
		body.Width = rectangleOptions?.width !== undefined ? rectangleOptions.width : 50;
		body.Height = rectangleOptions?.height !== undefined ? rectangleOptions.height : 50;
	}

	// Add profiles if provided
	const profiles = advancedOptions?.profiles as string | undefined;
	if (profiles) body.profiles = profiles;

	sanitizeProfiles(body);

	// Use generic async request function with query parameter
	const responseData = await pdf4meAsyncRequest.call(
		this,
		`/api/v2/CropImage?schemaVal=${cropType}`,
		body,
		'POST',
	);

	// Handle the binary response (cropped image data)
	if (responseData) {
		// Generate filename if not provided
		let fileName = outputFileName;
		if (!fileName || fileName.trim() === '') {
			// Extract name from original filename if available, otherwise use default
			const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'cropped_image';
			const extension = originalFileName ? originalFileName.split('.').pop() || 'jpg' : 'jpg';
			fileName = `${baseName}_cropped.${extension}`;
		}

		// Ensure proper extension based on original file or default to jpg
		if (!fileName.includes('.')) {
			const extension = originalFileName ? originalFileName.split('.').pop() || 'jpg' : 'jpg';
			fileName = `${fileName}.${extension}`;
		}

		// Determine MIME type based on file extension
		const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
		const mimeTypeMap: { [key: string]: string } = {
			'jpg': 'image/jpeg',
			'jpeg': 'image/jpeg',
			'png': 'image/png',
			'gif': 'image/gif',
			'bmp': 'image/bmp',
			'webp': 'image/webp',
			'tiff': 'image/tiff',
			'svg': 'image/svg+xml',
		};
		const mimeType = mimeTypeMap[extension] || 'image/jpeg';

		// Ensure responseData is a Buffer
		let imageBuffer: any;
		if (responseData instanceof Buffer) {
			imageBuffer = responseData;
		} else if (typeof responseData === 'string') {
			// If it's a base64 string, convert to buffer
			imageBuffer = Buffer.from(responseData, 'base64');
		} else {
			// If it's already binary data, convert to buffer
			imageBuffer = Buffer.from(responseData as any);
		}

		// Create binary data for output using n8n's helper
		const binaryData = await this.helpers.prepareBinaryData(
			imageBuffer,
			fileName,
			mimeType,
		);

		return [
			{
				json: {
					fileName,
					mimeType,
					fileSize: imageBuffer.length,
					success: true,
					cropType,
					originalFileName,
					message: 'Image cropped successfully',
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
