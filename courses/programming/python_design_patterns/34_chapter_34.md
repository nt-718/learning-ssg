---
id: "ch34"
number: 34
title: "第34章 Generator"
summary: "Generatorは、"
---

# 第34章 Generator

## 概要

Generatorは、

> 全データを一度に作らず、必要になったときだけ生成する

仕組みです。

```python
def users():
    for row in database:
        yield User(row)
```

大量データ処理では重要です。

```text
List
→ 全件メモリ

Generator
→ 一件ずつ
```
