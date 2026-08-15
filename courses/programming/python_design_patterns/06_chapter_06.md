---
id: "ch06"
number: 6
title: "第6章 Pythonにおける抽象化"
summary: "PythonではJavaのように、必ずinterfaceを定義する必要はありません。"
---

# 第6章 Pythonにおける抽象化

PythonではJavaのように、必ずinterfaceを定義する必要はありません。

## Duck Typing

Pythonでは、

> 同じ操作ができれば同じものとして扱う

という考え方が一般的です。

```python
def save(repository, user):
    repository.save(user)
```

`repository`が何クラスなのかは問いません。

`save()`があれば動きます。

## Protocol

静的型チェックも利用したいなら、

```python
from typing import Protocol

class Repository(Protocol):
    def save(self, obj) -> None:
        ...
```

と書けます。

Pythonのデザインパターンでは非常に重要な道具です。
