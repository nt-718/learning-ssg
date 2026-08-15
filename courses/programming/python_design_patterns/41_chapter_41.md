---
id: "ch41"
number: 41
title: "第41章 Lazy Evaluation"
summary: "必要になるまで計算しません。"
---

# 第41章 Lazy Evaluation

## 概要

必要になるまで計算しません。

```python
class User:

    @cached_property
    def profile(self):
        return expensive_load()
```

Proxy、Generator、Cacheとも密接に関係します。
