<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 07: Logger Configuration 🎛️

> **Core Framework Feature** - Understanding how to configure SyntropyLog's logger with different levels, transports, and serializers.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's logger configuration:

- **Logger levels**: Configuring different log levels (fatal, error, warn, info, debug, trace)
- **Transports**: Console, JSON, and custom transports
- **Serializers**: Custom serializers for complex objects
- **Service configuration**: Setting up logger for different services

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Logger Configuration                         │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Log Levels  │ │ Transports  │ │ Serializers │ │ Service     │ │
│ │             │ │             │ │             │ │ Config      │ │
│ │             │ │             │ │             │ │             │ │
│ │ • fatal     │ │ • Console   │ │ • Custom    │ │ • Service   │ │
│ │ • error     │ │ • JSON      │ │   Objects   │ │   Name      │ │
│ │ • warn      │ │ • Pretty    │ │ • Complex   │ │ • Logger    │ │
│ │ • info      │ │ • Custom    │ │   Data      │ │   Name      │ │
│ │ • debug     │ │ • Multiple  │ │ • Timeout   │ │ • Timeout   │ │
│ │ • trace     │ │ • Conditional│ │ • Error     │ │ • Pretty    │ │
│ │ • silent    │ │ • Environment│ │   Handling  │ │   Print     │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Logger Levels:**
- **Level configuration**: Setting appropriate log levels
- **Level filtering**: Understanding which levels are logged
- **Environment-based levels**: Different levels for dev/prod
- **Level hierarchy**: Understanding level importance

### **Transports:**
- **Console transport**: Basic console output
- **JSON transport**: Structured logging for production
- **Pretty transport**: Human-readable for development
- **Custom transports**: Creating your own transport
- **Multiple transports**: Using different outputs simultaneously

### **Serializers:**
- **Custom serializers**: Serializing complex objects
- **Serializer timeout**: Preventing slow serializers
- **Error handling**: Handling serializer failures
- **Built-in serializers**: Using framework serializers

### **Service Configuration:**
- **Service name**: Identifying your service in logs
- **Logger name**: Custom logger instances
- **Timeout configuration**: Preventing blocking operations
- **Pretty print**: Development-friendly output

## 🚀 Implementation Plan

### **Phase 1: Basic Logger Configuration**
- [ ] Configure log levels
- [ ] Set up service name
- [ ] Basic console transport
- [ ] Environment-based configuration

### **Phase 2: Transport Configuration**
- [ ] Console transport (pretty vs JSON)
- [ ] Multiple transports
- [ ] Environment-based transport selection
- [ ] Custom transport example

### **Phase 3: Serializer Configuration**
- [ ] Custom object serializers
- [ ] Serializer timeout configuration
- [ ] Error handling in serializers
- [ ] Built-in serializer usage

### **Phase 4: Advanced Configuration**
- [ ] Multiple logger instances
- [ ] Conditional configuration
- [ ] Performance considerations
- [ ] Best practices

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Logger levels** configured correctly
- ✅ **Multiple transports** working together
- ✅ **Custom serializers** handling complex objects
- ✅ **Service configuration** properly set up

### **Learning Outcomes:**
- ✅ **How to configure logger** for different needs
- ✅ **Transport selection** strategies
- ✅ **Serializer patterns** for complex data
- ✅ **Service configuration** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of basic logging concepts
- Familiarity with examples 00-06 (basic setup through error handling)

## 📝 Notes for Implementation

- **Start simple**: Basic logger configuration first
- **Add complexity gradually**: One feature at a time
- **Focus on practical use**: Show real configuration scenarios
- **Document simple patterns**: Explain when to use what
- **Environment examples**: Show dev vs prod configurations

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's logger configuration with simple, practical examples. 