---
id: "ch12"
number: 12
title: "第12章 Adapter"
summary: "自分のコードは、"
---

# 第12章 Adapter

## 問題

自分のコードは、

```python
mailer.send(message)
```

を期待している。

しかし外部ライブラリは、

```python
third_party.send_email(body)
```

というAPIだったとします。

Adapterを作ります。

```python
class MailAdapter:
    def __init__(self, third_party):
        self.third_party = third_party

    def send(self, message):
        self.third_party.send_email(message)
```

利用側から見ると、

```python
mailer.send(message)
```

で統一できます。

## Adapterの意味

Adapterとは、

> インターフェースの翻訳者

です。

外部APIへの依存を内部へ漏らさないために非常に重要です。
