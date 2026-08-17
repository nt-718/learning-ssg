---
id: "ch06"
number: 6
title: "第6章 シンプルな代数的データ型"
summary: "有限型について、"
---

# 第6章 シンプルな代数的データ型

## 1. 型を代数として読む

有限型について、

型に含まれる値の数を考える。

## Void

\[
0
\]

## Unit

\[
1
\]

## Bool

\[
1+1=2
\]

したがって、

\[
Bool\cong1+1
\]

## 2. Product type

```haskell
(A, B)
```

値の数は、

\[
|A|\times|B|
\]

したがって積。

## 3. Sum type

```haskell
Either A B
```

値の数は、

\[
|A|+|B|
\]

## 4. Maybe

```haskell
data Maybe a
    = Nothing
    | Just a
```

したがって、

\[
Maybe(A)=1+A
\]

## 5. リスト

```haskell
data List a
    = Nil
    | Cons a (List a)
```

形式的には、

\[
L=1+A\times L
\]

展開すると、

\[
L
=
1+A+A^2+A^3+\cdots
\]

## 6. なぜこの考え方が重要か

後半のF-代数では、

\[
L\cong1+A\times L
\]

という「型方程式」を本格的に扱う。

ここでは、

> データ型が代数式のように扱える

という感覚を持てればよい。
