---
id: "ch16"
number: 16
title: "第16章 Facade"
summary: "複雑なサブシステムを簡単なAPIで包みます。"
---

# 第16章 Facade

## 概要

複雑なサブシステムを簡単なAPIで包みます。

```python
class OrderFacade:

    def place_order(self, user, product):
        inventory.reserve(product)
        payment.charge(user)
        shipping.schedule(product)
        mail.send_confirmation(user)
```

利用側：

```python
order.place_order(user, product)
```

で済みます。

Facadeの目的は、

> 内部の複雑性を外へ漏らさないこと

です。
