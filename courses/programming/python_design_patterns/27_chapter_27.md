---
id: "ch27"
number: 27
title: "第27章 Strategy"
summary: "最重要パターンの一つです。"
---

# 第27章 Strategy

最重要パターンの一つです。

> アルゴリズムを交換可能にする。

```python
class PricingStrategy(Protocol):
    def calculate(self, price):
        ...
```

```python
class NormalPricing:
    def calculate(self, price):
        return price

class PremiumPricing:
    def calculate(self, price):
        return price * 0.9
```

Context：

```python
class PriceCalculator:
    def __init__(self, strategy):
        self.strategy = strategy

    def calculate(self, price):
        return self.strategy.calculate(price)
```

## Pythonic Strategy

クラスすら不要な場合があります。

```python
def normal(price):
    return price

def premium(price):
    return price * 0.9
```

そして、

```python
def calculate(price, strategy):
    return strategy(price)
```

Pythonでは関数がfirst-class objectなので、こちらのほうが簡潔です。
