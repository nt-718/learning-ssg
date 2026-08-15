---
id: "ch47"
number: 47
title: "第47章 Mapper"
summary: "異なるモデル間を変換します。"
---

# 第47章 Mapper

## 概要

異なるモデル間を変換します。

```text
Database Row
     ↓
Domain Model
     ↓
DTO
     ↓
JSON
```

例：

```python
def row_to_user(row):
    return User(
        id=row["id"],
        name=row["name"],
    )
```
