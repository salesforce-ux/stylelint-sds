#!/bin/bash

# Directory containing CSS files
TARGET_DIR="$1"
# Stylelint configuration file
CONFIG_FILE="packages/example-repository/.stylelintrc.yml"
# Custom formatter for SARIF
CUSTOM_FORMATTER="node_modules/stylelint-sarif-formatter/index.js"
# Folder to store SARIF reports for each batch

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FOLDER_NAME="reports"
OUTPUT_DIR="$SCRIPT_DIR/$FOLDER_NAME"

# Clear the OUTPUT_DIR if it already exists, then recreate it
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# Find all CSS files in the target directory
FILES=($(find "$TARGET_DIR" -name "*.css"))

# Batch size: number of files to process at once
BATCH_SIZE=50
# Max number of batches to process
MAX_BATCHES=10
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
  
  # Define the output SARIF file for the current batch
  BATCH_SARIF_FILE="$OUTPUT_DIR/sarif_batch${BATCH_NUM}.sarif"

  # Run stylelint on the batch and save output to the SARIF file for the batch
  npx stylelint "${BATCH[@]}" --config="$CONFIG_FILE" --custom-formatter="$CUSTOM_FORMATTER" --output-file="$BATCH_SARIF_FILE" > /dev/null 2>&1

  # Check if the stylelint command ran successfully
  # if [[ $? -eq 0 ]]; then
  #   echo "Batch $BATCH_NUM report generated: $BATCH_SARIF_FILE"
  # else
  #   echo "Failed to generate report for batch $BATCH_NUM. Skipping."
  #   continue
  # fi
done

echo "All batch .sarifs are generated"

echo "Consolidated file report generation ..."

"$SCRIPT_DIR/consolidate_sarifs.sh"