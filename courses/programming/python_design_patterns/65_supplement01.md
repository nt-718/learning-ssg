---
id: "supplement01"
number: 65
title: "パターン比較"
summary: "似ているパターンの意図と使い分け"
---

# パターン比較

## Strategy vs State

構造は非常に似ています。

### Strategy

利用側が、

> どのアルゴリズムを使うか

決めます。

```python
calculator.strategy = PremiumPricing()
```

### State

オブジェクト自身が、

> 現在の状態

によって振る舞いを変えます。

```python
order.pay()
# state automatically changes
```

## Factory vs Builder

Factory：

> どのオブジェクトを作るか

Builder：

> どのような手順で作るか

## Adapter vs Facade

Adapter：

> インターフェースを変換する。

Facade：

> 複雑なインターフェースを簡単にする。

## Decorator vs Proxy

どちらもラップします。

Decorator：

> 機能追加

Proxy：

> アクセス制御

が主目的です。

## Observer vs Mediator

Observer：

```text
1 → N
```

変更通知。

Mediator：

```text
N → 1 → N
```

相互通信の整理。

## Command vs Strategy

Strategy：

> 「どう処理するか」

Command：

> 「何を実行するか」

Commandは、

```text
Queue
Undo
Retry
Logging
```

などと相性がよいのが特徴です。
