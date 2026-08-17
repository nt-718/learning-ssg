---
id: "supplement04"
number: 35
title: "学習用総合演習"
summary: "15の総合問題と4つのHaskell実践課題で理解を確かめる"
---

# 学習用総合演習

## 問1

圏の公理を説明せよ。

## 解答

対象と射があり、

合成、

\[
g\circ f
\]

が定義され、

結合律、

\[
h\circ(g\circ f)
=
(h\circ g)\circ f
\]

を満たす。

また各対象に恒等射があり、

\[
f\circ id=f
\]

\[
id\circ f=f
\]

## 問2

積を内部構造を使わず定義せよ。

## 解答

対象Pと、

\[
\pi_1:P\to A
\]

\[
\pi_2:P\to B
\]

について、

任意の、

\[
f:X\to A
\]

\[
g:X\to B
\]

に対し唯一の、

\[
h:X\to P
\]

が存在し、

\[
\pi_1h=f
\]

\[
\pi_2h=g
\]

となるとき、Pが積。

## 問3

Functor lawを述べよ。

## 解答

\[
F(id)=id
\]

\[
F(g\circ f)
=
F(g)\circ F(f)
\]

## 問4

自然変換のnaturality conditionを書け。

## 解答

\[
G(f)\circ\alpha_A
=
\alpha_B\circ F(f)
\]

## 問5

米田の補題を書け。

## 解答

\[
Nat(Hom(A,-),F)
\cong
F(A)
\]

## 問6

左辺から右辺を作るには何を使うか。

## 解答

恒等射、

\[
id_A
\]

を使い、

\[
\alpha_A(id_A)
\]

を取る。

## 問7

随伴の定義を書け。

## 解答

\[
F\dashv G
\]

とは、

\[
Hom_{\mathcal D}(F(A),B)
\cong
Hom_{\mathcal C}(A,G(B))
\]

がA,Bについて自然に成立すること。

## 問8

自由モノイド随伴を説明せよ。

## 解答

集合Xから自由モノイドF(X)を作る関手Fと、

モノイドから underlying set を取り出すUについて、

\[
F\dashv U
\]

であり、

\[
Hom_{Mon}(F(X),M)
\cong
Hom_{Set}(X,U(M))
\]

が成立する。

## 問9

Kleisli arrowとは何か。

## 解答

Monad Mについて、

\[
A\to M(B)
\]

という形の射。

## 問10

Monad lawsと圏の公理にはどんな類似があるか。

## 解答

どちらも、

- 結合律
- 単位元

を持つ。

MonadではKleisli compositionが圏の射合成になる。

## 問11

Monadの圏論的定義を書け。

## 解答

自己関手、

\[
T:\mathcal C\to\mathcal C
\]

と自然変換、

\[
\eta:Id\Rightarrow T
\]

\[
\mu:T^2\Rightarrow T
\]

でモナド則を満たすもの。

## 問12

F-algebraを定義せよ。

## 解答

関手Fに対し、

対象Aと、

\[
\alpha:F(A)\to A
\]

からなる構造。

## 問13

リストのbase functorを書け。

## 解答

要素型Xを固定すると、

\[
F(R)=1+X\times R
\]

## 問14

foldがF-algebraとどう関係するか。

## 解答

初代数から任意のF-algebraへの一意な準同型がcatamorphismであり、

プログラムではfoldに対応する。

## 問15

Kan extensionを一言で説明せよ。

## 解答

> 関手を別の圏へ普遍的な方法で延長する構成。

## 実践課題1　Maybe pipeline

次の関数を作る。

```haskell
parseInt
  :: String
  -> Maybe Int

nonZero
  :: Int
  -> Maybe Int

inverse
  :: Int
  -> Maybe Double
```

これを、

```haskell
parseInt
>=> nonZero
>=> inverse
```

で合成する。

目的：

> Kleisli compositionを身体で理解する。

## 実践課題2　自然変換

次を実装する。

```haskell
listToMaybe
  :: [a]
  -> Maybe a
```

そして、

```haskell
map f
```

と、

```haskell
fmap f
```

を使い、

```text
listToMaybe (map f xs)
```

と、

```text
fmap f (listToMaybe xs)
```

が一致することを確かめる。

これはnaturality squareの具体例。

## 実践課題3　Yoneda

次を実装する。

```haskell
toYoneda
  :: Functor f
  => f a
  -> (forall x. (a -> x) -> f x)
```

および、

```haskell
fromYoneda
  :: (forall x. (a -> x) -> f x)
  -> f a
```

そして、

```haskell
fromYoneda . toYoneda
```

が実質的に `id` になることを確認する。

## 実践課題4　fold

独自Listを定義する。

```haskell
data List a
    = Nil
    | Cons a (List a)
```

次をfoldだけで書く。

- sum
- product
- length
- map
- filter

目的：

> 再帰パターンと代数を分離する。
