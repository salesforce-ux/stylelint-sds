#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FOLDER_NAME="reports"
REPORTS_DIR="$SCRIPT_DIR/$FOLDER_NAME"

# Consolidated JSON report in SARIF format
CONSOLIDATED_REPORT="$REPORTS_DIR/consolidated_report.json"
CONSOLIDATED_SARIF="$REPORTS_DIR/consolidated_report.sarif"

# Find all JSON batch files
JSON_FILES=($(find "$REPORTS_DIR" -name "*_batch*.json"))

# Check if any JSON files were found
if [[ ${#JSON_FILES[@]} -eq 0 ]]; then
    echo "No JSON files found in $REPORTS_DIR."
    exit 1
fi

# Merge all JSON files into one consolidated report
jq -s 'add' "${JSON_FILES[@]}" > "$CONSOLIDATED_REPORT"

echo "All valid JSON files have been merged into $CONSOLIDATED_REPORT."

echo "Converting JSON report to SARIF..."
# Convert JSON to SARIF using stylelint-sarif-formatter with Node.js
node ./node_modules/stylelint-sarif-formatter/index.js $CONSOLIDATED_REPORT -o $CONSOLIDATED_SARIF

# Check if the SARIF file was created successfully
if [[ -f "$CONSOLIDATED_SARIF" ]]; then
    echo "SARIF report generated successfully: $CONSOLIDATED_SARIF"
else
    echo "Failed to generate SARIF report."
fi
