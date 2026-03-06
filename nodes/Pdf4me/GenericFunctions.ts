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
		url.includes('/ProcessContract') || url.includes('/ProcessBankCheque') ||
		url.includes('/ProcessCreditCard') || url.includes('/ProcessMarriageCertificate') ||
		url.includes('/ProcessMortgageDocument') || url.includes('/ProcessPayStub') ||
		url.includes('/ParseDocument') || url.includes('/ClassifyDocument');

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

// Delay function using PDF4ME's DelayAsync endpoint.
// Always guarantees a minimum wait of `minWaitMs` regardless of whether the
// AddDelay call succeeds quickly or fails — this prevents rapid-fire polling
// that can cause PDF4me to expire the processing job.
async function delayAsync(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	minWaitMs: number = 10000,
): Promise<void> {
	const startTime = Date.now();
	console.log(`[pdf4me Async] delayAsync: starting, minWaitMs=${minWaitMs}`);
	try {
		await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: 'https://api.pdf4me.com/api/v2/AddDelay',
			method: 'GET',
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
			timeout: 15000,
		});
		console.log(`[pdf4me Async] delayAsync: AddDelay API completed in ${Date.now() - startTime}ms`);
	} catch (err) {
		console.log(`[pdf4me Async] delayAsync: AddDelay API failed, using setTimeout fallback. Error: ${err instanceof Error ? err.message : String(err)}`);
	}
	const elapsed = Date.now() - startTime;
	const remaining = minWaitMs - elapsed;
	if (remaining > 0) {
		console.log(`[pdf4me Async] delayAsync: waiting additional ${remaining}ms (elapsed ${elapsed}ms)`);
		await new Promise<void>(resolve => setTimeout(resolve, remaining));
	}
	console.log(`[pdf4me Async] delayAsync: done (total ${Date.now() - startTime}ms)`);
}

export async function pdf4meAsyncRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	url: string,
	body: any = {},
	method: IHttpRequestMethods = 'POST',
	qs: IDataObject = {},
	option: IDataObject = {},
): Promise<any> {
	// Use the body as-is without modifying it
	const asyncBody = body;

	// Determine if this is a JSON response operation (like CreateImages, AI processing, metadata extraction)
	const isJsonResponse = url.includes('/CreateImages') || url.includes('/CreateImagesFromPdf') ||
		url.includes('/ProcessInvoice') || url.includes('/ProcessHealthCard') ||
		url.includes('/ProcessContract') || url.includes('/ProcessBankCheque') ||
		url.includes('/ProcessCreditCard') || url.includes('/ProcessMarriageCertificate') ||
		url.includes('/ProcessMortgageDocument') || url.includes('/ProcessPayStub') ||
		url.includes('/ProcessUniversalDocument') || url.includes('/ProcessShippingLabel') ||
		url.includes('/ProcessOrder') || url.includes('/ProcessReceipt') || url.includes('/ProcessTaxDocument') ||
		url.includes('/ProcessBankStatement') ||
		url.includes('/ParseDocument') || url.includes('/ClassifyDocument') || url.includes('/GetTrackingChangesInWord') ||
		url.includes('/ExtractResources') || url.includes('/ExtractPdfFormData') ||
		url.includes('/GetPdfMetadata') || url.includes('/ExtractTextByExpression') ||
		url.includes('/ExtractAttachmentFromPdf') || url.includes('/GetImageMetadata') ||
		url.includes('/ExtractTableFromPdf') || url.includes('/SignDocument');

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
		timeout: 1000023,
	};
	options = Object.assign({}, options, option);

	try {
		console.log(`[pdf4me Async] Initial request: ${options.method} ${options.baseURL}${options.url}`);
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
		console.log(`[pdf4me Async] Initial response: status=${response.statusCode}`);

		if (response.statusCode === 200) {
			console.log(`[pdf4me Async] Immediate success (200), returning result`);
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
			console.log(`[pdf4me Async] Received 202, extracting Location header`);
			// Async processing - always start polling when API returns 202
			const rawLocation = response.headers?.location
				|| response.headers?.headers?.location
				|| (response.headers && (response.headers as IDataObject)['location']);
			const locationStr = typeof rawLocation === 'string' ? rawLocation : Array.isArray(rawLocation) ? rawLocation[0] : undefined;
			console.log(`[pdf4me Async] Raw Location: ${JSON.stringify(rawLocation)}, parsed: ${locationStr || '(empty)'}`);
			if (!locationStr || !locationStr.trim()) {
				throw new Error('No polling URL found in response');
			}
			// Resolve relative Location URLs to absolute (API may return e.g. /api/v2/GetDocument/xxx)
			const baseUrl = options.baseURL || 'https://api.pdf4me.com';
			const absoluteLocationUrl = locationStr.startsWith('http')
				? locationStr
				: `${baseUrl.replace(/\/$/, '')}${locationStr.startsWith('/') ? '' : '/'}${locationStr}`;
			console.log(`[pdf4me Async] Absolute polling URL: ${absoluteLocationUrl}, starting pollForCompletion`);

			// Poll the location URL until completion (with initial delay so job can register)
			return await pollForCompletion.call(this, absoluteLocationUrl, isJsonResponse);
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
			'Invalid JSON in Profiles. Check https://dev.pdf4me.com/ or contact support@pdf4me.com for help. ' +
				(error as Error).message,
		);
	}
}

/**
 * Creates a multipart/form-data body manually without external dependencies.
 * This is a native implementation to comply with n8n community node guidelines.
 *
 * @param fieldName - The form field name
 * @param fileBuffer - The file buffer to upload
 * @param filename - The filename
 * @returns Object with body (Buffer) and boundary string
 */
function createMultipartFormData(fieldName: string, fileBuffer: Buffer, filename: string): { body: Buffer; boundary: string } {
	// Generate a unique boundary
	const boundary = `----n8n-pdf4me-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
	const CRLF = '\r\n';

	// Build the multipart/form-data body
	const parts: Buffer[] = [];

	// Opening boundary
	parts.push(Buffer.from(`--${boundary}${CRLF}`));

	// Content-Disposition header
	const disposition = `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"${CRLF}`;
	parts.push(Buffer.from(disposition));

	// Content-Type header (use application/octet-stream for binary files)
	parts.push(Buffer.from(`Content-Type: application/octet-stream${CRLF}${CRLF}`));

	// File content
	parts.push(fileBuffer);

	// Closing boundary
	parts.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`));

	// Combine all parts
	const body = Buffer.concat(parts);

	return { body, boundary };
}

/**
 * Uploads binary data to PDF4me's UploadBlob endpoint and returns the blobId.
 * This is used when binary data is provided as input instead of base64 content.
 *
 * @param this - Execution context
 * @param fileStream - Binary data stream or buffer to upload
 * @param filename - Name of the file being uploaded
 * @returns The blobId from the API response
 */
export async function uploadBlobToPdf4me(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	fileStream: NodeJS.ReadableStream | Buffer,
	filename: string,
): Promise<string> {
	try {
		// Convert stream to buffer if needed
		let fileBuffer: Buffer;
		if (fileStream instanceof Buffer) {
			fileBuffer = fileStream;
		} else {
			// Read stream into buffer
			const chunks: Buffer[] = [];
			for await (const chunk of fileStream) {
				// Ensure chunk is a Buffer - handle different chunk types
				if (Buffer.isBuffer(chunk)) {
					chunks.push(chunk);
				} else {
					// Convert other types (string, Uint8Array, etc.) to Buffer
					chunks.push(Buffer.from(chunk as string | ArrayLike<number>));
				}
			}
			fileBuffer = Buffer.concat(chunks);
		}

		// Check file size
		const sizeMB = fileBuffer.length / 1024 / 1024;
		// Very large files might hit memory limits
		// Set a reasonable upper limit based on typical n8n Cloud memory constraints
		if (sizeMB > 500) {
			throw new Error(
				`File too large (${Math.round(sizeMB * 100) / 100}MB). Files larger than 500MB may exceed n8n Cloud memory limits. ` +
				'Please use a smaller file or consider processing it in chunks.',
			);
		}

		// Create multipart/form-data body manually (native implementation, no external dependencies)
		const { body, boundary } = createMultipartFormData('file', fileBuffer, filename);

		// Get authentication credentials
		const credentials = await this.getCredentials('pdf4meApi');
		const apiKey = credentials?.apiKey as string;

		// Make the upload request with manually constructed multipart/form-data
		const response = await this.helpers.httpRequest({
			url: 'https://api.pdf4me.com/api/V2/UploadBlob',
			method: 'POST',
			body: body, // Native Buffer with multipart/form-data
			headers: {
				'Content-Type': `multipart/form-data; boundary=${boundary}`,
				'Authorization': `Basic ${apiKey}`,
			},
			returnFullResponse: true,
			timeout: 60000023,
		});

		// Check if response is successful
		if (response.statusCode === 200 || response.statusCode === 201) {
			// Parse JSON response manually since we didn't use json: true
			let responseBody: IDataObject;
			try {
				if (typeof response.body === 'string') {
					responseBody = JSON.parse(response.body);
				} else if (Buffer.isBuffer(response.body)) {
					responseBody = JSON.parse(response.body.toString('utf8'));
				} else {
					responseBody = response.body as IDataObject;
				}
			} catch (parseError) {
				throw new Error(`Failed to parse UploadBlob response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
			}

			// Check for BlobId (capital B) first, then fallback to blobId for backward compatibility
			const blobId = responseBody?.BlobId || responseBody?.blobId;
			if (responseBody && blobId) {
				return blobId as string;
			} else {
				throw new Error('UploadBlob response missing BlobId field');
			}
		} else {
			let errorMessage = `UploadBlob failed with status ${response.statusCode}`;
			try {
				let errorBody: IDataObject | string = response.body;
				if (typeof response.body === 'string') {
					errorBody = JSON.parse(response.body);
				} else if (Buffer.isBuffer(response.body)) {
					errorBody = JSON.parse(response.body.toString('utf8'));
				}
				if (typeof errorBody === 'object' && errorBody) {
					errorMessage = (errorBody as any).message || (errorBody as any).error || errorMessage;
				}
			} catch {
				// Ignore parsing errors
			}
			throw new Error(errorMessage);
		}
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
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
	AddHtmlHeaderFooter: 'Add HTML Header Footer',
	AddImageStampToPdf: 'Add Image Stamp To PDF',
	AddImageWatermarkToImage: 'Add Image Watermark To Image',
	AddMarginToPdf: 'Add Margin To PDF',
	AddPageNumberToPdf: 'Add Page Number To PDF',
	AddTextStampToPdf: 'Add Text Stamp To PDF',
	AddTextWatermarkToImage: 'Add Text Watermark To Image',
	AiInvoiceParser: 'AI-Invoice Parser',
	AiProcessBankCheque: 'AI-Process Bank Cheque',
	AiProcessCreditCard: 'AI-Process Credit Card',
	AiProcessContract: 'AI-Process Contract',
	AiProcessHealthCard: 'AI-Process HealthCard',
	AiProcessMarriageCertificate: 'AI-Process Marriage Certificate',
	AiProcessMortgageDocument: 'AI-Process Mortgage Document',
	AiProcessPayStub: 'AI-Process Pay Stub',
	ClassifyDocument: 'Classify Document',
	CompressImage: 'Compress Image',
	CompressPdf: 'Compress PDF',
	ConvertHtmlToPdf: 'Convert HTML To PDF',
	ConvertImageFormat: 'Convert Image Format',
	JsonToExcel: 'Convert JSON To Excel',
	ConvertMarkdownToPdf: 'Convert Markdown To PDF',
	ConvertPdfToEditableOcr: 'Convert PDF To Editable PDF Using OCR',
	ConvertPdfToExcel: 'Convert PDF To Excel',
	ConvertPdfToPowerpoint: 'Convert PDF To PowerPoint',
	ConvertPdfToWord: 'Convert PDF To Word',
	ConvertToPdf: 'Convert To PDF',
	UrlToPdf: 'Convert URL to PDF',
	ConvertVisio: 'Convert VISIO',
	ConvertWordToPdfForm: 'Convert Word To PDF Form',
	CreateImagesFromPdf: 'Create Images From PDF',
	CreatePdfA: 'Create PDF/A',
	CreateSwissQrBill: 'Create Swiss QR Bill',
	CropImage: 'Crop Image',
	DeleteBlankPagesFromPdf: 'Delete Blank Pages From PDF',
	DeleteUnwantedPagesFromPdf: 'Delete Unwanted Pages From PDF',
	DisableTrackingChangesInWord: 'Disable Tracking Changes in Word',
	EnableTrackingChangesInWord: 'Enable Tracking Changes in Word',
	ExtractAttachmentFromPdf: 'Extract Attachment From PDF',
	ExtractFormDataFromPdf: 'Extract Form Data From PDF',
	ExtractPagesFromPdf: 'Extract Pages From PDF',
	ExtractResources: 'Extract Resources',
	ExtractTableFromPdf: 'Extract Table From PDF',
	ExtractTextByExpression: 'Extract Text By Expression',
	ExtractTextFromWord: 'Extract Text From Word',
	FillPdfForm: 'Fill PDF Form',
	FindAndReplaceText: 'Find And Replace Text',
	FlipImage: 'Flip Image',
	FlattenPdf: 'Flatten PDF',
	BarcodeGenerator: 'Generate Barcode',
	GenerateDocumentSingle: 'Generate Document Single',
	GenerateDocumentsMultiple: 'Generate Documents Multiple',
	GetDocumentFromPdf4me: 'Get Document From Pdf4me',
	GetImageMetadata: 'Get Image Metadata',
	GetPdfMetadata: 'Get PDF Metadata',
	GetTrackingChangesInWord: 'Get Tracking Changes in Word',
	ImageExtractText: 'Image Extract Text',
	LinearizePdf: 'Linearize PDF',
	MergeMultiplePDFs: 'Merge Multiple PDFs',
	OverlayPDFs: 'Overlay PDFs',
	ParseDocument: 'Parse Document',
	ProtectDocument: 'Protect PDF',
	ReadBarcodeFromImage: 'Read Barcode From Image',
	ReadBarcodeFromPdf: 'Read Barcode From PDF',
	ReadSwissQrCode: 'Read SwissQR Code',
	RemoveExifTagsFromImage: 'Remove Exif Tags From Image',
	RepairPdfDocument: 'Repair PDF Document',
	ReplaceTextWithImage: 'Replace Text With Image',
	ReplaceTextWithImageInWord: 'Replace Text With Image In Word',
	ResizeImage: 'Resize Image',
	RotateDocument: 'Rotate Document',
	RotateImage: 'Rotate Image',
	RotateImageByExifData: 'Rotate Image By Exif Data',
	RotatePage: 'Rotate PDF Page',
	SignDocument: 'Sign Document',
	SignPdf: 'Sign PDF',
	SplitPdfByBarcode: 'Split PDF By Barcode',
	SplitPdfBySwissQR: 'Split PDF By SwissQR',
	SplitPdfByText: 'Split PDF By Text',
	SplitPdfRegular: 'Split PDF Regular',
	UnlockPdf: 'Unlock PDF',
	UpdateHyperlinksAnnotation: 'Update Hyperlinks Annotation',
	UploadFile: 'Upload File To PDF4me',
	ProcessUniversalDocument: 'Process Universal Document',
	ProcessShippingLabel: 'Process Shipping Label',
	ProcessOrder: 'Process Order',
	ProcessReceipt: 'Process Receipt',
	ProcessTaxDocument: 'Process Tax Document',
	ProcessBankStatement: 'Process Bank Statement',
	ZugferdInvoice: 'Zugferd Invoice',
};

async function pollForCompletion(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	locationUrl: string,
	isJsonResponse: boolean,
	maxRetries: number = 12000,
): Promise<any> {
	let retryCount = 0;
	// Tracks consecutive 404s — in cloud environments the job may not be
	// immediately queryable after the 202 response. Allow many retries with delayAsync between each.
	let notFoundCount = 0;
	const maxNotFoundRetries = 90;

	console.log(`[pdf4me Async] pollForCompletion: starting, url=${locationUrl}`);
	// Initial delay before first poll — give the backend time to register the job
	await delayAsync.call(this, 3000);
	console.log(`[pdf4me Async] pollForCompletion: initial delay done, entering poll loop`);

	while (retryCount < maxRetries) {
		try {
			retryCount++;
			console.log(`[pdf4me Async] pollForCompletion: poll attempt #${retryCount}`);
			// Make polling request
			const pollResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
				url: locationUrl,
				method: 'GET',
				encoding: isJsonResponse ? undefined : 'arraybuffer' as const,
				returnFullResponse: true,
				json: isJsonResponse,
				ignoreHttpStatusErrors: true,
			});
			console.log(`[pdf4me Async] pollForCompletion: attempt #${retryCount} → status=${pollResponse.statusCode}`);

			if (pollResponse.statusCode === 200) {
				console.log(`[pdf4me Async] pollForCompletion: SUCCESS on attempt #${retryCount}`);
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
				console.log(`[pdf4me Async] pollForCompletion: 202 still processing, calling delayAsync`);
				// Still processing — reset not-found counter and wait before next poll
				notFoundCount = 0;
				await delayAsync.call(this);
				continue;
			} else if (pollResponse.statusCode === 404) {
				notFoundCount++;
				console.log(`[pdf4me Async] pollForCompletion: 404 not found (${notFoundCount}/${maxNotFoundRetries}), calling delayAsync`);
				// In n8n Cloud (and other cloud environments), the job may not yet be
				// registered on the PDF4me side immediately after the 202 response.
				// Retry a limited number of times before declaring the job truly gone.
				if (notFoundCount >= maxNotFoundRetries) {
					console.log(`[pdf4me Async] pollForCompletion: 404 max retries (${maxNotFoundRetries}) exceeded, throwing`);
					throw new Error(
						'Processing job not found or expired after ' + maxNotFoundRetries + ' polling attempts. The document processing may have timed out.',
					);
				}
				await delayAsync.call(this);
				continue;
			} else {
				console.log(`[pdf4me Async] pollForCompletion: error status ${pollResponse.statusCode}, throwing`);
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
			const errMsg = error instanceof Error ? error.message : String(error);
			console.log(`[pdf4me Async] pollForCompletion: catch block, error=${errMsg}`);
			// Retry on transient network errors
			if (errMsg.includes('ENOTFOUND') || errMsg.includes('ECONNRESET') || errMsg.includes('timeout')) {
				if (retryCount >= maxRetries) {
					console.log(`[pdf4me Async] pollForCompletion: network error max retries exceeded`);
					throw new Error(`Network error during polling after ${maxRetries} attempts: ${errMsg}`);
				}
				console.log(`[pdf4me Async] pollForCompletion: network error, calling delayAsync and retrying`);
				await delayAsync.call(this);
				continue;
			}
			// For other errors, throw immediately
			console.log(`[pdf4me Async] pollForCompletion: re-throwing non-network error`);
			throw error;
		}
	}

	console.log(`[pdf4me Async] pollForCompletion: max retries (${maxRetries}) exceeded, throwing timeout`);
	throw new Error(`Document processing timed out after ${maxRetries} polling attempts. The operation may still be processing on the server.`);
}
