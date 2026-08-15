---
id: "ch08"
number: 8
title: "第8章 Abstract Factory"
summary: "Factory Methodが一種類の生成を扱うのに対して、Abstract Factoryは、"
---

# 第8章 Abstract Factory

## 概要

Factory Methodが一種類の生成を扱うのに対して、Abstract Factoryは、

> 関連するオブジェクト群をまとめて生成する

ために使います。

例：

```text
UIFactory
├─ WindowsFactory
│   ├─ WindowsButton
│   └─ WindowsDialog
│
└─ MacFactory
    ├─ MacButton
    └─ MacDialog
```

Python：

```python
class WindowsFactory:
    def create_button(self):
        return WindowsButton()

    def create_dialog(self):
        return WindowsDialog()
```

利用側：

```python
def render(factory):
    button = factory.create_button()
    dialog = factory.create_dialog()
```

利用側はWindowsかMacか知る必要がありません。
