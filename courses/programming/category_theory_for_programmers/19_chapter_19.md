---
id: "ch19"
number: 19
title: "第19章 自由/忘却随伴"
summary: "随伴を最も具体的に理解できる例。"
---

# 第19章 自由/忘却随伴

随伴を最も具体的に理解できる例。

## 1. Forgetful functor

モノイド、

\[
(M,\cdot,e)
\]

から、

演算と単位元を「忘れて」単なる集合Mを取り出す。

\[
U:Mon\to Set
\]

## 2. Free functor

集合Xから自由モノイドを作る。

\[
F:Set\to Mon
\]

プログラミングでは概念的に、

```haskell
F X = [X]
```

## 3. 随伴

\[
F\dashv U
\]

つまり、

\[
Hom_{Mon}(F(X),M)
\cong
Hom_{Set}(X,U(M))
\]

## 4. 日本語訳

Xの各要素をMへ写すだけで、

その関数を、

> Xから作られたすべての有限列

に対するモノイド準同型へ一意に拡張できる。

## 5. foldMap

Haskellならこの思想は、

```haskell
foldMap
  :: Monoid m
  => (a -> m)
  -> [a]
  -> m
```

に近い。
