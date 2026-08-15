---
id: "ch18"
number: 18
title: "第18章 Proxy"
summary: "本物のオブジェクトの代理を置きます。"
---

# 第18章 Proxy

## 概要

本物のオブジェクトの代理を置きます。

```python
class ImageProxy:
    def __init__(self, path):
        self.path = path
        self._image = None

    def display(self):
        if self._image is None:
            self._image = load_image(self.path)

        self._image.display()
```

これはLazy Loadingです。

Proxyには、

- Remote Proxy
- Virtual Proxy
- Protection Proxy
- Cache Proxy

などがあります。
