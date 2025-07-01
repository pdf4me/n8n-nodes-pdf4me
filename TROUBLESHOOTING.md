# PDF4ME n8n Node - Troubleshooting Guide

## Common Issues and Solutions

### ❌ Error: "Cannot find module '/path/to/n8n/nodes/node_modules/n8n-nodes-pdf4me/dist/nodes/Pdf4me/Pdf4me.node.js'"

This error typically occurs when the compiled JavaScript files are missing or the package structure is incorrect.

#### 🔍 Diagnosis Steps

1. **Check if the package is properly installed**:
   ```bash
   npm list n8n-nodes-pdf4me
   ```

2. **Verify the file exists in the installed package**:
   ```bash
   ls -la node_modules/n8n-nodes-pdf4me/dist/nodes/Pdf4me/Pdf4me.node.js
   ```

3. **Check the package contents**:
   ```bash
   npm pack --dry-run
   ```

#### ✅ Solutions

##### Solution 1: Reinstall the Package
```bash
# Remove the existing package
npm uninstall n8n-nodes-pdf4me

# Clear npm cache
npm cache clean --force

# Reinstall the package
npm install n8n-nodes-pdf4me
```

##### Solution 2: Use the Latest Version
Make sure you're using the latest version of the package:
```bash
npm install n8n-nodes-pdf4me@latest
```

##### Solution 3: Manual Installation
If the npm package has issues, you can install manually:
```bash
# Download and extract the package
wget https://registry.npmjs.org/n8n-nodes-pdf4me/-/n8n-nodes-pdf4me-0.1.9.tgz
tar -xzf n8n-nodes-pdf4me-0.1.9.tgz
cd package

# Install dependencies and build
npm install
npm run build

# Copy to n8n custom nodes directory
cp -r dist /path/to/n8n/custom/nodes/
```

##### Solution 4: Global Installation
Try installing globally instead:
```bash
npm install -g n8n-nodes-pdf4me
```

#### 🔧 Package Structure Verification

The correct package structure should be:
```
n8n-nodes-pdf4me/
├── dist/
│   ├── nodes/
│   │   └── Pdf4me/
│   │       ├── Pdf4me.node.js ✅ (Required)
│   │       ├── Pdf4me.node.json ✅ (Required)
│   │       └── actions/
│   └── credentials/
│       └── Pdf4meApi.credentials.js ✅ (Required)
├── index.js ✅ (Required)
└── package.json ✅ (Required)
```

#### 🚀 n8n Integration

For n8n to recognize the node, ensure:

1. **Package.json configuration**:
   ```json
   {
     "n8n": {
       "n8nNodesApiVersion": 1,
       "credentials": [
         "dist/credentials/Pdf4meApi.credentials.js"
       ],
       "nodes": [
         "dist/nodes/Pdf4me/Pdf4me.node.js"
       ]
     }
   }
   ```

2. **Index.js exports**:
   ```javascript
   const { Pdf4me } = require('./dist/nodes/Pdf4me/Pdf4me.node.js');
   const { Pdf4meApi } = require('./dist/credentials/Pdf4meApi.credentials.js');

   module.exports = {
     nodes: { Pdf4me },
     credentials: { Pdf4meApi }
   };
   ```

#### 🔄 Build Process

If you're building from source:
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Validate build
npm run validate-build

# Create package
npm pack
```

#### 📍 Installation Locations

The package can be installed in different locations:

1. **Global installation** (Recommended):
   ```bash
   npm install -g n8n-nodes-pdf4me
   ```

2. **Local n8n project**:
   ```bash
   cd /path/to/n8n-project
   npm install n8n-nodes-pdf4me
   ```

3. **n8n custom nodes directory**:
   ```bash
   # Copy to n8n custom nodes
   cp -r node_modules/n8n-nodes-pdf4me /path/to/n8n/custom/nodes/
   ```

#### 🐛 Debugging Steps

1. **Check n8n logs**:
   ```bash
   n8n start --verbose
   ```

2. **Verify module loading**:
   ```bash
   node -e "try { require('n8n-nodes-pdf4me'); console.log('✅ Module loads successfully'); } catch(e) { console.log('❌ Error:', e.message); }"
   ```

3. **Check file permissions**:
   ```bash
   ls -la node_modules/n8n-nodes-pdf4me/dist/nodes/Pdf4me/
   ```

#### 📞 Support

If the issue persists:

1. Check the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
2. Review the [PDF4ME API documentation](https://dev.pdf4me.com/apiv2/documentation/)
3. Contact support at support@pdf4me.com
4. Open an issue on the GitHub repository

#### 🔄 Version History

- **v0.1.9**: Fixed package structure and build validation
- **v0.1.3**: Added global installation support
- **v0.1.2**: Initial release

Always use the latest version to avoid known issues. 