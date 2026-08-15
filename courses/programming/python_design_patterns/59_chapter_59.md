---
id: "ch59"
number: 59
title: "第59章 パターンは組み合わせる"
summary: "実際のコードでは一つだけ使うことは少ないです。"
---

# 第59章 パターンは組み合わせる

## 概要

実際のコードでは一つだけ使うことは少ないです。

たとえば通知システム。

```text
Factory
 ↓
Notification生成

Strategy
 ↓
送信方法

Decorator
 ↓
Retry / Logging

Observer
 ↓
イベント通知

Adapter
 ↓
外部API接続
```

このように複数のパターンが協調します。
