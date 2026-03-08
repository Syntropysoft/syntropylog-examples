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

# Function to get versions from versions.txt (xargs quita espacios al final)
get_versions() {
    if [ -f "versions.txt" ]; then
        SYNTROPYLOG_VERSION=$(grep "^syntropylog=" versions.txt | cut -d'=' -f2 | xargs)
        TYPES_VERSION=$(grep "^@syntropylog/types=" versions.txt | cut -d'=' -f2 | xargs)
        REDIS_VERSION=$(grep "^redis=" versions.txt | cut -d'=' -f2 | xargs)
        CHALK_VERSION=$(grep "^chalk=" versions.txt | cut -d'=' -f2 | xargs)
    else
        log_error "versions.txt not found!"
        exit 1
    fi
}

# Add a dependency to package.json if missing (uses Node for portability)
add_dep_if_missing() {
    local package_file=$1
    local dep=$2
    local version=$3
    node -e "
    const fs = require('fs');
    const p = process.argv[1];
    const dep = process.argv[2];
    const version = process.argv[3];
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!j.dependencies) j.dependencies = {};
    if (!j.dependencies[dep]) {
      j.dependencies[dep] = version;
      fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
    }
    " "$package_file" "$dep" "$version"
}

# Function to update package.json dependencies
update_package_dependencies() {
    local package_file=$1
    local example_name=$2
    
    log_info "Updating dependencies in $example_name"
    
    # Create a backup
    cp "$package_file" "$package_file.backup"
    
    # Update versions of existing deps
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$SYNTROPYLOG_VERSION\"/g" "$package_file"
        sed -i '' "s/\"@syntropylog\/types\": \"[^\"]*\"/\"@syntropylog\/types\": \"$TYPES_VERSION\"/g" "$package_file"
        sed -i '' "s/\"redis\": \"[^\"]*\"/\"redis\": \"$REDIS_VERSION\"/g" "$package_file"
        sed -i '' "s/\"chalk\": \"[^\"]*\"/\"chalk\": \"$CHALK_VERSION\"/g" "$package_file"
    else
        sed -i "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$SYNTROPYLOG_VERSION\"/g" "$package_file"
        sed -i "s/\"@syntropylog\/types\": \"[^\"]*\"/\"@syntropylog\/types\": \"$TYPES_VERSION\"/g" "$package_file"
        sed -i "s/\"redis\": \"[^\"]*\"/\"redis\": \"$REDIS_VERSION\"/g" "$package_file"
        sed -i "s/\"chalk\": \"[^\"]*\"/\"chalk\": \"$CHALK_VERSION\"/g" "$package_file"
    fi
    
    # Add missing deps (solo en ejemplos que tienen syntropylog)
    if grep -q '"syntropylog"' "$package_file"; then
        add_dep_if_missing "$package_file" "@syntropylog/types" "$TYPES_VERSION"
        add_dep_if_missing "$package_file" "redis" "$REDIS_VERSION"
        add_dep_if_missing "$package_file" "chalk" "$CHALK_VERSION"
    fi
    
    log_success "Updated $example_name"
}

log_info "🚀 Starting dependency update process"

# Get versions from versions.txt
get_versions

log_info "📦 Using versions:"
log_info "  syntropylog: $SYNTROPYLOG_VERSION"
log_info "  @syntropylog/types: $TYPES_VERSION"
log_info "  redis: $REDIS_VERSION"
log_info "  chalk: $CHALK_VERSION"

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