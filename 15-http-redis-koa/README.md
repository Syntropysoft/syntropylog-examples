<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 15: HTTP + Redis with Koa 🌊

> **Basic Skeleton** - Basic Koa HTTP server with Redis caching, without context or correlationId (skeleton implementation).

## 🎯 What You'll Learn

This example demonstrates basic Koa integration with SyntropyLog:

- **Koa server setup**: Basic Koa application with router
- **HTTP endpoints**: Product API with GET and POST routes
- **Redis caching**: Basic caching without context
- **Error handling**: Standard error handling patterns
- **Skeleton structure**: Foundation for future context implementation

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Koa           │    │  ProductData     │    │     Redis       │
│   Server        │◄──►│  Service         │◄──►│     Cache       │
│                 │    │                  │    │                 │
│ • HTTP Routes   │    │ • Business Logic │    │ • Product Cache │
│ • Request/Resp  │    │ • Cache Logic    │    │ • TTL: 30s      │
│ • Validation    │    │ • DB Simulation  │    │ • Auto Cleanup  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Note**: This is a basic skeleton without context propagation or correlationId.

## 🎯 Learning Objectives

### **Basic Koa Setup:**
- **Koa application**: Basic Koa server with router
- **Middleware setup**: Body parser and router middleware
- **Route handling**: HTTP endpoints for products
- **Error handling**: Standard error responses

### **Redis Integration:**
- **Basic caching**: Product caching without context
- **Cache operations**: GET and SET operations
- **TTL management**: 30-second cache expiration
- **Error handling**: Redis error handling

### **SyntropyLog Integration:**
- **Logger setup**: Basic logging without context
- **Redis client**: SyntropyLog Redis client
- **Error logging**: Standard error logging
- **Service structure**: Foundation for future enhancements

## 🚀 Implementation Plan

### **Phase 1: Basic Skeleton ✅ COMPLETE**
- [x] Koa application setup
- [x] SyntropyLog configuration
- [x] Basic routes and handlers
- [x] Logger integration

### **Phase 2: Context Integration 🚧 PLANNED**
- [ ] Context middleware implementation
- [ ] Correlation ID propagation
- [ ] Request context injection
- [ ] Context-aware logging

### **Phase 3: Advanced Features 🚧 PLANNED**
- [ ] Custom middleware
- [ ] Performance optimization
- [ ] Health checks
- [ ] Metrics collection

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Koa application** with SyntropyLog integration
- ✅ **HTTP correlation** across Koa middleware
- ✅ **Redis caching** with performance monitoring
- ✅ **Context integration** with SyntropyLog

### **Learning Outcomes:**
- ✅ **How to integrate SyntropyLog** with Koa
- ✅ **HTTP correlation** in Koa applications
- ✅ **Redis caching** strategies with monitoring
- ✅ **Koa best practices** with observability

## 🔧 Prerequisites

- Node.js 18+
- Understanding of Koa framework
- Familiarity with examples 10-13 (HTTP + Redis basics)

## 📝 Notes for Implementation

- **Start with basic Koa**: Simple routes and handlers
- **Add middleware gradually**: Step-by-step middleware integration
- **Focus on context**: Koa ctx integration with SyntropyLog
- **Include caching examples**: Real-world caching scenarios
- **Document middleware patterns**: Best practices for Koa

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog integration with Koa for building lightweight observable HTTP APIs with Redis caching. 