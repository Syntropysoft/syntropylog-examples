<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 16: Data Masking 🔒

> **Core Framework Feature** - Understanding SyntropyLog's data masking system for protecting sensitive information in logs.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's data masking:

- **Sensitive fields**: Identifying and masking sensitive data
- **Regex patterns**: Using regular expressions for complex masking
- **Custom masks**: Creating custom masking strategies
- **Security compliance**: Ensuring logs meet security requirements

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Masking Strategy                       │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Sensitive   │ │ Regex       │ │ Custom      │ │ Security    │ │
│ │ Fields      │ │ Patterns    │ │ Masks       │ │ Compliance  │ │
│ │             │ │             │ │             │ │             │ │
│ │ • password  │ │ • Email     │ │ • Custom    │ │ • GDPR      │ │
│ │ • creditCard│ │ • Phone     │ │   Functions │ │ • PCI DSS   │ │
│ │ • ssn       │ │ • Credit    │ │ • Business  │ │ • HIPAA     │ │
│ │ • apiKey    │ │   Card      │ │   Logic     │ │ • SOX       │ │
│ │ • token     │ │ • SSN       │ │ • Conditional│ │ • Internal  │ │
│ │ • secret    │ │ • Custom    │ │ • Contextual│ │ • Audit     │ │
│ │ • private   │ │ • Complex   │ │ • Adaptive  │ │ • Monitoring│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Sensitive Fields:**
- **Field identification**: Identifying sensitive data fields
- **Built-in fields**: Using framework's built-in sensitive fields
- **Custom fields**: Adding custom sensitive fields
- **Field patterns**: Understanding field naming patterns

### **Regex Patterns:**
- **Email masking**: Masking email addresses
- **Phone masking**: Masking phone numbers
- **Credit card masking**: Masking credit card numbers
- **SSN masking**: Masking social security numbers
- **Custom patterns**: Creating custom regex patterns

### **Custom Masks:**
- **Custom functions**: Creating custom masking functions
- **Business logic**: Implementing business-specific masking
- **Conditional masking**: Masking based on conditions
- **Contextual masking**: Masking based on context

### **Security Compliance:**
- **GDPR compliance**: European data protection
- **PCI DSS compliance**: Payment card industry
- **HIPAA compliance**: Healthcare data protection
- **SOX compliance**: Financial data protection
- **Internal policies**: Company-specific requirements

## 🚀 Implementation Plan

### **Phase 1: Basic Data Masking**
- [ ] Built-in sensitive fields
- [ ] Basic regex patterns
- [ ] Simple masking strategies
- [ ] Security compliance basics

### **Phase 2: Advanced Patterns**
- [ ] Complex regex patterns
- [ ] Custom masking functions
- [ ] Conditional masking
- [ ] Contextual masking

### **Phase 3: Compliance**
- [ ] GDPR compliance patterns
- [ ] PCI DSS compliance patterns
- [ ] HIPAA compliance patterns
- [ ] SOX compliance patterns

### **Phase 4: Real-World Patterns**
- [ ] E-commerce patterns
- [ ] Healthcare patterns
- [ ] Financial patterns
- [ ] Production patterns

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Sensitive fields** masked correctly
- ✅ **Regex patterns** working properly
- ✅ **Custom masks** functioning as expected
- ✅ **Security compliance** requirements met

### **Learning Outcomes:**
- ✅ **How to configure masking** for different needs
- ✅ **Pattern selection** strategies
- ✅ **Compliance patterns** for different industries
- ✅ **Data masking** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of data security concepts
- Familiarity with examples 00-15 (basic setup through message brokers)

## 📝 Notes for Implementation

- **Start simple**: Basic sensitive fields first
- **Add complexity gradually**: One pattern at a time
- **Focus on security**: Show real security scenarios
- **Document compliance**: Explain compliance requirements
- **Real-world examples**: Show practical use cases

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's data masking with simple, practical examples. 