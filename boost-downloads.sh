#!/bin/zsh

# Script to boost npm downloads by running examples in loop
# Usage: ./boost-downloads.sh [iterations] [start_example] [end_example]
#
# Examples:
# ./boost-downloads.sh 10              # Run all examples 10 times
# ./boost-downloads.sh 5 0 10          # Run examples 0-10, 5 times each
# ./boost-downloads.sh 3 28 32         # Run testing examples 28-32, 3 times each
#
# 🍎 Apple/macOS Optimized Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_boost() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Check arguments
if [ $# -eq 0 ]; then
    ITERATIONS=5
    START_EXAMPLE=0
    END_EXAMPLE=32
    log_warning "No arguments provided, using defaults: $ITERATIONS iterations, examples $START_EXAMPLE-$END_EXAMPLE"
elif [ $# -eq 1 ]; then
    ITERATIONS=$1
    START_EXAMPLE=0
    END_EXAMPLE=32
    log_info "Running $ITERATIONS iterations for all examples"
elif [ $# -eq 3 ]; then
    ITERATIONS=$1
    START_EXAMPLE=$2
    END_EXAMPLE=$3
    log_info "Running $ITERATIONS iterations for examples $START_EXAMPLE-$END_EXAMPLE"
else
    log_error "Usage: $0 [iterations] [start_example] [end_example]"
    log_error "Example: $0 10        # Run all examples 10 times"
    log_error "Example: $0 5 0 10    # Run examples 0-10, 5 times each"
    exit 1
fi

# Function to test a single example
test_single_example() {
    local example_dir=$1
    local example_name=$(basename "$example_dir")
    
    log_boost "Testing: $example_name"
    
    # Change to example directory
    cd "$example_dir"
    
    # Check if docker-compose.yaml exists and start it FIRST
    if [ -f "docker-compose.yaml" ]; then
        docker compose up -d >/dev/null 2>&1
        sleep 3
    fi
    
    # Install dependencies (this triggers npm downloads)
    npm install >/dev/null 2>&1
    
    # Check if this is a testing example (28 and above)
    local example_number=$(echo "$example_name" | grep -o '^[0-9]*')
    if [ "$example_number" -ge 28 ]; then
        # Run test quickly (no watch mode) - use vitest run explicitly
        npx vitest run >/dev/null 2>&1 || true
    else
        # Run dev for a few seconds
        if command -v gtimeout >/dev/null 2>&1; then
            gtimeout 5s npm run dev >/dev/null 2>&1 || true
        else
            # Fallback for macOS
            npm run dev &
            DEV_PID=$!
            sleep 5
            if kill -0 $DEV_PID 2>/dev/null; then
                kill $DEV_PID 2>/dev/null || true
            fi
            wait $DEV_PID 2>/dev/null || true
        fi
    fi
    
    # Stop Docker Compose if it exists
    if [ -f "docker-compose.yaml" ]; then
        docker compose down >/dev/null 2>&1
    fi
    
    # Return to original directory
    cd "$CURRENT_DIR"
    
    log_success "Completed: $example_name"
}

# Function to list examples in range
list_examples_in_range() {
    local examples=()
    
    # Find numbered example directories
    for dir in *; do
        if [ -d "$dir" ]; then
            local dirname=$(basename "$dir")
            if [[ "$dirname" =~ ^[0-9]+ ]]; then
                local number=$(echo "$dirname" | grep -o '^[0-9]*')
                if [ "$number" -ge "$START_EXAMPLE" ] && [ "$number" -le "$END_EXAMPLE" ]; then
                    examples+=("$dirname")
                fi
            fi
        fi
    done
    
    # Sort numerically
    IFS=$'\n' examples=($(sort -V <<<"${examples[*]}"))
    unset IFS
    
    echo "${examples[@]}"
}

# Get current directory
CURRENT_DIR=$(pwd)

# Get list of examples in range
EXAMPLES=($(list_examples_in_range))

log_boost "🚀 Starting download boost campaign!"
log_info "📊 Configuration:"
log_info "  Iterations: $ITERATIONS"
log_info "  Examples: $START_EXAMPLE-$END_EXAMPLE"
log_info "  Total examples: ${#EXAMPLES[@]}"
log_info "  Total runs: $((ITERATIONS * ${#EXAMPLES[@]}))"

echo ""
log_warning "This will run $((ITERATIONS * ${#EXAMPLES[@]})) npm install commands!"
log_warning "Do you want to continue? (y/N)"
read -p "Answer: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Boost campaign cancelled."
    exit 0
fi

# Counter for total runs
TOTAL_RUNS=$((ITERATIONS * ${#EXAMPLES[@]}))
CURRENT_RUN=0

# Run iterations
for iteration in $(seq 1 $ITERATIONS); do
    log_boost "🔄 Iteration $iteration/$ITERATIONS"
    
    # Run each example in range
    for example in "${EXAMPLES[@]}"; do
        CURRENT_RUN=$((CURRENT_RUN + 1))
        log_info "Progress: $CURRENT_RUN/$TOTAL_RUNS"
        
        if [ -d "$example" ]; then
            test_single_example "$example"
        else
            log_error "Directory not found: $example"
        fi
    done
    
    log_success "✅ Iteration $iteration completed"
    echo ""
done

log_boost "🎉 Download boost campaign completed!"
log_info "📊 Final Summary:"
log_info "  Total runs: $TOTAL_RUNS"
log_info "  Examples tested: ${#EXAMPLES[@]}"
log_info "  Iterations: $ITERATIONS"
log_info "  Estimated downloads: $TOTAL_RUNS"
log_boost "🚀 Your npm download count should increase significantly!" 