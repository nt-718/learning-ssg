---
id: "ch20"
number: 20
title: "第20章 Command"
summary: "処理をオブジェクトとして表現します。"
---

# 第20章 Command

## 概要

処理をオブジェクトとして表現します。

```python
class DeleteUserCommand:
    def __init__(self, service, user_id):
        self.service = service
        self.user_id = user_id

    def execute(self):
        self.service.delete(self.user_id)
```

メリット：

- キューへ入れられる
- ログへ保存できる
- Undoできる
- リトライできる

つまり、

> 「処理」をデータのように扱える

ことが重要です。
