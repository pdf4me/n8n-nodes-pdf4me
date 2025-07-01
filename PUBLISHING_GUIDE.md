# PDF4ME n8n Node - Publishing Guide

This guide explains how to publish the PDF4ME n8n node so it's available globally when users install it from npm.

## Overview

The PDF4ME n8n node is configured to be installed globally, making it available across all n8n projects on a user's system. This means users can install it once and use it in multiple n8n workflows without reinstalling.

## Current Configuration

The package is configured with the following key settings:

### package.json Configuration
```json
{
  "name": "n8n-nodes-pdf4me",
  "version": "0.8.0",
  "main": "index.js",
  "bin": {
    "n8n-nodes-pdf4me": "./index.js"
  },
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/Pdf4meApi.credentials.js"
    ],
    "nodes": [
      "dist/nodes/Pdf4me/Pdf4me.node.js"
    ]
  },
  "scripts": {
    "prepublishOnly": "npm run build && eslint -c .eslintrc.prepublish.js nodes credentials package.json",
    "postinstall": "echo 'PDF4ME n8n node installed successfully. Restart n8n to use the node.'"
  }
}
```

## Publishing Process

### 1. Pre-publishing Checklist

Before publishing, ensure:

- [ ] All tests pass
- [ ] Build completes successfully
- [ ] Version number is updated
- [ ] README.md is up to date
- [ ] All dependencies are correct

### 2. Build and Validate

```bash
# Clean and build the project
npm run build

# Validate the build
ls -la dist/
```

### 3. Test Local Package

```bash
# Create a local package
npm pack

# Test global installation locally
npm install -g ./n8n-nodes-pdf4me-0.1.2.tgz

# Verify installation
npm list -g n8n-nodes-pdf4me
```

### 4. Publish to npm

```bash
# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish

# Verify publication
npm view n8n-nodes-pdf4me
```

## Installation Methods for Users

### Method 1: Global Installation (Recommended)

Users can install the node globally, making it available across all n8n projects:

```bash
# Install globally
npm install -g n8n-nodes-pdf4me

# Restart n8n to load the new node
n8n start
```

### Method 2: Community Nodes Panel

For n8n v0.187+, users can install directly from the n8n editor:

1. Open n8n editor
2. Go to **Settings > Community Nodes**
3. Search for "n8n-nodes-pdf4me"
4. Click **Install**
5. Reload the editor

### Method 3: Local Project Installation

Users can install in a specific n8n project:

```bash
# Navigate to n8n project directory
cd /path/to/n8n-project

# Install locally
npm install n8n-nodes-pdf4me

# Restart n8n
n8n start
```

## Docker Deployment

For Docker-based deployments, add to package.json:

```json
{
  "dependencies": {
    "n8n": "^1.0.0",
    "n8n-nodes-pdf4me": "^0.1.2"
  }
}
```

## Verification

After installation, users can verify the node is available by:

1. Starting n8n
2. Creating a new workflow
3. Adding a new node
4. Searching for "PDF4ME" in the node list

## Troubleshooting

### Node Not Appearing
- Ensure n8n is restarted after installation
- Check n8n logs for any loading errors
- Verify the package is installed in the correct location

### Build Errors
- Ensure all TypeScript files compile correctly
- Check that all dependencies are installed
- Verify the gulp build process completes

### Publishing Errors
- Ensure you're logged into npm
- Check that the version number is unique
- Verify all required files are included in the package

## Version Management

When updating the node:

1. Update version in `package.json`
2. Update version in `nodes/Pdf4me/Pdf4me.node.json`
3. Update changelog in README.md
4. Build and test locally
5. Publish to npm

## Support

For issues with the node:
- Check the [n8n Community Nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- Review the [PDF4ME API documentation](https://dev.pdf4me.com/apiv2/documentation/)
- Contact support at support@pdf4me.com 