---
id: "ch11"
number: 11
title: "第11章 Singleton"
summary: "インスタンスを一つだけにします。"
---

# 第11章 Singleton

## 概要

インスタンスを一つだけにします。

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

しかしPythonではSingletonを多用すべきではありません。

なぜなら、

```text
Singleton
≈ Global State
```

になりやすいからです。

テストが難しくなります。

Pythonでは、

```python
# config.py

settings = Settings()
```

のようにmodule自体の一回ロードを利用するだけで十分なことも多いです。
