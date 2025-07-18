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
		// Debug: Log authentication info (without exposing the full key)

		// Make initial request
		const response = await this.helpers.request(options);

		if (response.statusCode === 200) {
			// Immediate success
			if (isJsonResponse) {
				// For JSON responses (like CreateImages), return the parsed JSON
				return response.body;
			} else {
				// For binary responses, return binary content
				// Convert to Buffer if it's not already
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
					} catch {
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
			}
		} else if (response.statusCode === 202) {
			// Async processing - poll for result
			const locationUrl = response.headers.location;
			if (!locationUrl) {
				throw new Error('No polling URL found in response');
			}


			// Enhanced polling with longer timeout and better error handling
			const maxRetries = 30; // Increased from 15 to 30 attempts
			const initialDelay = 3000; // Start with 3 seconds
			const maxDelay = 30000; // Max 30 seconds between attempts (increased from 8s)
			const totalTimeout = 25 * 60 * 1000; // 25 minutes total timeout
			const startTime = Date.now();

			for (let attempt = 0; attempt < maxRetries; attempt++) {
				// Check total timeout
				if (Date.now() - startTime > totalTimeout) {
					throw new Error(`Total timeout reached (${Math.round(totalTimeout/60000)} minutes). Document processing is taking longer than expected. This can happen with very large or complex documents.`);
				}

				// Exponential backoff with jitter to avoid thundering herd
				const baseDelay = Math.min(initialDelay * Math.pow(1.3, attempt), maxDelay);
				const jitter = Math.random() * 0.3 + 0.85; // 85-115% of base delay
				const delay = Math.round(baseDelay * jitter);

				if (attempt > 0) {
					// Wait before polling
					await new Promise(resolve => {
						const timer = setInterval(() => {
							clearInterval(timer);
							resolve(undefined);
						}, delay);
					});
				}

				// Poll the status
				const pollOptions: IRequestOptions = {
					url: locationUrl,
					headers: {
						'Authorization': `Basic ${credentials.apiKey}`,
					},
					method: 'GET',
					resolveWithFullResponse: true,
					simple: false,
					encoding: null, // For binary response
					json: isJsonResponse, // Parse as JSON for CreateImages operations
					timeout: 30000, // 30 second timeout for polling requests (increased from 15s)
				};

				try {
					const pollResponse = await this.helpers.request(pollOptions);

					if (pollResponse.statusCode === 200) {
						// Success

						if (isJsonResponse) {
							// For JSON responses (like CreateImages), return the parsed JSON
							return pollResponse.body;
						} else {
							// For binary responses, return binary content
							// Ensure we return a Buffer
							let result;
							if (Buffer.isBuffer(pollResponse.body)) {
								result = pollResponse.body;
							} else if (typeof pollResponse.body === 'string') {
								// If it's a string, it might be an error message
								if (pollResponse.body.length < 100) {
									throw new Error(`API returned error message: ${pollResponse.body}`);
								}
								// Try to convert from base64 if it's a long string
								try {
									result = Buffer.from(pollResponse.body, 'base64');
								} catch (error) {
									throw new Error(`API returned unexpected string response: ${pollResponse.body.substring(0, 100)}...`);
								}
							} else {
								result = Buffer.from(pollResponse.body, 'binary');
							}

							// Validate the result
							if (!Buffer.isBuffer(result)) {
								throw new Error('Failed to convert response to Buffer');
							}

							// Validate file size (should be reasonable for a document)
							if (result.length < 100) {
								throw new Error(`Response too small (${result.length} bytes). This might indicate an error response.`);
							}

							return result;
						}
					} else if (pollResponse.statusCode === 202) {
						// Still processing, continue polling
						continue;
					} else if (pollResponse.statusCode === 404) {
						// Resource not found - might be temporary
						continue;
					} else if (pollResponse.statusCode >= 500) {
						// Server error - retry with backoff
						continue;
					} else {
						// Other error during processing
						let errorMessage = `Error during processing: ${pollResponse.statusCode}`;
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
				} catch (pollError) {
					// Network or timeout error during polling

					// If this is the last attempt, throw the error
					if (attempt === maxRetries - 1) {
						throw new Error(`Polling failed after ${maxRetries} attempts. Last error: ${pollError.message}`);
					}

					// Otherwise, continue with next attempt
					continue;
				}
			}

			// Timeout after all retries
			const totalElapsed = Math.round((Date.now() - startTime) / 60000);
			throw new Error(`Timeout: Processing did not complete after ${maxRetries} attempts (${totalElapsed} minutes). Document processing can take longer for complex documents. Please try again or consider using a simpler document.`);
		} else {
			// Error
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
			'Invalid JSON in Profiles. Check https://developer.pdf4me.com/api/profiles/ or contact support@pdf4me.com for help. ' +
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
