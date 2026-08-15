---
id: "ch43"
number: 43
title: "第43章 Service Layer"
summary: "ビジネスユースケースをまとめるレイヤーです。"
---

# 第43章 Service Layer

## 概要

ビジネスユースケースをまとめるレイヤーです。

```python
class TransferService:

    def transfer(
        self,
        sender_id,
        receiver_id,
        amount,
    ):
        sender = self.accounts.get(sender_id)
        receiver = self.accounts.get(receiver_id)

        sender.withdraw(amount)
        receiver.deposit(amount)

        self.accounts.save(sender)
        self.accounts.save(receiver)
```

Controllerにビジネスロジックを書かないことが重要です。
