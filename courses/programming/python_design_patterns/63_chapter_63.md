---
id: "ch63"
number: 63
title: "第63章 ケーススタディ"
summary: "次のシステムを考えます。"
---

# 第63章 ケーススタディ

## ECサイトを設計する

次のシステムを考えます。

```text
ECサイト

User
Product
Cart
Order
Payment
Shipping
Notification
```

## Step 1 Domain Model

```python
class Order:

    def __init__(self, user, items):
        self.user = user
        self.items = items
        self.status = "created"

    def total(self):
        return sum(
            item.price * item.quantity
            for item in self.items
        )
```

## Step 2 Repository

```python
class OrderRepository(Protocol):

    def save(self, order):
        ...

    def get(self, order_id):
        ...
```

## Step 3 Payment Strategy

```python
class PaymentMethod(Protocol):

    def pay(self, amount):
        ...
```

```python
class CreditCardPayment:

    def pay(self, amount):
        ...
```

## Step 4 External API Adapter

```python
class StripePaymentAdapter:

    def __init__(self, stripe_client):
        self.client = stripe_client

    def pay(self, amount):
        self.client.create_charge(amount)
```

## Step 5 Service Layer

```python
class OrderService:

    def __init__(
        self,
        orders,
        payment,
        event_bus,
    ):
        self.orders = orders
        self.payment = payment
        self.event_bus = event_bus

    def place_order(self, order):

        amount = order.total()

        self.payment.pay(amount)

        order.mark_paid()

        self.orders.save(order)

        self.event_bus.publish(
            "order_paid",
            order,
        )
```

## Step 6 Observer

```python
event_bus.subscribe(
    "order_paid",
    send_confirmation_email,
)

event_bus.subscribe(
    "order_paid",
    reserve_inventory,
)

event_bus.subscribe(
    "order_paid",
    notify_shipping,
)
```

最終構造：

```text
                  Controller
                      │
                      ▼
                OrderService
                /     |      \
               /      |       \
              ▼       ▼        ▼
        Repository  Payment   EventBus
             ▲        ▲
             │        │
          Adapter   Adapter
             │        │
             ▼        ▼
             DB     Stripe
```

ここには、

- Strategy
- Adapter
- Repository
- Observer
- Dependency Injection
- Service Layer
- Dependency Inversion

が組み合わされています。
