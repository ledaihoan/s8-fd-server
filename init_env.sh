#!/usr/bin/env bash

# Function to parse YAML file
parse_yaml() {
    local yaml_file="$1"
    while IFS=': ' read -r key value; do
        if [[ $key && $value && $key != "#"* ]]; then
            export "$key"="$value"
        fi
    done < <(grep -vE '^\s*#' "$yaml_file")
}

# Load YAML file
if [ -n "$1" ]; then
  NODE_ENV=$1
else
  NODE_ENV=development
fi
yaml_file="./$NODE_ENV.env.yaml"

if [ ! -f "$yaml_file" ]; then
    echo "Error: YAML file '$yaml_file' not found."
    exit 1
fi

# Parse YAML and bind to environment variables
parse_yaml "$yaml_file"