#!/bin/bash

# Script to create missing package.json and tsconfig.json files
# Usage: ./create-missing-files.sh

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

# Function to create package.json
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
  "main": "src/index.ts",
  "type": "module",
  "scripts": {
    "dev": "tsx src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "syntropylog": "0.7.0",
    "@syntropylog/types": "0.1.5",
    "@syntropylog/adapters": "0.1.23"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
EOF
        
        log_success "Created package.json for $folder_name"
    fi
}

# Function to create tsconfig.json
create_tsconfig_json() {
    local dir=$1
    local folder_name=$(basename "$dir")
    local tsconfig_file="$dir/tsconfig.json"
    
    if [ ! -f "$tsconfig_file" ]; then
        log_info "Creating tsconfig.json for $folder_name"
        
        cat > "$tsconfig_file" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
        
        log_success "Created tsconfig.json for $folder_name"
    fi
}

# Function to create src/index.ts with pending message
create_index_ts() {
    local dir=$1
    local folder_name=$(basename "$dir")
    local src_dir="$dir/src"
    local index_file="$src_dir/index.ts"
    
    if [ ! -d "$src_dir" ]; then
        mkdir -p "$src_dir"
    fi
    
    if [ ! -f "$index_file" ]; then
        log_info "Creating src/index.ts for $folder_name"
        
        cat > "$index_file" << EOF
console.log("🚧 Pending example: $folder_name");
console.log("📦 This example will be implemented soon...");
console.log("✅ Dependencies installed successfully!");

// TODO: Implement $folder_name example
EOF
        
        log_success "Created src/index.ts for $folder_name"
    fi
}

log_info "🚀 Starting creation of missing files"

# List of examples that need files
MISSING_EXAMPLES=(
    "14-http-redis-nestjs"
    "15-http-redis-koa"
    "16-http-redis-hapi"
    "17-custom-serializers"
    "18-custom-transports"
    "19-doctor-cli"
    "25-production-configuration"
    "26-advanced-context"
    "27-complete-enterprise-app"
)

# Create files for each missing example
for example in "${MISSING_EXAMPLES[@]}"; do
    if [ -d "$example" ]; then
        log_info "Processing $example"
        create_package_json "$example"
        create_tsconfig_json "$example"
        create_index_ts "$example"
        echo ""
    else
        log_warning "Directory not found: $example"
    fi
done

log_success "🎉 All missing files created!"
log_info "📊 Summary: ${#MISSING_EXAMPLES[@]} examples processed" 