import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

// Declare Node.js globals
declare const Buffer: any;

export async function pdf4meApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	url: string,
	body: any = {},
	method: IHttpRequestMethods = 'POST',
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('pdf4meApi');
	let options: IRequestOptions = {
		baseURL: 'https://api.pdf4me.com',
		url: url,
		headers: {
			'Authorization': `Basic ${credentials.apiKey}`,
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		json: false, // Don't parse as JSON for binary responses
		encoding: null, // For binary responses
		resolveWithFullResponse: true, // Need full response to check status
		simple: false, // Don't throw on non-2xx status codes
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body as IDataObject).length === 0) {
		delete options.body;
	}

	try {
		// Debug: Log authentication info (without exposing the full key)

		const response = await this.helpers.request(options);

		// Check if response is successful
		if (response.statusCode === 200) {
			// Return binary content
			let result;
			if (Buffer.isBuffer(response.body)) {
				result = response.body;
			} else if (typeof response.body === 'string') {
				// If it's a string, it might be an error message
				if (response.body.length < 100) {
					throw new Error(`API returned error message: ${response.body}`);
				}
				// Try to convert from base64 if it's a long string
				try {
					result = Buffer.from(response.body, 'base64');
				} catch (error) {
					throw new Error(`API returned unexpected string response: ${response.body.substring(0, 100)}...`);
				}
			} else {
				result = Buffer.from(response.body, 'binary');
			}

			// Validate the result
			if (!Buffer.isBuffer(result)) {
				throw new Error('Failed to convert response to Buffer');
			}

			return result;
		} else {
			// Error response - try to parse as JSON for error details
			let errorMessage = `HTTP ${response.statusCode}`;
			try {
				const errorJson = JSON.parse(response.body);
				errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
			} catch {
				errorMessage = `${errorMessage}: ${response.body}`;
			}
			throw new Error(errorMessage);
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

// Removed n8nSleep and all artificial delay logic to comply with n8n community guidelines.

export async function pdf4meAsyncRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	url: string,
	body: any = {},
	method: IHttpRequestMethods = 'POST',
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	const credentials = await this.getCredentials('pdf4meApi');

	// Add async flag to body
	const asyncBody = { ...body, async: true };

	// Determine if this is a JSON response operation (like CreateImages)
	const isJsonResponse = url.includes('/CreateImages') || url.includes('/CreateImagesFromPdf');

	let options: IRequestOptions = {
		baseURL: 'https://api.pdf4me.com',
		url: url,
		headers: {
			'Authorization': `Basic ${credentials.apiKey}`,
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body: asyncBody,
		json: isJsonResponse, // Parse as JSON for CreateImages operations
		resolveWithFullResponse: true, // Need full response to get headers
		simple: false, // Don't throw on non-2xx status codes
		encoding: null, // For potential binary response
		timeout: 60000, // 60 second timeout for initial request (increased from 30s)
	};
	options = Object.assign({}, options, option);

	try {
		// Make initial request
		const response = await this.helpers.request(options);

		if (response.statusCode === 200) {
			// Immediate success
			if (isJsonResponse) {
				return response.body;
			} else {
				let result;
				if (Buffer.isBuffer(response.body)) {
					result = response.body;
				} else if (typeof response.body === 'string') {
					if (response.body.length < 100) {
						throw new Error(`API returned error message: ${response.body}`);
					}
					try {
						result = Buffer.from(response.body, 'base64');
					} catch {
						throw new Error(`API returned unexpected string response: ${response.body.substring(0, 100)}...`);
					}
				} else {
					result = Buffer.from(response.body, 'binary');
				}
				if (!Buffer.isBuffer(result)) {
					throw new Error('Failed to convert response to Buffer');
				}
				return result;
			}
		} else if (response.statusCode === 202) {
			// Async processing - instruct user to use Wait node and workflow polling
			const locationUrl = response.headers.location;
			if (!locationUrl) {
				throw new Error('No polling URL found in response');
			}
			// Return a special object to indicate polling is required
			return {
				status: 'processing',
				message: 'Document is still being processed. Use the Wait node and poll the provided URL in your workflow.',
				pollUrl: locationUrl,
				context: {
					// Add any additional context needed for polling
					originalRequest: url,
					method: 'GET',
					isJsonResponse,
				},
			};
		} else {
			let errorMessage = `API Error: ${response.statusCode}`;
			try {
				if (typeof response.body === 'string') {
					const errorJson = JSON.parse(response.body);
					errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
				} else {
					errorMessage = `${errorMessage}: ${response.body}`;
				}
			} catch {
				errorMessage = `${errorMessage}: ${response.body}`;
			}
			throw new Error(errorMessage);
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

export function sanitizeProfiles(data: IDataObject): void {
	// Convert profiles to a trimmed string (or empty string if not provided)
	const profilesValue = data.profiles ? String(data.profiles).trim() : '';

	// If the profiles field is empty, remove it from the payload
	if (!profilesValue) {
		delete data.profiles;
		return;
	}

	try {
		// Wrap profiles in curly braces if they are not already
		let sanitized = profilesValue;
		if (!sanitized.startsWith('{')) {
			sanitized = `{ ${sanitized}`;
		}
		if (!sanitized.endsWith('}')) {
			sanitized = `${sanitized} }`;
		}
		data.profiles = sanitized;
	} catch (error) {
		throw new Error(
			'Invalid JSON in Profiles. Check https://developer.pdf4me.com/ or contact support@pdf4me.com for help. ' +
				(error as Error).message,
		);
	}
}

/**
 * ActionConstants provides a mapping of all supported PDF4ME node operations to their string values.
 * Includes CreatePdfA for PDF/A conversion.
 */
export const ActionConstants = {
	AddAttachmentToPdf: 'Add Attachment To PDF',
	AddFormFieldsToPdf: 'Add Form Fields To PDF',
	FillPdfForm: 'Fill PDF Form',
	AddHtmlHeaderFooter: 'Add HTML Header Footer',
	AddImageStampToPdf: 'Add Image Stamp To PDF',
	AddImageWatermarkToImage: 'Add Image Watermark To Image',
	AddMarginToPdf: 'Add Margin To PDF',
	AddPageNumberToPdf: 'Add Page Number To PDF',
	AddTextStampToPdf: 'Add Text Stamp To PDF',
	AddTextWatermarkToImage: 'Add Text Watermark To Image',
	BarcodeGenerator: 'Barcode Generator',
	ClassifyDocument: 'Classify Document',
	CompressImage: 'Compress Image',
	CompressPdf: 'Compress PDF',
	ConvertFromPDF: 'Convert From PDF',
	ConvertToPdf: 'Convert To PDF',
	ConvertImageFormat: 'Convert Image Format',
	CreateImagesFromPdf: 'Create Images From PDF',
	CropImage: 'Crop Image',
	DeleteBlankPagesFromPdf: 'Delete Blank Pages From PDF',
	DeleteUnwantedPagesFromPdf: 'Delete Unwanted Pages From PDF',
	ExtractPages: 'Extract Pages',
	ExtractPagesFromPdf: 'Extract Pages From PDF',
	ExtractAttachmentFromPdf: 'Extract Attachment From PDF',
	ExtractTextByExpression: 'Extract Text By Expression',
	ExtractTableFromPdf: 'Extract Table From PDF',
	ExtractResources: 'Extract Resources',
	ExtractTextFromWord: 'Extract Text From Word',
	FindAndReplaceText: 'Find And Replace Text',
	ConvertPdfToEditableOcr: 'Convert PDF To Editable PDF Using OCR',
	FlipImage: 'Flip Image',
	GetImageMetadata: 'Get Image Metadata',
	GetPdfMetadata: 'Get PDF Metadata',
	GetDocumentFromPdf4me: 'getDocumentFromPdf4me',
	ImageExtractText: 'Image Extract Text',
	JsonToExcel: 'Json To Excel',
	MergeMultiplePDFs: 'Merge Multiple PDFs',
	OverlayPDFs: 'Overlay PDFs',
	RemoveExifTagsFromImage: 'Remove Exif Tags From Image',
	ReplaceTextWithImage: 'Replace Text With Image',
	ReplaceTextWithImageInWord: 'Replace Text With Image In Word',
	ResizeImage: 'Resize Image',
	RepairPdfDocument: 'Repair PDF Document',
	RotateDocument: 'Rotate Document',
	RotateImage: 'Rotate Image',
	RotateImageByExifData: 'Rotate Image By Exif Data',
	RotatePage: 'Rotate Page',
	SignPdf: 'Sign PDF',
	UrlToPdf: 'URL to PDF',
	UpdateHyperlinksAnnotation: 'Update Hyperlinks Annotation',
	ProtectDocument: 'Protect Document',
	UnlockPdf: 'Unlock PDF',
	DisableTrackingChangesInWord: 'Disable Tracking Changes in Word',
	EnableTrackingChangesInWord: 'Enable Tracking Changes in Word',
	ExtractFormDataFromPdf: 'Extract Form Data From PDF',
	GenerateDocumentSingle: 'Generate Document Single',
	GenerateDocumentsMultiple: 'Generate Documents Multiple',
	GetTrackingChangesInWord: 'Get Tracking Changes in Word',
	ReadBarcodeFromImage: 'Read Barcode From Image',
	CreateSwissQrBill: 'Create Swiss QR Bill',
	SplitPdfRegular: 'Split PDF',
	SplitPdfByBarcode: 'Split PDF By Barcode',
	SplitPdfBySwissQR: 'Split PDF By SwissQR',
	SplitPdfByText: 'Split PDF By Text',
	ReadBarcodeFromPdf: 'Read Barcode From PDF',
	ReadSwissQrCode: 'Read SwissQR Code',
	CreatePdfA: 'Create PDF/A',
	ConvertHtmlToPdf: 'Convert HTML To PDF',
	ConvertWordToPdfForm: 'Convert Word To PDF Form',
	ConvertPdfToWord: 'Convert PDF To Word',
	ConvertPdfToPowerpoint: 'Convert PDF To PowerPoint',
	ConvertMarkdownToPdf: 'Convert Markdown To PDF',
	PdfToExcel: 'PDF To Excel',
	ConvertPdfToExcel: 'Convert PDF To Excel',
	ConvertVisio: 'Convert VISIO',
};
