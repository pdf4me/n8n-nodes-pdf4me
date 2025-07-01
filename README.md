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
  "version": "0.8.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "n8n"
  },
  "dependencies": {
    "n8n": "^1.0.0",
    "n8n-nodes-pdf4me": "^0.1.0"
  }
}
```

## Operations

This node provides comprehensive document processing capabilities through PDF4ME's API. Here are the available features:

### 1. Barcode Generation
**Generate Barcode**: Create various types of barcodes with customizable options

#### Supported Barcode Types
- **QR Code** (default)
- **Code 128, Code 39, Code 93**
- **EAN-8, EAN-13, EAN-14**
- **UPC-A, UPC-E**
- **PDF417, Micro PDF417**
- **Data Matrix**
- **Aztec**
- **MaxiCode**
- And many more (100+ barcode types supported)

#### Parameters
- **File Name**: Name for the generated barcode file
- **File Content**: Base64 encoded content of input file (optional)
- **Text**: The text/data to encode in the barcode
- **Barcode Type**: Select from 100+ supported barcode formats
- **Hide Text**: Whether to hide or display the text alongside the barcode
- **Additional Options**: Various formatting and styling options

### 2. URL/HTML to PDF Conversion
**URL to PDF**: Convert web pages to PDF while preserving layout, styling, and content

#### Parameters
- **Web URL**: The URL of the web page to convert (required)
- **File Name**: Name for the generated PDF file
- **Authentication Type**: NoAuth or Basic authentication for protected sites
- **Username/Password**: Credentials if Basic authentication is required
- **Page Layout**: Portrait or Landscape orientation
- **Page Format**: A0-A8, Tabloid, Legal, Statement, Executive formats
- **Advanced Options**: 
  - **Scale**: Zoom factor for the web page (0.1 to 2.0)
  - **Margins**: Top, Left, Right, Bottom margins (e.g., 20px, 1cm, 0.5in)
  - **Print Background**: Include background colors and images
  - **Display Header Footer**: Show header and footer in PDF
  - **Custom Profiles**: Additional API configuration options

### 3. PDF to Other Formats
**PDF to Word**: Convert PDF documents to editable Word format with OCR support

#### Parameters
- **Input Data Type**: Choose between Binary Data (from previous node), Base64 String, URL, or File Path
- **Input Binary Field**: Name of the binary property containing the PDF (when using Binary Data)
- **Base64 PDF Content**: Direct base64 encoded PDF content (when using Base64 String)
- **PDF URL**: URL to the PDF file to convert (when using URL)
- **Local File Path**: Path to PDF file on local filesystem (when using File Path)
- **Output File Name**: Name for the generated Word document
- **Document Name**: Name of the source PDF file for reference
- **Quality Type**: 
  - **Draft**: Faster conversion, good for simple PDFs with clear text
  - **Quality**: Slower but more accurate, better for complex layouts
- **OCR Language**: Language for text recognition (English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Dutch, Swedish, Norwegian, Danish, Finnish)
- **Advanced Options**:
  - **Merge All Sheets**: Combine multiple pages into single document flow
  - **Preserve Output Format**: Maintain original formatting when possible
  - **Use OCR When Needed**: Enable OCR for scanned PDFs
  - **Use Async Processing**: Enhanced timeout handling for complex PDFs (up to 25 minutes)
  - **Max Retries**: Maximum polling attempts for async processing (increased for complex PDFs)
  - **Retry Delay**: Base seconds between polling attempts (actual delay increases exponentially)
  - **Custom Profiles**: Additional API configuration options

### 4. Data Conversion
**JSON to Excel**: Convert JSON data to Excel spreadsheet with customizable formatting

#### Parameters
- **Input Data Type**: Choose between JSON String (direct input), Binary Data (from previous node), or Base64 String
- **JSON Content**: Direct JSON data input with syntax highlighting (when using JSON String)
- **Input Binary Field**: Name of the binary property containing the JSON file (when using Binary Data)
- **Base64 JSON Content**: Direct base64 encoded JSON content (when using Base64 String)
- **Output File Name**: Name for the generated Excel file
- **Document Name**: Name of the output document for reference
- **Worksheet Name**: Name of the Excel worksheet (default: Sheet1)
- **Advanced Options**:
  - **Title Bold**: Make the title row bold (default: true)
  - **Title Wrap Text**: Wrap text in title cells (default: true)
  - **Convert Numbers and Dates**: Automatically convert numbers and dates (default: false)
  - **Ignore Null Values**: Ignore null values in the JSON (default: false)
  - **Number Format**: Excel number format codes (0-22) for General, Number, Currency, Percentage, Scientific, Fraction, Date/Time formats
  - **Date Format**: Date format pattern for Excel cells (e.g., MM/dd/yyyy)
  - **First Row**: Starting row number (1-based, default: 1)
  - **First Column**: Starting column number (1-based, default: 1)
  - **Custom Profiles**: Additional API configuration options

### 5. Image Processing
**Crop Image**: Crop images with border or rectangle cropping options

#### Parameters
- **Input Data Type**: Choose between Binary Data (from previous node), Base64 String, or File Path
- **Input Binary Field**: Name of the binary property containing the image file (when using Binary Data)
- **Base64 Image Content**: Direct base64 encoded image content (when using Base64 String)
- **Local File Path**: Path to image file on local filesystem (when using File Path)
- **Output File Name**: Name for the output cropped image file
- **Document Name**: Name of the source image file for reference
- **Crop Type**: 
  - **Border**: Crop by removing borders from all sides
  - **Rectangle**: Crop to a specific rectangular area
- **Border Cropping Options** (when Crop Type = Border):
  - **Left Border**: Number of pixels to crop from the left border
  - **Right Border**: Number of pixels to crop from the right border
  - **Top Border**: Number of pixels to crop from the top border
  - **Bottom Border**: Number of pixels to crop from the bottom border
- **Rectangle Cropping Options** (when Crop Type = Rectangle):
  - **Upper Left X**: X coordinate of the upper left corner of the crop rectangle
  - **Upper Left Y**: Y coordinate of the upper left corner of the crop rectangle
  - **Width**: Width of the crop rectangle in pixels
  - **Height**: Height of the crop rectangle in pixels
- **Advanced Options**:
  - **Custom Profiles**: Additional API configuration options

## Credentials

To use this node, you need a PDF4ME API key. Here's how to get started:

1. Sign up for a PDF4ME account at [PDF4ME Developer Portal](https://developer.pdf4me.com/)
2. Navigate to your dashboard and obtain your API key
3. In n8n, add your PDF4ME credentials by providing your API key

## Usage

This node allows you to automate document processing tasks in your n8n workflows. Here are some common use cases:

### Document Processing
- Convert PDF documents to editable Word format with OCR support
- Process complex PDFs with enhanced timeout handling (up to 25 minutes)
- Extract text from PDF documents for data processing
- Convert various document formats to PDF

### Barcode Operations
- Generate QR codes for product tracking
- Create product barcodes (EAN-13, UPC-A) for inventory management
- Generate barcodes for document identification
- Embed barcodes in documents and reports

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

### Automated Workflows
- Chain multiple PDF4ME operations together
- Integrate with email nodes for automated document distribution
- Connect with storage services for file management
- Build complete document processing pipelines

For detailed examples and workflow templates, visit our documentation.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [PDF4ME API Documentation](https://developer.pdf4me.com/api/)
- [PDF4ME Developer Portal](https://developer.pdf4me.com/)
- [PDF4ME Support](mailto:support@pdf4me.com)

## Version History

### 0.1.0
- Initial release with comprehensive document processing capabilities
- Full integration with PDF4ME API services
- Support for barcode generation, URL to PDF conversion, PDF to Word conversion, JSON to Excel conversion, and image cropping
- Enhanced timeout handling for complex PDF to Word conversions (up to 25 minutes)
- Improved async processing with exponential backoff and better error handling
- Support for multiple input types (Binary Data, Base64, URL, File Path)
- Advanced OCR capabilities with multi-language support
- Comprehensive barcode generation with 100+ supported formats
