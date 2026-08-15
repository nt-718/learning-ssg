---
id: "ch36"
number: 36
title: "第36章 ProtocolとDuck Typing"
summary: "Pythonにおいて非常に重要な設計思想です。"
---

# 第36章 ProtocolとDuck Typing

## 概要

Pythonにおいて非常に重要な設計思想です。

Java的には、

```text
interface Repository
```

を明示します。

Pythonでは、

```python
class Repository(Protocol):
    def save(self, obj) -> None:
        ...
```

とできます。

利用：

```python
def register(
    repository: Repository,
):
    ...
```

しかし実装側は、

```python
class MySQLRepository:
    def save(self, obj):
        ...
```

だけでよく、Repositoryを継承する必要さえありません。

これをstructural typingと呼びます。
