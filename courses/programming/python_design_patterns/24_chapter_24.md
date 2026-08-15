---
id: "ch24"
number: 24
title: "第24章 Memento"
summary: "オブジェクトの過去状態を保存します。"
---

# 第24章 Memento

## 概要

オブジェクトの過去状態を保存します。

```python
history = []

history.append(copy.deepcopy(document))
```

Undo機能などで利用します。

典型例：

```text
State 1
 ↓
State 2
 ↓
State 3
 ↓ Undo
State 2
```
