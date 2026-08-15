---
id: "supplement06"
number: 70
title: "デザインパターンとテスト"
summary: "依存の分離とテスト容易性の関係を理解する"
---

# デザインパターンとテスト

## 概要

良い設計はテストしやすいことが多いです。

例：

```python
class UserService:

    def __init__(self, repository):
        self.repository = repository
```

テスト：

```python
class FakeRepository:

    def __init__(self):
        self.users = []

    def save(self, user):
        self.users.append(user)
```

```python
repo = FakeRepository()

service = UserService(repo)

service.register("Alice")

assert len(repo.users) == 1
```

Dependency InjectionとRepositoryによってDB不要でテストできます。
