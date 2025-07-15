/**
 * @type {import('@types/eslint').ESLint.ConfigData}
 */
module.exports = {
	root: true,

	env: {
		browser: true,
		es6: true,
		node: true,
	},

	parser: '@typescript-eslint/parser',

	parserOptions: {
		project: ['./tsconfig.json'],
		sourceType: 'module',
		extraFileExtensions: ['.json'],
	},

	ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**', 'package.json'],

	plugins: [
		'@typescript-eslint',
		'eslint-plugin-n8n-nodes-base',
	],

	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],

	rules: {
		// Basic TypeScript rules
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		
		// General code quality rules
		'no-console': 'warn',
		'no-debugger': 'error',
		'no-unused-vars': 'off', // Use TypeScript version instead
		'prefer-const': 'error',
		'no-var': 'error',
		
		// Formatting rules
		'indent': ['error', 'tab'],
		'quotes': ['error', 'single'],
		'semi': ['error', 'always'],
		'comma-dangle': ['error', 'always-multiline'],
	},
};
