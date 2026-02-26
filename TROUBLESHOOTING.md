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
npm install n8n-nodes-pdf4me@latest
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
wget https://registry.npmjs.org/n8n-nodes-pdf4me/-/n8n-nodes-pdf4me-0.8.0.tgz
tar -xzf n8n-nodes-pdf4me-0.8.0.tgz
cd package

# Install dependencies and build
npm install
npm run build

# Copy to n8n custom nodes directory
cp -r dist /path/to/n8n/custom/nodes/
```

##### Solution 4: Global Installation (Recommended)
Try installing globally instead:
```bash
npm install -g n8n-nodes-pdf4me
```

### ❌ Error: "Invalid API Key" or "Authentication Failed"

This error occurs when the PDF4ME API credentials are incorrect or expired.

#### 🔍 Diagnosis Steps

1. **Verify your API key**:
   - Check your PDF4ME dashboard at https://dev.pdf4me.com/
   - Ensure the API key is active and has sufficient credits
   - Verify the key format (should be a valid string)

2. **Check credential configuration in n8n**:
   - Go to Settings > Credentials
   - Verify the PDF4ME API credential is properly configured
   - Test the credential connection

#### ✅ Solutions

##### Solution 1: Update API Key
1. Get a new API key from your PDF4ME dashboard
2. Update the credential in n8n Settings > Credentials
3. Test the connection

##### Solution 2: Check API Quotas
1. Verify your PDF4ME account has sufficient credits
2. Check usage limits in your dashboard
3. Upgrade your plan if needed

### ❌ Error: "Request Timeout" or "Operation Timed Out"

This error occurs during long-running operations like PDF to Word conversion.

#### 🔍 Diagnosis Steps

1. **Check operation complexity**:
   - Large PDF files (>50MB) may take longer
   - Complex layouts with images and tables
   - OCR processing on scanned documents

2. **Verify network connectivity**:
   - Check internet connection stability
   - Test API endpoint accessibility

#### ✅ Solutions

##### Solution 1: Optimize Processing Settings
For PDF to Word conversion:
1. Increase "Max Retries" to 30-50
2. Set "Retry Delay" to 5-10 seconds
3. All operations now use async processing by default for better performance

##### Solution 2: Optimize Input
1. Reduce PDF file size if possible
2. Use "Draft" quality for faster processing
3. Split large documents into smaller chunks

### ❌ Error: "Processing job not found or expired. The document processing may have timed out."

This error occurs when polling the async job status returns HTTP 404. The PDF4ME API uses async processing (202 response) and a polling URL to fetch results.

#### 🔍 Possible Causes

1. **Relative polling URL** – The API may return a relative path in the Location header. The node now resolves relative URLs to absolute URLs automatically.
2. **Wrong API environment** – Ensure your API key matches the environment. The node uses `https://api.pdf4me.com` by default. If your key is for production (`https://api.pdf4me.com`), contact support or check for an environment option.
3. **Job expiry** – Async jobs can expire if processing takes too long. Try smaller documents or simpler operations.
4. **Network/timeout** – Intermittent failures can cause the job to be lost. Retry the operation.

#### ✅ Solutions

- **Rebuild and test** – Run `npm run build` and re-link the package to get the latest polling URL fix.
- **Verify API key** – Confirm your key is valid and has access to the operation at https://dev.pdf4me.com/
- **Try sync mode** – If the API supports `isAsync: false` for smaller documents, that may avoid polling entirely (check PDF4ME docs).
- **Contact PDF4ME** – If the error persists, reach out to support@pdf4me.com with your request/response details.

### ❌ Error: "No tax document processing results received from PDF4ME API"

This error occurs when the Process Tax Document action receives a null or empty response from the PDF4ME API.

#### 🔍 Diagnosis Steps

1. **Check document format**:
   - Ensure the input is a valid PDF tax document (W2, 1099, 1040, etc.)
   - Verify the file is not corrupted and opens correctly

2. **Verify API access**:
   - Confirm your PDF4ME API key has ProcessTaxDocument access
   - Check your account credits at https://dev.pdf4me.com/

3. **Test with a known tax form**:
   - Try a sample W2 or 1099 from the PDF4ME documentation
   - Set the "Tax Model" option to match the form type (e.g., W2, 1099)

#### ✅ Solutions

##### Solution 1: Set the Tax Model
If your document is a specific tax form, set the "Tax Model" dropdown to match (e.g., W2, 1099, 1040) for improved parsing accuracy.

##### Solution 2: Verify Input
- For Binary Data: Ensure the previous node outputs binary data with the correct property name (usually "data")
- For URL: Ensure the URL is publicly accessible
- For Base64: Ensure the string is valid base64-encoded PDF content

##### Solution 3: Check API Status
If the error persists, the API may have returned an empty response. Contact PDF4ME support at support@pdf4me.com with your trace details.

### ❌ Error: "Invalid JSON in Profiles"

This error occurs when the Custom Profiles JSON is malformed.

#### 🔍 Diagnosis Steps

1. **Validate JSON syntax**:
   ```bash
   echo '{"your": "json"}' | jq .
   ```

2. **Check profile documentation**:
   - Review available profiles at https://dev.pdf4me.com/apiv2/documentation/
   - Ensure profile names and values are correct

#### ✅ Solutions

##### Solution 1: Fix JSON Syntax
1. Use a JSON validator to check syntax
2. Ensure all quotes and brackets are properly closed
3. Remove any trailing commas

##### Solution 2: Use Valid Profiles
```json
{
  "outputDataFormat": "base64",
  "quality": "high"
}
```

### ❌ Error: "File Not Found" or "Invalid File Path"

This error occurs when the input file cannot be accessed.

#### 🔍 Diagnosis Steps

1. **Check file path**:
   - Verify the file exists at the specified path
   - Ensure proper file permissions
   - Check for special characters in file names

2. **Verify file format**:
   - Ensure the file is in the expected format
   - Check file size limits

#### ✅ Solutions

##### Solution 1: Use Binary Data
Instead of file paths, use Binary Data from previous nodes:
1. Set "Input Data Type" to "Binary Data"
2. Specify the correct "Input Binary Field" name
3. Ensure the previous node outputs binary data

##### Solution 2: Use Base64
For direct file content:
1. Set "Input Data Type" to "Base64 String"
2. Provide the base64-encoded file content
3. Ensure proper encoding

### ❌ Error: "Barcode Generation Failed"

This error occurs when barcode parameters are invalid.

#### 🔍 Diagnosis Steps

1. **Check barcode type compatibility**:
   - Verify the text content is valid for the selected barcode type
   - Some barcodes have character limits or format requirements

2. **Validate text content**:
   - Ensure text is not empty
   - Check for unsupported characters

#### ✅ Solutions

##### Solution 1: Use Compatible Barcode Types
- **QR Code**: Accepts any text content
- **Code 128**: Alphanumeric characters
- **EAN-13**: Exactly 13 digits
- **UPC-A**: Exactly 12 digits

##### Solution 2: Validate Input
1. Clean and validate input text
2. Use appropriate barcode type for your data
3. Test with simple text first

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
   node -e "try { require('n8n-nodes-pdf4me'); } catch(e) { throw new Error('Module loading failed: ' + e.message); }"
   ```

3. **Check file permissions**:
   ```bash
   ls -la node_modules/n8n-nodes-pdf4me/dist/nodes/Pdf4me/
   ```

4. **Test API connectivity**:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" https://api.pdf4me.com/health
   ```

#### 🔧 Performance Optimization

1. **For large files**:
   - Use async processing for PDF to Word conversion
   - Increase timeout settings
   - Consider splitting large documents

2. **For high-volume processing**:
   - Implement proper error handling and retries
   - Use batch processing when possible
   - Monitor API usage and quotas

3. **For complex workflows**:
   - Test individual operations first
   - Use appropriate quality settings
   - Validate input data formats

#### 📞 Support

If the issue persists:

1. Check the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
2. Review the [PDF4ME API documentation](https://dev.pdf4me.com/apiv2/documentation/)
3. Contact support at support@pdf4me.com
4. Open an issue on the GitHub repository

#### 🔄 Version History

- **v0.8.0**: Current version with comprehensive document processing, enhanced async processing, and improved error handling
- **v0.1.9**: Fixed package structure and build validation
- **v0.1.3**: Added global installation support
- **v0.1.2**: Initial release

Always use the latest version to avoid known issues and benefit from the latest improvements. 
