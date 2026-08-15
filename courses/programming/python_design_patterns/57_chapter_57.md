---
id: "ch57"
number: 57
title: "第57章 CQRS"
summary: "Command Query Responsibility Segregation。"
---

# 第57章 CQRS

## 概要

Command Query Responsibility Segregation。

更新と参照を分けます。

従来：

```python
repository.save()
repository.find()
```

CQRS：

```text
Command Side
  ↓
Write Model

Query Side
  ↓
Read Model
```

複雑なシステムでは、

```text
Write DB
Read DB
```

まで分離することがあります。
