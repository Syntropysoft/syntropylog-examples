# Example 17: Benchmark (SyntropyLog vs Pino vs Winston)

This example is **self-contained**: all benchmark code lives in this folder. If you clone the repo (monorepo with `syntropylog-examples` and `syntropyLog`), you can install dependencies and run the benchmarks from here.

## What the benchmark measures

- **Throughput**: console.log (baseline), SyntropyLog, Pino, Winston (JSON and complex object).
- **MaskingEngine**: masking time on a complex object.
- **Fluent API**: `withRetention` with complex JSON.
- **Memory**: heap usage per operation (use `--expose-gc` for stable results).

## How to run it

From this folder:

```bash
# Install dependencies (includes syntropylog from the monorepo)
npm install

# Throughput and comparisons
npm run bench

# Include memory measurement (requires Node with --expose-gc)
npm run bench:memory
```

The `syntropylog` dependency points to `file:../../syntropyLog`, so the repo must have the library at that path (typical monorepo layout). If you only have the examples repo, you can change `package.json` to use `"syntropylog": "latest"` (or a published version) and run the same commands.

## Rust addon

The benchmark reports whether the SyntropyLog **native Rust addon** is in use. In this example setup (monorepo or local link) the addon may not appear as available. We’ll verify it once the latest version is published to npm.

## Dependencies

- **mitata**: performance measurements
- **syntropylog**, **pino**, **winston**: loggers being compared
- **tsx**: run TypeScript
- **cross-env**: cross-platform env vars for `bench:memory`
