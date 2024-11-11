#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FOLDER_NAME="reports"
REPORTS_DIR="$SCRIPT_DIR/$FOLDER_NAME"

# Consolidated SARIF report
CONSOLIDATED_REPORT="$REPORTS_DIR/consolidated_report.sarif"

# Initialize the consolidated SARIF report with a base structure
echo '{"version": "2.1.0", "runs": [{"results": [], "tool": {}}]}' > "$CONSOLIDATED_REPORT"

# Find all SARIF batch files
SARIF_FILES=($(find "$REPORTS_DIR" -name "sarif_batch*.sarif"))

# Check if any SARIF files were found
if [[ ${#SARIF_FILES[@]} -eq 0 ]]; then
    echo "No SARIF files found in $REPORTS_DIR."
    exit 1
fi

echo "Merging ${#SARIF_FILES[@]} SARIF files into $(basename "$CONSOLIDATED_REPORT")..."

# Extract and consolidate unique results based on `ruleId` and `message`
for SARIF_FILE in "${SARIF_FILES[@]}"; do
    echo "Processing $(basename "$SARIF_FILE")..."

    # Verify SARIF structure and merge only if compatible
    if jq -e '.runs[0]? and .runs[0].results?' "$SARIF_FILE" > /dev/null; then
        jq -s '
          # Load current consolidated and new batch SARIF
          .[0] as $base | .[1] as $new | 

          # Consolidate unique results based on `ruleId` and `message`
          $base |
          .runs[0].results += ($new.runs[0].results // [] | unique_by(.ruleId, .message)) |
          
          # Set `tool` only if it is initially empty
          if (.runs[0].tool == {} or .runs[0].tool == null) then 
            .runs[0].tool = $new.runs[0].tool 
          else 
            . 
          end' "$CONSOLIDATED_REPORT" "$SARIF_FILE" > temp && mv temp "$CONSOLIDATED_REPORT"

        # if [[ $? -eq 0 ]]; then
        #     echo "Successfully merged $SARIF_FILE."
        # else
        #     echo "Error merging $SARIF_FILE. Skipping."
        # fi
    else
        echo "Warning: Structure of $SARIF_FILE is incompatible. Skipping this file."
    fi
done

echo "All valid SARIF files have been merged into $CONSOLIDATED_REPORT."