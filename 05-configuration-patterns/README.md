<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 05: Configuration Patterns ⚙️

> **Core Framework Feature** - Understanding different ways to configure SyntropyLog for various use cases and environments.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's configuration flexibility:

- **Configuration patterns**: Environment-based, feature-based, modular
- **Simple configuration**: Different ways to configure SyntropyLog
- **Environment strategies**: Development vs Production vs Testing
- **Best practices**: Simple and maintainable configuration

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Patterns                       │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Environment │ │ Feature     │ │ Modular     │ │ Dynamic     │ │
│ │ Based       │ │ Based       │ │ Config      │ │ Config      │ │
│ │             │ │             │ │             │ │             │ │
│ │ • dev       │ │ • logging   │ │ • logger    │ │ • Hot reload│ │
│ │ • prod      │ │ • http      │ │ • http      │ │ • Runtime   │ │
│ │ • test      │ │ • redis     │ │ • redis     │ │ • API       │ │
│ │ • staging   │ │ • brokers   │ │ • brokers   │ │ • File      │ │
│ │ • ci/cd     │ │ • masking   │ │ • masking   │ │ • Database  │ │
│ │ • docker    │ │ • context   │ │ • context   │ │ • Remote    │ │
│ │ • k8s       │ │ • doctor    │ │ • doctor    │ │ • Secrets   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Environment-Based Configuration:**
- **Development**: Verbose logging, local services
- **Production**: Minimal logging, production services
- **Testing**: Mock services, structured logging
- **Staging**: Production-like with debugging

### **Feature-Based Configuration:**
- **Logging only**: Minimal configuration
- **HTTP + Redis**: Common web app pattern
- **Message brokers**: Event-driven applications
- **Full stack**: Complete observability

### **Modular Configuration:**
- **Separate configs**: Logger, HTTP, Redis, Brokers
- **Composition**: Combine modules as needed
- **Reusability**: Share configs across projects
- **Maintainability**: Easy to update individual parts

### **Simple Configuration:**
- **Environment-based**: Different configs for dev/prod/test
- **Feature-based**: Configs for different features
- **Modular config**: Separate configs for different parts
- **Configuration composition**: Combine configs as needed

## 🚀 Implementation Plan

### **Phase 1: Environment Patterns**
- [ ] Development configuration
- [ ] Production configuration
- [ ] Testing configuration
- [ ] Environment detection

### **Phase 2: Feature Patterns**
- [ ] Logging-only configuration
- [ ] HTTP + Redis configuration
- [ ] Message broker configuration
- [ ] Full-stack configuration

### **Phase 3: Modular Patterns**
- [ ] Separate config modules
- [ ] Configuration composition
- [ ] Shared configuration
- [ ] Configuration inheritance

### **Phase 4: Configuration Composition**
- [ ] Combine different config patterns
- [ ] Environment-based selection
- [ ] Feature-based composition
- [ ] Simple validation

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Multiple configuration patterns** working
- ✅ **Environment-based** configuration switching
- ✅ **Modular configuration** composition
- ✅ **Simple configuration** strategies

### **Learning Outcomes:**
- ✅ **When to use which pattern** for different scenarios
- ✅ **How to structure configuration** for maintainability
- ✅ **Simple best practices** for configuration
- ✅ **Environment strategies** for configuration

## 🔧 Prerequisites

- Node.js 18+
- Understanding of basic configuration concepts
- Familiarity with examples 00-04 (basic setup and logging)

## 📝 Notes for Implementation

- **Start simple**: Basic environment patterns first
- **Add complexity gradually**: One pattern at a time
- **Include simple validation**: Show basic error handling
- **Document simple patterns**: Explain when to use what
- **Focus on practical use**: Show real configuration scenarios

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's configuration flexibility with simple, practical patterns. 