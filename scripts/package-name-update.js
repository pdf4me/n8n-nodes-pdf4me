const fs = require('fs');
const path = require('path');

// Get the new name from environment variable or hardcode here
const env = process.env.NODE_ENV || 'production';

// Path to package.json
const packageJsonPath = path.join(__dirname,'..' ,'package.json');

// Read the existing package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
let newName = packageJson.name;
let version = packageJson.version;
if (env === 'development') {
	newName = 'n8n-nodes-pdf4me-beta';
	version = '1.0.5'
} else {
	newName = 'n8n-nodes-pdf4me';
	version = '1.4.0'
}
// Change the name
packageJson.name = newName;
packageJson.version = version;

// Write the updated package.json back
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`package.json name has been updated to: ${newName}`);
