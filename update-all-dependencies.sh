#!/bin/bash

# Script to update all package.json with complete SyntropyLog dependencies
# Usage: ./update-all-dependencies.sh

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

# Function to get versions from versions.txt
get_versions() {
    if [ -f "versions.txt" ]; then
        SYNTROPYLOG_VERSION=$(grep "^syntropylog=" versions.txt | cut -d'=' -f2)
        TYPES_VERSION=$(grep "^@syntropylog/types=" versions.txt | cut -d'=' -f2)
        ADAPTERS_VERSION=$(grep "^@syntropylog/adapters=" versions.txt | cut -d'=' -f2)
    else
        log_error "versions.txt not found!"
        exit 1
    fi
}

# Function to update package.json dependencies
update_package_dependencies() {
    local package_file=$1
    local example_name=$2
    
    log_info "Updating dependencies in $example_name"
    
    # Create a backup
    cp "$package_file" "$package_file.backup"
    
    # Update syntropylog version
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$SYNTROPYLOG_VERSION\"/g" "$package_file"
        sed -i '' "s/\"@syntropylog\/types\": \"[^\"]*\"/\"@syntropylog\/types\": \"$TYPES_VERSION\"/g" "$package_file"
        sed -i '' "s/\"@syntropylog\/adapters\": \"[^\"]*\"/\"@syntropylog\/adapters\": \"$ADAPTERS_VERSION\"/g" "$package_file"
    else
        # Linux
        sed -i "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$SYNTROPYLOG_VERSION\"/g" "$package_file"
        sed -i "s/\"@syntropylog\/types\": \"[^\"]*\"/\"@syntropylog\/types\": \"$TYPES_VERSION\"/g" "$package_file"
        sed -i "s/\"@syntropylog\/adapters\": \"[^\"]*\"/\"@syntropylog\/adapters\": \"$ADAPTERS_VERSION\"/g" "$package_file"
    fi
    
    # Add missing dependencies using a simpler approach
    # Check if types dependency exists
    if ! grep -q '"@syntropylog/types"' "$package_file"; then
        log_warning "Adding @syntropylog/types to $example_name"
        # Add it manually by replacing the dependencies section
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/"dependencies": {/"dependencies": {\n    "@syntropylog\/types": "'$TYPES_VERSION'",/' "$package_file"
        else
            sed -i 's/"dependencies": {/"dependencies": {\n    "@syntropylog\/types": "'$TYPES_VERSION'",/' "$package_file"
        fi
    fi
    
    # Check if adapters dependency exists
    if ! grep -q '"@syntropylog/adapters"' "$package_file"; then
        log_warning "Adding @syntropylog/adapters to $example_name"
        # Add it manually by replacing the dependencies section
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' 's/"dependencies": {/"dependencies": {\n    "@syntropylog\/adapters": "'$ADAPTERS_VERSION'",/' "$package_file"
        else
            sed -i 's/"dependencies": {/"dependencies": {\n    "@syntropylog\/adapters": "'$ADAPTERS_VERSION'",/' "$package_file"
        fi
    fi
    
    log_success "Updated $example_name"
}

log_info "🚀 Starting dependency update process"

# Get versions from versions.txt
get_versions

log_info "📦 Using versions:"
log_info "  syntropylog: $SYNTROPYLOG_VERSION"
log_info "  @syntropylog/types: $TYPES_VERSION"
log_info "  @syntropylog/adapters: $ADAPTERS_VERSION"

# Find all package.json files in example directories
PACKAGE_FILES=($(find . -maxdepth 2 -name "package.json" | grep -E "./[0-9]+-" | sort))

log_info "📋 Found ${#PACKAGE_FILES[@]} package.json files to update"

# Update each package.json
for package_file in "${PACKAGE_FILES[@]}"; do
    example_name=$(basename $(dirname "$package_file"))
    update_package_dependencies "$package_file" "$example_name"
done

log_success "🎉 All package.json files updated with complete dependencies!"
log_info "📊 Summary: ${#PACKAGE_FILES[@]} examples updated"
log_info "🚀 Ready to increase npm downloads!" 