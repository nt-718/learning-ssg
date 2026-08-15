---
id: "ch55"
number: 55
title: "第55章 Hexagonal Architecture"
summary: "別名Ports and Adapters。"
---

# 第55章 Hexagonal Architecture

## 概要

別名Ports and Adapters。

中心：

```text
         Web
          ↓
       Adapter
          ↓
Database → Port ← External API
          ↓
       Domain
```

正確には、

```text
External
   ↓
Adapter
   ↓
Port
   ↓
Application
```

という形で外界との境界を明確にします。

Repository interfaceなどがPortです。
