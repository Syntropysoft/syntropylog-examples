# Example 33: Tree Shaking - Minimal Import

This example demonstrates **optimal tree shaking** when you only need logging and context functionality.

## 🎯 What This Example Shows

- **Minimal imports**: Only importing what you need
- **Tree shaking enabled**: Unused modules are excluded from the bundle
- **Small bundle size**: Expected ~45KB
- **Best practices**: Recommended approach for production

## 📦 Bundle Analysis

**Expected bundle includes:**
- ✅ Logger functionality
- ✅ Context management  
- ✅ Console transport
- ✅ Basic utilities

**Expected bundle excludes:**
- ❌ HTTP clients
- ❌ Redis integration
- ❌ Message brokers
- ❌ Serializers
- ❌ Mock adapters
- ❌ Masking engine
- ❌ Sanitization engine

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build the example
npm run build

# Run the example
npm start

# Analyze bundle size
npm run build:analyze
```

## 📊 Expected Results

When you run this example, you should see:

```
🌳 Tree Shaking Demo - Minimal Import
📦 Only importing: syntropyLog (logger + context)
✅ Minimal tree shaking demo completed!
📊 Expected bundle includes:
   ✅ Logger functionality
   ✅ Context management
   ✅ Console transport
   ❌ HTTP clients (excluded)
   ❌ Redis (excluded)
   ❌ Message brokers (excluded)
   ❌ Serializers (excluded)
```

## 🔍 Bundle Analysis

After building, you can:

1. **Check bundle size**: Look at `dist/index.js`
2. **View detailed analysis**: Open `bundle-analysis.html` in your browser
3. **Compare with full import**: Run the comparison script

## 💡 Key Takeaways

- **Import only what you need**: `import { syntropyLog } from 'syntropylog'`
- **Configure only what you use**: Don't configure HTTP/Redis if you don't need them
- **Monitor bundle size**: Use tools like rollup-plugin-visualizer
- **Tree shaking works**: Unused modules are automatically excluded

## 🔗 Related Examples

- [Example 34: Tree Shaking - Full Import](../34-tree-shaking-full/) (Anti-pattern)
- [Example 01: Hello World](../01-hello-world/) (Basic logging)
- [Example 02: Basic Context](../02-basic-context/) (Context usage)

## 📚 Best Practices

```typescript
// ✅ DO THIS - Minimal import
import { syntropyLog } from 'syntropylog';

// ✅ DO THIS - Configure only what you need
await syntropyLog.init({
  logger: { /* ... */ },
  context: { /* ... */ }
  // No HTTP, Redis, or Brokers configured
});
```

This example demonstrates the **recommended approach** for using SyntropyLog in production applications where bundle size matters. 