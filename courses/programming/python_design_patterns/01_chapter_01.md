---
id: "ch01"
number: 1
title: "第1章 デザインパターンとは何か"
summary: "デザインパターンとは、"
---

# 第1章 デザインパターンとは何か

## 1.1 パターンとは「コード」ではない

デザインパターンとは、

> ソフトウェア設計で繰り返し発生する問題に対する、再利用可能な設計上の考え方

です。

重要なのは「設計」であって、特定のコードではありません。

同じObserverパターンでも、

```python
class Observer:
    ...
```

とクラスとして実装することもあれば、

```python
callbacks = []

def subscribe(callback):
    callbacks.append(callback)
```

のように関数だけで実装することもあります。

Pythonでは後者のほうが自然な場合も珍しくありません。
