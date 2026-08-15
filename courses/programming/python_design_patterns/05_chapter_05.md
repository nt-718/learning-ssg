---
id: "ch05"
number: 5
title: "第5章 継承よりコンポジション"
summary: "GoFで非常に重要な原則があります。"
---

# 第5章 継承よりコンポジション

## 概要

GoFで非常に重要な原則があります。

> Favor object composition over class inheritance.

すなわち、

> クラス継承よりオブジェクト合成を優先する。

たとえば、

```python
class FlyingBird(Bird):
    ...
```

のように継承で能力を表現すると、

```text
Bird
├─ FlyingBird
├─ SwimmingBird
├─ FlyingSwimmingBird
...
```

と増殖しやすくなります。

そこで、

```python
class Bird:
    def __init__(self, fly_behavior):
        self.fly_behavior = fly_behavior
```

と振る舞いを注入します。

これはStrategyにもつながります。
