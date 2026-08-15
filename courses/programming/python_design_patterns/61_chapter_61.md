---
id: "ch61"
number: 61
title: "第61章 アンチパターン"
summary: "何でも担当する巨大クラス。"
---

# 第61章 アンチパターン

## God Object

何でも担当する巨大クラス。

```python
class ApplicationManager:
    ...
```

が、

- DB
- Email
- Auth
- Payment
- Logging
- Validation
- Analytics

すべてを担当する状態です。

## Spaghetti Code

依存関係が複雑化して、

```text
A → B
↑ ↘ ↓
D ← C
```

変更影響を予測できない状態です。

## Shotgun Surgery

一つの機能変更のために、

```text
20ファイル変更
```

が必要になる状態。

責務の分散を疑います。

## Lava Flow

昔必要だったコードが、

> 「何に使われているか分からないから消せない」

状態です。

AIコーディングでも特に注意すべき問題です。

## Golden Hammer

覚えたパターンを何にでも使います。

Strategyを覚えた直後、

```text
全部Strategy
```

にしてしまうような状態です。
