#!/bin/bash

# List of files that need the binaryDataName parameter added
files=(
    "nodes/Pdf4me/actions/rotateDocument.ts"
    "nodes/Pdf4me/actions/extractAttachmentFromPdf.ts"
    "nodes/Pdf4me/actions/SplitPdfByBarcode.ts"
    "nodes/Pdf4me/actions/replaceTextWithImageInWord.ts"
    "nodes/Pdf4me/actions/SplitPdfRegular.ts"
    "nodes/Pdf4me/actions/deleteUnwantedPagesFromPdf.ts"
    "nodes/Pdf4me/actions/extractTextByExpression.ts"
    "nodes/Pdf4me/actions/classifyDocument.ts"
    "nodes/Pdf4me/actions/extractTableFromPdf.ts"
    "nodes/Pdf4me/actions/extractTextFromWord.ts"
    "nodes/Pdf4me/actions/convertMarkdownToPdf.ts"
    "nodes/Pdf4me/actions/extractFormDataFromPdf.ts"
    "nodes/Pdf4me/actions/createSwissQrBill.ts"
)

# Function to add binaryDataName parameter before Advanced Options
add_binary_data_name() {
    local file="$1"
    echo "Processing $file..."
    
    # Check if file has Advanced Options section
    if grep -q "Advanced Options" "$file"; then
        # Add before Advanced Options
        sed -i.bak '/displayName.*Advanced Options/i\
	{\
		displayName: '\''Output Binary Field Name'\'',\
		name: '\''binaryDataName'\'',\
		type: '\''string'\'',\
		default: '\''data'\'',\
		description: '\''Name of the binary property to store the output file'\'',\
		displayOptions: {\
			show: {\
				operation: [ActionConstants.*],\
			},\
		},\
	},\
' "$file"
    else
        # Add before the closing bracket of description array
        sed -i.bak '/^];$/i\
	{\
		displayName: '\''Output Binary Field Name'\'',\
		name: '\''binaryDataName'\'',\
		type: '\''string'\'',\
		default: '\''data'\'',\
		description: '\''Name of the binary property to store the output file'\'',\
		displayOptions: {\
			show: {\
				operation: [ActionConstants.*],\
			},\
		},\
	},\
' "$file"
    fi
    
    # Clean up backup files
    rm -f "$file.bak"
}

# Process each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        add_binary_data_name "$file"
    else
        echo "File not found: $file"
    fi
done

echo "Done!"
