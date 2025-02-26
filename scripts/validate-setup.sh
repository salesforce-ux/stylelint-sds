#!/bin/bash

# Check Node.js version
required_version="20.18.3"
current_version=$(node -v | cut -c 2-)

if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "Error: Node.js version $required_version or higher is required."
    echo "Current version: $current_version"
    exit 1
fi

echo "Node.js version check passed."

# Check if yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "Error: yarn is not installed. Please install yarn and try again."
    exit 1
fi

# Check if npm is being used
if [ "$npm_config_user_agent" != "${npm_config_user_agent#npm}" ]; then
    echo "Error: Please use yarn instead of npm for this project."
    exit 1
fi

echo "Yarn check passed. Continuing with installation..."