---
id: "ch08"
number: 8
title: "第8章 関手性"
summary: "f:A\\to B"
---

# 第8章 関手性

## 1. 共変関手

\[
f:A\to B
\]

を、

\[
F(f):F(A)\to F(B)
\]

に写す。

矢印の向きを保存する。

## 2. 反変関手

矢印の向きを逆転する。

\[
f:A\to B
\]

から、

\[
F(f):F(B)\to F(A)
\]

## 3. なぜ反転するのか

関数入力について考える。

```haskell
f :: A -> B
```

と、

```haskell
g :: B -> R
```

があれば、

```haskell
g . f :: A -> R
```

を作れる。

つまり、

\[
A\to B
\]

を使って、

\[
(B\to R)\to(A\to R)
\]

という逆向き変換ができる。

## 4. 双関手

2つの圏から入力を取る関手。

\[
F:\mathcal C\times\mathcal D\to\mathcal E
\]

たとえば、

\[
(A,B)\mapsto A\times B
\]

## 5. 関数型の分散

関数型

\[
A\to B
\]

は、

- Aについて反変
- Bについて共変

となる。

この「入力反変・出力共変」は非常に重要。
