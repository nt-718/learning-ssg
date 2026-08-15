---
id: "ch49"
number: 49
title: "第49章 Dependency Inversion"
summary: "アプリケーション中心の依存関係を作ります。"
---

# 第49章 Dependency Inversion

## 概要

アプリケーション中心の依存関係を作ります。

悪い構造：

```text
Domain
 ↓
SQLAlchemy
 ↓
PostgreSQL
```

良い構造：

```text
Infrastructure
      ↓
Application
      ↓
Domain
```

重要なのは、

> 外部技術が内側へ依存する

ことです。

Domainは、

- FastAPI
- Django
- SQLAlchemy
- PostgreSQL
- AWS

などを知る必要がありません。
