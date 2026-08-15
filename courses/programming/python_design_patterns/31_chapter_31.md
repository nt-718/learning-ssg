---
id: "ch31"
number: 31
title: "第31章 Callable Object"
summary: "__call__を実装するとオブジェクトを関数のように扱えます。"
---

# 第31章 Callable Object

## 概要

`__call__`を実装するとオブジェクトを関数のように扱えます。

```python
class Retry:
    def __init__(self, times):
        self.times = times

    def __call__(self, func):
        ...
```

「状態を持つ関数」が欲しいとき便利です。
