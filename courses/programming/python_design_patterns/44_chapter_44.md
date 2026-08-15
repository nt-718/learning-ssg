---
id: "ch44"
number: 44
title: "第44章 Unit of Work"
summary: "複数Repositoryを一つのtransactionとしてまとめます。"
---

# 第44章 Unit of Work

## 概要

複数Repositoryを一つのtransactionとしてまとめます。

```python
with uow:

    user = uow.users.get(user_id)

    order = Order(user)

    uow.orders.add(order)

    uow.commit()
```

失敗すればrollbackします。
