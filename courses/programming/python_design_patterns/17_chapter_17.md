---
id: "ch17"
number: 17
title: "第17章 Flyweight"
summary: "大量のオブジェクトが同じ情報を共有するとき、その情報を共有します。"
---

# 第17章 Flyweight

## 概要

大量のオブジェクトが同じ情報を共有するとき、その情報を共有します。

たとえばゲームに100万本の木がある場合、

```text
木の種類
テクスチャ
モデル
```

を各木が持つ必要はありません。

共有：

```python
class TreeType:
    def __init__(self, texture):
        self.texture = texture
```

個別：

```python
class Tree:
    def __init__(self, x, y, tree_type):
        self.x = x
        self.y = y
        self.tree_type = tree_type
```

となります。
