---
id: "ch21"
number: 21
title: "第21章 Interpreter"
summary: "小さな言語や式をオブジェクト構造として表現します。"
---

# 第21章 Interpreter

## 概要

小さな言語や式をオブジェクト構造として表現します。

たとえば、

```text
age > 20 AND country == "Japan"
```

という検索条件。

```python
class And:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, obj):
        return (
            self.left.evaluate(obj)
            and self.right.evaluate(obj)
        )
```

ただし本格的な言語処理では、

- Parser
- Lexer
- AST

を利用するほうが一般的です。
