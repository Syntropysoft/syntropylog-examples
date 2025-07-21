# Test All Examples Script

This script automates the testing of all SyntropyLog examples.

## Quick Start

```bash
# Test with default version (0.6.7)
./test-all-examples.sh

# Test with specific version
./test-all-examples.sh 0.6.8
```

## What it does

1. **Automatic Updates**: Updates `syntropylog` version in all `package.json` files
2. **Dependency Installation**: Runs `npm install` in each example
3. **Docker Compose**: Automatically starts and stops `docker-compose.yaml` if it exists
4. **Interactive Testing**: Runs each example and waits for your confirmation
5. **Visual Progress**: Shows progress and status of each example

## How it works

1. Lists all found examples
2. Asks for confirmation to continue
3. For each example:
   - Updates `package.json` with the new version
   - Installs dependencies with `npm install`
   - Starts Docker Compose if it exists
   - Runs `npm run dev`
   - Waits for you to review and confirm
   - Terminates the process and stops Docker Compose
   - Continues with the next example

## Features

- ✅ **Terminal colors** for better readability
- ✅ **macOS/Linux compatibility** with sed
- ✅ **Error handling** with `set -e`
- ✅ **Visual progress** with counter
- ✅ **Numerical sorting** of examples
- ✅ **Automatic cleanup** of processes and containers

## Example Usage

```bash
$ ./test-all-examples.sh 0.6.7

ℹ️  🚀 Starting test of all examples with syntropylog@0.6.7
ℹ️  📋 Examples found: 31
  - 00-setup-initialization
  - 01-hello-world
  - 02-basic-context
  - 03-context-ts
  - 10-basic-http-correlation
  - 11-custom-adapter
  - 12-http-redis-axios
  - 13-http-redis-fastify
  - 20-basic-kafka-correlation
  - 21-basic-rabbitmq-broker
  - 22-basic-nats-broker
  - 23-kafka-full-stack
  - 24-full-stack-nats
  ...

⚠️  Do you want to test all examples? (y/N)
y

📦 === TESTING EXAMPLE: 00-setup-initialization ===
🔧 Updating package.json in .
✅ Version updated to syntropylog@0.6.7
🔧 Installing dependencies...
✅ Dependencies installed
🔧 Running example...
⚠️  The example will run. Check the logs and press ENTER when ready to continue.
⚠️  Press Ctrl+C to stop the example when you're done reviewing it.

[Example running...]
Press ENTER when you've reviewed the example and want to continue...

✅ Example 00-setup-initialization completed

📦 === TESTING EXAMPLE: 01-hello-world ===
...
```

## Important Notes

- The script requires Docker to be installed and running
- Make sure you have write permissions in the example directories
- The script may take several minutes depending on the number of examples
- You can interrupt the script at any time with `Ctrl+C`

## Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for examples with docker-compose.yaml)
- Bash shell

## Troubleshooting

### Permission Denied
```bash
chmod +x test-all-examples.sh
```

### Docker Not Running
Make sure Docker Desktop is running before executing the script.

### Port Conflicts
If you get port conflicts, make sure no other examples are running on the same ports.

### Memory Issues
Some examples (especially with Docker) may require significant memory. Close other applications if needed. 