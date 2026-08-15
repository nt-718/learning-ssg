---
id: "ch25"
number: 25
title: "第25章 Observer"
summary: "非常に重要なパターンです。"
---

# 第25章 Observer

非常に重要なパターンです。

> あるオブジェクトの変化を複数の購読者へ通知する。

```python
class EventBus:
    def __init__(self):
        self.listeners = {}

    def subscribe(self, event, callback):
        self.listeners.setdefault(event, []).append(callback)

    def publish(self, event, data):
        for callback in self.listeners.get(event, []):
            callback(data)
```

登録：

```python
bus.subscribe("user_created", send_welcome_mail)
bus.subscribe("user_created", create_profile)
```

発火：

```python
bus.publish("user_created", user)
```

## 重要な発展

Observer

↓

Publish/Subscribe

↓

Domain Events

↓

Event-Driven Architecture

へ発展します。
