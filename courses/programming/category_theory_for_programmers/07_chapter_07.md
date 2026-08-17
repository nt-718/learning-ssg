---
id: "ch07"
number: 7
title: "第7章 関手"
summary: "ここから圏論の核心へ入る。"
---

# 第7章 関手

ここから圏論の核心へ入る。

## 1. 関手とは

関手

\[
F:\mathcal C\to\mathcal D
\]

は、

対象 \(A\) を、

\[
F(A)
\]

へ写し、

射

\[
f:A\to B
\]

を、

\[
F(f):F(A)\to F(B)
\]

へ写す。

## 2. しかし単なる写像ではない

次の2法則を守る。

## 恒等射保存

\[
F(id_A)=id_{F(A)}
\]

## 合成保存

\[
F(g\circ f)
=
F(g)\circ F(f)
\]

## 3. Functor = 構造保存

一番重要な理解は、

> **Functor は圏の合成構造を壊さない変換**

である。

## 4. Maybe

```haskell
fmap :: (a -> b) -> Maybe a -> Maybe b
```

実装：

```haskell
fmap f Nothing  = Nothing
fmap f (Just x) = Just (f x)
```

## 5. Functor law

```haskell
fmap id = id
```

および、

```haskell
fmap (g . f)
=
fmap g . fmap f
```

## 6. 図

```text
A -------f------> B
|                 |
F                 F
|                 |
v                 v
F(A) ----F(f)---> F(B)
```

## 7. 「コンテナ」は本質ではない

MaybeやListを見ると、

> Functor = コンテナ

と理解しやすい。

しかし、

```haskell
type Reader r a = r -> a
```

もFunctorになる。

したがって本質は、

> **A→B という射を F(A)→F(B) に持ち上げられる**

こと。
