---
id: "ch33"
number: 33
title: "第33章 Context Manager"
summary: "with open(\"file.txt\") as f:"
---

# 第33章 Context Manager

## 概要

```python
with open("file.txt") as f:
    ...
```

これは、

> リソース取得と解放を安全にペアにする

パターンです。

自作：

```python
class Transaction:

    def __enter__(self):
        self.begin()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type:
            self.rollback()
        else:
            self.commit()
```
