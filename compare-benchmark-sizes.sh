#!/bin/bash

# ==============================================================================
# SyntropyLog Advanced Benchmark Script (Portable Version)
#
# Features:
# - Compatible with older bash versions (e.g., macOS default).
# - Parallel builds for faster execution.
# - Centralized configuration for easy maintenance.
# - Robust error handling.
# - Dynamic calculations and clean, formatted table output.
# - Dependency checks.
# ==============================================================================

# --- Configuration ---
# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Pipelines fail if any command fails, not just the last one.
set -o pipefail

# --- Colors and Formatting ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Benchmark Cases ---
# Add new benchmark cases here. The script will handle them automatically.
# Format: "ID;DisplayName;Path"
declare -a BENCHMARK_CASES=(
    "syntropy;SyntropyLog;35-benchmark-with-syntropy"
    "nologger;No Logger;36-benchmark-without-syntropy"
    "pino;Pino Logger;37-benchmark-with-pino"
)

# --- Global Result Variables ---
# Using simple global variables for portability across bash versions.
syntropy_size=0
nologger_size=0
pino_size=0
syntropy_time=0
nologger_time=0
pino_time=0

# --- Helper Functions ---
function print_header() {
    echo -e "${YELLOW}📊 SyntropyLog Benchmark Suite${NC}"
    echo -e "${YELLOW}=============================${NC}"
    echo
}

function check_deps() {
    if ! command -v bc &> /dev/null; then
        echo -e "${RED}Error: 'bc' (basic calculator) is not installed. Please install it to run the benchmarks.${NC}"
        exit 1
    fi
}

# Function to get ONLY the main JavaScript bundle size
function get_bundle_size() {
    local dir_path=$1
    # Sums the size of all .js files, excluding .map files.
    if [ -d "$dir_path" ]; then
        find "$dir_path" -name "*.js" ! -name "*.map" -exec stat -f%z {} \; 2>/dev/null | awk '{sum += $1} END {print sum+0}' || echo "0"
    else
        echo "0"
    fi
}

# --- Main Logic ---

# 1. Build projects in parallel
function run_builds() {
    echo -e "${BLUE}🔨 Building all projects in parallel...${NC}"
    local pids=()
    local build_errors=()
    
    for case in "${BENCHMARK_CASES[@]}"; do
        IFS=';' read -r id display_name path <<< "$case"
        (
            echo -e "  -> Building ${BOLD}${display_name}${NC}..."
            cd "$path" || exit 1
            
            # Clean previous builds
            npm run clean &> /dev/null || true
            
            # Install dependencies silently if not present
            if [ ! -d "node_modules" ]; then
                npm install --silent &> /dev/null
            fi
            
            # Build project and hide output
            if npm run build &> /dev/null; then
                echo -e "  -> Done building ${BOLD}${display_name}${NC}."
            else
                echo -e "  -> ${RED}Failed building ${BOLD}${display_name}${NC}."
                exit 1
            fi
        ) &
        pids+=($!)
    done

    # Wait for all parallel builds to complete and check for errors
    local failed_builds=0
    for i in "${!pids[@]}"; do
        if ! wait "${pids[$i]}"; then
            failed_builds=$((failed_builds + 1))
        fi
    done
    
    if [ $failed_builds -gt 0 ]; then
        echo -e "${RED}❌ $failed_builds build(s) failed. Please check the errors above.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All projects built successfully.${NC}"
    echo
}

# 2. Print results table
function print_results() {
    echo -e "${YELLOW}📊 BENCHMARK RESULTS${NC}"
    echo -e "${YELLOW}=====================${NC}"
    echo
    
    # Header
    printf "${BOLD}%-18s | %12s | %12s | %18s | %18s${NC}\n" "Logger" "Bundle Size" "Perf. Time" "vs No Logger" "vs Pino"
    printf -- '-%.0s' {1..90} && printf '\n'

    # No Logger
    printf "%-18s | %9s KB | %9s ms | %18s | %18s\n" "No Logger" "$((nologger_size / 1024))" "$nologger_time" "-" "-"

    # Pino
    local pino_size_diff=$((pino_size - nologger_size))
    printf "%-18s | %9s KB | %9s ms | %+6d B | %18s\n" "Pino" "$((pino_size / 1024))" "$pino_time" "$pino_size_diff" "-"

    # SyntropyLog
    local syntropy_size_diff_vs_none=$((syntropy_size - nologger_size))
    local syntropy_size_diff_vs_pino=$((syntropy_size - pino_size))
    local syntropy_time_diff_vs_pino=$((syntropy_time - pino_time))
    
    local size_ratio="N/A"
    local time_ratio="N/A"
    
    if [ "$pino_size" -gt 0 ]; then
        size_ratio=$(echo "scale=2; $syntropy_size / $pino_size" | bc 2>/dev/null || echo "N/A")
    fi
    
    if [ "$pino_time" -gt 0 ]; then
        time_ratio=$(echo "scale=2; $syntropy_time / $pino_time" | bc 2>/dev/null || echo "N/A")
    fi

    printf "%-18s | %9s KB | %9s ms | %+6d B | %+6d B (%s)\n" "SyntropyLog" "$((syntropy_size / 1024))" "$syntropy_time" "$syntropy_size_diff_vs_none" "$syntropy_size_diff_vs_pino" "$size_ratio"
    # Print time comparison on a new line for alignment
    printf "%-18s | %12s | %12s | %18s | %+6d ms (%s)\n" "" "" "" "" "$syntropy_time_diff_vs_pino" "$time_ratio"
    
    echo
    echo -e "${BLUE}💡 Analysis:${NC}"
    
    # Bundle size analysis
    if [ "$size_ratio" != "N/A" ] && [ "$(echo "$size_ratio < 2" | bc 2>/dev/null || echo "false")" = "1" ]; then
        echo "  • ✅ Bundle size impact vs Pino is reasonable"
    else
        echo "  • ⚠️  Bundle size impact vs Pino is significant"
    fi
    
    # Performance analysis
    if [ "$time_ratio" != "N/A" ] && [ "$(echo "$time_ratio < 1.5" | bc 2>/dev/null || echo "false")" = "1" ]; then
        echo "  • ✅ Performance impact vs Pino is minimal"
    else
        echo "  • ⚠️  Performance impact vs Pino is noticeable"
    fi
    
    echo
    echo -e "${BLUE}🎯 Recommendations:${NC}"
    echo "  • Use SyntropyLog when you need:"
    echo "    - Structured logging with context"
    echo "    - Distributed tracing"
    echo "    - Advanced observability features"
    echo "  • Use Pino when you need:"
    echo "    - Maximum performance"
    echo "    - Minimal bundle size"
    echo "    - Simple JSON logging"
    echo "  • Consider no logger when:"
    echo "    - Performance is absolutely critical"
    echo "    - Bundle size is paramount"
    echo "    - Logging is not required"
}

# --- Script Execution ---
main() {
    print_header
    check_deps
    run_builds

    echo -e "${BLUE}📦 Analyzing bundle sizes...${NC}"
    for case_data in "${BENCHMARK_CASES[@]}"; do
        IFS=';' read -r id display_name path <<< "$case_data"
        local size
        size=$(get_bundle_size "$path/dist")
        case "$id" in
            syntropy) syntropy_size=$size ;;
            nologger) nologger_size=$size ;;
            pino)     pino_size=$size ;;
        esac
        echo -e "  -> ${BOLD}${display_name}${NC}: ${size} bytes"
    done
    echo

    echo -e "${BLUE}⚡ Running performance benchmarks (sequentially)...${NC}"
    for case_data in "${BENCHMARK_CASES[@]}"; do
        IFS=';' read -r id display_name path <<< "$case_data"
        echo -e "  -> Running ${BOLD}${display_name}${NC}..."
        cd "$path" || exit 1
        local start_time=$(date +%s%N)
        timeout 60s npm run dev &> /dev/null || true
        local end_time=$(date +%s%N)
        local execution_time=$(( (end_time - start_time) / 1000000 ))
        case "$id" in
            syntropy) syntropy_time=$execution_time ;;
            nologger) nologger_time=$execution_time ;;
            pino)     pino_time=$execution_time ;;
        esac
        cd ..
    done
    echo -e "${GREEN}✅ Performance benchmarks completed.${NC}"
    echo

    print_results
    
    echo -e "${GREEN}✅ Benchmark comparison completed!${NC}"
}

main
