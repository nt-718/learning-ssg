---
id: "ch29"
number: 29
title: "第29章 Visitor"
summary: "Visitorは複雑ですが重要です。"
---

# 第29章 Visitor

## 概要

Visitorは複雑ですが重要です。

オブジェクト構造を変えずに、新しい操作を追加します。

たとえばAST：

```text
Add
├─ Number
└─ Multiply
   ├─ Number
   └─ Number
```

ここに、

- 評価
- 表示
- 型検査
- 最適化

などの操作を追加したい。

Visitor：

```python
class Evaluator:

    def visit_number(self, node):
        return node.value

    def visit_add(self, node):
        return (
            node.left.accept(self)
            + node.right.accept(self)
        )
```

CompilerやAST処理で重要になります。
