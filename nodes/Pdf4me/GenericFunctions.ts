import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	JsonObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export async function pdf4meApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	url: string,
	body: any = {},
	method: IHttpRequestMethods = 'POST',
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	// Determine if this is a JSON response operation (AI processing endpoints)
	const isJsonResponse = url.includes('/ProcessInvoice') || url.includes('/ProcessHealthCard') ||
		url.includes('/ProcessContract') || url.includes('/ParseDocument') ||
		url.includes('/ClassifyDocument');

	let options: IHttpRequestOptions = {
		baseURL: 'https://api.pdf4me.com',
		url: url,
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body,
		json: isJsonResponse, // Parse as JSON for AI processing operations
		encoding: isJsonResponse ? undefined : 'arraybuffer' as const, // Use default encoding for JSON, arraybuffer for binary
		returnFullResponse: true, // Need full response to check status
		ignoreHttpStatusErrors: true, // Don't throw on non-2xx status codes
	};
	options = Object.assign({}, options, option);
	if (Object.keys(options.body as IDataObject).length === 0) {
		delete options.body;
	}

	try {
		// Debug: Log authentication info (without exposing the full key)

		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: `${options.baseURL}${options.url}`,
			method: options.method,
			headers: options.headers,
			body: options.body,
			qs: options.qs,
			encoding: isJsonResponse ? undefined : 'arraybuffer' as const,
			// SSL validation is handled by n8n's httpRequestWithAuthentication
			returnFullResponse: options.returnFullResponse,
			json: options.json,
		});

		// Check if response is successful
		if (response.statusCode === 200) {
			// For JSON responses (AI processing), return the parsed JSON directly
			if (isJsonResponse) {
				return response.body; // Already parsed when json: true is set
			}
			
			// For binary responses, return binary content
			if (response.body instanceof Buffer) {
				return response.body;
			} else if (typeof response.body === 'string') {
				// If it's a string, it might be an error message
				if (response.body.length < 100) {
					throw new Error(`API returned error message: ${response.body}`);
				}
				// Try to convert from base64 if it's a long string
				try {
					return Buffer.from(response.body, 'base64');
				} catch (error) {
					throw new Error(`API returned unexpected string response: ${response.body.substring(0, 100)}...`);
				}
			} else {
				return Buffer.from(response.body, 'binary');
			}
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
	// Add async flag to body
	const asyncBody = { ...body, async: true };

	// Determine if this is a JSON response operation (like CreateImages, AI processing)
	const isJsonResponse = url.includes('/CreateImages') || url.includes('/CreateImagesFromPdf') ||
		url.includes('/ProcessInvoice') || url.includes('/ProcessHealthCard') ||
		url.includes('/ProcessContract') || url.includes('/ParseDocument') ||
		url.includes('/ClassifyDocument');

	let options: IHttpRequestOptions = {
		baseURL: 'https://api.pdf4me.com',
		url: url,
		headers: {
			'Content-Type': 'application/json',
		},
		method,
		qs,
		body: asyncBody,
		json: isJsonResponse, // Parse as JSON for CreateImages operations
		returnFullResponse: true, // Need full response to get headers
		ignoreHttpStatusErrors: true, // Don't throw on non-2xx status codes
		encoding: 'arraybuffer' as const, // For potential binary response
		timeout: 60000, // 60 second timeout for initial request (increased from 30s)
	};
	options = Object.assign({}, options, option);

	try {
		// Make initial request
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: `${options.baseURL}${options.url}`,
			method: options.method,
			headers: options.headers,
			body: options.body,
			qs: options.qs,
			encoding: isJsonResponse ? undefined : 'arraybuffer' as const,
			// SSL validation is handled by n8n's httpRequestWithAuthentication
			returnFullResponse: options.returnFullResponse,
			json: options.json,
			timeout: options.timeout,
		});

		if (response.statusCode === 200) {
			// Immediate success
			if (isJsonResponse) {
				return response.body; // Already parsed when json: true is set
			} else {
				// Handle binary response
				if (response.body instanceof Buffer) {
					return response.body;
				} else if (typeof response.body === 'string') {
					if (response.body.length < 100) {
						throw new Error(`API returned error message: ${response.body}`);
					}
					try {
						return Buffer.from(response.body, 'base64');
					} catch {
						throw new Error(`API returned unexpected string response: ${response.body.substring(0, 100)}...`);
					}
				} else {
					return Buffer.from(response.body, 'binary');
				}
			}
		} else if (response.statusCode === 202) {
			// Async processing - start polling
			const locationUrl = response.headers.location;
			if (!locationUrl) {
				throw new Error('No polling URL found in response');
			}

			// Poll the location URL until completion
			return await pollForCompletion.call(this, locationUrl, isJsonResponse);
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
	AddBarcodeToPdf: 'Add Barcode To PDF',
	AddFormFieldsToPdf: 'Add Form Fields To PDF',
	FillPdfForm: 'Fill PDF Form',
	AddHtmlHeaderFooter: 'Add HTML Header Footer',
	AddImageStampToPdf: 'Add Image Stamp To PDF',
	AddImageWatermarkToImage: 'Add Image Watermark To Image',
	AddMarginToPdf: 'Add Margin To PDF',
	AddPageNumberToPdf: 'Add Page Number To PDF',
	AddTextStampToPdf: 'Add Text Stamp To PDF',
	AddTextWatermarkToImage: 'Add Text Watermark To Image',
	AiInvoiceParser: 'AI-Invoice Parser',
	AiProcessHealthCard: 'AI-Process HealthCard',
	AiProcessContract: 'AI-Process Contract',
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
	UploadFile: 'Upload Files to Pdf4me',
	ParseDocument: 'Parse Document',
	LinearizePdf: 'Linearize PDF',
	FlattenPdf: 'Flatten PDF',
};

async function pollForCompletion(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	locationUrl: string,
	isJsonResponse: boolean,
	maxRetries: number = 5,
): Promise<any> {
	let retryCount = 0;

	while (retryCount < maxRetries) {
		try {
			// No artificial delays - immediate polling for n8n compliance
			// Make polling request
			const pollResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
				url: locationUrl,
				method: 'GET',
				encoding: isJsonResponse ? undefined : 'arraybuffer' as const,
				returnFullResponse: true,
				json: isJsonResponse,
				ignoreHttpStatusErrors: true,
			});

			if (pollResponse.statusCode === 200) {
				// Success - return the final result
				if (isJsonResponse) {
					return pollResponse.body; // Already parsed when json: true is set
				} else {
					// Handle binary response
					if (pollResponse.body instanceof Buffer) {
						return pollResponse.body;
					} else if (typeof pollResponse.body === 'string') {
						if (pollResponse.body.length < 100) {
							throw new Error(`API returned error message: ${pollResponse.body}`);
						}
						try {
							return Buffer.from(pollResponse.body, 'base64');
						} catch {
							throw new Error(`API returned unexpected string response: ${pollResponse.body.substring(0, 100)}...`);
						}
					} else {
						return Buffer.from(pollResponse.body, 'binary');
					}
				}
			} else if (pollResponse.statusCode === 202) {
				// Still processing, continue polling
				retryCount++;
				continue;
			} else if (pollResponse.statusCode === 404) {
				// Job not found or expired
				throw new Error('Processing job not found or expired. The document processing may have timed out.');
			} else {
				// Other error
				let errorMessage = `Polling failed with status ${pollResponse.statusCode}`;
				try {
					if (typeof pollResponse.body === 'string') {
						const errorJson = JSON.parse(pollResponse.body);
						errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
					} else {
						errorMessage = `${errorMessage}: ${pollResponse.body}`;
					}
				} catch {
					errorMessage = `${errorMessage}: ${pollResponse.body}`;
				}
				throw new Error(errorMessage);
			}
		} catch (error) {
			// If it's a network error, retry immediately
			if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNRESET') || error.message.includes('timeout')) {
				retryCount++;
				if (retryCount >= maxRetries) {
					throw new Error(`Network error during polling after ${maxRetries} attempts: ${error.message}`);
				}
				continue;
			}
			// For other errors, throw immediately
			throw error;
		}
	}

	throw new Error(`Document processing timed out after ${maxRetries} polling attempts. The operation may still be processing on the server.`);
}
