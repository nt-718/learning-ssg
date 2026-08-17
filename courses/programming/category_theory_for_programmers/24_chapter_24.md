---
id: "ch24"
number: 24
title: "第24章 F-代数"
summary: "ここから後半の大きな難所。"
---

# 第24章 F-代数

ここから後半の大きな難所。

## 1. 再帰型を分解する

リスト：

```haskell
data List a
    = Nil
    | Cons a (List a)
```

一段だけを見ると、

\[
F(X)=1+A\times X
\]

## 2. F-代数

関手Fに対し、

対象Aと射、

\[
\alpha:F(A)\to A
\]

の組をF-代数と呼ぶ。

## 3. リストの一段を処理する

たとえばIntのリストを合計する。

一段分の処理は、

```text
Nil          → 0

Cons x rest  → x + rest
```

## 4. 初代数

あるF-代数、

\[
(\mu F,in)
\]

が初対象になるとき、

これをinitial algebraと呼ぶ。

## 5. Catamorphism

初代数から任意のF-代数への射は一意。

この一意な射がcatamorphism。

プログラミングでは、

> fold

に対応する。

## 6. foldr

```haskell
foldr
  :: (a -> b -> b)
  -> b
  -> [a]
  -> b
```

## 7. 例

```haskell
sum =
    foldr (+) 0
```

```haskell
product =
    foldr (*) 1
```

```haskell
length =
    foldr (\_ n -> n + 1) 0
```

## 8. なぜfoldが重要か

再帰を毎回手書きする代わりに、

> **データ構造の再帰パターン**

と、

> **各コンストラクタをどう解釈するか**

を分離できる。

## 9. F-代数の設計上の意味

「リストを走査する」という構造は共通で、

何を計算するかだけを差し替えられる。

これは構造と意味の分離である。
