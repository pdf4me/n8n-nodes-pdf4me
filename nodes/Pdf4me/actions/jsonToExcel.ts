import type { INodeProperties } from 'n8n-workflow';
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	pdf4meAsyncRequest,
	sanitizeProfiles,
	ActionConstants,
} from '../GenericFunctions';



export const description: INodeProperties[] = [
	{
		displayName: 'Input Data Type',
		name: 'inputDataType',
		type: 'options',
		required: true,
		default: 'jsonString',
		description: 'Choose how to provide the JSON data to convert',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
			},
		},
		options: [
			{
				name: 'JSON String',
				value: 'jsonString',
				description: 'Provide JSON content as string',
			},
			{
				name: 'Binary Data',
				value: 'binaryData',
				description: 'Use JSON file from previous node',
			},
			{
				name: 'Base64 String',
				value: 'base64',
				description: 'Provide JSON content as base64 encoded string',
			},
		],
	},
	{
		displayName: 'JSON Content',
		name: 'jsonContent',
		type: 'json',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '[]',
		description: 'JSON data to convert to Excel',
		placeholder: '[{"Name": "John", "Age": 30}, {"Name": "Jane", "Age": 25}]',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
				inputDataType: ['jsonString'],
			},
		},
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description: 'Name of the binary property that contains the JSON file',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
				inputDataType: ['binaryData'],
			},
		},
	},
	{
		displayName: 'Base64 JSON Content',
		name: 'base64Content',
		type: 'string',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
		required: true,
		default: '',
		description: 'Base64 encoded JSON content',
		placeholder: 'W3siTmFtZSI6IkpvaG4iLCJBZ2UiOjMwfV0=',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
				inputDataType: ['base64'],
			},
		},
	},
	{
		displayName: 'Output File Name',
		name: 'outputFileName',
		type: 'string',

		default: 'converted_data.xlsx',
		description: 'Name for the output Excel file',
		placeholder: 'my-data.xlsx',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
			},
		},
	},
	{
		displayName: 'Document Name',
		name: 'docName',
		type: 'string',

		default: 'output',
		description: 'Name of the output document for reference',
		placeholder: 'data-export',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
			},
		},
	},
	{
		displayName: 'Worksheet Name',
		name: 'worksheetName',
		type: 'string',

		default: 'Sheet1',
		description: 'Name of the Excel worksheet',
		placeholder: 'Data',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
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
				operation: [ActionConstants.JsonToExcel],
			},
		},
		options: [
			{
				displayName: 'Convert Numbers and Dates',
				name: 'convertNumberAndDate',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically convert numbers and dates',
			},
			{
				displayName: 'Custom Profiles',
				name: 'profiles',
				type: 'string',
				default: '',
				description: 'Use "JSON" to adjust custom properties. Review Profiles at https://developer.pdf4me.com/api/profiles/index.html to set extra options for API calls.',
				placeholder: '{ \'outputDataFormat\': \'base64\' }',
			},
			{
				displayName: 'Date Format',
				name: 'dateFormat',
				type: 'string',
				default: '01/01/2025',
				description: 'Date format pattern for Excel cells',
				placeholder: 'MM/dd/yyyy',
			},
			{
				displayName: 'First Column',
				name: 'firstColumn',
				type: 'number',
				default: 1,
				description: 'Starting column number (1-based)',
				typeOptions: {
					minValue: 1,
					maxValue: 16384,
				},
			},
			{
				displayName: 'First Row',
				name: 'firstRow',
				type: 'number',
				default: 1,
				description: 'Starting row number (1-based)',
				typeOptions: {
					minValue: 1,
					maxValue: 1048576,
				},
			},
			{
				displayName: 'Ignore Null Values',
				name: 'ignoreNullValues',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore null values in the JSON',
			},
			{
				displayName: 'Number Format',
				name: 'numberFormat',
				type: 'options',
				default: '11',
				description: 'Number format code for Excel cells',
				options: [
					{ name: 'General (0)', value: '0' },
					{ name: 'Number (1)', value: '1' },
					{ name: 'Number with 2 Decimals (2)', value: '2' },
					{ name: 'Number with Thousands Separator (3)', value: '3' },
					{ name: 'Number with Thousands Separator and 2 Decimals (4)', value: '4' },
					{ name: 'Currency ($#,##0) (5)', value: '5' },
					{ name: 'Currency ($#,##0.00) (6)', value: '6' },
					{ name: 'Currency Red ($#,##0) (7)', value: '7' },
					{ name: 'Currency Red ($#,##0.00) (8)', value: '8' },
					{ name: 'Percentage (9)', value: '9' },
					{ name: 'Percentage with 2 Decimals (10)', value: '10' },
					{ name: 'Scientific (11)', value: '11' },
					{ name: 'Fraction (12)', value: '12' },
					{ name: 'Date (13)', value: '13' },
					{ name: 'Date (14)', value: '14' },
					{ name: 'Date (15)', value: '15' },
					{ name: 'Date (16)', value: '16' },
					{ name: 'Time (17)', value: '17' },
					{ name: 'Time (18)', value: '18' },
					{ name: 'Time (19)', value: '19' },
					{ name: 'Date/Time (20)', value: '20' },
					{ name: 'Date/Time (21)', value: '21' },
					{ name: 'Date/Time (22)', value: '22' },
				],
			},
			{
				displayName: 'Title Bold',
				name: 'isTitleBold',
				type: 'boolean',
				default: true,
				description: 'Whether to make the title row bold',
			},
			{
				displayName: 'Title Wrap Text',
				name: 'isTitleWrapText',
				type: 'boolean',
				default: true,
				description: 'Whether to wrap text in title cells',
			},
		],
	},
	{
		displayName: 'Binary Data Output Name',
		name: 'binaryDataName',
		type: 'string',
		default: 'data',
		description: 'Custom name for the binary data in n8n output',
		placeholder: 'excel-file',
		displayOptions: {
			show: {
				operation: [ActionConstants.JsonToExcel],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, index: number) {
	try {
		const inputDataType = this.getNodeParameter('inputDataType', index) as string;
		const outputFileName = this.getNodeParameter('outputFileName', index) as string;
	const binaryDataName = this.getNodeParameter('binaryDataName', index) as string;
		const docName = this.getNodeParameter('docName', index) as string;
		const worksheetName = this.getNodeParameter('worksheetName', index) as string;

		const advancedOptions = this.getNodeParameter('advancedOptions', index) as IDataObject;

		let docContent: string;

		// Handle different input data types
		if (inputDataType === 'jsonString') {
			// Get JSON content directly
			const jsonContent = this.getNodeParameter('jsonContent', index) as string;

			// Validate JSON
			try {
				JSON.parse(jsonContent);
			} catch (error) {
				throw new Error(`Invalid JSON content: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}

			// Convert to base64
			docContent = Buffer.from(jsonContent, 'utf-8').toString('base64');
		} else if (inputDataType === 'binaryData') {
			// Get JSON content from binary data
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index) as string;
			const item = this.getInputData(index);

			if (!item[0].binary || !item[0].binary[binaryPropertyName]) {
				throw new Error(`No binary data found in property '${binaryPropertyName}'`);
			}

			const buffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);
			const jsonString = buffer.toString('utf-8');

			// Validate JSON
			try {
				JSON.parse(jsonString);
			} catch (error) {
				throw new Error(`Invalid JSON in binary data: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}

			docContent = buffer.toString('base64');
		} else {
			// Use base64 content directly
			docContent = this.getNodeParameter('base64Content', index) as string;

			// Remove data URL prefix if present (e.g., "data:application/json;base64,")
			if (docContent.includes(',')) {
				docContent = docContent.split(',')[1];
			}

			// Validate that base64 decodes to valid JSON
			try {
				const jsonString = Buffer.from(docContent, 'base64').toString('utf-8');
				JSON.parse(jsonString);
			} catch (error) {
				throw new Error(`Invalid JSON in base64 content: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}

		// Validate base64 content
		if (!docContent || docContent.trim() === '') {
			throw new Error('JSON content is required');
		}

		// Build the request body
		const body: IDataObject = {
			docContent,
			docName,
			worksheetName,
			isTitleWrapText: advancedOptions?.isTitleWrapText !== undefined ? advancedOptions.isTitleWrapText : true,
			isTitleBold: advancedOptions?.isTitleBold !== undefined ? advancedOptions.isTitleBold : true,
			convertNumberAndDate: advancedOptions?.convertNumberAndDate !== undefined ? advancedOptions.convertNumberAndDate : false,
			numberFormat: advancedOptions?.numberFormat || '11',
			dateFormat: advancedOptions?.dateFormat || '01/01/2025',
			ignoreNullValues: advancedOptions?.ignoreNullValues !== undefined ? advancedOptions.ignoreNullValues : false,
			firstRow: advancedOptions?.firstRow !== undefined ? advancedOptions.firstRow : 1,
			firstColumn: advancedOptions?.firstColumn !== undefined ? advancedOptions.firstColumn : 1,
			IsAsync: true,
		};

		// Add profiles if provided
		const profiles = advancedOptions?.profiles as string | undefined;
		if (profiles) body.profiles = profiles;

		sanitizeProfiles(body);

		const responseData = await pdf4meAsyncRequest.call(this, '/api/v2/ConvertJsonToExcel', body);

		// Handle the binary response (Excel file data)
		if (responseData) {
			// Generate filename if not provided
			let fileName = outputFileName;
			if (!fileName || fileName.trim() === '') {
				// Extract name from docName if available, otherwise use default
				const baseName = docName || 'converted_data';
				fileName = `${baseName}.xlsx`;
			}

			// Ensure .xlsx extension
			if (!fileName.toLowerCase().endsWith('.xlsx')) {
				fileName = `${fileName.replace(/\.[^.]*$/, '')}.xlsx`;
			}

			// responseData is already binary data (Buffer)
			const binaryData = await this.helpers.prepareBinaryData(
				responseData,
				fileName,
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			);

			return [
				{
					json: {
						fileName,
						mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
						fileSize: responseData.length,
						success: true,
						worksheetName,
						rowCount: null, // Could be calculated if needed
						columnCount: null, // Could be calculated if needed
					},
			binary: {
				[binaryDataName || 'data']: binaryData,
			},
				},
			];
		}

		// Error case
		throw new Error('No response data received from PDF4ME API');
	} catch (error) {
		// Re-throw the error with additional context
		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
		throw new Error(`JSON to Excel conversion failed: ${errorMessage}`);
	}
}
