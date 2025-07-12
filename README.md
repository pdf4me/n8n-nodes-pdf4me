# n8n-nodes-pdf4me

This is an n8n community node that enables you to integrate PDF4ME's powerful PDF processing capabilities into your n8n workflows. PDF4ME is a comprehensive PDF processing API that allows you to convert, generate barcodes, process images, and manipulate documents programmatically.

n8n is a fair-code licensed workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Operations](#operations)
- [Credentials](#credentials)
- [Usage](#usage)
- [Resources](#resources)
- [Version History](#version-history)

## Installation

### Community Nodes (Recommended)

For users on n8n v0.187+, you can install this node directly from the n8n Community Nodes panel in the n8n editor:

1. Open your n8n editor
2. Go to **Settings > Community Nodes**
3. Search for "n8n-nodes-pdf4me"
4. Click **Install**
5. Reload the editor

### Global Installation (Recommended)

For global installation that makes the node available across all n8n projects:

```bash
# Install globally
npm install -g n8n-nodes-pdf4me

# Restart n8n to load the new node
n8n start
```

### Manual Installation

You can also install this node manually in a specific n8n project:

1. Navigate to your n8n installation directory
2. Run the following command:
   ```bash
   npm install n8n-nodes-pdf4me
   ```
3. Restart your n8n server

For Docker-based deployments, add the package to your package.json and rebuild the image:

```json
{
  "name": "n8n-custom",
  "version": "0.9.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "n8n"
  },
  "dependencies": {
    "n8n": "^1.0.0",
    "n8n-nodes-pdf4me": "^0.9.0"
  }
}
```

## Operations

This node provides comprehensive document processing capabilities through PDF4ME's API. Here are the available features:

### 1. PDF Processing & Conversion
- **Add Attachment to PDF**: Attach files to PDF documents
- **Add HTML Header Footer**: Add custom HTML headers and footers to PDFs
- **Add Image Stamp to PDF**: Add image stamps with positioning and opacity controls
- **Add Margin to PDF**: Add margins to PDF documents
- **Add Page Number to PDF**: Add page numbers to PDF documents
- **Add Text Stamp to PDF**: Add text stamps with customizable formatting
- **Compress PDF**: Optimize PDF files for web, print, or screen viewing
- **Convert from PDF**: Convert PDFs to Word or Excel with OCR support
- **Create Images from PDF**: Extract images from PDF documents
- **Delete Blank Pages from PDF**: Remove blank pages from PDF documents
- **Delete Unwanted Pages from PDF**: Remove specific pages from PDF documents
- **Extract Pages**: Extract specific pages from PDF documents
- **Merge Multiple PDFs**: Combine multiple PDF files into one
- **Overlay PDFs**: Overlay one PDF on top of another
- **Protect Document**: Add password protection and encryption to PDFs
- **Repair PDF Document**: Fix corrupted or damaged PDF files
- **Rotate Document**: Rotate entire PDF documents
- **Rotate Page**: Rotate specific pages within a PDF
- **Sign PDF**: Add digital signatures to PDF documents
- **Unlock PDF**: Remove password protection from PDFs
- **Update Hyperlinks Annotation**: Modify hyperlinks and annotations in PDFs

### 2. Image Processing
- **Add Image Watermark to Image**: Add watermarks to images
- **Add Text Watermark to Image**: Add text watermarks to images
- **Compress Image**: Reduce image file sizes while maintaining quality
- **Convert Image Format**: Convert images between different formats (JPEG, PNG, etc.)
- **Crop Image**: Crop images with border or rectangle options
- **Flip Image**: Flip images horizontally, vertically, or both
- **Get Image Metadata**: Extract metadata from image files
- **Image Extract Text**: Extract text from images using OCR
- **Read Barcode from Image**: Read barcodes from images
- **Remove EXIF Tags from Image**: Remove metadata from images
- **Replace Text with Image**: Replace text in documents with images
- **Resize Image**: Resize images to specific dimensions
- **Rotate Image**: Rotate images by specific angles
- **Rotate Image by EXIF Data**: Auto-rotate images based on EXIF orientation

### 3. Document Conversion
- **Convert to PDF**: Convert various document formats to PDF
- **Document to PDF**: Convert documents to PDF format
- **HTML to PDF**: Convert HTML content to PDF
- **JSON to Excel**: Convert JSON data to Excel spreadsheets
- **Markdown to PDF**: Convert Markdown files to PDF
- **PNG to PDF**: Convert PNG images to PDF
- **PPTX to PDF**: Convert PowerPoint presentations to PDF
- **URL to PDF**: Convert web pages to PDF
- **Visio to PDF**: Convert Visio diagrams to PDF
- **Word to PDF Form**: Convert Word documents to PDF forms
- **XLSX to PDF**: Convert Excel spreadsheets to PDF

### 4. Barcode Operations
- **Barcode Generator**: Generate various types of barcodes (QR, Code 128, EAN, UPC, etc.)
- **Read Barcode from Image**: Extract barcode data from images

### 5. Document Analysis & Extraction
- **Classify Document**: Automatically classify document types
- **Extract**: Extract various elements from documents
- **Extract Attachment from PDF**: Extract attached files from PDFs
- **Extract Form Data from PDF**: Extract form field data from PDFs
- **Extract Pages from PDF**: Extract specific pages from PDFs
- **Extract Resources**: Extract resources from documents
- **Extract Table from PDF**: Extract tables from PDF documents
- **Extract Text by Expression**: Extract text using custom expressions
- **Extract Text from Word**: Extract text from Word documents
- **Find Search**: Search for specific content in documents
- **Get Document from PDF4ME**: Retrieve documents from PDF4ME storage
- **Get PDF Metadata**: Extract metadata from PDF files

### 6. Document Management
- **Create PDF/A**: Create PDF/A compliant documents
- **Disable Tracking Changes in Word**: Remove tracking changes from Word documents
- **Edit**: Edit document properties and content
- **Flatten PDF**: Flatten PDF forms and annotations
- **Form**: Process PDF forms
- **Generate**: Generate documents from templates
- **Linearize PDF**: Optimize PDFs for web streaming
- **Organize**: Organize document structure
- **Upload File**: Upload files to PDF4ME storage

### 7. Advanced Features
- **Router**: Route documents based on conditions
- **Split PDF**: Split PDF documents into multiple files

## Credentials

To use this node, you need a PDF4ME API key. Here's how to get started:

1. Sign up for a PDF4ME account at [PDF4ME Developer Portal](https://dev.pdf4me.com/)
2. Navigate to your dashboard and obtain your API key
3. In n8n, add your PDF4ME credentials by providing your API key

## Usage

This node allows you to automate document processing tasks in your n8n workflows. Here are some common use cases:

### Document Processing
- Convert PDF documents to editable Word format with OCR support
- Process complex PDFs with enhanced timeout handling (up to 25 minutes)
- Extract text from PDF documents for data processing
- Convert various document formats to PDF
- Extract specific pages from PDF documents for creating shorter versions or digital booklets
- Add watermarks, stamps, and annotations to documents
- Compress and optimize PDF files for different use cases

### Barcode Operations
- Generate QR codes for product tracking
- Create product barcodes (EAN-13, UPC-A) for inventory management
- Generate barcodes for document identification
- Embed barcodes in documents and reports
- Read barcodes from images for automated processing

### Web Content Processing
- Convert web pages to PDF for archiving
- Automatically convert HTML reports to PDF
- Capture web-based dashboards and reports
- Convert protected web content with authentication

### Data Export and Reporting
- Convert JSON data to Excel spreadsheets
- Transform API responses to formatted reports
- Export analytics data to Excel for stakeholder reports
- Create automated data processing pipelines

### Image Processing
- Crop images for specific dimensions
- Remove borders from scanned documents
- Process product images for e-commerce
- Create thumbnails and optimized images
- Add watermarks to images for branding
- Extract text from images using OCR

### Automated Workflows
- Chain multiple PDF4ME operations together
- Integrate with email nodes for automated document distribution
- Connect with storage services for file management
- Build complete document processing pipelines
- Automate document classification and routing

For detailed examples and workflow templates, visit our documentation.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [PDF4ME API Documentation](https://dev.pdf4me.com/apiv2/documentation/)
- [PDF4ME Developer Portal](https://dev.pdf4me.com/)
- [PDF4ME Support](mailto:support@pdf4me.com)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
- [Publishing Guide](PUBLISHING_GUIDE.md)

## Version History

### 0.9.0
- **Current Version**: Comprehensive document processing capabilities with 50+ actions
- Full integration with PDF4ME API services
- Complete PDF processing suite including conversion, manipulation, and analysis
- Advanced image processing capabilities with watermarking, cropping, and format conversion
- Comprehensive barcode generation and reading functionality
- Document conversion between multiple formats (PDF, Word, Excel, HTML, etc.)
- Enhanced timeout handling for complex operations (up to 25 minutes)
- Improved async processing with exponential backoff and better error handling
- Support for multiple input types (Binary Data, Base64, URL, File Path)
- Advanced OCR capabilities with multi-language support
- Document protection, signing, and security features
- Metadata extraction and document analysis tools
- All critical lint errors resolved for production readiness
- Optimized package structure and build validation

### 0.8.0
- Comprehensive document processing capabilities
- Full integration with PDF4ME API services
- Support for barcode generation, URL to PDF conversion, PDF to Word conversion, JSON to Excel conversion, image cropping, and PDF page extraction
- Enhanced timeout handling for complex PDF to Word conversions (up to 25 minutes)
- Improved async processing with exponential backoff and better error handling
- Support for multiple input types (Binary Data, Base64, URL, File Path)
- Advanced OCR capabilities with multi-language support
- Comprehensive barcode generation with 100+ supported formats
- PDF page extraction for creating shorter versions and digital booklets
- Standardized API documentation URLs across all files
- Global installation support for cross-project availability

### 0.1.9
- Fixed package structure and build validation
- Improved error handling and debugging capabilities

### 0.1.3
- Added global installation support
- Enhanced package configuration for npm publishing

### 0.1.2
- Initial release with core functionality
