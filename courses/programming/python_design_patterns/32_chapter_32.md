---
id: "ch32"
number: 32
title: "第32章 Python Decorator"
summary: "def log(func):"
---

# 第32章 Python Decorator

## 概要

```python
def log(func):

    def wrapper(*args, **kwargs):
        print("start")
        result = func(*args, **kwargs)
        print("end")
        return result

    return wrapper
```

利用：

```python
@log
def calculate():
    ...
```

用途：

- logging
- caching
- authorization
- retry
- metrics
- transaction
