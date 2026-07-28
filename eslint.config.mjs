import { config } from '@n8n/node-cli/eslint';
import tseslint from 'typescript-eslint';

export default [
	...config,
	{
		files: ['**/*.ts'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					caughtErrors: 'none',
				},
			],
		},
	},
];
