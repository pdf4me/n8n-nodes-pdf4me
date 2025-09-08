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
		description: 'Choose how to provide the health card document to process',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
			},
		},
		options: [
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use health card file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide health card content as base64 encoded string',
			},
			{
				name: 'URL',
				value: 'url',
				description: 'Provide URL to health card file',
			},
		],
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: false,
		default: 'data',
		description: 'Name of the binary property that contains the health card file',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 Health Card Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded health card content',
		placeholder: 'JVBERi0xLjQKJcfsj6IKNSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Health Card URL',
		name: 'healthCardUrl',
		type: 'string',
		required: true,
		default: '',
		description: 'URL to the health card file to process',
		placeholder: 'https://example.com/health_card.jpeg',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
				inputDataType: ['url'],
			},
		},
	},
	{
		displayName: 'Health Card Name',
		name: 'docName',
		type: 'string',
		default: 'health_card.jpeg',
		description: 'Name of the source health card file for reference',
		placeholder: 'original-health_card.jpeg',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
			},
		},
	},
	{
		displayName: 'Output Format',
		name: 'outputFormat',
		type: 'options',
		required: true,
		default: 'json',
		description: 'Choose the output format for the processed health card data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
			},
		},
		options: [
			{
				name: 'JSON',
				value: 'json',
				description: 'Return structured JSON data with extracted health card information',
			},
			{
				name: 'Text',
				value: 'text',
				description: 'Return formatted text summary of extracted health card data',
			},
		],
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',
		default: 'processed_health_card',
		description: 'Name for the output file (without extension)',
		placeholder: 'extracted_health_card_data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
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
				operation: [ActionConstants.AiProcessHealthCard],
			},
		},
		options: [
			{
				displayName: 'Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Custom processing profiles for health card analysis',
				placeholder: 'healthcard_profile_1, healthcard_profile_2',
			},
		],
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'health-card-data',
		displayOptions: {
			show: {
				operation: [ActionConstants.AiProcessHealthCard],
				outputFormat: ['text'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;
	const outputFormat = this.getNodeParameter('outputFormat', index) as string;
	const outputFileName = this.getNodeParameter('outputFileName', index, 'processed_health_card') as string;
	const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;
	const profiles = advancedOptions?.profiles as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;

	let docContent: string;
	let originalFileName = docName;

	// Handle different input data types
	if (inputDataType === 'binaryData') {
		// Get health card content from binary data
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

		// Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		const healthCardUrl = this.getNodeParameter('healthCardUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: healthCardUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = await this.helpers.binaryToBuffer(response);
		docContent = buffer.toString('base64');
		originalFileName = healthCardUrl.split('/').pop() || 'health_card.jpeg';
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate health card content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Health card content is required');
	}

	// Build the request body for health card processing
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



	// Make the API request to process the health card
	let result: any;
	try {
		// Use async processing for better performance
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessHealthCard', body);
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
			outputText = 'AI Health Card Processing Results\n';
			outputText += '================================\n';
			outputText += `Processed on: ${new Date().toISOString()}\n`;
			outputText += `Source file: ${originalFileName}\n\n`;

			// Extract key health card fields
			if (processedData.memberName) {
				outputText += `Member Name: ${processedData.memberName}\n`;
			}
			if (processedData.memberId) {
				outputText += `Member ID: ${processedData.memberId}\n`;
			}
			if (processedData.policyNumber) {
				outputText += `Policy Number: ${processedData.policyNumber}\n`;
			}
			if (processedData.groupNumber) {
				outputText += `Group Number: ${processedData.groupNumber}\n`;
			}
			if (processedData.effectiveDate) {
				outputText += `Effective Date: ${processedData.effectiveDate}\n`;
			}
			if (processedData.expirationDate) {
				outputText += `Expiration Date: ${processedData.expirationDate}\n`;
			}
			if (processedData.insuranceProvider) {
				outputText += `Insurance Provider: ${processedData.insuranceProvider}\n`;
			}
			if (processedData.planType) {
				outputText += `Plan Type: ${processedData.planType}\n`;
			}
			if (processedData.coverageLevel) {
				outputText += `Coverage Level: ${processedData.coverageLevel}\n`;
			}
			if (processedData.deductible) {
				outputText += `Deductible: ${processedData.deductible}\n`;
			}
			if (processedData.copay) {
				outputText += `Copay: ${processedData.copay}\n`;
			}

			// Add dependent information if available
			if (processedData.dependents && Array.isArray(processedData.dependents)) {
				outputText += '\nDependents:\n';
				outputText += '-----------\n';
				processedData.dependents.forEach((dependent: any, index: number) => {
					outputText += `${index + 1}. ${dependent.name || 'N/A'}\n`;
					if (dependent.relationship) outputText += `   Relationship: ${dependent.relationship}\n`;
					if (dependent.dateOfBirth) outputText += `   Date of Birth: ${dependent.dateOfBirth}\n`;
					outputText += '\n';
				});
			}

			// Add coverage details if available
			if (processedData.coverageDetails && Array.isArray(processedData.coverageDetails)) {
				outputText += '\nCoverage Details:\n';
				outputText += '-----------------\n';
				processedData.coverageDetails.forEach((coverage: any, index: number) => {
					outputText += `${index + 1}. ${coverage.service || 'N/A'}\n`;
					if (coverage.coverage) outputText += `   Coverage: ${coverage.coverage}\n`;
					if (coverage.limits) outputText += `   Limits: ${coverage.limits}\n`;
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
						message: 'Health card processed successfully using AI',
						fileName: `${outputFileName}.txt`,
						mimeType: 'text/plain',
						fileSize: textBuffer.length,
						memberName: processedData.memberName,
						memberId: processedData.memberId,
						policyNumber: processedData.policyNumber,
						processingTimestamp: new Date().toISOString(),
					},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
				},
			];
		} else {
			// Return JSON output
			return [
				{
					json: {
						success: true,
						message: 'Health card processed successfully using AI',
						processedData,
						memberName: processedData.memberName,
						memberId: processedData.memberId,
						policyNumber: processedData.policyNumber,
						groupNumber: processedData.groupNumber,
						effectiveDate: processedData.effectiveDate,
						expirationDate: processedData.expirationDate,
						insuranceProvider: processedData.insuranceProvider,
						planType: processedData.planType,
						coverageLevel: processedData.coverageLevel,
						deductible: processedData.deductible,
						copay: processedData.copay,
						dependents: processedData.dependents,
						coverageDetails: processedData.coverageDetails,
						processingTimestamp: new Date().toISOString(),
					},
				},
			];
		}
	}

	// Error case
	throw new Error('No response data received from PDF4ME AI Health Card Processing API');
}
