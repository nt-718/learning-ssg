---
id: "supplement04"
number: 68
title: "Strategyを選ぶ前に"
summary: "条件分岐と交換可能なアルゴリズムの違いを見極める"
---

# Strategyを選ぶ前に

## 概要

たとえば、

```python
if age >= 18:
    return "adult"

return "child"
```

この程度の分岐を、

```python
class AdultStrategy:
    ...
```

へ分割する必要はありません。

重要なのはコード量ではなく、

> **独立して変化する理由が存在するか**

です。
