---
id: "ch30"
number: 30
title: "第30章 First-Class Function"
summary: "Pythonでは関数自体が値です。"
---

# 第30章 First-Class Function

## 概要

Pythonでは関数自体が値です。

```python
def greet():
    print("hello")

x = greet
x()
```

リストにも入れられます。

```python
handlers = [
    validate,
    normalize,
    save,
]
```

これにより、

- Strategy
- Command
- Observer

などをクラスなしで実装できます。
