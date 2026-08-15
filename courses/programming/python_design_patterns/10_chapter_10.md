---
id: "ch10"
number: 10
title: "第10章 Prototype"
summary: "既存オブジェクトを複製して新しいオブジェクトを生成します。"
---

# 第10章 Prototype

## 概要

既存オブジェクトを複製して新しいオブジェクトを生成します。

Pythonでは標準ライブラリがあります。

```python
import copy

new_obj = copy.copy(obj)
```

深いコピー：

```python
new_obj = copy.deepcopy(obj)
```

PythonではPrototype専用クラスを作るより、

```python
copy.copy()
copy.deepcopy()
```

が自然です。
