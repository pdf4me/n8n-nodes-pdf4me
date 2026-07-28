const path = require('path');
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
	const configStream = src(['eslint.config.mjs', 'tsconfig.json'])
		.pipe(dest('dist'));

	// Return the configStream to signal async completion
	return configStream;
}

function copyFiles() {
	// Copy README, LICENSE, and index.js files to dist directory
	return src(['README.md', 'LICENSE.md', 'index.js'])
		.pipe(dest('dist'));
}
