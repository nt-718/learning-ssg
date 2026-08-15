---
id: "ch46"
number: 46
title: "第46章 DTO"
summary: "Data Transfer Object。"
---

# 第46章 DTO

## 概要

Data Transfer Object。

層をまたいでデータを運ぶためのオブジェクトです。

```python
@dataclass
class UserDTO:
    id: int
    name: str
    email: str
```

Domain Objectを直接APIへ露出させないために使います。
