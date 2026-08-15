---
id: "ch40"
number: 40
title: "第40章 Sentinel"
summary: "None自体が有効値の場合に特殊値を作ります。"
---

# 第40章 Sentinel

## 概要

`None`自体が有効値の場合に特殊値を作ります。

```python
MISSING = object()
```

```python
def update(value=MISSING):

    if value is MISSING:
        ...
```

Pythonライブラリ設計で非常に便利です。
