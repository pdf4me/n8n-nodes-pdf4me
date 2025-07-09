import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { readFileSync } from 'fs';
import { ActionConstants, pdf4meAsyncRequest } from '../GenericFunctions';

export const description: INodeProperties[] = [
	{
		displayName: 'Image Feature',
		name: 'imageFeature',
		type: 'options',
		default: 'addImageWatermark',
		description: 'Select the image feature to use',
		options: [
			{ name: 'Add Image Watermark', value: 'addImageWatermark' },
			{ name: 'Add Text Watermark', value: 'addTextWatermark' },
			{ name: 'Compress Image', value: 'compressImage' },
			{ name: 'Convert Image Format', value: 'convertImageFormat' },
			{ name: 'Create Image From PDF', value: 'createImageFromPdf' },
			{ name: 'Crop Image', value: 'cropImage' },
			{ name: 'Flip Image', value: 'flipImage' },
			{ name: 'Get Image Metadata', value: 'getImageMetadata' },
			{ name: 'Image Extract Text', value: 'imageExtractText' },
			{ name: 'Read Barcode From Image', value: 'readBarcodeFromImage' },
			{ name: 'Remove EXIF Tags From Image', value: 'removeExifTagsFromImage' },
			{ name: 'Replace Text with Image', value: 'replaceTextWithImage' },
			{ name: 'Resize Image', value: 'resizeImage' },
			{ name: 'Rotate Image', value: 'rotateImage' },
			{ name: 'Rotate Image by EXIF Data', value: 'rotateImageByExifData' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
			},
		},
	},
	// Common image input fields
	{
		displayName: 'Input Type',
		name: 'inputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the input image or PDF',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
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
				operation: [ActionConstants.Image],
				inputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'image.jpg or document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
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
				operation: [ActionConstants.Image],
				inputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Input File Name',
		name: 'inputFileName',
		type: 'string',
		default: '',
		placeholder: 'image.jpg or document.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				inputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'File URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/sample.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				inputType: ['url'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'localFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/sample.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				inputType: ['localPath'],
			},
		},
	},
	// Add Image Watermark fields
	{
		displayName: 'Watermark Image Input Type',
		name: 'watermarkInputType',
		type: 'options',
		default: 'binaryData',
		description: 'How to provide the watermark image',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'URL', value: 'url' },
			{ name: 'Local Path', value: 'localPath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	{
		displayName: 'Watermark Binary Property',
		name: 'watermarkBinaryPropertyName',
		type: 'string',
		default: 'watermark',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Watermark File Name',
		name: 'watermarkFileName',
		type: 'string',
		default: '',
		placeholder: 'watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Watermark Base64 Content',
		name: 'watermarkBase64Content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['base64'],
			},
		},
	},
	{
		displayName: 'Watermark File Name',
		name: 'watermarkFileName',
		type: 'string',
		default: '',
		placeholder: 'watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['base64', 'localPath', 'url'],
			},
		},
	},
	{
		displayName: 'Watermark File URL',
		name: 'watermarkFileUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['url'],
			},
		},
	},
	{
		displayName: 'Watermark Local File Path',
		name: 'watermarkLocalFilePath',
		type: 'string',
		default: '',
		placeholder: '/path/to/watermark.png',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				watermarkInputType: ['localPath'],
			},
		},
	},
	{
		displayName: 'Position',
		name: 'position',
		type: 'options',
		default: 'topright',
		description: 'Position of the watermark',
		options: [
			{ name: 'Bottom Left', value: 'bottomleft' },
			{ name: 'Bottom Right', value: 'bottomright' },
			{ name: 'Central Horizontal', value: 'centralhorizontal' },
			{ name: 'Central Vertical', value: 'centralvertical' },
			{ name: 'Custom', value: 'custom' },
			{ name: 'Diagonal', value: 'diagonal' },
			{ name: 'Top Left', value: 'topleft' },
			{ name: 'Top Right', value: 'topright' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 1,
		description: 'Opacity of the watermark (0.0 to 1.0)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	{
		displayName: 'Horizontal Offset',
		name: 'horizontalOffset',
		type: 'number',
		default: 0,
		description: 'Horizontal offset for positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	{
		displayName: 'Vertical Offset',
		name: 'verticalOffset',
		type: 'number',
		default: 0,
		description: 'Vertical offset for positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 0,
		description: 'X position for custom positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 0,
		description: 'Y position for custom positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
				position: ['custom'],
			},
		},
	},
	{
		displayName: 'Rotation',
		name: 'rotation',
		type: 'number',
		default: 0,
		description: 'Rotation angle for watermark',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addImageWatermark'],
			},
		},
	},
	// Add Text Watermark fields
	{
		displayName: 'Watermark Text',
		name: 'watermarkText',
		type: 'string',
		default: 'PDF4me Sample Text',
		description: 'Text to be used as watermark',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Text Position',
		name: 'textPosition',
		type: 'options',
		default: 'bottomleft',
		description: 'Position of the watermark text',
		options: [
			{ name: 'Bottom Left', value: 'bottomleft' },
			{ name: 'Bottom Right', value: 'bottomright' },
			{ name: 'Central Horizontal', value: 'centralhorizontal' },
			{ name: 'Central Vertical', value: 'centralvertical' },
			{ name: 'Custom', value: 'custom' },
			{ name: 'Diagonal', value: 'diagonal' },
			{ name: 'Top Left', value: 'topleft' },
			{ name: 'Top Right', value: 'topright' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Font Family',
		name: 'textFontFamily',
		type: 'string',
		default: 'Arial',
		description: 'Font family for the watermark text',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Font Size',
		name: 'textFontSize',
		type: 'number',
		default: 50,
		description: 'Font size for the watermark text',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Text Colour',
		name: 'textColour',
		type: 'color',
		default: '#b4351a',
		description: 'Text color in hex format',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Bold',
		name: 'isBold',
		type: 'boolean',
		default: true,
		description: 'Whether to make text bold',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Underline',
		name: 'isUnderline',
		type: 'boolean',
		default: false,
		description: 'Whether to underline text',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Italic',
		name: 'isItalic',
		type: 'boolean',
		default: true,
		description: 'Whether to make text italic',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Opacity',
		name: 'opacity',
		type: 'number',
		default: 1,
		description: 'Opacity of the watermark text (0.0 to 1.0)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Rotation Angle',
		name: 'rotationAngle',
		type: 'number',
		default: 0,
		description: 'Rotation angle for the watermark text',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
			},
		},
	},
	{
		displayName: 'Position X',
		name: 'positionX',
		type: 'number',
		default: 0,
		description: 'X position for custom positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
				textPosition: ['custom'],
			},
		},
	},
	{
		displayName: 'Position Y',
		name: 'positionY',
		type: 'number',
		default: 0,
		description: 'Y position for custom positioning',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['addTextWatermark'],
				textPosition: ['custom'],
			},
		},
	},
	// Compress Image fields
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		default: 'JPG',
		description: 'Output image format',
		options: [
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['compressImage'],
			},
		},
	},
	{
		displayName: 'Compression Level',
		name: 'compressionLevel',
		type: 'options',
		default: 'Medium',
		options: [
			{ name: 'Max', value: 'Max' },
			{ name: 'Medium', value: 'Medium' },
			{ name: 'Low', value: 'Low' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['compressImage'],
			},
		},
	},
	// Convert Image Format fields
	{
		displayName: 'Current Image Format',
		name: 'currentImageFormat',
		type: 'options',
		default: 'JPG',
		description: 'Current format of the image',
		options: [
			{ name: 'BMP', value: 'BMP' },
			{ name: 'GIF', value: 'GIF' },
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
			{ name: 'TIFF', value: 'TIFF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['convertImageFormat'],
			},
		},
	},
	{
		displayName: 'New Image Format',
		name: 'newImageFormat',
		type: 'options',
		default: 'PNG',
		description: 'Format to convert the image to',
		options: [
			{ name: 'BMP', value: 'BMP' },
			{ name: 'GIF', value: 'GIF' },
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
			{ name: 'TIFF', value: 'TIFF' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['convertImageFormat'],
			},
		},
	},
	// Create Image from PDF fields
	{
		displayName: 'Image Extension',
		name: 'imageExtension',
		type: 'options',
		default: 'jpeg',
		description: 'Output image extension/format',
		options: [
			{ name: 'BMP', value: 'bmp' },
			{ name: 'GIF', value: 'gif' },
			{ name: 'JB2', value: 'jb2' },
			{ name: 'JP2', value: 'jp2' },
			{ name: 'JPEG', value: 'jpeg' },
			{ name: 'JPF', value: 'jpf' },
			{ name: 'JPG', value: 'jpg' },
			{ name: 'JPX', value: 'jpx' },
			{ name: 'PNG', value: 'png' },
			{ name: 'TIF', value: 'tif' },
			{ name: 'TIFF', value: 'tiff' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['createImageFromPdf'],
			},
		},
	},
	{
		displayName: 'Width (Pixels)',
		name: 'widthPixel',
		type: 'number',
		default: 800,
		description: 'Width of the output image in pixels',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['createImageFromPdf'],
			},
		},
	},
	{
		displayName: 'Page Numbers',
		name: 'pageNumbers',
		type: 'string',
		default: '',
		description: 'Page numbers to convert (e.g. "1", "1,3,5", "2-5", "1,3,7-10", "2-")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['createImageFromPdf'],
			},
		},
	},
	// Flip Image fields
	{
		displayName: 'Orientation Type',
		name: 'orientationType',
		type: 'options',
		default: 'Vertical',
		description: 'Orientation to flip the image',
		options: [
			{ name: 'Horizontal', value: 'Horizontal' },
			{ name: 'Vertical', value: 'Vertical' },
			{ name: 'Horizontal and Vertical', value: 'HorizontalAndVertical' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['flipImage'],
			},
		},
	},
	// Get Image Metadata fields
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		default: 'PNG',
		description: 'Type of the image',
		options: [
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['getImageMetadata'],
			},
		},
	},
	// Read Barcode from Image fields
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		default: 'JPG',
		description: 'Type of the image',
		options: [
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['readBarcodeFromImage'],
			},
		},
	},
	// Remove EXIF Tags from Image fields
	{
		displayName: 'Image Type',
		name: 'imageType',
		type: 'options',
		default: 'JPG',
		description: 'Type of the image',
		options: [
			{ name: 'JPG', value: 'JPG' },
			{ name: 'PNG', value: 'PNG' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['removeExifTagsFromImage'],
			},
		},
	},
	// Replace Text with Image fields
	{
		displayName: 'Replace Text',
		name: 'replaceText',
		type: 'string',
		default: '',
		description: 'Text to be replaced with image',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['replaceTextWithImage'],
			},
		},
	},
	{
		displayName: 'Page Sequence',
		name: 'pageSequence',
		type: 'string',
		default: 'all',
		description: 'Pages to replace text on (e.g. "all", "1", "1,3,5", "2-5")',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['replaceTextWithImage'],
			},
		},
	},
	{
		displayName: 'Image Height',
		name: 'imageHeight',
		type: 'number',
		default: 50,
		description: 'Height of the replacement image',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['replaceTextWithImage'],
			},
		},
	},
	{
		displayName: 'Image Width',
		name: 'imageWidth',
		type: 'number',
		default: 100,
		description: 'Width of the replacement image',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['replaceTextWithImage'],
			},
		},
	},
	// Resize Image fields
	{
		displayName: 'Image Resize Type',
		name: 'imageResizeType',
		type: 'options',
		default: 'Percentage',
		description: 'How to resize the image',
		options: [
			{ name: 'Percentage', value: 'Percentage' },
			{ name: 'Specific', value: 'Specific' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['resizeImage'],
			},
		},
	},
	{
		displayName: 'Resize Percentage',
		name: 'resizePercentage',
		type: 'string',
		default: '50.0',
		description: 'Resize percentage (only for Percentage type)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['resizeImage'],
				imageResizeType: ['Percentage'],
			},
		},
	},
	{
		displayName: 'Width',
		name: 'width',
		type: 'number',
		default: 800,
		description: 'Width in pixels (only for Specific type)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['resizeImage'],
				imageResizeType: ['Specific'],
			},
		},
	},
	{
		displayName: 'Height',
		name: 'height',
		type: 'number',
		default: 600,
		description: 'Height in pixels (only for Specific type)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['resizeImage'],
				imageResizeType: ['Specific'],
			},
		},
	},
	{
		displayName: 'Maintain Aspect Ratio',
		name: 'maintainAspectRatio',
		type: 'boolean',
		default: true,
		description: 'Whether to maintain aspect ratio',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['resizeImage'],
			},
		},
	},
	// Rotate Image fields
	{
		displayName: 'Background Color',
		name: 'backgroundColor',
		type: 'color',
		default: '#FFFFFF',
		description: 'Background color for rotation (hex)',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['rotateImage'],
			},
		},
	},
	{
		displayName: 'Proportionate Resize',
		name: 'proportionateResize',
		type: 'boolean',
		default: true,
		description: 'Whether to maintain proportions during rotation',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['rotateImage'],
			},
		},
	},
	{
		displayName: 'Rotation Angle',
		name: 'rotationAngle',
		type: 'number',
		default: 90,
		description: 'Rotation angle in degrees',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['rotateImage'],
			},
		},
	},
	// Crop Image fields
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		default: 'binaryData',
		description: 'Choose how to provide the image file to crop',
		options: [
			{ name: 'Binary Data', value: 'binaryData' },
			{ name: 'Base64 String', value: 'base64' },
			{ name: 'File Path', value: 'filePath' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		description: 'Name of the binary property that contains the image file',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Image Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: { alwaysOpenEditWindow: true },
		default: '',
		description: 'Base64 encoded image content',
		placeholder: '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYI...',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Local File Path',
		name: 'filePath',
		type: 'string',
		default: '',
		description: 'Local file path to the image file to crop',
		placeholder: '/path/to/image.jpg',
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
				inputDataType: ['filePath'],
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
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
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
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
			},
		},
	},
	{
		displayName: 'Crop Type',
		name: 'cropType',
		type: 'options',
		default: 'Border',
		description: 'Type of cropping to perform',
		options: [
			{ name: 'Border', value: 'Border' },
			{ name: 'Rectangle', value: 'Rectangle' },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
			},
		},
	},
	{
		displayName: 'Border Cropping Options',
		name: 'borderOptions',
		type: 'collection',
		placeholder: 'Add Border Option',
		default: {},
		options: [
			{ displayName: 'Left Border', name: 'leftBorder', type: 'number', default: 10, description: 'Number of pixels to crop from the left border', typeOptions: { minValue: 0, maxValue: 10000 } },
			{ displayName: 'Right Border', name: 'rightBorder', type: 'number', default: 10, description: 'Number of pixels to crop from the right border', typeOptions: { minValue: 0, maxValue: 10000 } },
			{ displayName: 'Top Border', name: 'topBorder', type: 'number', default: 20, description: 'Number of pixels to crop from the top border', typeOptions: { minValue: 0, maxValue: 10000 } },
			{ displayName: 'Bottom Border', name: 'bottomBorder', type: 'number', default: 20, description: 'Number of pixels to crop from the bottom border', typeOptions: { minValue: 0, maxValue: 10000 } },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
				cropType: ['Border'],
			},
		},
	},
	{
		displayName: 'Rectangle Cropping Options',
		name: 'rectangleOptions',
		type: 'collection',
		placeholder: 'Add Rectangle Option',
		default: {},
		options: [
			{ displayName: 'Upper Left X', name: 'upperLeftX', type: 'number', default: 10, description: 'X coordinate of the upper left corner of the crop rectangle', typeOptions: { minValue: 0, maxValue: 10000 } },
			{ displayName: 'Upper Left Y', name: 'upperLeftY', type: 'number', default: 10, description: 'Y coordinate of the upper left corner of the crop rectangle', typeOptions: { minValue: 0, maxValue: 10000 } },
			{ displayName: 'Width', name: 'width', type: 'number', default: 50, description: 'Width of the crop rectangle in pixels', typeOptions: { minValue: 1, maxValue: 10000 } },
			{ displayName: 'Height', name: 'height', type: 'number', default: 50, description: 'Height of the crop rectangle in pixels', typeOptions: { minValue: 1, maxValue: 10000 } },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
				cropType: ['Rectangle'],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{ displayName: 'Custom Profiles', name: 'profiles', type: 'string', default: '', description: 'Use "JSON" to adjust custom properties. Review Profiles at https://dev.pdf4me.com/apiv2/documentation/ to set extra options for API calls.', placeholder: `{ 'outputDataFormat': 'base64' }` },
		],
		displayOptions: {
			show: {
				operation: [ActionConstants.Image],
				imageFeature: ['cropImage'],
			},
		},
	},
];

// The execute function will be implemented following the same pattern as other actions, handling each feature and calling the correct PDF4me API endpoint.

export async function execute(this: IExecuteFunctions, itemIndex: number) {
	const items = this.getInputData();
	const item = items[itemIndex];
	const imageFeature = this.getNodeParameter('imageFeature', itemIndex) as string;

	// Helper to get file content (binary, base64, url, localPath)
	function getFileContent(this: IExecuteFunctions, paramPrefix: string) {
		const inputType = this.getNodeParameter(paramPrefix + 'InputType', itemIndex, 'binaryData') as string;
		if (inputType === 'binaryData') {
			const binaryPropertyName = this.getNodeParameter(paramPrefix + 'BinaryPropertyName', itemIndex, 'data') as string;
			if (!item.binary || !item.binary[binaryPropertyName]) {
				throw new Error(`No binary data property '${binaryPropertyName}' found on input item!`);
			}
			const fileBuffer = item.binary[binaryPropertyName].data;
			return Buffer.from(fileBuffer, 'base64').toString('base64');
		} else if (inputType === 'base64') {
			return this.getNodeParameter(paramPrefix + 'Base64Content', itemIndex) as string;
		} else if (inputType === 'url') {
			const url = this.getNodeParameter(paramPrefix + 'FileUrl', itemIndex) as string;
			const res = require('sync-request')('GET', url);
			return Buffer.from(res.getBody()).toString('base64');
		} else if (inputType === 'localPath') {
			const path = this.getNodeParameter(paramPrefix + 'LocalFilePath', itemIndex) as string;
			return Buffer.from(readFileSync(path)).toString('base64');
		}
		throw new Error('Unsupported input type');
	}

	let payload: any = {};
	let endpoint = '';

	if (imageFeature === 'addImageWatermark') {
		endpoint = '/api/v2/AddImageWatermarkToImage';
		const docContent = getFileContent.call(this, '');
		const watermarkContent = getFileContent.call(this, 'watermark');
		payload = {
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			docContent,
			WatermarkFileName: this.getNodeParameter('watermarkFileName', itemIndex, 'watermark.png'),
			WatermarkFileContent: watermarkContent,
			Position: this.getNodeParameter('position', itemIndex, 'topright'),
			Opacity: this.getNodeParameter('opacity', itemIndex, 1),
			HorizontalOffset: this.getNodeParameter('horizontalOffset', itemIndex, 0),
			VerticalOffset: this.getNodeParameter('verticalOffset', itemIndex, 0),
			PositionX: this.getNodeParameter('positionX', itemIndex, 0),
			PositionY: this.getNodeParameter('positionY', itemIndex, 0),
			Rotation: this.getNodeParameter('rotation', itemIndex, 0),
			async: true,
		};
	} else if (imageFeature === 'addTextWatermark') {
		endpoint = '/api/v2/AddTextWatermarkToImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			docContent,
			WatermarkText: this.getNodeParameter('watermarkText', itemIndex, 'PDF4me Sample Text'),
			TextPosition: this.getNodeParameter('textPosition', itemIndex, 'bottomleft'),
			TextFontFamily: this.getNodeParameter('textFontFamily', itemIndex, 'Arial'),
			TextFontSize: this.getNodeParameter('textFontSize', itemIndex, 50),
			TextColour: this.getNodeParameter('textColour', itemIndex, '#b4351a'),
			IsBold: this.getNodeParameter('isBold', itemIndex, true),
			IsUnderline: this.getNodeParameter('isUnderline', itemIndex, false),
			IsItalic: this.getNodeParameter('isItalic', itemIndex, true),
			Opacity: this.getNodeParameter('opacity', itemIndex, 1),
			RotationAngle: this.getNodeParameter('rotationAngle', itemIndex, 0),
			PositionX: this.getNodeParameter('positionX', itemIndex, 0),
			PositionY: this.getNodeParameter('positionY', itemIndex, 0),
			async: true,
		};
	} else if (imageFeature === 'compressImage') {
		endpoint = '/api/v2/CompressImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			imageType: this.getNodeParameter('imageType', itemIndex, 'JPG'),
			compressionLevel: this.getNodeParameter('compressionLevel', itemIndex, 'Medium'),
			async: true,
		};
	} else if (imageFeature === 'convertImageFormat') {
		endpoint = '/api/v2/ConvertImageFormat';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			currentImageFormat: this.getNodeParameter('currentImageFormat', itemIndex, 'JPG'),
			newImageFormat: this.getNodeParameter('newImageFormat', itemIndex, 'PNG'),
			async: true,
		};
	} else if (imageFeature === 'createImageFromPdf') {
		endpoint = '/api/v2/CreateImages';
		const docContent = getFileContent.call(this, '');
		const imageExtension = this.getNodeParameter('imageExtension', itemIndex, 'jpeg');
		const widthPixelRaw = this.getNodeParameter('widthPixel', itemIndex, 800);
		const widthPixel = widthPixelRaw != null ? widthPixelRaw : 800;
		let pageNumbers = this.getNodeParameter('pageNumbers', itemIndex, '');
		if (typeof pageNumbers !== 'string') pageNumbers = String(pageNumbers);
		payload = {
			docContent,
			docname: this.getNodeParameter('inputFileName', itemIndex, 'document.pdf'),
			imageAction: {
				WidthPixel: widthPixel.toString(),
				ImageExtension: imageExtension,
				PageSelection: pageNumbers ? { PageNrs: pageNumbers.split(',').map((n: string) => parseInt(n.trim(), 10)).filter((n: number) => !isNaN(n)) } : undefined,
			},
			pageNrs: pageNumbers,
			async: true,
		};
	} else if (imageFeature === 'flipImage') {
		endpoint = '/api/v2/FlipImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			orientationType: this.getNodeParameter('orientationType', itemIndex, 'Vertical'),
			async: true,
		};
	} else if (imageFeature === 'getImageMetadata') {
		endpoint = '/api/v2/GetImageMetadata';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.png'),
			imageType: this.getNodeParameter('imageType', itemIndex, 'PNG'),
			async: true,
		};
	} else if (imageFeature === 'imageExtractText') {
		endpoint = '/api/v2/ImageExtractText';
		const docContent = getFileContent.call(this, '');
		payload = {
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			docContent,
			async: true,
		};
	} else if (imageFeature === 'readBarcodeFromImage') {
		endpoint = '/api/v2/ReadBarcodesfromImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			docContent,
			imageType: this.getNodeParameter('imageType', itemIndex, 'JPG'),
			async: true,
		};
	} else if (imageFeature === 'removeExifTagsFromImage') {
		endpoint = '/api/v2/RemoveEXIFTagsFromImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			imageType: this.getNodeParameter('imageType', itemIndex, 'JPG'),
			async: true,
		};
	} else if (imageFeature === 'replaceTextWithImage') {
		endpoint = '/api/v2/ReplaceTextWithImage';
		const docContent = getFileContent.call(this, '');
		const imageContent = getFileContent.call(this, 'image');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'document.pdf'),
			replaceText: this.getNodeParameter('replaceText', itemIndex, ''),
			pageSequence: this.getNodeParameter('pageSequence', itemIndex, 'all'),
			imageContent,
			imageHeight: this.getNodeParameter('imageHeight', itemIndex, 50),
			imageWidth: this.getNodeParameter('imageWidth', itemIndex, 100),
			async: true,
		};
	} else if (imageFeature === 'resizeImage') {
		endpoint = '/api/v2/ResizeImage';
		const docContent = getFileContent.call(this, '');
		const imageResizeType = this.getNodeParameter('imageResizeType', itemIndex, 'Percentage');
		payload = {
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.jpg'),
			docContent,
			ImageResizeType: imageResizeType,
			ResizePercentage: imageResizeType === 'Percentage' ? this.getNodeParameter('resizePercentage', itemIndex, '50.0') : undefined,
			Width: imageResizeType === 'Specific' ? this.getNodeParameter('width', itemIndex, 800) : undefined,
			Height: imageResizeType === 'Specific' ? this.getNodeParameter('height', itemIndex, 600) : undefined,
			MaintainAspectRatio: this.getNodeParameter('maintainAspectRatio', itemIndex, true),
			async: true,
		};
	} else if (imageFeature === 'rotateImageByExifData') {
		endpoint = '/api/v2/RotateImageByExifData';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.png'),
			async: true,
		};
	} else if (imageFeature === 'rotateImage') {
		endpoint = '/api/v2/RotateImage';
		const docContent = getFileContent.call(this, '');
		payload = {
			docContent,
			docName: this.getNodeParameter('inputFileName', itemIndex, 'image.png'),
			Backgroundcolor: this.getNodeParameter('backgroundColor', itemIndex, '#FFFFFF'),
			ProportionateResize: this.getNodeParameter('proportionateResize', itemIndex, true),
			RotationAngle: this.getNodeParameter('rotationAngle', itemIndex, 90),
			async: true,
		};
	} else if (imageFeature === 'cropImage') {
		// Crop Image logic from cropImage.ts
		const inputDataType = this.getNodeParameter('inputDataType', itemIndex) as string;
		const outputFileName = this.getNodeParameter('outputFileName', itemIndex) as string;
		const docName = this.getNodeParameter('docName', itemIndex) as string;
		const cropType = this.getNodeParameter('cropType', itemIndex) as string;
		let borderOptions: any = {};
		let rectangleOptions: any = {};
		if (cropType === 'Border') {
			borderOptions = this.getNodeParameter('borderOptions', itemIndex) as any;
		} else if (cropType === 'Rectangle') {
			rectangleOptions = this.getNodeParameter('rectangleOptions', itemIndex) as any;
		}
		const advancedOptions = this.getNodeParameter('advancedOptions', itemIndex) as any;
		let docContent: string;
		let originalFileName = docName;
		if (inputDataType === 'binaryData') {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
			if (!item.binary || !item.binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}'`);
			}
			const binaryData = item.binary[binaryPropertyName];
			const buffer = Buffer.from(binaryData.data, 'base64');
			docContent = buffer.toString('base64');
			if (binaryData.fileName) {
				originalFileName = binaryData.fileName;
			}
		} else if (inputDataType === 'base64') {
			docContent = this.getNodeParameter('base64Content', itemIndex) as string;
			if (docContent.includes(',')) {
				docContent = docContent.split(',')[1];
			}
		} else if (inputDataType === 'filePath') {
			const filePath = this.getNodeParameter('filePath', itemIndex) as string;
			const fs = require('fs');
			const fileBuffer = fs.readFileSync(filePath);
			docContent = fileBuffer.toString('base64');
			const pathParts = filePath.replace(/\\/g, '/').split('/');
			originalFileName = pathParts[pathParts.length - 1];
		} else {
			throw new Error(`Unsupported input data type: ${inputDataType}`);
		}
		if (!docContent || docContent.trim() === '') {
			throw new Error('Image content is required');
		}
		const body: any = {
			docContent,
			docName: originalFileName,
			CropType: cropType,
		};
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
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;
		// sanitizeProfiles(body); // If needed, import and use
		const responseData = await pdf4meAsyncRequest.call(this, `/api/v2/CropImage?schemaVal=${cropType}`, body);
		if (responseData) {
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				const baseName = originalFileName ? originalFileName.replace(/\.[^.]*$/, '') : 'cropped_image';
				const extension = originalFileName ? originalFileName.split('.').pop() || 'jpg' : 'jpg';
				fileName = `${baseName}_cropped.${extension}`;
			}
			if (!fileName.includes('.')) {
				const extension = originalFileName ? originalFileName.split('.').pop() || 'jpg' : 'jpg';
				fileName = `${fileName}.${extension}`;
			}
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
			let imageBuffer: any;
			if (Buffer.isBuffer(responseData)) {
				imageBuffer = responseData;
			} else if (typeof responseData === 'string') {
				imageBuffer = Buffer.from(responseData, 'base64');
			} else {
				imageBuffer = Buffer.from(responseData as any);
			}
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
						data: binaryData,
					},
				},
			];
		}
		throw new Error('No response data received from PDF4ME API');
	}

	const response = await pdf4meAsyncRequest.call(this, endpoint, payload);
	return this.helpers.returnJsonArray([response]);
}
