---
id: "ch23"
number: 23
title: "第23章 コモナド"
summary: "モナドの双対。"
---

# 第23章 コモナド

モナドの双対。

## 1. モナド

\[
\eta:
Id\Rightarrow T
\]

\[
\mu:T^2\Rightarrow T
\]

## 2. コモナド

矢印を反転。

\[
\varepsilon:
W\Rightarrow Id
\]

\[
\delta:
W\Rightarrow W^2
\]

## 3. Haskell的表現

```haskell
extract :: w a -> a
```

```haskell
duplicate :: w a -> w (w a)
```

## 4. モナドとの直観的対比

Monad：

> 値を計算文脈へ入れ、文脈付き計算を合成する。

Comonad：

> 文脈付き値から情報を取り出し、周囲の文脈を利用して計算する。

## 5. 例

- セルオートマトン
- ストリーム
- 周辺文脈を持つ計算

などで現れる。
