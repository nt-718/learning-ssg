---
id: "ch26"
number: 26
title: "第26章 State"
summary: "状態ごとのifが増殖する問題を解決します。"
---

# 第26章 State

状態ごとの`if`が増殖する問題を解決します。

悪い例：

```python
if order.status == "new":
    ...
elif order.status == "paid":
    ...
elif order.status == "shipped":
    ...
```

State：

```python
class PaidState:
    def ship(self, order):
        order.state = ShippedState()
```

状態自身に振る舞いを持たせます。

## State Machineとして考える

```text
Created
  ↓ pay
Paid
  ↓ ship
Shipped
  ↓ deliver
Delivered
```

状態遷移が重要なドメイン、

- 採用選考
- 注文
- ワークフロー
- チケット管理
- 承認フロー

などで有効です。
