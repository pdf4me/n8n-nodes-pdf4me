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
declare const setTimeout: any;
declare const Buffer: any;
declare const console: any;

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
			} catch (parseError) {
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
		json: true,
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
			// Immediate success - return binary content
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
		} else if (response.statusCode === 202) {
			// Async processing - poll for result
			const locationUrl = response.headers.location;
			if (!locationUrl) {
				throw new Error('No polling URL found in response');
			}

			console.log('Starting async processing, polling for completion...');
			console.log('Note: PDF to Word conversion can take several minutes for complex documents');

			// Enhanced polling with longer timeout and better error handling
			const maxRetries = 30; // Increased from 15 to 30 attempts
			const initialDelay = 3000; // Start with 3 seconds
			const maxDelay = 30000; // Max 30 seconds between attempts (increased from 8s)
			const totalTimeout = 25 * 60 * 1000; // 25 minutes total timeout
			let startTime = Date.now();

			for (let attempt = 0; attempt < maxRetries; attempt++) {
				// Check total timeout
				if (Date.now() - startTime > totalTimeout) {
					throw new Error(`Total timeout reached (${Math.round(totalTimeout/60000)} minutes). PDF to Word conversion is taking longer than expected. This can happen with very large or complex PDFs.`);
				}

				// Exponential backoff with jitter to avoid thundering herd
				const baseDelay = Math.min(initialDelay * Math.pow(1.3, attempt), maxDelay);
				const jitter = Math.random() * 0.3 + 0.85; // 85-115% of base delay
				const delay = Math.round(baseDelay * jitter);
				
				if (attempt > 0) {
					const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
					console.log(`Polling attempt ${attempt + 1}/${maxRetries} (waiting ${Math.round(delay/1000)}s, elapsed: ${elapsedMinutes}m)...`);
					// Wait before polling
					await new Promise(resolve => setTimeout(resolve, delay));
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
					json: false, // Don't parse as JSON for binary response
					timeout: 30000, // 30 second timeout for polling requests (increased from 15s)
				};

				try {
					const pollResponse = await this.helpers.request(pollOptions);

					if (pollResponse.statusCode === 200) {
						// Success - return binary content
						console.log('Processing completed successfully!');
						
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
						
						// Validate file size (should be reasonable for a Word document)
						if (result.length < 1000) {
							throw new Error(`Response too small (${result.length} bytes). This might indicate an error response.`);
						}
						
						return result;
					} else if (pollResponse.statusCode === 202) {
						// Still processing, continue polling
						console.log('Document still being processed...');
						continue;
					} else if (pollResponse.statusCode === 404) {
						// Resource not found - might be temporary
						console.log('Resource temporarily unavailable, retrying...');
						continue;
					} else if (pollResponse.statusCode >= 500) {
						// Server error - retry with backoff
						console.log(`Server error ${pollResponse.statusCode}, retrying...`);
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
						} catch (parseError) {
							errorMessage = `${errorMessage}: ${pollResponse.body}`;
						}
						throw new Error(errorMessage);
					}
				} catch (pollError) {
					// Network or timeout error during polling
					console.log(`Polling request failed: ${pollError.message}`);
					
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
			throw new Error(`Timeout: Processing did not complete after ${maxRetries} attempts (${totalElapsed} minutes). PDF to Word conversion can take longer for complex documents. Please try again or consider using a simpler PDF.`);
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
			} catch (parseError) {
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
			'Invalid JSON in Profiles. Check https://dev.pdf4me.com/apiv2/documentation/ or contact support@pdf4me.com for help. ' +
				(error as Error).message,
		);
	}
}

	export class ActionConstants {
		public static readonly BarcodeGenerator: string = 'Barcode Generator';
		public static readonly UrlToPdf: string = 'URL to PDF';
		public static readonly PdfToWord: string = 'PDF to Word';
		public static readonly JsonToExcel: string = 'JSON to Excel';
		public static readonly CropImage: string = 'Crop Image';
		public static readonly AddAttachmentToPdf: string = 'Add Attachment to PDF';
		public static readonly AddHtmlHeaderFooter: string = 'Add HTML Header Footer';
		public static readonly AddImageStampToPdf: string = 'Add Image Stamp to PDF';
		public static readonly AddMarginToPdf: string = 'Add Margin to PDF';
		public static readonly AddPageNumberToPdf: string = 'Add Page Number to PDF';
		public static readonly AddTextStampToPdf: string = 'Add Text Stamp to PDF';
		public static readonly SignPdf: string = 'Sign PDF';
		public static readonly ClassifyDocument: string = 'Classify Document';
		public static readonly ExtractAttachmentFromPdf: string = 'Extract Attachment From PDF';
		public static readonly ExtractFormDataFromPdf: string = 'Extract Form Data From PDF';
		public static readonly ExtractResources: string = 'Extract Resources';
		public static readonly ExtractTableFromPdf: string = 'Extract Table From PDF';
		public static readonly ExtractTextByExpression: string = 'Extract Text by Expression';
		public static readonly ExtractTextFromWord: string = 'Extract Text from Word';
	}
