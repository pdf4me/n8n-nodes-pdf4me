import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '..');

function collectTsFiles(dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) files.push(...collectTsFiles(fullPath));
		else if (entry.name.endsWith('.ts')) files.push(fullPath);
	}
	return files;
}

function getProperty(obj, name) {
	for (const prop of obj.properties) {
		if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === name) return prop;
	}
	return undefined;
}

function getStringValue(node) {
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
	return undefined;
}

function isNodeParameter(obj) {
	const keys = new Set(obj.properties.filter((p) => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)).map((p) => p.name.text));
	return ['displayName', 'name', 'type', 'default'].every((k) => keys.has(k));
}

function toWhether(description) {
	if (description.startsWith('Whether')) return description;
	if (description.startsWith('Enable ')) return `Whether to enable ${description.slice(7, 8).toLowerCase()}${description.slice(8)}`;
	if (description.startsWith('Maintain ')) return `Whether to maintain ${description.slice(9, 10).toLowerCase()}${description.slice(10)}`;
	if (description.startsWith('Convert ')) return `Whether to convert ${description.slice(8, 9).toLowerCase()}${description.slice(9)}`;
	if (description.startsWith('Select true to ')) {
		const rest = description.slice(15);
		const [feature] = rest.split(' in PDF');
		return `Whether to ${feature.charAt(0).toLowerCase()}${feature.slice(1)} in PDF`;
	}
	return `Whether to ${description.charAt(0).toLowerCase()}${description.slice(1)}`;
}

for (const file of collectTsFiles(path.join(root, 'nodes'))) {
	const source = fs.readFileSync(file, 'utf8');
	const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
	const reps = [];
	const visit = (node) => {
		if (ts.isObjectLiteralExpression(node) && isNodeParameter(node)) {
			const typeProp = getProperty(node, 'type');
			const descProp = getProperty(node, 'description');
			if (getStringValue(typeProp?.initializer) === 'boolean' && descProp) {
				const value = getStringValue(descProp.initializer);
				if (value && !value.startsWith('Whether')) {
					const start = descProp.initializer.getStart(sf);
					const end = descProp.initializer.getEnd();
					const q = source[start];
					reps.push({ start, end, text: `${q}${toWhether(value)}${q}` });
				}
			}
		}
		ts.forEachChild(node, visit);
	};
	visit(sf);
	if (!reps.length) continue;
	reps.sort((a, b) => b.start - a.start);
	let out = source;
	for (const r of reps) out = out.slice(0, r.start) + r.text + out.slice(r.end);
	fs.writeFileSync(file, out);
}
