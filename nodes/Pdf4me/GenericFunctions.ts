import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	JsonObject,
	IHttpRequestMethods,
	IHttpRequestOptions,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Build a readable error string from PDF4me JSON error responses.
 * Handles UTF-8 Buffer bodies (common when requests use arraybuffer encoding).
 */
function formatPdf4meHttpError(statusCode: number, body: unknown): string {
	let raw = '';
	if (Buffer.isBuffer(body)) {
		raw = body.toString('utf8').trim();
	} else if (typeof body === 'string') {
		raw = body.trim();
	} else if (body != null) {
		raw = String(body);
	}
	if (!raw) {
		return `HTTP ${statusCode}`;
	}
	try {
		const obj = JSON.parse(raw) as IDataObject;
		const message =
			(typeof obj.message === 'string' && obj.message) ||
			(typeof obj.error === 'string' && obj.error) ||
			(typeof obj.detail === 'string' && obj.detail) ||
			(typeof obj.title === 'string' && obj.title);
		const extras: string[] = [];
		if (obj.errors != null) {
			try {
				extras.push(`errors: ${JSON.stringify(obj.errors)}`);
			} catch {
				extras.push('errors: [unserializable]');
			}
		}
		if (typeof obj.traceId === 'string' && obj.traceId) {
			extras.push(`traceId: ${obj.traceId}`);
		}
		if (typeof obj.type === 'string' && obj.type) {
			extras.push(`type: ${obj.type}`);
		}
		if (message) {
			const combined = extras.length ? `${message} (${extras.join('; ')})` : message;
			return `[HTTP ${statusCode}] ${combined}`;
		}
		return `HTTP ${statusCode}: ${raw.length > 8000 ? `${raw.slice(0, 8000)}…` : raw}`;
	} catch {
		return `HTTP ${statusCode}: ${raw.length > 8000 ? `${raw.slice(0, 8000)}…` : raw}`;
	}
}

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
		url.includes('/ParseDocument') || url.includes('/ClassifyDocument') ||
		url.includes('/AiDocumentParser') || url.includes('/GetAnalyzerId') ||
		url.includes('/GetTemplateName') || url.includes('/GenerateDocumentSingleV2');

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
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
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
			throw new Error(formatPdf4meHttpError(response.statusCode, response.body));
		}
	} catch (error) {
		if (error instanceof NodeApiError) throw error;
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: error instanceof Error ? error.message : String(error),
		});
	}
}

// Removed n8nSleep and all artificial delay logic to comply with n8n community guidelines.

// Delay function using PDF4ME's DelayAsync endpoint
async function delayAsync(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
): Promise<void> {
	await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
		url: 'https://api.pdf4me.com/api/v2/AddDelay',
		method: 'GET',
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	});
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
		url.includes('/ParseDocument') || url.includes('/ClassifyDocument') || url.includes('/AiDocumentParser') ||
		url.includes('/GetTrackingChangesInWord') ||
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
		// Make initial request
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: `${options.baseURL}${options.url}`,
			method: options.method,
			headers: options.headers,
			body: options.body,
			qs: options.qs,
			encoding: isJsonResponse ? undefined : 'arraybuffer' as const,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
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
			// Async processing - always start polling when API returns 202
			const locationUrl = response.headers.headers?.location || response.headers.location;
			if (!locationUrl) {
				throw new Error('No polling URL found in response');
			}

			// Start polling immediately when API returns 202
			// Poll the location URL until completion
			return await pollForCompletion.call(this, locationUrl, isJsonResponse);
		} else {
			throw new Error(formatPdf4meHttpError(response.statusCode, response.body));
		}
	} catch (error) {
		if (error instanceof NodeApiError) throw error;
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: error instanceof Error ? error.message : String(error),
		});
	}
}

/**
 * Normalize GET /api/v2/GetAnalyzerId response into dropdown options.
 * API body is typically a string array; each item is used as both label and value.
 */
function parseGetAnalyzerIdOptions(body: unknown): INodePropertyOptions[] {
	const items = extractGetAnalyzerIdItems(body);
	const seen = new Set<string>();

	return items.reduce<INodePropertyOptions[]>((options, item) => {
		const trimmed = item.trim();
		if (!trimmed || seen.has(trimmed)) {
			return options;
		}
		seen.add(trimmed);
		options.push({
			name: trimmed,
			value: trimmed,
		});
		return options;
	}, []);
}

function extractGetAnalyzerIdItems(body: unknown): string[] {
	if (body == null) {
		return [];
	}

	let data: unknown = body;

	if (Buffer.isBuffer(data)) {
		data = data.toString('utf8');
	}

	if (typeof data === 'string') {
		const trimmed = data.trim();
		if (!trimmed) {
			return [];
		}

		try {
			return extractGetAnalyzerIdItems(JSON.parse(trimmed));
		} catch {
			if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
				return [];
			}
			if (trimmed.includes('\n')) {
				return trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
			}
			if (trimmed.includes(',')) {
				return trimmed.split(',').map((part) => part.trim()).filter(Boolean);
			}
			return [trimmed];
		}
	}

	if (Array.isArray(data)) {
		return data.flatMap((item) => {
			if (typeof item === 'string') {
				return item.trim() ? [item.trim()] : [];
			}
			if (typeof item === 'number' || typeof item === 'boolean') {
				return [String(item)];
			}
			if (item && typeof item === 'object') {
				const entry = item as IDataObject;
				const value =
					entry.name ??
					entry.Name ??
					entry.label ??
					entry.Label ??
					entry.analyzerId ??
					entry.AnalyzerId ??
					entry.id ??
					entry.Id ??
					entry.templateName ??
					entry.TemplateName ??
					entry.value ??
					entry.Value ??
					entry.customisationNote ??
					entry.customisationNote;
				if (typeof value === 'string' && value.trim()) {
					return [value.trim()];
				}
				if (typeof value === 'number' || typeof value === 'boolean') {
					return [String(value)];
				}
			}
			return [];
		});
	}

	if (typeof data === 'object') {
		const record = data as IDataObject;
		const nestedKeys = ['body', 'items', 'data', 'results', 'analyzers', 'analyzerIds', 'analyzerList'];
		for (const key of nestedKeys) {
			if (record[key] != null) {
				return extractGetAnalyzerIdItems(record[key]);
			}
		}

		const stringValues = Object.values(record).filter(
			(value): value is string => typeof value === 'string' && value.trim() !== '',
		);
		if (stringValues.length > 0) {
			return stringValues.map((value) => value.trim());
		}

		return Object.keys(record).map((key) => key.trim()).filter(Boolean);
	}

	return [];
}

/**
 * Load AI analyzer options for the node dropdown via GET /api/v2/GetAnalyzerId.
 */
export async function getAnalyzerIdList(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const body = await pdf4meApiRequest.call(this, '/api/v2/GetAnalyzerId', {}, 'GET');
	const options = parseGetAnalyzerIdOptions(body);

	if (options.length === 0) {
		throw new Error('GetAnalyzerId returned no analyzer options');
	}

	return options;
}

/**
 * Load template name options for the node dropdown via GET /api/v2/GetTemplateName.
 */
export async function getTemplateNameList(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const body = await pdf4meApiRequest.call(this, '/api/v2/GetTemplateName', {}, 'GET');
	const options = parseGetAnalyzerIdOptions(body);

	if (options.length === 0) {
		throw new Error('GetTemplateName returned no template options');
	}

	return options;
}

interface GenerateDocumentV2Result {
	name: string;
	docData: string;
}

function bufferFromV2ResponseBody(body: unknown): Buffer | null {
	if (Buffer.isBuffer(body)) {
		return body.length > 0 ? body : null;
	}
	if (body instanceof ArrayBuffer) {
		return Buffer.from(body);
	}
	if (body instanceof Uint8Array) {
		return Buffer.from(body);
	}
	if (typeof body === 'string') {
		const trimmed = body.trim();
		if (!trimmed) {
			return null;
		}
		if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
			return null;
		}
		return Buffer.from(body, 'latin1');
	}
	return null;
}

function isLikelyBinaryDocument(buffer: Buffer): boolean {
	if (buffer.length < 4) {
		return false;
	}
	if (buffer.subarray(0, 4).toString('ascii') === '%PDF') {
		return true;
	}
	if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
		return true;
	}
	const start = buffer.subarray(0, Math.min(buffer.length, 20)).toString('utf8').toLowerCase();
	return start.includes('<!doctype') || start.startsWith('<html');
}

function parseV2JsonBody(body: unknown): IDataObject {
	if (body && typeof body === 'object' && !Buffer.isBuffer(body)) {
		return body as IDataObject;
	}

	const buffer = bufferFromV2ResponseBody(body);
	if (!buffer || isLikelyBinaryDocument(buffer)) {
		return {};
	}

	const raw = buffer.toString('utf8').trim();
	if (!raw) {
		return {};
	}

	try {
		return JSON.parse(raw) as IDataObject;
	} catch {
		return {};
	}
}

function resolveV2FileName(headers: unknown, templateFileName?: string): string {
	if (headers && typeof headers === 'object') {
		const headerRecord = headers as IDataObject;
		const nestedHeaders =
			headerRecord.headers && typeof headerRecord.headers === 'object'
				? (headerRecord.headers as IDataObject)
				: undefined;
		const disposition =
			headerRecord['content-disposition'] ??
			headerRecord['Content-Disposition'] ??
			nestedHeaders?.['content-disposition'] ??
			nestedHeaders?.['Content-Disposition'];

		if (typeof disposition === 'string') {
			const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
			if (match?.[1]) {
				return decodeURIComponent(match[1].trim());
			}
		}

		const contentType =
			headerRecord['content-type'] ??
			headerRecord['Content-Type'] ??
			nestedHeaders?.['content-type'] ??
			nestedHeaders?.['Content-Type'];
		if (typeof contentType === 'string') {
			if (contentType.includes('pdf')) {
				return 'generated_document.pdf';
			}
			if (contentType.includes('wordprocessingml')) {
				return 'generated_document.docx';
			}
			if (contentType.includes('html')) {
				return 'generated_document.html';
			}
		}
	}

	if (templateFileName) {
		const baseName = templateFileName.replace(/\.[^.]+$/, '');
		return `${baseName}_generated.pdf`;
	}

	return 'generated_document.pdf';
}

function documentFromV2BinaryResponse(
	body: unknown,
	headers: unknown,
	templateFileName?: string,
): GenerateDocumentV2Result | null {
	const buffer = bufferFromV2ResponseBody(body);
	if (!buffer || !isLikelyBinaryDocument(buffer)) {
		return null;
	}

	return {
		name: resolveV2FileName(headers, templateFileName),
		docData: buffer.toString('base64'),
	};
}

function extractV2Document(doc: unknown, fallbackName?: string): GenerateDocumentV2Result | null {
	if (!doc || typeof doc !== 'object') {
		return null;
	}
	const entry = doc as IDataObject;
	const name = (entry.name ??
		entry.Name ??
		entry.fileName ??
		entry.FileName ??
		entry.docName ??
		entry.DocName) as string | undefined;
	const docData = (entry.docData ??
		entry.DocData ??
		entry.data ??
		entry.Data ??
		entry.content ??
		entry.Content ??
		entry.streamFile ??
		entry.StreamFile ??
		entry.fileContent ??
		entry.FileContent ??
		entry.docContent ??
		entry.DocContent) as string | undefined;
	if (!docData) {
		return null;
	}
	return {
		name: name || fallbackName || 'generated_document.pdf',
		docData,
	};
}

function isV2CallInProgress(status: string): boolean {
	const normalized = status.trim().toLowerCase();
	return normalized === 'callinit' || normalized === 'inprogress' || normalized === 'processing';
}

function resolveV2DocumentFromBody(body: IDataObject, fallbackName?: string): GenerateDocumentV2Result | null {
	const direct = extractV2Document(body, fallbackName);
	if (direct) {
		return direct;
	}

	const nestedSources = [
		body.document,
		body.Document,
		body.output,
		body.Output,
		body.result,
		body.Result,
	];

	for (const source of nestedSources) {
		const doc = extractV2Document(source, fallbackName);
		if (doc) {
			return doc;
		}

		if (source && typeof source === 'object') {
			const wrapped = source as IDataObject;
			const wrappedDoc = extractV2Document(wrapped.document ?? wrapped.Document, fallbackName);
			if (wrappedDoc) {
				return wrappedDoc;
			}
		}
	}

	const documents = body.documents ?? body.Documents;
	if (Array.isArray(documents) && documents.length > 0) {
		return extractV2Document(documents[0], fallbackName);
	}

	const outputDocuments = body.outputDocuments ?? body.OutputDocuments;
	if (Array.isArray(outputDocuments) && outputDocuments.length > 0) {
		return extractV2Document(outputDocuments[0], fallbackName);
	}

	return null;
}

function resolveV2StatusUrl(body: IDataObject, responseHeaders?: unknown): string | null {
	const statusUrl = body.statusUrl ?? body.StatusUrl;
	if (statusUrl && String(statusUrl).trim()) {
		return String(statusUrl);
	}

	if (!responseHeaders || typeof responseHeaders !== 'object') {
		return null;
	}

	const headers = responseHeaders as IDataObject;
	const nestedHeaders =
		headers.headers && typeof headers.headers === 'object'
			? (headers.headers as IDataObject)
			: undefined;
	const location = headers.location ?? nestedHeaders?.location;
	if (location && String(location).trim()) {
		return String(location);
	}

	return null;
}

function formatV2ResponseForError(body: IDataObject): string {
	try {
		const serialized = JSON.stringify(body);
		return serialized.length > 1000 ? `${serialized.slice(0, 1000)}…` : serialized;
	} catch {
		return '[unserializable response body]';
	}
}

/**
 * Poll V2 statusUrl until the job completes or times out.
 */
async function pollV2StatusUrl(
	this: IExecuteFunctions,
	statusUrl: string,
	templateFileName: string,
	maxRetries: number = 720,
): Promise<GenerateDocumentV2Result> {
	let retryCount = 0;
	let pollBody: IDataObject = {};
	const fallbackName = templateFileName
		? `${templateFileName.replace(/\.[^.]+$/, '')}_generated.pdf`
		: 'generated_document.pdf';

	while (retryCount < maxRetries) {
		const pollResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: statusUrl,
			method: 'GET',
			encoding: 'arraybuffer' as const,
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
		});

		if (pollResponse.statusCode === 404 || pollResponse.statusCode === 202) {
			retryCount++;
			await delayAsync.call(this);
			continue;
		}

		if (pollResponse.statusCode !== 200) {
			throw new Error(formatPdf4meHttpError(pollResponse.statusCode, pollResponse.body));
		}

		const pollBinaryDocument = documentFromV2BinaryResponse(
			pollResponse.body,
			pollResponse.headers,
			templateFileName,
		);
		if (pollBinaryDocument) {
			return pollBinaryDocument;
		}

		pollBody = parseV2JsonBody(pollResponse.body);
		const status = String(pollBody.status ?? pollBody.Status ?? '');
		const completedDocument = resolveV2DocumentFromBody(pollBody, fallbackName);

		if (completedDocument) {
			return completedDocument;
		}

		if (isV2CallInProgress(status)) {
			retryCount++;
			await delayAsync.call(this);
			continue;
		}

		throw new Error(
			`GenerateDocumentSingleV2 job finished with status "${status || 'unknown'}" but no document could be parsed: ${formatV2ResponseForError(pollBody)}`,
		);
	}

	throw new Error(
		`GenerateDocumentSingleV2 polling timed out after ${maxRetries} attempts. Last status: ${
			String(pollBody.status ?? pollBody.Status ?? 'unknown')
		}. Last body: ${formatV2ResponseForError(pollBody)}`,
	);
}

/**
 * Call GenerateDocumentSingleV2 and handle sync or statusUrl-based async polling.
 */
export async function pdf4meGenerateDocumentV2Request(
	this: IExecuteFunctions,
	url: string,
	payload: IDataObject,
): Promise<GenerateDocumentV2Result> {
	const templateFileName = String(payload.TemplateFileName ?? '');

	const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
		url: `https://api.pdf4me.com${url}`,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: payload,
		encoding: 'arraybuffer' as const,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	});

	if (response.statusCode !== 200 && response.statusCode !== 202) {
		throw new Error(formatPdf4meHttpError(response.statusCode, response.body));
	}

	const body = parseV2JsonBody(response.body);
	const statusUrl = resolveV2StatusUrl(body, response.headers);

	if (statusUrl) {
		return await pollV2StatusUrl.call(this, statusUrl, templateFileName);
	}

	if (response.statusCode === 202) {
		throw new Error('No polling URL found in async GenerateDocumentSingleV2 response');
	}

	const binaryDocument = documentFromV2BinaryResponse(
		response.body,
		response.headers,
		templateFileName,
	);
	if (binaryDocument) {
		return binaryDocument;
	}

	const fallbackName = templateFileName
		? `${templateFileName.replace(/\.[^.]+$/, '')}_generated.pdf`
		: 'generated_document.pdf';
	const document = resolveV2DocumentFromBody(body, fallbackName);
	if (!document) {
		throw new Error(
			`No document found in GenerateDocumentSingleV2 response: ${formatV2ResponseForError(body)}`,
		);
	}

	return document;
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

		// Make the upload request with manually constructed multipart/form-data.
		// Authentication is provided by the credential via n8n helper.
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			url: 'https://api.pdf4me.com/api/V2/UploadBlob',
			method: 'POST',
			body: body, // Native Buffer with multipart/form-data
			headers: {
				'Content-Type': `multipart/form-data; boundary=${boundary}`,
			},
			returnFullResponse: true,
			ignoreHttpStatusErrors: true,
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
			throw new Error(formatPdf4meHttpError(response.statusCode, response.body));
		}
	} catch (error) {
		if (error instanceof NodeApiError) throw error;
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: error instanceof Error ? error.message : String(error),
		});
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
	AiAutoCropDocument: 'AI Auto Crop Document',
	AiDocumentParser: 'AI Document Parser',
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
	GenerateDocumentFromTemplate: 'Generate Document From Template',
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
	maxRetries: number = 9000,
): Promise<any> {
	let retryCount = 0;

	while (retryCount < maxRetries) {
		try {
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
				// Still processing, continue polling with 10 second backoff
				retryCount++;
				// Use PDF4ME's DelayAsync endpoint for 10 second delay
				await delayAsync.call(this);
				continue;
			} else if (pollResponse.statusCode === 404) {
				// Job not found or expired
				throw new Error('Processing job not found or expired. The document processing may have timed out.');
			} else {
				throw new Error(formatPdf4meHttpError(pollResponse.statusCode, pollResponse.body));
			}
		} catch (error) {
			// If it's a network error, retry with minimal backoff
			if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNRESET') || error.message.includes('timeout')) {
				retryCount++;
				if (retryCount >= maxRetries) {
					throw new Error(`Network error during polling after ${maxRetries} attempts: ${error.message}`);
				}
				// Use PDF4ME's DelayAsync endpoint for 10 second delay on network errors
				await delayAsync.call(this);
				continue;
			}
			// For other errors, throw immediately
			throw error;
		}
	}

	throw new Error(`Document processing timed out after ${maxRetries} polling attempts. The operation may still be processing on the server.`);
}
