#!/bin/bash

# Tree Shaking Bundle Size Comparison Script
# This script builds both examples and compares their bundle sizes

set -e

echo "🌳 SyntropyLog Tree Shaking Bundle Size Comparison"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get file size in KB
get_file_size() {
    local file="$1"
    if [ -f "$file" ]; then
        local size=$(du -k "$file" | cut -f1)
        echo "$size"
    else
        echo "0"
    fi
}

# Function to format size
format_size() {
    local size="$1"
    if [ "$size" -gt 1024 ]; then
        echo "$(echo "scale=1; $size/1024" | bc)MB"
    else
        echo "${size}KB"
    fi
}

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf modules/examples/33-tree-shaking-minimal/dist
rm -rf modules/examples/34-tree-shaking-full/dist

# Build minimal example
print_status "Building minimal tree shaking example (33)..."
cd modules/examples/33-tree-shaking-minimal
npm install --silent
npm run build --silent
cd ../../..

# Build full example
print_status "Building full import example (34)..."
cd modules/examples/34-tree-shaking-full
npm install --silent
npm run build --silent
cd ../../..

# Get bundle sizes
print_status "Analyzing bundle sizes..."

MINIMAL_BUNDLE="modules/examples/33-tree-shaking-minimal/dist/index.js"
FULL_BUNDLE="modules/examples/34-tree-shaking-full/dist/index.js"

MINIMAL_SIZE=$(get_file_size "$MINIMAL_BUNDLE")
FULL_SIZE=$(get_file_size "$FULL_BUNDLE")

# Calculate difference
if [ "$MINIMAL_SIZE" -gt 0 ] && [ "$FULL_SIZE" -gt 0 ]; then
    DIFFERENCE=$((FULL_SIZE - MINIMAL_SIZE))
    PERCENTAGE=$(echo "scale=1; ($DIFFERENCE * 100) / $MINIMAL_SIZE" | bc)
    
    echo ""
    echo "📊 Bundle Size Comparison Results:"
    echo "=================================="
    echo ""
    echo "Minimal Import (Example 33):"
    echo "  📦 Bundle: $MINIMAL_BUNDLE"
    echo "  📏 Size: $(format_size $MINIMAL_SIZE)"
    echo "  ✅ Tree shaking: Enabled"
    echo "  🎯 Includes: Logger + Context only"
    echo ""
    echo "Full Import (Example 34):"
    echo "  📦 Bundle: $FULL_BUNDLE"
    echo "  📏 Size: $(format_size $FULL_SIZE)"
    echo "  ❌ Tree shaking: Disabled"
    echo "  🚫 Includes: Everything (even unused)"
    echo ""
    echo "📈 Comparison:"
    echo "  🔺 Size difference: $(format_size $DIFFERENCE)"
    echo "  📊 Percentage increase: ${PERCENTAGE}%"
    echo "  💾 Space wasted: $(format_size $DIFFERENCE)"
    
    if [ "$PERCENTAGE" -gt 50 ]; then
        print_warning "Bundle size is ${PERCENTAGE}% larger with full imports!"
    else
        print_success "Bundle size difference is reasonable."
    fi
    
    echo ""
    echo "🎯 Recommendations:"
    echo "  ✅ Use minimal imports: import { syntropyLog } from 'syntropylog'"
    echo "  ✅ Only import what you need"
    echo "  ❌ Avoid importing everything"
    echo "  📊 Monitor bundle size in CI/CD"
    
else
    print_error "Could not analyze bundle sizes. Check if builds completed successfully."
    exit 1
fi

# Check if bundle analysis files were generated
print_status "Checking for bundle analysis files..."

MINIMAL_ANALYSIS="modules/examples/33-tree-shaking-minimal/bundle-analysis.html"
FULL_ANALYSIS="modules/examples/34-tree-shaking-full/bundle-analysis.html"

if [ -f "$MINIMAL_ANALYSIS" ]; then
    print_success "Minimal bundle analysis: $MINIMAL_ANALYSIS"
else
    print_warning "Minimal bundle analysis not found"
fi

if [ -f "$FULL_ANALYSIS" ]; then
    print_success "Full bundle analysis: $FULL_ANALYSIS"
else
    print_warning "Full bundle analysis not found"
fi

echo ""
print_success "Bundle size comparison completed!"
echo ""
echo "🔍 Next steps:"
echo "  1. Open bundle-analysis.html files to see detailed breakdown"
echo "  2. Compare the modules included in each bundle"
echo "  3. Use this data to optimize your imports" 