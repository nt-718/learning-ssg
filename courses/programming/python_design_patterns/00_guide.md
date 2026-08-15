---
id: "intro"
number: 0
title: "はじめに"
summary: "設計上の問題、責務の分割、変化の局所化を軸にデザインパターンを学ぶ"
---

# はじめに

## 本書の目的

デザインパターンを学ぶとき、最も避けたいのは、

> 「このコードはFactory Methodです」
>
> 「これはObserverです」

と名前だけを覚えることです。

デザインパターンの本質は、クラス図の形ではありません。

本質は、

> **繰り返し現れる設計上の問題に対して、どのように責務を分割し、どこに変化を閉じ込めるか**

という問題解決の知識です。

たとえば、次のコードを考えてください。

```python
def calculate_price(customer_type, price):
    if customer_type == "normal":
        return price
    elif customer_type == "premium":
        return price * 0.9
    elif customer_type == "vip":
        return price * 0.8
```

プログラムとしては問題なく動きます。

しかし今後、

- 学生割引
- 法人割引
- キャンペーン割引
- 会員ランク別割引
- 地域別割引

が増え続けたらどうでしょうか。

`if` が増え続け、価格計算という一つの関数が、多数のルールを知ることになります。

そこで「割引アルゴリズムそのものを交換可能にする」という発想が生まれます。

```python
from typing import Protocol

class Discount(Protocol):
    def apply(self, price: float) -> float:
        ...

class NormalDiscount:
    def apply(self, price: float) -> float:
        return price

class PremiumDiscount:
    def apply(self, price: float) -> float:
        return price * 0.9

class VipDiscount:
    def apply(self, price: float) -> float:
        return price * 0.8

def calculate_price(price: float, discount: Discount) -> float:
    return discount.apply(price)
```

これはStrategyパターンと呼ばれる考え方です。

しかし重要なのは、

> 「Strategyというクラス構造を覚えること」

ではありません。

重要なのは、

> **変化するアルゴリズムを、利用側から分離する**

という設計思想です。

本書では、このように

1. 何が問題なのか
2. 素朴な実装では何が起こるか
3. どの責務を分離すればよいか
4. デザインパターンではどう表現するか
5. Pythonならもっと簡潔に書けないか
6. いつ使うべきか
7. いつ使わないべきか

という順序で学習します。

## 本書の構成
#
