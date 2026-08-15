---
id: "ch37"
number: 37
title: "第37章 Dependency Injection"
summary: "依存オブジェクトを内部生成しないで、外部から渡します。"
---

# 第37章 Dependency Injection

## 概要

依存オブジェクトを内部生成しないで、外部から渡します。

悪い：

```python
class UserService:

    def __init__(self):
        self.repo = MySQLRepository()
```

良い：

```python
class UserService:

    def __init__(self, repo):
        self.repo = repo
```

テスト：

```python
service = UserService(
    FakeRepository()
)
```

非常にテストしやすくなります。
