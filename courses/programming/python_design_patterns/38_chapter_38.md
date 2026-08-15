---
id: "ch38"
number: 38
title: "第38章 Registry"
summary: "種類と実装の対応表を登録します。"
---

# 第38章 Registry

## 概要

種類と実装の対応表を登録します。

```python
registry = {}

def register(name):
    def decorator(cls):
        registry[name] = cls
        return cls

    return decorator
```

利用：

```python
@register("csv")
class CsvImporter:
    ...
```

取得：

```python
importer = registry["csv"]()
```

Plugin Architectureの基礎として重要です。
