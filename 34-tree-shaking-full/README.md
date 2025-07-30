# Example 34: Tree Shaking - Full Import (Anti-pattern)

This example demonstrates what happens when you **import everything** instead of using tree shaking. This is **NOT recommended** for production.

## ⚠️ What This Example Shows

- **Full imports**: Importing everything (even unused modules)
- **Tree shaking disabled**: All modules included in bundle
- **Large bundle size**: Expected ~180KB (75% larger)
- **Anti-pattern**: What NOT to do in production

## 📦 Bundle Analysis

**Bundle includes everything:**
- ✅ Logger functionality
- ✅ Context management
- ✅ Console transport
- ❌ HTTP clients (included but unused)
- ❌ Redis integration (included but unused)
- ❌ Message brokers (included but unused)
- ❌ Serializers (included but unused)
- ❌ Mock adapters (included but unused)
- ❌ Masking engine (included but unused)
- ❌ Sanitization engine (included but unused)

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
🌳 Tree Shaking Demo - Full Import (Anti-pattern)
📦 Importing: Everything (even unused modules)
📦 Unused imports that will be included:
   - MaskingEngine: function
   - SanitizationEngine: function
   - Transport classes: function
   - Mock adapters: function
❌ Full import demo completed!
📊 Bundle will include everything:
   ✅ Logger functionality
   ✅ Context management
   ✅ Console transport
   ❌ HTTP clients (included but unused)
   ❌ Redis (included but unused)
   ❌ Message brokers (included but unused)
   ❌ Serializers (included but unused)
   ❌ Mock adapters (included but unused)
   ❌ Masking/Sanitization (included but unused)
   📈 Bundle size: ~75% larger than minimal
```

## 🔍 Bundle Analysis

After building, you can:

1. **Check bundle size**: Look at `dist/index.js` (should be ~180KB)
2. **View detailed analysis**: Open `bundle-analysis.html` in your browser
3. **Compare with minimal import**: Run the comparison script

## 💡 Key Takeaways

- **Don't import everything**: Avoid `import * from 'syntropylog'`
- **Bundle size matters**: 75% larger bundle for same functionality
- **Performance impact**: Slower load times, more memory usage
- **Tree shaking is important**: Use minimal imports instead

## 🔗 Related Examples

- [Example 33: Tree Shaking - Minimal Import](../33-tree-shaking-minimal/) (Recommended)
- [Example 01: Hello World](../01-hello-world/) (Basic logging)
- [Example 02: Basic Context](../02-basic-context/) (Context usage)

## 📚 Anti-patterns to Avoid

```typescript
// ❌ DON'T DO THIS - Full import
import { syntropyLog, SyntropyLog, MaskingEngine, SanitizationEngine } from 'syntropylog';
import { Transport, ConsoleTransport, MockBrokerAdapter } from 'syntropylog';

// ❌ DON'T DO THIS - Importing unused modules
await syntropyLog.init({
  logger: { /* ... */ },
  http: { /* ... */ },  // Not used
  redis: { /* ... */ }, // Not used
  brokers: { /* ... */ } // Not used
});
```

## 🎯 Comparison with Minimal Import

| Aspect | Minimal Import | Full Import |
|--------|----------------|-------------|
| Bundle Size | ~45KB | ~180KB |
| Performance | Fast | Slow |
| Memory Usage | Low | High |
| Tree Shaking | ✅ Enabled | ❌ Disabled |
| Production Ready | ✅ Yes | ❌ No |

## 📈 Performance Impact

- **Bundle size**: 75% larger
- **Load time**: Significantly slower
- **Memory usage**: Higher
- **Caching**: Less efficient
- **Network**: More bandwidth used

This example demonstrates what **NOT to do** in production. Always use minimal imports for optimal performance. 