---
id: "ch13"
number: 13
title: "第13章 Bridge"
summary: "Bridgeでは、"
---

# 第13章 Bridge

## 概要

Bridgeでは、

> 抽象と実装を別々に変化させる

ことを目指します。

例：

```text
Notification
├─ Alert
└─ Reminder

Sender
├─ Email
├─ SMS
└─ Slack
```

継承だけなら、

```text
EmailAlert
SmsAlert
SlackAlert
EmailReminder
SmsReminder
SlackReminder
```

となります。

組み合わせ爆発です。

Bridgeなら、

```python
class Alert:
    def __init__(self, sender):
        self.sender = sender

    def send(self, message):
        self.sender.send(message)
```

として独立させます。
