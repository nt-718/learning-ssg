---
id: "supplement05"
number: 36
title: "3周学習法"
summary: "構造、コードと定義、数式の順に理解を深める学習計画"
---

# 3周学習法

この副読本と本編を次の順番で学ぶ。

## 第1周　構造だけ掴む

各章の、

- この章を学ぶ理由
- 直観
- 1分復習

だけ読む。

目標：

> 圏論の地図を作る。

この段階では証明や高度な数式を飛ばしてよい。

## 第2周　コードと定義を一致させる

たとえば、

### Product

\[
A\times B
\]

↓

```haskell
(a,b)
```

### Coproduct

\[
A+B
\]

↓

```haskell
Either a b
```

### Functor

\[
F(f)
\]

↓

```haskell
fmap f
```

### Natural transformation

\[
F\Rightarrow G
\]

↓

```haskell
forall a. F a -> G a
```

### Monad multiplication

\[
\mu:T^2\Rightarrow T
\]

↓

```haskell
join :: m (m a) -> m a
```

という対応を確認する。

## 第3周　数式中心に読む

最後に、

\[
Nat(Hom(A,-),F)
\cong
F(A)
\]

や、

\[
Hom(FA,B)
\cong
Hom(A,GB)
\]

などを見ただけで日本語に翻訳できるようにする。
