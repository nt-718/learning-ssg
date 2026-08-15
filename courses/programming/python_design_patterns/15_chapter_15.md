---
id: "ch15"
number: 15
title: "第15章 Decorator"
summary: "Decoratorは、"
---

# 第15章 Decorator

Decoratorは、

> 元のオブジェクトを変更せず、機能を重ねる

パターンです。

```python
class LoggingRepository:
    def __init__(self, repository):
        self.repository = repository

    def save(self, obj):
        print("saving", obj)
        return self.repository.save(obj)
```

さらに、

```python
repository = LoggingRepository(
    CacheRepository(
        DatabaseRepository()
    )
)
```

のように積み重ねられます。

## Pythonの@decoratorとの違い

Pythonの、

```python
@cache
def get_user():
    ...
```

も根本思想は似ています。

ただしGoF Decoratorは、

> オブジェクトを包む

ことが中心です。

Python decoratorは、

> callableを包む

場合が多いです。
