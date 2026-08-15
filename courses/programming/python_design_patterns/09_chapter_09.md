---
id: "ch09"
number: 9
title: "第9章 Builder"
summary: "大量の引数があるオブジェクトを考えます。"
---

# 第9章 Builder

大量の引数があるオブジェクトを考えます。

```python
User(
    name="Alice",
    age=30,
    country="Japan",
    language="ja",
    newsletter=True,
    admin=False,
    ...
)
```

Builderでは段階的に構築します。

```python
builder = UserBuilder()

user = (
    builder
    .name("Alice")
    .age(30)
    .newsletter(True)
    .build()
)
```

## ただしPythonでは？

Pythonには、

- keyword arguments
- dataclass
- default value

があります。

```python
@dataclass
class User:
    name: str
    age: int | None = None
    newsletter: bool = False
```

このためJavaほどBuilderが必要ではありません。

Builderが有効なのは、

> 「生成手順そのものが複雑」

な場合です。

たとえばSQL構築、

```python
query = (
    QueryBuilder()
    .select("name", "age")
    .from_("users")
    .where("age > 20")
    .order_by("name")
    .build()
)
```

などです。
