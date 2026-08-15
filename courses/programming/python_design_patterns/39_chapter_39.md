---
id: "ch39"
number: 39
title: "第39章 Null Object"
summary: "Noneチェックを繰り返す代わりに何もしないオブジェクトを使います。"
---

# 第39章 Null Object

## 概要

`None`チェックを繰り返す代わりに何もしないオブジェクトを使います。

悪い：

```python
if logger is not None:
    logger.log(message)
```

Null Object：

```python
class NullLogger:
    def log(self, message):
        pass
```

すると、

```python
logger.log(message)
```

だけで済みます。
