---
id: "ch14"
number: 14
title: "第14章 Composite"
summary: "木構造を、単体と集合で同じように扱います。"
---

# 第14章 Composite

## 概要

木構造を、単体と集合で同じように扱います。

典型例：

```text
Folder
├─ File
├─ File
└─ Folder
   ├─ File
   └─ File
```

```python
class File:
    def size(self):
        return self._size

class Directory:
    def __init__(self, children):
        self.children = children

    def size(self):
        return sum(child.size() for child in self.children)
```

利用者は、

```python
node.size()
```

だけ使えばよく、

```text
Fileなのか
Directoryなのか
```

を意識しません。
