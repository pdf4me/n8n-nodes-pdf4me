const path = require('path');
const fs = require('fs');
const { task, src, dest, series } = require('gulp');
const merge = require('merge-stream');

task('build:icons', copyIcons);
task('build:config', copyConfig);
task('build:files', copyFiles);
task('build', series('build:icons', 'build:config', 'build:files'));

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	return src(credSource).pipe(dest(credDestination));
}

function copyConfig() {
	// Copy ESLint configuration files and tsconfig.json to dist directory
	const configStream = src(['.eslintrc.js', '.eslintrc.prepublish.js', 'tsconfig.json'])
		.pipe(dest('dist'));

	// Create custom package.json for dist directory
	const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
	packageJson.scripts.prepublishOnly = 'eslint -c .eslintrc.prepublish.js package.json';
	
	// Fix the n8n paths for the dist package.json
	packageJson.n8n.credentials = packageJson.n8n.credentials.map(path => path.replace('dist/', ''));
	packageJson.n8n.nodes = packageJson.n8n.nodes.map(path => path.replace('dist/', ''));
	
	fs.writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 4));

	// Return the configStream to signal async completion
	return configStream;
}

function copyFiles() {
	// Copy README, LICENSE, and index.js files to dist directory
	return src(['README.md', 'LICENSE.md', 'index.js'])
		.pipe(dest('dist'));
}
