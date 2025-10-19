import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	ActionConstants,
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
		hint: 'Extract structured data from health cards using AI technology for member management. See our <b><a href="https://docs.pdf4me.com/n8n/pdf4me-ai/ai-process-health-card/" target="_blank">complete guide</a></b> for detailed instructions and examples.',
	},
];

/**
 * AI Process Health Card - Extract structured data from health cards using PDF4ME's AI/ML technology
 * Process: Read health card → Encode to base64 → Send API request → Poll for completion → Return extracted results
 * 
 * This action mirrors the Python process_health_card() function functionality exactly:
 * - Extracts member information, policy details, coverage, and dependent data
 * - Supports various health card formats using AI/ML technology
 * - Always processes asynchronously for optimal performance
 * - Returns structured data in the same format as the Python script
 */
export async function execute(this: IExecuteFunctions, index: number) {
	const inputDataType = this.getNodeParameter('inputDataType', index) as string;
	const docName = this.getNodeParameter('docName', index) as string;

	let docContent: string;

	// Handle different input data types - convert all to base64
	if (inputDataType === 'binaryData') {
		// Get health card content from binary data
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;
		const item = this.getInputData(index);

		if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
			throw new Error(`No binary data found in property '${binaryPropertyName}'`);
		}

		const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
		docContent = buffer.toString('base64');
	} else if (inputDataType === 'base64') {
		// Use base64 content directly
		docContent = this.getNodeParameter('base64Content', index) as string;

		// Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
		if (docContent.includes(',')) {
			docContent = docContent.split(',')[1];
		}
	} else if (inputDataType === 'url') {
		// Download file from URL and convert to base64
		const healthCardUrl = this.getNodeParameter('healthCardUrl', index) as string;
		const response = await this.helpers.httpRequestWithAuthentication.call(this, 'pdf4meApi', {
			method: 'GET' as const,
			url: healthCardUrl,
			encoding: 'arraybuffer' as const,
		});
		const buffer = Buffer.from(response);
		docContent = buffer.toString('base64');
	} else {
		throw new Error(`Unsupported input data type: ${inputDataType}`);
	}

	// Validate health card content
	if (!docContent || docContent.trim() === '') {
		throw new Error('Health card content is required');
	}

	// Build the request payload - exactly like contract action
	const payload: IDataObject = {
		docContent,    // Base64 encoded health card document content
		docName,       // User-provided document name
		IsAsync: true,
	};



	// Make the API request to process the health card - matching contract action exactly
	let result: any;
	try {
		// Use async request function for health card processing
		result = await pdf4meAsyncRequest.call(this, '/api/v2/ProcessHealthCard', payload);
	} catch (error) {
		// Enhanced error handling with debugging context
		if (error.code === 'ECONNRESET') {
			throw new Error(`Connection was reset. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 500) {
			throw new Error(`PDF4Me server error (500): ${error.message || 'The service was not able to process your request.'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 404) {
			throw new Error(`API endpoint not found. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 401) {
			throw new Error(`Authentication failed. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 403) {
			throw new Error(`Access denied. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode === 429) {
			throw new Error(`Rate limit exceeded. Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else if (error.statusCode) {
			throw new Error(`PDF4Me API error (${error.statusCode}): ${error.message || 'Unknown error'} | Debug: docLength=${docContent?.length}, docName=${docName}`);
		} else {
			throw new Error(`Connection error: ${error.message || 'Unknown connection issue'} | Debug: docLength=${docContent?.length}, docName=${docName}, errorCode=${error.code}`);
		}
	}

	// Process the response - handle the exact same format as contract action
	if (result) {
		let processedData: any;

		// Parse the result
		try {
			if (typeof result === 'string') {
				processedData = JSON.parse(result);
			} else {
				processedData = result;
			}
		} catch (error) {
			throw new Error(`Failed to parse API response: ${error.message}`);
		}

		// Return both raw data and metadata
		return [
			{
				json: {
					...processedData, // Raw API response data
					_metadata: {
						success: true,
						message: 'Health card processed successfully using AI',
						processingTimestamp: new Date().toISOString(),
						sourceFileName: docName,
						operation: 'aiProcessHealthCard',
					},
				},
			},
		];
	}

	// Error case - no response received
	throw new Error('No response data received from PDF4ME AI Health Card Processing API');
}
