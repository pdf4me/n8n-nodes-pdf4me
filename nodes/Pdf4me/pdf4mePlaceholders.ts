import type { INodeProperties } from 'n8n-workflow';

// ---------------------------------------------------------------------------
// Shared placeholders
// ---------------------------------------------------------------------------

export const PDF_FILE = {
	templateName: 'template.pdf',
	documentName: 'document.pdf',
	templateUrl: 'https://example.com/template.pdf',
	documentUrl: 'https://example.com/document.pdf',
	base64Sample: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
} as const;

export const COLLECTION_PLACEHOLDER = {
	addOption: 'Add Option',
	addFormField: 'Add Form Field',
} as const;

export const CUSTOM_PROFILES_PLACEHOLDER = '{ \'outputDataFormat\': \'base64\' }';

// ---------------------------------------------------------------------------
// Fill PDF Form
// ---------------------------------------------------------------------------

export const FILL_PDF_FORM = {
	formDataBase64: 'eyJmaXJzdG5hbWUiOiJKb2huIn0=',
	formFieldName: 'e.g., firstname',
	formFieldValue: 'e.g., John',
	outputFileName: 'my-filled-form.pdf',
	binaryDataName: 'filled-pdf',
	formDataJsonDefault: '{"firstname": "John", "lastname": "Doe", "email": "john@example.com"}',
} as const;

// ---------------------------------------------------------------------------
// Generate Document
// ---------------------------------------------------------------------------

export const TEMPLATE_FILE_NAME = {
	Docx: 'template.docx',
	MailMerge: 'template.docx',
	GoogleDocs: 'template.docx',
	HTML: 'template.html',
	PDF: 'template.pdf',
} as const;

export const TEMPLATE_FILE_URL = {
	Docx: 'https://example.com/template.docx',
	MailMerge: 'https://example.com/template.docx',
	GoogleDocs: 'https://example.com/template.docx',
	HTML: 'https://example.com/template.html',
	PDF: 'https://example.com/template.pdf',
} as const;

export const DOCUMENT_DATA_FILE_NAME = {
	Json: 'data.json',
	XML: 'data.xml',
	Csv: 'data.csv',
} as const;

export const DOCUMENT_DATA_FILE_URL = {
	Json: 'https://example.com/data.json',
	XML: 'https://example.com/data.xml',
	Csv: 'https://example.com/data.csv',
} as const;

export const DOCUMENT_DATA_TEXT = {
	Json: '{"name": "John Doe", "email": "john@example.com", "items": [{"product": "Widget", "price": 29.99}]}',
	XML: '<?xml version="1.0" encoding="UTF-8"?><root><name>John Doe</name><email>john@example.com</email></root>',
	Csv: 'name,email\nJohn Doe,john@example.com',
} as const;

export const OUTPUT_FILE_NAME = {
	PDF: 'generated_document',
	Docx: 'generated_document',
	xlsx: 'generated_document',
	HTML: 'generated_document',
} as const;

export const GENERATE_DOCUMENT = {
	binaryDataName: 'generated-document',
	binaryDataNameMultiple: 'generated-documents',
} as const;

export const WORD_TEMPLATE_TYPES = ['Docx', 'MailMerge', 'GoogleDocs'] as const;

export const HTML_TEMPLATE_PLACEHOLDER =
	'<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{heading}}</h1><p>{{content}}</p></body></html>';

// ---------------------------------------------------------------------------
// ZUGFeRD Invoice
// ---------------------------------------------------------------------------

export const ZUGFERD = {
	docName: 'invoice.pdf',
	outputFileName: 'zugferd_invoice.pdf',
} as const;

export const ZUGFERD_INVOICE_DATA_URL = {
	XML: 'https://example.com/invoice.xml',
	JSON: 'https://example.com/invoice.json',
	CSV: 'https://example.com/invoice.csv',
} as const;

// ---------------------------------------------------------------------------
// Swiss QR Bill
// ---------------------------------------------------------------------------

export const SWISS_QR_BILL = {
	amount: '1000',
	iban: 'CH0200700110003765824',
	creditorName: 'Test AG',
	creditorStreet: 'Test Strasse',
	creditorBuilding: '1',
	postalCode: '8000',
	city: 'Zurich',
	debtorName: 'Test Debt AG',
	debtorStreet: 'Test Deb Strasse',
	debtorBuilding: '2',
	reference: 'REF123456789',
	unstructuredMessage: 'Thank you for your business',
	billingInfo: 'Invoice for services rendered',
	av1: 'AV1',
	av2: 'AV2',
} as const;

export const SWISS_QR_OUTPUT_FILE_NAME = {
	pdf: 'swissqr_bill.pdf',
	png: 'swissqr_bill.png',
	jpeg: 'swissqr_bill.jpeg',
	tiff: 'swissqr_bill.tiff',
	'': 'swissqr_bill.pdf',
} as const;

// ---------------------------------------------------------------------------
// Field builders
// ---------------------------------------------------------------------------

type ShowRules = Record<string, string[]>;

function stringField(
	operation: string,
	field: {
		displayName: string;
		name: string;
		description: string;
		placeholder: string;
		show: ShowRules;
		required?: boolean;
		default?: string;
		hint?: string;
		typeOptions?: INodeProperties['typeOptions'];
	},
): INodeProperties {
	const nodeProperty: INodeProperties = {
		displayName: field.displayName,
		name: field.name,
		type: 'string',
		default: '',
		description: field.description,
		placeholder: field.placeholder,
		...(field.required !== undefined && { required: field.required }),
		...(field.hint && { hint: field.hint }),
		...(field.typeOptions && { typeOptions: field.typeOptions }),
		displayOptions: {
			show: {
				operation: [operation],
				...field.show,
			},
		},
	};

	if (field.default !== undefined) {
		nodeProperty.default = field.default;
	}

	return nodeProperty;
}

export function pdfFileUrlField(
	operation: string,
	name: 'pdfUrl' | 'fileUrl',
	inputDataTypeKey: 'pdfInputDataType' | 'inputDataType',
): INodeProperties {
	return stringField(operation, {
		displayName: name === 'pdfUrl' ? 'PDF URL' : 'File URL',
		name,
		description: name === 'pdfUrl' ? 'URL to the PDF file' : 'URL to the file to process',
		placeholder: PDF_FILE.templateUrl,
		required: true,
		show: { [inputDataTypeKey]: ['url'] },
	});
}

export function templateFileNameFields(
	operation: string,
	name: 'templateFileName' | 'templateFileNameRequired',
	inputTypes: string[],
	options?: {
		required?: boolean;
		hint?: string;
		templateFileTypes?: (keyof typeof TEMPLATE_FILE_NAME)[];
	},
): INodeProperties[] {
	const types = options?.templateFileTypes ??
		(Object.keys(TEMPLATE_FILE_NAME) as (keyof typeof TEMPLATE_FILE_NAME)[]);
	return types.map((templateFileType) =>
		stringField(operation, {
			displayName: 'Template File Name',
			name,
			description: 'Name of the template file (including extension)',
			placeholder: TEMPLATE_FILE_NAME[templateFileType],
			show: {
				templateInputDataType: inputTypes,
				templateFileType: [templateFileType],
			},
			...(options?.required && { required: true }),
			...(options?.hint && name === 'templateFileName' && { hint: options.hint }),
		}),
	);
}

export function templateFileUrlFields(
	operation: string,
	templateFileTypes?: (keyof typeof TEMPLATE_FILE_URL)[],
): INodeProperties[] {
	const types = templateFileTypes ??
		(Object.keys(TEMPLATE_FILE_URL) as (keyof typeof TEMPLATE_FILE_URL)[]);
	return types.map((templateFileType) =>
		stringField(operation, {
			displayName: 'Template File URL',
			name: 'templateFileUrl',
			description: 'URL of the template file',
			placeholder: TEMPLATE_FILE_URL[templateFileType],
			required: true,
			show: {
				templateInputDataType: ['url'],
				templateFileType: [templateFileType],
			},
		}),
	);
}

export function documentDataFileNameFields(
	operation: string,
	name: 'documentDataFileName' | 'documentDataFileNameRequired',
	inputTypes: string[],
	dataTypes: (keyof typeof DOCUMENT_DATA_FILE_NAME)[],
	required?: boolean,
): INodeProperties[] {
	return dataTypes.map((documentDataType) =>
		stringField(operation, {
			displayName: 'Document Data File Name',
			name,
			description: 'Name of the data file (including extension)',
			placeholder: DOCUMENT_DATA_FILE_NAME[documentDataType],
			show: {
				documentInputDataType: inputTypes,
				documentDataType: [documentDataType],
			},
			...(required && { required: true }),
		}),
	);
}

export function documentDataFileUrlFields(
	operation: string,
	dataTypes: (keyof typeof DOCUMENT_DATA_FILE_NAME)[],
): INodeProperties[] {
	return dataTypes.map((documentDataType) =>
		stringField(operation, {
			displayName: 'Document Data File URL',
			name: 'documentDataFileUrl',
			description: 'URL of the data file',
			placeholder: DOCUMENT_DATA_FILE_URL[documentDataType],
			required: true,
			show: {
				documentInputDataType: ['url'],
				documentDataType: [documentDataType],
			},
		}),
	);
}

export function documentDataTextFields(
	operation: string,
	dataTypes: (keyof typeof DOCUMENT_DATA_TEXT)[],
	options?: { required?: boolean; description?: string },
): INodeProperties[] {
	return dataTypes.map((documentDataType) =>
		stringField(operation, {
			displayName: 'Document Data Text',
			name: 'documentDataText',
			description:
				options?.description ??
				'Manual data entry for the template (required if Document Data File is not provided)',
			placeholder: DOCUMENT_DATA_TEXT[documentDataType],
			show: {
				documentInputDataType: ['text'],
				documentDataType: [documentDataType],
			},
			...(options?.required && { required: true }),
			typeOptions: { alwaysOpenEditWindow: true },
		}),
	);
}

export function outputFileNameFields(
	operation: string,
	outputTypes?: (keyof typeof OUTPUT_FILE_NAME)[],
): INodeProperties[] {
	const types = outputTypes ?? (Object.keys(OUTPUT_FILE_NAME) as (keyof typeof OUTPUT_FILE_NAME)[]);
	return types.map((outputType) =>
		stringField(operation, {
			displayName: 'Output File Name',
			name: 'outputFileName',
			description:
				'Name for the output file(s). If multiple documents are generated, this will be used as a prefix with numbers appended (e.g., "document" becomes "document1.pdf", "document2.pdf", etc.)',
			placeholder: OUTPUT_FILE_NAME[outputType],
			show: { outputType: [outputType] },
		}),
	);
}

export function zugferdInvoiceDataUrlFields(operation: string): INodeProperties[] {
	const formats = Object.keys(ZUGFERD_INVOICE_DATA_URL) as (keyof typeof ZUGFERD_INVOICE_DATA_URL)[];
	return formats.map((inputFormat) =>
		stringField(operation, {
			displayName: 'Invoice Data URL',
			name: 'invoiceDataUrl',
			description: 'URL to the invoice data file (XML/JSON/CSV)',
			placeholder: ZUGFERD_INVOICE_DATA_URL[inputFormat],
			required: true,
			show: {
				invoiceDataInputType: ['url'],
				inputFormat: [inputFormat],
			},
		}),
	);
}

export function swissQrOutputFileNameFields(operation: string): INodeProperties[] {
	const formats = Object.keys(SWISS_QR_OUTPUT_FILE_NAME) as (keyof typeof SWISS_QR_OUTPUT_FILE_NAME)[];
	return formats.map((formatType) =>
		stringField(operation, {
			displayName: 'Output File Name',
			name: 'outputFileName',
			description: 'Name for the output Swiss QR Bill file',
			placeholder: SWISS_QR_OUTPUT_FILE_NAME[formatType],
			default: formatType === 'pdf' ? 'swissqr_bill.pdf' : '',
			show: { formatType: [formatType] },
		}),
	);
}
