---
id: "ch50"
number: 50
title: "第50章 Domain Events"
summary: "たとえば注文が完了したとします。"
---

# 第50章 Domain Events

## 概要

たとえば注文が完了したとします。

直接、

```python
send_email()
update_points()
notify_warehouse()
send_analytics()
```

するとOrderServiceが巨大化します。

代わりに、

```python
OrderCompleted(order_id)
```

というイベントを発行します。

購読者：

```text
OrderCompleted
 ├─ SendEmail
 ├─ AddPoints
 ├─ NotifyWarehouse
 └─ Analytics
```

となります。
