---
id: "ch35"
number: 35
title: "第35章 Descriptor"
summary: "Pythonの高度な機構です。"
---

# 第35章 Descriptor

## 概要

Pythonの高度な機構です。

```python
class Positive:

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__[self.name]

    def __set__(self, instance, value):
        if value <= 0:
            raise ValueError()

        instance.__dict__[self.name] = value
```

利用：

```python
class Product:
    price = Positive()
```

`property`やORMのFieldなどの理解にもつながります。
