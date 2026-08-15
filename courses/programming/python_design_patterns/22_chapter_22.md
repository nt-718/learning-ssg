---
id: "ch22"
number: 22
title: "第22章 Iterator"
summary: "PythonではIteratorが言語レベルに統合されています。"
---

# 第22章 Iterator

## 概要

PythonではIteratorが言語レベルに統合されています。

```python
for user in users:
    ...
```

内部では、

```python
iter(users)
next(iterator)
```

が利用されています。

自作：

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration

        value = self.current
        self.current -= 1
        return value
```

しかしPythonなら、

```python
def countdown(start):
    while start > 0:
        yield start
        start -= 1
```

のほうが自然です。

ここに、

> GoFパターンが言語機能に吸収される

典型例があります。
