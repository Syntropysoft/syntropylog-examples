<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 19: Doctor CLI - Configuration Validation 🩺

> **Core Framework Feature** - Understanding SyntropyLog's Doctor CLI for configuration validation and diagnostic rules.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's **actual** Doctor CLI capabilities:

- **Configuration validation**: Validating SyntropyLog configuration against schema
- **Diagnostic rules**: Using built-in and custom diagnostic rules
- **Rule management**: Creating custom rule manifests
- **Audit workflows**: Running comprehensive configuration audits

## 🏗️ What Actually Exists

### **✅ Available Commands:**
```bash
# Initialize configuration files
syntropylog init --rules          # Generate rule manifest
syntropylog init --audit          # Generate audit plan

# Validate single configuration
syntropylog doctor config.yaml    # Run diagnostics on config file

# Run comprehensive audit
syntropylog audit                 # Execute full audit plan
```

### **✅ Built-in Validation Rules:**
- **Logger Level**: Warns if logger level is too verbose for production
- **Transport Validation**: Errors if no logger transports are defined
- **Masking Rules**: Warns if no data masking rules are defined
- **Redis Sentinel**: Ensures Redis Sentinel instances have master name
- **Instance Names**: Errors if multiple Redis instances share same name

### **✅ Custom Rule System:**
- **Local manifests**: Create `syntropylog.doctor.ts` for custom rules
- **Rule disabling**: Disable specific rules via configuration
- **Error handling**: Robust error handling for rule execution

## 🚀 Implementation

### **Step 1: Create Configuration File**
```yaml
# config.yaml
logger:
  serviceName: 'my-app'
  level: 'debug'  # ⚠️ This will trigger a warning in production

redis:
  instances:
    - instanceName: 'cache'
      url: 'redis://localhost:6379'
    - instanceName: 'cache'  # ⚠️ This will trigger an error (duplicate name)
      url: 'redis://localhost:6380'

masking:
  rules: []  # ⚠️ This will trigger a warning (no masking rules)
```

### **Step 2: Run Doctor CLI**
```bash
# Basic validation
syntropylog doctor config.yaml

# Expected output:
# 🩺 Running syntropylog doctor on: config.yaml
# ✅ Config structure for "config.yaml" is valid.
# [WARN] Production Log Level - Logger level 'debug' is too verbose for production
# [ERROR] Duplicate Redis Instance Name - Multiple Redis instances share the name 'cache'
# [WARN] No Masking Rules - No data masking rules are defined
```

### **Step 3: Create Custom Rules**
```typescript
// syntropylog.doctor.ts
import { DiagnosticRule } from 'syntropylog';

export default [
  {
    id: 'custom-service-name',
    description: 'Ensures service name follows naming convention',
    check: (config) => {
      const serviceName = config.logger?.serviceName;
      if (serviceName && !serviceName.includes('-')) {
        return [{
          level: 'WARN',
          title: 'Service Naming Convention',
          message: `Service name '${serviceName}' should use kebab-case`,
          recommendation: 'Use format like "my-service" instead of "myService"'
        }];
      }
      return [];
    }
  }
];
```

### **Step 4: Run Audit**
```bash
# Create audit plan
syntropylog init --audit

# Run comprehensive audit
syntropylog audit
```

## 📊 Real Capabilities

### **✅ What Works:**
- **Schema validation** with detailed error messages
- **Built-in diagnostic rules** for common issues
- **Custom rule system** with TypeScript support
- **Rule disabling** via configuration
- **Audit workflows** across multiple files
- **Color-coded output** (ERROR/WARN/INFO)
- **Detailed recommendations** for fixes

### **🚧 What's NOT Available (Future):**
- Health checks (Redis, brokers, HTTP)
- Performance analysis
- Security scanning
- Log analysis tools
- Metrics collection
- Compliance checks

## 🎯 Learning Objectives

### **Configuration Validation:**
- ✅ **Schema validation**: Validating against SyntropyLog schema
- ✅ **Required fields**: Checking required configuration fields
- ✅ **Custom rules**: Creating and using custom diagnostic rules
- ✅ **Rule management**: Disabling and organizing rules

### **Diagnostic System:**
- ✅ **Built-in rules**: Using core diagnostic rules
- ✅ **Custom rules**: Creating application-specific rules
- ✅ **Rule execution**: Understanding rule execution flow
- ✅ **Error handling**: Managing rule execution errors

### **Audit Workflows:**
- ✅ **Single file validation**: Using `doctor` command
- ✅ **Multi-file audits**: Using `audit` command
- ✅ **Rule manifests**: Creating custom rule sets
- ✅ **Audit plans**: Organizing comprehensive audits

## 🔧 Prerequisites

- Node.js 18+
- Understanding of YAML configuration
- Familiarity with examples 00-18 (basic setup through custom transports)

## 📝 Implementation Notes

- **Start with built-in rules**: Use core rules first
- **Add custom rules gradually**: One rule at a time
- **Test rule execution**: Verify custom rules work correctly
- **Use audit workflows**: For comprehensive validation
- **Follow naming conventions**: For service names and instances

## 🚀 Quick Start

```bash
# 1. Create a configuration file
echo "logger: { serviceName: 'test-app', level: 'debug' }" > config.yaml

# 2. Run basic validation
syntropylog doctor config.yaml

# 3. Create custom rules
syntropylog init --rules

# 4. Add your custom validation logic
# Edit syntropylog.doctor.ts

# 5. Run with custom rules
syntropylog doctor config.yaml
```

---

**Status**: ✅ **WORKING** - This example demonstrates the actual Doctor CLI capabilities for configuration validation and diagnostic rules. 