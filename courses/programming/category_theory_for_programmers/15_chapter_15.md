---
id: "ch15"
number: 15
title: "第15章 米田の補題"
summary: "圏論全体の中心定理の一つ。"
---

# 第15章 米田の補題

圏論全体の中心定理の一つ。

## 1. 式

\[
Nat(Hom(A,-),F)
\cong
F(A)
\]

## 2. 左辺を読む

\[
Hom(A,-)
\]

は、

> Aから各対象Xへの射すべて

を集める関手。

そこからFへの自然変換を考える。

## 3. 右辺

単なる、

\[
F(A)
\]

の要素。

## 4. 驚き

「すべてのXについて整合的な変換」を作るという巨大な情報が、

> **F(A) の値一つ**

だけで完全に決まる。

## 5. 証明の直観

\(x\in F(A)\) を一つ選ぶ。

任意の、

\[
f:A\to X
\]

について、

\[
F(f):F(A)\to F(X)
\]

がある。

したがって、

\[
F(f)(x)\in F(X)
\]

を得る。

これにより、

\[
\alpha_X(f)=F(f)(x)
\]

と定義できる。

## 6. 逆方向

自然変換、

\[
\alpha:Hom(A,-)\Rightarrow F
\]

があるとする。

特にA自身を見ると、

\[
\alpha_A:
Hom(A,A)\to F(A)
\]

恒等射、

\[
id_A\in Hom(A,A)
\]

を入力すれば、

\[
\alpha_A(id_A)\in F(A)
\]

が得られる。

## 7. Haskell版

概念的には、

```haskell
forall x. (a -> x) -> f x
```

と、

```haskell
f a
```

が同じ情報量を持つ。

## 8. なぜそうなるのか

```haskell
fa :: f a
```

があれば、

```haskell
toYoneda
  :: Functor f
  => f a
  -> ((a -> x) -> f x)

toYoneda fa k =
    fmap k fa
```

を作れる。

## 9. 逆

```haskell
fromYoneda y =
    y id
```

## 10. 米田の核心

> **対象は、その対象と他の対象との関係によって完全に特徴付けられる。**

## 11. 重要な誤解

米田は、

> 「Aの中身を完全に再構築する」

という素朴な主張ではない。

正確には、

> Hom関手を通した表現が圏論的情報を完全に保持する

という話。

## 12. 演習

次の型について考える。

```haskell
forall x. (Bool -> x) -> Maybe x
```

米田より、どの型と同等か。

### 解答

\[
Maybe\ Bool
\]

したがって、

```haskell
Maybe Bool
```
