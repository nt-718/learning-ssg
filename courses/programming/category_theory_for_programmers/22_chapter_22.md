---
id: "ch22"
number: 22
title: "第22章 圏論から見たモナド"
summary: "ここでプログラミング上のMonadを圏論へ戻す。"
---

# 第22章 圏論から見たモナド

ここでプログラミング上のMonadを圏論へ戻す。

## 1. 自己関手

まず、

\[
T:\mathcal C\to\mathcal C
\]

というendofunctorがある。

## 2. Unit

\[
\eta:
Id
\Rightarrow
T
\]

各Aについて、

\[
\eta_A:A\to T(A)
\]

Haskellなら概念的に、

```haskell
return :: a -> m a
```

## 3. Multiplication

\[
\mu:
T\circ T
\Rightarrow
T
\]

各Aについて、

\[
\mu_A:T(T(A))\to T(A)
\]

## Haskell

```haskell
join
  :: Monad m
  => m (m a)
  -> m a
```

## 4. Maybeのjoin

```haskell
join Nothing         = Nothing
join (Just Nothing)  = Nothing
join (Just (Just x)) = Just x
```

## 5. Listのjoin

```haskell
join :: [[a]] -> [a]
```

リストのリストを平坦化する。

## 6. Monad lawの圏論版

\(\eta\) は単位元。

\(\mu\) は積。

\[
\mu\circ T\mu
=
\mu\circ\mu_T
\]

が結合律に相当する。

## 7. モノイドとの対応

モノイド：

\[
(M,m,e)
\]

モナド：

\[
(T,\mu,\eta)
\]

対応は、

```text
モノイド      モナド
-----------------------
要素の集合      自己関手
積             μ
単位元          η
```

## 8. 随伴からMonad

\[
F\dashv G
\]

なら、

\[
T=GF
\]

はモナドになる。

unitは随伴のunit。

multiplicationはcounitから構成できる。

ここに、

```text
随伴
 ↓
モナド
```

の本当の意味がある。
