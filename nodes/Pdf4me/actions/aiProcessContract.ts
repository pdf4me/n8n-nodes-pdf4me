import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
	sanitizeProfiles,
} from '../GenericFunctions';



export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'binaryData',
		description: 'Choose how to provide the contract document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use contract file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide contract content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to contract file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: false,
		default: 'data',
		description: 'Name of the binary property that contains the contract file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Contract Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded contract content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Contract URL',
		name: 'contractUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the contract file to process',
		placeholder: 'https://example.com/contract.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Contract Name',
		name: 'docName',
		type: 'string',
		default: 'contract.pdf',
		description: 'Name of the source contract file for reference',
		placeholder: 'original-contract.pdf',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		required: true,
		default: 'json',
		description: 'Choose the output format for the processed contract data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Return structured JSON data with extracted contract information',
			},
			{
				name: 'Text',
				value: 'text',
				description: 'Return formatted text summary of extracted contract data',
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'processed_contract',
		description: 'Name for the output file (without extension)',
		placeholder: 'extracted_contract_data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
				outputFormat: ['text'],
			},
		},
	},
	{
		displayName: 'Advanced Options',
		name: 'advancedOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessContract],
			},
		},
		options: [
			{
				displayName: 'Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Custom processing profiles for contract analysis',
				placeholder: 'contract_profile_1, contract_profile_2',
			},
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index, 'processed_contract') as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const profiles = advancedOptions?.profiles as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get contract content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;
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

		// Remove data URL prefix if present (e.g., "data:application/pdf;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const contractUrl = this.getNodeParameter('contractUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: contractUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		originalFileName = contractUrl.split('/').pop() || 'contract.pdf';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate contract content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Contract content is required');
	}

	// Build the request body for contract processing
	const body: IDataObject = {
		docContent,
		docName: originalFileName,
		IsAsync: true,
	};

	// Add profiles if provided
	if (profiles) {
		body.profiles = profiles;
	}

	// Sanitize profiles
	sanitizeProfiles(body);



	// Make the API request to process the contract
	let result: any;
	try {
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessContract', body);
	} catch (error) {
		// Handle connection and API errors with better debugging
		
		if (error.code === 'ECONNRESET') {
			throw new Error('Connection was reset. Please check your network connection and try again.');
		} else if (error.statusCode === 500) {
			throw new Error(`PDF4Me server error (500): ${error.message || 'The service was not able to process your request. Check the console logs for details.'}`);
		} else if (error.statusCode === 404) {
			throw new Error('API endpoint not found. Please check if the PDF4Me service is properly configured.');
		} else if (error.statusCode === 401) {
			throw new Error('Authentication failed. Please check your PDF4Me API credentials.');
		} else if (error.statusCode === 403) {
			throw new Error('Access denied. Please check your PDF4Me API permissions.');
		} else if (error.statusCode === 429) {
			throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
		} else if (error.statusCode) {
			throw new Error(`PDF4Me API error (${error.statusCode}): ${error.message || 'Unknown error'}`);
		} else {
			throw new Error(`Connection error: ${error.message || 'Unknown connection issue'}`);
		}
	}

	// Process the response
	if (result) {
		let processedData: any;
		let outputText: string = '';

		// Try to parse as JSON first
		try {
			if (typeof result === 'string') {
				processedData = JSON.parse(result);
			} else {
				processedData = result;
			}
		} catch (error) {
			// If not JSON, treat as raw text
			processedData = { rawContent: result };
		}

		// Format output based on user preference
		if (outputFormat === 'text') {
			// Create formatted text output similar to Python implementation
			outputText = 'AI Contract Processing Results\n';
			outputText += '============================\n';
			outputText += `Processed on: ${new Date().toISOString()}\n`;
			outputText += `Source file: ${originalFileName}\n\n`;

			// Extract key contract fields
			if (processedData.contractTitle) {
				outputText += `Contract Title: ${processedData.contractTitle}\n`;
			}
			if (processedData.contractNumber) {
				outputText += `Contract Number: ${processedData.contractNumber}\n`;
			}
			if (processedData.contractType) {
				outputText += `Contract Type: ${processedData.contractType}\n`;
			}
			if (processedData.effectiveDate) {
				outputText += `Effective Date: ${processedData.effectiveDate}\n`;
			}
			if (processedData.expirationDate) {
				outputText += `Expiration Date: ${processedData.expirationDate}\n`;
			}
			if (processedData.contractValue) {
				outputText += `Contract Value: ${processedData.contractValue}\n`;
			}
			if (processedData.currency) {
				outputText += `Currency: ${processedData.currency}\n`;
			}

			// Add parties information if available
			if (processedData.parties && Array.isArray(processedData.parties)) {
				outputText += '\nParties:\n';
				outputText += '--------\n';
				processedData.parties.forEach((party: any, index: number) => {
					outputText += `${index + 1}. ${party.name || 'N/A'}\n`;
					if (party.role) outputText += `   Role: ${party.role}\n`;
					if (party.type) outputText += `   Type: ${party.type}\n`;
					if (party.address) outputText += `   Address: ${party.address}\n`;
					outputText += '\n';
				});
			}

			// Add key terms if available
			if (processedData.keyTerms && Array.isArray(processedData.keyTerms)) {
				outputText += '\nKey Terms:\n';
				outputText += '----------\n';
				processedData.keyTerms.forEach((term: any, index: number) => {
					outputText += `${index + 1}. ${term.term || 'N/A'}\n`;
					if (term.description) outputText += `   Description: ${term.description}\n`;
					if (term.value) outputText += `   Value: ${term.value}\n`;
					outputText += '\n';
				});
			}

			// Add obligations if available
			if (processedData.obligations && Array.isArray(processedData.obligations)) {
				outputText += '\nObligations:\n';
				outputText += '------------\n';
				processedData.obligations.forEach((obligation: any, index: number) => {
					outputText += `${index + 1}. ${obligation.description || 'N/A'}\n`;
					if (obligation.party) outputText += `   Party: ${obligation.party}\n`;
					if (obligation.deadline) outputText += `   Deadline: ${obligation.deadline}\n`;
					if (obligation.penalty) outputText += `   Penalty: ${obligation.penalty}\n`;
					outputText += '\n';
				});
			}

			// Add clauses if available
			if (processedData.clauses && Array.isArray(processedData.clauses)) {
				outputText += '\nKey Clauses:\n';
				outputText += '------------\n';
				processedData.clauses.forEach((clause: any, index: number) => {
					outputText += `${index + 1}. ${clause.title || 'N/A'}\n`;
					if (clause.content) outputText += `   Content: ${clause.content}\n`;
					if (clause.type) outputText += `   Type: ${clause.type}\n`;
					outputText += '\n';
				});
			}

			// Add dates if available
			if (processedData.importantDates && Array.isArray(processedData.importantDates)) {
				outputText += '\nImportant Dates:\n';
				outputText += '----------------\n';
				processedData.importantDates.forEach((date: any, index: number) => {
					outputText += `${index + 1}. ${date.event || 'N/A'}\n`;
					if (date.date) outputText += `   Date: ${date.date}\n`;
					if (date.description) outputText += `   Description: ${date.description}\n`;
					outputText += '\n';
				});
			}

			outputText += '\nFull Response:\n';
			outputText += JSON.stringify(processedData, null, 2);

			// Create binary output for text file
			const textBuffer = Buffer.from(outputText, 'utf8');
			const binaryData = await this.helpers.prepareBinaryData(
				textBuffer,
				`${outputFileName}.txt`,
				'text/plain',
			);

			return [
				{
					json: {
						success: true,
						message: 'Contract processed successfully using AI',
						fileName: `${outputFileName}.txt`,
						mimeType: 'text/plain',
						fileSize: textBuffer.length,
						contractTitle: processedData.contractTitle,
						contractNumber: processedData.contractNumber,
						contractType: processedData.contractType,
						processingTimestamp: new Date().toISOString(),
					},
					binary: {
						data: binaryData,
					},
				},
			];
		} else {
			// Return JSON output
			return [
				{
					json: {
						success: true,
						message: 'Contract processed successfully using AI',
						processedData,
						contractTitle: processedData.contractTitle,
						contractNumber: processedData.contractNumber,
						contractType: processedData.contractType,
						effectiveDate: processedData.effectiveDate,
						expirationDate: processedData.expirationDate,
						contractValue: processedData.contractValue,
						currency: processedData.currency,
						parties: processedData.parties,
						keyTerms: processedData.keyTerms,
						obligations: processedData.obligations,
						clauses: processedData.clauses,
						importantDates: processedData.importantDates,
						processingTimestamp: new Date().toISOString(),
					},
				},
			];
		}
	}

	// Error case
	throw new Error('No response data received from PDF4ME AI Contract Processing API');
}
