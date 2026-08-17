---
id: "ch04"
number: 4
title: "第4章 クライスリ圏"
summary: "普通の関数なら、"
---

# 第4章 クライスリ圏

## 1. 問題設定

普通の関数なら、

```haskell
f :: A -> B
g :: B -> C
```

を合成できる。

しかし、

```haskell
f :: A -> Maybe B
g :: B -> Maybe C
```

はどうか。

普通の関数合成

```haskell
g . f
```

はできない。

なぜなら、

```text
f : A → Maybe B

g : B → Maybe C
```

であり、

```text
Maybe B ≠ B
```

だから。

## 2. 解決策

特別な合成演算を作る。

概念的に、

```haskell
composeK
  :: (A -> Maybe B)
  -> (B -> Maybe C)
  -> A
  -> Maybe C
```

## 実装例

```haskell
composeK f g x =
    case f x of
        Nothing -> Nothing
        Just y  -> g y
```

## 3. Kleisli arrow

通常の射を、

\[
A\to B
\]

とする代わりに、

\[
A\to M(B)
\]

を射と考える。

## 4. 重要な伏線

この章はモナドの予告編である。

モナドの最重要な意義は、

> **通常は合成できない効果付き計算を合成可能にする**

ことにある。
