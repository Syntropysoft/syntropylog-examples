#!/bin/bash

# Script to test all SyntropyLog examples
# Usage: ./test-all-examples.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to show colored messages
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

log_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

log_example() {
    echo -e "${CYAN}📦 $1${NC}"
}

# Check arguments
if [ $# -eq 0 ]; then
    VERSION="0.6.7"
    log_warning "No version specified, using: $VERSION"
else
    VERSION=$1
fi

log_info "🚀 Starting test of all examples with syntropylog@$VERSION"

# Base directory
BASE_DIR="."
CURRENT_DIR=$(pwd)

# Function to update package.json
update_package_json() {
    local example_dir=$1
    local package_file="$example_dir/package.json"
    
    if [ -f "$package_file" ]; then
        log_step "Updating package.json in $example_dir"
        
        # Update syntropylog version
        if grep -q '"syntropylog"' "$package_file"; then
            # Use sed to update version
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS
                sed -i '' "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$VERSION\"/g" "$package_file"
            else
                # Linux
                sed -i "s/\"syntropylog\": \"[^\"]*\"/\"syntropylog\": \"$VERSION\"/g" "$package_file"
            fi
            log_success "Version updated to syntropylog@$VERSION"
        else
            log_warning "syntropylog not found in $package_file"
        fi
    else
        log_warning "package.json not found in $example_dir"
    fi
}

# Function to test an example
test_example() {
    local example_dir=$1
    local example_name=$(basename "$example_dir")
    
    log_example "=== TESTING EXAMPLE: $example_name ==="
    
    # Change to example directory
    cd "$example_dir"
    
    # Update package.json
    update_package_json "."
    
    # Install dependencies
    log_step "Installing dependencies..."
    npm install
    log_success "Dependencies installed"
    
    # Check if docker-compose.yaml exists
    if [ -f "docker-compose.yaml" ]; then
        log_step "Starting Docker Compose..."
        docker-compose up -d
        log_success "Docker Compose started"
        
        # Wait a bit for services to be ready
        sleep 3
    fi
    
    # Run the example
    log_step "Running example..."
    log_warning "The example will run. Check the logs and press ENTER when ready to continue."
    log_warning "Press Ctrl+C to stop the example when you're done reviewing it."
    
    # Run in background so we can interrupt
    npm run dev &
    DEV_PID=$!
    
    # Wait for user input
    read -p "Press ENTER when you've reviewed the example and want to continue..."
    
    # Terminate process
    if kill -0 $DEV_PID 2>/dev/null; then
        kill $DEV_PID
        log_info "Example process terminated"
    fi
    
    # Stop Docker Compose if it exists
    if [ -f "docker-compose.yaml" ]; then
        log_step "Stopping Docker Compose..."
        docker-compose down
        log_success "Docker Compose stopped"
    fi
    
    # Return to original directory
    cd "$CURRENT_DIR"
    
    log_success "Example $example_name completed"
    echo ""
}

# Function to list examples in order
list_examples() {
    local examples=()
    
    # Find numbered example directories
    for dir in *; do
        if [ -d "$dir" ]; then
            local dirname=$(basename "$dir")
            if [[ "$dirname" =~ ^[0-9]+ ]]; then
                examples+=("$dirname")
            fi
        fi
    done
    
    # Sort numerically
    IFS=$'\n' examples=($(sort -V <<<"${examples[*]}"))
    unset IFS
    
    echo "${examples[@]}"
}

# Get list of examples
EXAMPLES=($(list_examples))

log_info "📋 Examples found: ${#EXAMPLES[@]}"
for example in "${EXAMPLES[@]}"; do
    echo "  - $example"
done

echo ""

# Ask for confirmation
log_warning "Do you want to test all examples? (y/N)"
read -p "Answer: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Test cancelled."
    exit 0
fi

# Counter
TOTAL=${#EXAMPLES[@]}
CURRENT=0

# Test each example
for example in "${EXAMPLES[@]}"; do
    CURRENT=$((CURRENT + 1))
    example_path="$example"
    
    if [ -d "$example_path" ]; then
        log_info "Progress: $CURRENT/$TOTAL"
        test_example "$example_path"
    else
        log_error "Directory not found: $example_path"
    fi
done

log_success "🎉 All examples have been tested successfully!"
log_info "📊 Summary: $TOTAL examples tested with syntropylog@$VERSION" 