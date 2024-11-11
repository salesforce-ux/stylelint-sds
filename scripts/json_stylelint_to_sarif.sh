#!/bin/bash

# Directory containing CSS files
TARGET_DIR="$1"
# Stylelint configuration file
CONFIG_FILE=".stylelintrc.yml"
# Custom formatter for SARIF
CUSTOM_FORMATTER="node_modules/stylelint-sarif-formatter/index.js"
# Output consolidated SARIF file
OUTPUT_SARIF="report.sarif"
# Temporary SARIF output for each batch
TEMP_SARIF="temp_report.sarif"

# Clear or create the consolidated SARIF report with empty structure
echo '{"version": "2.1.0", "runs": [{"results": []}]}' > "$OUTPUT_SARIF"

# Find all CSS files in the target directory
FILES=($(find "$TARGET_DIR" -name "*.css"))

# Batch size: number of files to process at once
BATCH_SIZE=50
# Max number of batches to process
MAX_BATCHES=5
# Time per batch (in seconds)
TIME_PER_BATCH=5

# Calculate the number of batches and total estimated time
TOTAL_FILES=${#FILES[@]}
TOTAL_BATCHES=$(( (TOTAL_FILES + BATCH_SIZE - 1) / BATCH_SIZE ))
TOTAL_BATCHES=$(( TOTAL_BATCHES > MAX_BATCHES ? MAX_BATCHES : TOTAL_BATCHES ))
TOTAL_TIME=$(( TOTAL_BATCHES * TIME_PER_BATCH ))

echo "Total files: $TOTAL_FILES"
echo "Batch size: $BATCH_SIZE"
echo "Processing up to $TOTAL_BATCHES batches, estimated time: $TOTAL_TIME seconds"

# Process files in batches
for (( i=0; i<${#FILES[@]}; i+=BATCH_SIZE )); do
  BATCH_NUM=$((i / BATCH_SIZE + 1))
  
  if [ $BATCH_NUM -gt $MAX_BATCHES ]; then
    echo "Reached maximum batch limit of $MAX_BATCHES. Stopping."
    break
  fi

  # Select batch of files
  BATCH=("${FILES[@]:i:BATCH_SIZE}")
  
  echo "Linting batch $BATCH_NUM of $TOTAL_BATCHES..."
  
  # Run stylelint on the batch and save output to a temporary SARIF file
  npx stylelint "${BATCH[@]}" --config="$CONFIG_FILE" --custom-formatter="$CUSTOM_FORMATTER" --output-file="$TEMP_SARIF"

  # Merge `results` from the temporary SARIF into the consolidated report
  jq -s '.[0].runs[0].results += .[1].runs[0].results | .[0]' "$OUTPUT_SARIF" "$TEMP_SARIF" > temp && mv temp "$OUTPUT_SARIF"
done

# Cleanup temporary SARIF file
rm -f "$TEMP_SARIF"

echo "Consolidated SARIF report generated: $OUTPUT_SARIF"