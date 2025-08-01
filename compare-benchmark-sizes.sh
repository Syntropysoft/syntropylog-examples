#!/bin/bash

# ==============================================================================
# SyntropyLog Advanced Benchmark Script (Enhanced Version)
#
# Features:
# - Compatible with older bash versions (e.g., macOS default).
# - Parallel builds for faster execution.
# - Centralized configuration for easy maintenance.
# - Robust error handling.
# - Dynamic calculations and clean, formatted table output.
# - Dependency checks.
# - System information and memory usage tracking.
# - CPU usage monitoring during benchmarks.
# - More accurate performance measurements.
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
syntropy_memory=0
nologger_memory=0
pino_memory=0
syntropy_cpu=0
nologger_cpu=0
pino_cpu=0

# --- Helper Functions ---
function print_header() {
    echo -e "${YELLOW}📊 SyntropyLog Benchmark Suite${NC}"
    echo -e "${YELLOW}=============================${NC}"
    echo
}

function print_system_info() {
    echo -e "${BLUE}🖥️  SYSTEM INFORMATION${NC}"
    echo -e "${BLUE}=====================${NC}"
    
    # OS Information
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "  OS: $(sw_vers -productName) $(sw_vers -productVersion)"
        echo -e "  Architecture: $(uname -m)"
        echo -e "  Kernel: $(uname -r)"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            echo -e "  OS: $PRETTY_NAME"
        else
            echo -e "  OS: $(uname -s) $(uname -r)"
        fi
        echo -e "  Architecture: $(uname -m)"
        echo -e "  Kernel: $(uname -r)"
    else
        echo -e "  OS: $OSTYPE"
        echo -e "  Architecture: $(uname -m)"
    fi
    
    # CPU Information
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "  CPU: $(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo 'Unknown')"
        echo -e "  Cores: $(sysctl -n hw.ncpu 2>/dev/null || echo 'Unknown')"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "  CPU: $(grep 'model name' /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)"
        echo -e "  Cores: $(nproc)"
    fi
    
    # Memory Information
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local total_mem=$(sysctl -n hw.memsize 2>/dev/null || echo "0")
        total_mem=$((total_mem / 1024 / 1024))
        echo -e "  Memory: ${total_mem} MB"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local total_mem=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        total_mem=$((total_mem / 1024))
        echo -e "  Memory: ${total_mem} MB"
    fi
    
    # Node.js Information
    if command -v node &> /dev/null; then
        echo -e "  Node.js: $(node --version)"
        echo -e "  NPM: $(npm --version)"
    fi
    
    echo
}

function check_deps() {
    local missing_deps=()
    
    if ! command -v bc &> /dev/null; then
        missing_deps+=("bc")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}Error: Missing dependencies: ${missing_deps[*]}${NC}"
        echo -e "${YELLOW}Please install the missing dependencies to run the benchmarks.${NC}"
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

# Function to get memory usage in MB
function get_memory_usage() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS: Get memory usage for the current process
        ps -o rss= -p $$ 2>/dev/null | awk '{print $1/1024}' || echo "0"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux: Get memory usage for the current process
        cat /proc/$$/status 2>/dev/null | grep VmRSS | awk '{print $2/1024}' || echo "0"
    else
        echo "0"
    fi
}

# Function to get CPU usage percentage
function get_cpu_usage() {
    if command -v top &> /dev/null; then
        # Get CPU usage for the current process
        if [[ "$OSTYPE" == "darwin"* ]]; then
            top -pid $$ -l 1 2>/dev/null | grep -E "^CPU" | awk '{print $3}' | sed 's/%//' || echo "0"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            top -p $$ -bn1 2>/dev/null | grep -E "^%Cpu" | awk '{print $2}' || echo "0"
        else
            echo "0"
        fi
    else
        echo "0"
    fi
}

# Function to run benchmark with detailed metrics
function run_benchmark() {
    local id=$1
    local display_name=$2
    local path=$3
    
    echo -e "  -> Running ${BOLD}${display_name}${NC} (3 iterations)..."
    cd "$path" || exit 1
    
    local total_time=0
    local total_memory=0
    local total_cpu=0
    local iterations=3
    local max_memory=0
    
    for iteration in {1..3}; do
        echo -e "    Iteration ${iteration}/3..."
        
        # Start the application in background
        local start_time=$(date +%s%N)
        timeout 15s npm run dev > /dev/null 2>&1 &
        local app_pid=$!
        
        # Wait for the app to start and stabilize
        sleep 3
        
        # Monitor for 8 seconds to get stable metrics
        local iteration_memory=0
        local iteration_cpu=0
        local cpu_samples=0
        
        for i in {1..8}; do
            if kill -0 $app_pid 2>/dev/null; then
                # Get memory usage from the actual Node.js process
                local current_memory=0
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    current_memory=$(ps -o rss= -p $app_pid 2>/dev/null | awk '{print $1/1024}' || echo "0")
                elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                    current_memory=$(cat /proc/$app_pid/status 2>/dev/null | grep VmRSS | awk '{print $2/1024}' || echo "0")
                fi
                
                # Get CPU usage from the actual Node.js process
                local current_cpu=0
                if command -v top &> /dev/null; then
                    if [[ "$OSTYPE" == "darwin"* ]]; then
                        current_cpu=$(top -pid $app_pid -l 1 2>/dev/null | grep -E "^CPU" | awk '{print $3}' | sed 's/%//' || echo "0")
                    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
                        current_cpu=$(top -p $app_pid -bn1 2>/dev/null | grep -E "^%Cpu" | awk '{print $2}' || echo "0")
                    fi
                fi
                
                # Track peak memory for this iteration
                if (( $(echo "$current_memory > $iteration_memory" | bc -l) )); then
                    iteration_memory=$current_memory
                fi
                
                # Track global peak memory
                if (( $(echo "$current_memory > $max_memory" | bc -l) )); then
                    max_memory=$current_memory
                fi
                
                iteration_cpu=$(echo "$iteration_cpu + $current_cpu" | bc -l)
                cpu_samples=$((cpu_samples + 1))
                
                sleep 1
            else
                break
            fi
        done
        
        # Kill the process if still running
        kill $app_pid 2>/dev/null || true
        wait $app_pid 2>/dev/null || true
        
        local end_time=$(date +%s%N)
        local execution_time=$(( (end_time - start_time) / 1000000 ))
        
        # Calculate average CPU for this iteration
        local avg_cpu_iteration=0
        if [ $cpu_samples -gt 0 ]; then
            avg_cpu_iteration=$(echo "scale=2; $iteration_cpu / $cpu_samples" | bc -l)
        fi
        
        # Accumulate totals
        total_time=$((total_time + execution_time))
        total_memory=$(echo "$total_memory + $iteration_memory" | bc -l)
        total_cpu=$(echo "$total_cpu + $avg_cpu_iteration" | bc -l)
        
        echo -e "    -> Iteration ${iteration}: ${execution_time}ms, ${iteration_memory}MB, ${avg_cpu_iteration}% CPU"
    done
    
    # Calculate averages
    local avg_time=$((total_time / iterations))
    local avg_memory=$(echo "scale=2; $total_memory / $iterations" | bc -l)
    local avg_cpu=$(echo "scale=2; $total_cpu / $iterations" | bc -l)
    
    echo -e "    -> Average: ${avg_time}ms, ${avg_memory}MB, ${avg_cpu}% CPU (Peak: ${max_memory}MB)"
    
    # Store results (use peak memory for more realistic comparison)
    case "$id" in
        syntropy) 
            syntropy_time=$avg_time
            syntropy_memory=$max_memory
            syntropy_cpu=$avg_cpu
            ;;
        nologger) 
            nologger_time=$avg_time
            nologger_memory=$max_memory
            nologger_cpu=$avg_cpu
            ;;
        pino)     
            pino_time=$avg_time
            pino_memory=$max_memory
            pino_cpu=$avg_cpu
            ;;
    esac
    
    cd ..
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
    
    # First table: Basic metrics
    echo -e "${BLUE}📈 BASIC METRICS${NC}"
    printf "${BOLD}%-12s | %10s | %10s | %8s | %6s${NC}\n" "Logger" "Size(KB)" "Time(ms)" "Mem(MB)" "CPU%"
    printf -- '-%.0s' {1..55} && printf '\n'
    
    printf "%-12s | %10s | %10s | %8s | %6s\n" "No Logger" "$((nologger_size / 1024))" "$nologger_time" "$(printf "%.1f" $nologger_memory)" "$(printf "%.1f" $nologger_cpu)"
    printf "%-12s | %10s | %10s | %8s | %6s\n" "Pino" "$((pino_size / 1024))" "$pino_time" "$(printf "%.1f" $pino_memory)" "$(printf "%.1f" $pino_cpu)"
    printf "%-12s | %10s | %10s | %8s | %6s\n" "SyntropyLog" "$((syntropy_size / 1024))" "$syntropy_time" "$(printf "%.1f" $syntropy_memory)" "$(printf "%.1f" $syntropy_cpu)"
    
    echo
    echo -e "${BLUE}📊 COMPARISONS${NC}"
    
    # Calculate differences
    local syntropy_size_diff_vs_none=$((syntropy_size - nologger_size))
    local syntropy_size_diff_vs_pino=$((syntropy_size - pino_size))
    local syntropy_memory_diff_vs_none=$(echo "$syntropy_memory - $nologger_memory" | bc -l)
    local syntropy_memory_diff_vs_pino=$(echo "$syntropy_memory - $pino_memory" | bc -l)
    local syntropy_cpu_diff_vs_none=$(echo "$syntropy_cpu - $nologger_cpu" | bc -l)
    local syntropy_cpu_diff_vs_pino=$(echo "$syntropy_cpu - $pino_cpu" | bc -l)
    local syntropy_time_diff_vs_pino=$((syntropy_time - pino_time))
    
    local size_ratio="N/A"
    local time_ratio="N/A"
    local memory_ratio="N/A"
    local cpu_ratio="N/A"
    
    if [ "$pino_size" -gt 0 ]; then
        size_ratio=$(echo "scale=2; $syntropy_size / $pino_size" | bc 2>/dev/null || echo "N/A")
    fi
    
    if [ "$pino_time" -gt 0 ]; then
        time_ratio=$(echo "scale=2; $syntropy_time / $pino_time" | bc 2>/dev/null || echo "N/A")
    fi
    
    if [ "$(echo "$pino_memory > 0" | bc -l)" = "1" ]; then
        memory_ratio=$(echo "scale=2; $syntropy_memory / $pino_memory" | bc 2>/dev/null || echo "N/A")
    fi
    
    if [ "$(echo "$pino_cpu > 0" | bc -l)" = "1" ]; then
        cpu_ratio=$(echo "scale=2; $syntropy_cpu / $pino_cpu" | bc 2>/dev/null || echo "N/A")
    fi
    
    echo -e "  📦 Bundle Size:"
    echo -e "    • SyntropyLog vs No Logger: ${syntropy_size_diff_vs_none:+${syntropy_size_diff_vs_none}} bytes"
    echo -e "    • SyntropyLog vs Pino: ${syntropy_size_diff_vs_pino:+${syntropy_size_diff_vs_pino}} bytes (${size_ratio}x)"
    
    echo -e "  ⚡ Performance:"
    echo -e "    • SyntropyLog vs Pino: ${syntropy_time_diff_vs_pino:+${syntropy_time_diff_vs_pino}} ms (${time_ratio}x)"
    
    echo -e "  💾 Memory Usage:"
    echo -e "    • SyntropyLog vs No Logger: ${syntropy_memory_diff_vs_none:+${syntropy_memory_diff_vs_none}} MB"
    echo -e "    • SyntropyLog vs Pino: ${syntropy_memory_diff_vs_pino:+${syntropy_memory_diff_vs_pino}} MB (${memory_ratio}x)"
    
    echo -e "  🔥 CPU Usage:"
    echo -e "    • SyntropyLog vs No Logger: ${syntropy_cpu_diff_vs_none:+${syntropy_cpu_diff_vs_none}}%"
    echo -e "    • SyntropyLog vs Pino: ${syntropy_cpu_diff_vs_pino:+${syntropy_cpu_diff_vs_pino}}% (${cpu_ratio}x)"
    
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
    
    # Memory analysis
    if [ "$memory_ratio" != "N/A" ] && [ "$(echo "$memory_ratio < 1.3" | bc 2>/dev/null || echo "false")" = "1" ]; then
        echo "  • ✅ Memory usage vs Pino is reasonable"
    else
        echo "  • ⚠️  Memory usage vs Pino is higher than expected"
    fi
    
    # CPU analysis
    if [ "$cpu_ratio" != "N/A" ] && [ "$(echo "$cpu_ratio < 1.2" | bc 2>/dev/null || echo "false")" = "1" ]; then
        echo "  • ✅ CPU usage vs Pino is minimal"
    else
        echo "  • ⚠️  CPU usage vs Pino is noticeable"
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
    print_system_info
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
        run_benchmark "$id" "$display_name" "$path"
    done
    echo -e "${GREEN}✅ Performance benchmarks completed.${NC}"
    echo

    print_results
    
    echo -e "${GREEN}✅ Benchmark comparison completed!${NC}"
}

main
