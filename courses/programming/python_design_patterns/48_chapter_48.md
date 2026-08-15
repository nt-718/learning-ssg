---
id: "ch48"
number: 48
title: "第48章 Domain Model"
summary: "データとビジネスルールを一緒にします。"
---

# 第48章 Domain Model

## 概要

データとビジネスルールを一緒にします。

悪い例：

```python
class User:
    name: str
    age: int
```

ただのデータ袋です。

Rich Domain Model：

```python
class Account:

    def withdraw(self, amount):
        if amount <= 0:
            raise InvalidAmount()

        if self.balance < amount:
            raise InsufficientFunds()

        self.balance -= amount
```

ルールがDomain Model内部にあります。
