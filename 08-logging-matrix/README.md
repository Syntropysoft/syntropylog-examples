<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 08: Logging Matrix 🧮

> **Core Framework Feature** - Understanding SyntropyLog's logging matrix for smart context filtering based on log levels.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's logging matrix:

- **Context filtering**: Control what context is included in logs
- **Level-based filtering**: Different context for different log levels
- **Smart logging**: Minimal context for success, full context for errors
- **Cost optimization**: Reduce log ingestion costs with smart filtering

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Logging Matrix Strategy                      │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Success     │ │ Warning     │ │ Error       │ │ Debug       │ │
│ │ Logs        │ │ Logs        │ │ Logs        │ │ Logs        │ │
│ │             │ │             │ │             │ │             │ │
│ │ • Minimal   │ │ • Medium    │ │ • Full      │ │ • Detailed  │ │
│ │   Context   │ │   Context   │ │   Context   │ │   Context   │ │
│ │ • Low Cost  │ │ • Moderate  │ │ • Complete  │ │ • Complete  │ │
│ │ • Fast      │ │   Cost      │ │   Info      │ │   Info      │ │
│ │ • Clean     │ │ • Important │ │ • High Cost │ │ • High Cost │ │
│ │ • Cheap     │ │   Details   │ │ • Debugging │ │ • Debugging │ │
│ │ • Simple    │ │ • Alerts    │ │ • Analysis  │ │ • Analysis  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Context Filtering:**
- **Minimal context**: Only essential information for success logs
- **Medium context**: Important details for warning logs
- **Full context**: Complete information for error logs
- **Debug context**: Detailed information for debugging

### **Level-Based Filtering:**
- **Info level**: correlationId, serviceName
- **Warn level**: correlationId, userId, errorCode
- **Error level**: Full context with all fields
- **Debug level**: Complete context for debugging

### **Smart Logging:**
- **Cost optimization**: Reduce log ingestion costs
- **Performance**: Faster logging with minimal context
- **Debugging**: Rich context when needed
- **Compliance**: Full audit trail for errors

### **Configuration Patterns:**
- **Default patterns**: Common logging matrix configurations
- **Custom patterns**: Tailored to specific needs
- **Environment patterns**: Different strategies for dev/prod
- **Business patterns**: Context relevant to business logic

## 🚀 Implementation Plan

### **Phase 1: Basic Logging Matrix**
- [ ] Default logging matrix configuration
- [ ] Level-based context filtering
- [ ] Simple context fields
- [ ] Basic cost optimization

### **Phase 2: Advanced Filtering**
- [ ] Custom context fields
- [ ] Business-specific context
- [ ] Environment-based matrix
- [ ] Conditional context inclusion

### **Phase 3: Cost Optimization**
- [ ] Success log optimization
- [ ] Error log enrichment
- [ ] Performance impact analysis
- [ ] Cost comparison scenarios

### **Phase 4: Real-World Patterns**
- [ ] E-commerce patterns
- [ ] API patterns
- [ ] Microservice patterns
- [ ] Production patterns

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Logging matrix** configured correctly
- ✅ **Context filtering** working by level
- ✅ **Cost optimization** strategies implemented
- ✅ **Smart logging** patterns demonstrated

### **Learning Outcomes:**
- ✅ **How to configure logging matrix** for different needs
- ✅ **Context filtering** strategies
- ✅ **Cost optimization** techniques
- ✅ **Smart logging** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of basic logging concepts
- Familiarity with examples 00-07 (basic setup through logger configuration)

## 📝 Notes for Implementation

- **Start simple**: Basic logging matrix first
- **Add complexity gradually**: One level at a time
- **Focus on cost optimization**: Show real cost savings
- **Document patterns**: Explain when to use what
- **Real-world examples**: Show practical use cases

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's logging matrix with simple, practical examples. 