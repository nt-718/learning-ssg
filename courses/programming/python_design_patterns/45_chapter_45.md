---
id: "ch45"
number: 45
title: "第45章 Specification"
summary: "条件をオブジェクトとして表します。"
---

# 第45章 Specification

## 概要

条件をオブジェクトとして表します。

```python
class Adult:

    def is_satisfied_by(self, user):
        return user.age >= 18
```

組み合わせ：

```python
adult & japanese & active
```

などへ発展できます。

複雑な業務条件の再利用に有効です。
