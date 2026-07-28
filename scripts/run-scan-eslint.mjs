import { ESLint } from 'eslint';
import glob from 'glob';
const globSync = glob.sync.bind(glob);
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

const { buildScanConfig } = await import('@n8n/scan-community-package/scanner/scanner.mjs');

const eslint = new ESLint({
	cwd: rootDir,
	fix: process.argv.includes('--fix'),
	allowInlineConfig: false,
	overrideConfigFile: true,
	overrideConfig: await buildScanConfig(),
});

const files = globSync('package.json', { cwd: rootDir, absolute: true })
	.concat(globSync('nodes/**/*.{js,ts,json}', { cwd: rootDir, absolute: true }))
	.concat(globSync('credentials/**/*.{js,ts,json}', { cwd: rootDir, absolute: true }));

const results = await eslint.lintFiles(files);
if (process.argv.includes('--fix')) {
	await ESLint.outputFixes(results);
}

const formatter = await eslint.loadFormatter('stylish');
console.log(await formatter.format(results));

const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);
console.log(`\n${errorCount} errors, ${warningCount} warnings`);
process.exit(errorCount > 0 ? 1 : 0);
