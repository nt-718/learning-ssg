---
id: "ch19"
number: 19
title: "第19章 Chain of Responsibility"
summary: "複数の処理候補を順番に試します。"
---

# 第19章 Chain of Responsibility

## 概要

複数の処理候補を順番に試します。

```python
class Handler:
    def __init__(self, next_handler=None):
        self.next = next_handler

    def handle(self, request):
        if self.can_handle(request):
            return self.process(request)

        if self.next:
            return self.next.handle(request)
```

例：

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Business Logic
```

Web Frameworkのmiddlewareは、この思想に近いものです。
