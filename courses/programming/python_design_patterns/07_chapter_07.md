---
id: "ch07"
number: 7
title: "第7章 Factory Method"
summary: "生成するオブジェクトを条件分岐で決めているとします。"
---

# 第7章 Factory Method

## 問題

生成するオブジェクトを条件分岐で決めているとします。

```python
def create_notification(kind):
    if kind == "email":
        return EmailNotification()
    if kind == "sms":
        return SmsNotification()
```

種類が増えるほど変更箇所が増えます。

## 基本思想

> オブジェクト生成の決定を分離する。

```python
class NotificationFactory:
    @staticmethod
    def create(kind):
        if kind == "email":
            return EmailNotification()

        if kind == "sms":
            return SmsNotification()

        raise ValueError(kind)
```

利用側：

```python
notification = NotificationFactory.create("email")
notification.send()
```

## Pythonic Factory

Pythonでは辞書を使う方法も非常に有効です。

```python
FACTORIES = {
    "email": EmailNotification,
    "sms": SmsNotification,
}

def create_notification(kind):
    try:
        return FACTORIES[kind]()
    except KeyError:
        raise ValueError(f"Unknown notification: {kind}")
```

ここからRegistryパターンにも発展します。
