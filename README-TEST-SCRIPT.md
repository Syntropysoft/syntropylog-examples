# Test All Examples Script

This script runs all SyntropyLog examples (00–17) in sequence.

## Quick Start

```bash
# Use version from versions.txt
./test-all-examples.sh

# Use a specific syntropylog version
./test-all-examples.sh 0.11.1

# Start from a given example index (e.g. 5 = 05-universal-context-patterns)
./test-all-examples.sh 0.11.1 5
```

## What it does

1. Lists all numbered example directories (00–17)
2. Asks for confirmation
3. For each example:
   - Updates `syntropylog` version in `package.json`
   - Removes `node_modules` and `package-lock.json`, then runs `npm install`
   - Starts Docker Compose if `docker-compose.yaml` exists
   - Runs `npm run dev` and waits for you to press ENTER
   - Stops the process and Docker Compose if used

## Prerequisites

- Node.js 18+
- Bash

## Notes

- Each example is run interactively; press ENTER to move to the next.
- Use `Ctrl+C` to cancel.
- Example 17 (`17-benchmark`) uses `npm run dev` which runs the benchmark (no long-lived server).
