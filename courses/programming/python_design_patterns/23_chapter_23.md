---
id: "ch23"
number: 23
title: "第23章 Mediator"
summary: "オブジェクト同士が直接通信すると、"
---

# 第23章 Mediator

## 概要

オブジェクト同士が直接通信すると、

```text
A ↔ B
A ↔ C
A ↔ D
B ↔ C
B ↔ D
...
```

と依存関係が爆発します。

Mediatorを置いて、

```text
     Mediator
    ↗   ↑   ↖
   A    B    C
```

とします。

```python
class ChatRoom:
    def send(self, sender, message):
        for user in self.users:
            if user != sender:
                user.receive(message)
```

各Userは他Userを知る必要がありません。
