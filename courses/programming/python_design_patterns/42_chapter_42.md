---
id: "ch42"
number: 42
title: "第42章 Repository"
summary: "Domain ModelからDB操作を切り離します。"
---

# 第42章 Repository

## 概要

Domain ModelからDB操作を切り離します。

```python
class UserRepository(Protocol):

    def get(self, user_id: int) -> User:
        ...

    def save(self, user: User) -> None:
        ...
```

MySQL：

```python
class MySQLUserRepository:

    def get(self, user_id):
        ...

    def save(self, user):
        ...
```

Service：

```python
class UserService:

    def __init__(self, repository):
        self.repository = repository
```
