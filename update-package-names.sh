#!/bin/bash

# Script to update package.json names to match folder names
# Usage: ./update-package-names.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to update package.json name
update_package_name() {
    local dir=$1
    local package_file="$dir/package.json"
    local folder_name=$(basename "$dir")
    
    if [ -f "$package_file" ]; then
        log_info "Updating $package_file"
        
        # Update the name field to match folder name
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/\"name\": \"[^\"]*\"/\"name\": \"$folder_name\"/g" "$package_file"
        else
            # Linux
            sed -i "s/\"name\": \"[^\"]*\"/\"name\": \"$folder_name\"/g" "$package_file"
        fi
        
        log_success "Updated $folder_name"
    else
        log_warning "No package.json found in $dir"
    fi
}

# Function to create package.json for missing examples
create_package_json() {
    local dir=$1
    local folder_name=$(basename "$dir")
    local package_file="$dir/package.json"
    
    if [ ! -f "$package_file" ]; then
        log_info "Creating package.json for $folder_name"
        
        cat > "$package_file" << EOF
{
  "name": "$folder_name",
  "version": "1.0.0",
  "description": "SyntropyLog $folder_name Example",
  "main": "dist/index.js",
  "type": "module",
  "scripts": {
    "clean": "rm -rf dist",
    "build": "tsc",
    "start": "npm run clean && npm run build && node dist/index.js",
    "dev": "npm run clean && tsx src/index.ts",
    "test": "vitest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  },
  "dependencies": {
    "syntropylog": "0.7.0",
    "@syntropylog/types": "0.1.5",
    "@syntropylog/adapters": "0.1.23"
  }
}
EOF
        
        log_success "Created package.json for $folder_name"
    fi
}

log_info "🚀 Starting package.json update process"

# Get all numbered example directories
EXAMPLES=($(find . -maxdepth 1 -type d -name "[0-9][0-9]-*" | sort))

log_info "📋 Found ${#EXAMPLES[@]} example directories"

# Update existing package.json files
for example in "${EXAMPLES[@]}"; do
    if [ -f "$example/package.json" ]; then
        update_package_name "$example"
    else
        create_package_json "$example"
    fi
done

log_success "🎉 Package.json update completed!"
log_info "📊 Summary: Updated ${#EXAMPLES[@]} examples" 