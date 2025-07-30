import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json'; // Added for JSON imports
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  input: 'index_3.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs', // Changed from 'es' back to 'cjs'
    sourcemap: true
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    json(), // Added for JSON imports
    typescript({
      tsconfig: './tsconfig.json'
    }),
    visualizer({
      filename: 'bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  external: ['events', 'util', 'path', 'fs', 'os']
}); 