---
id: "ch05"
number: 5
title: "第5章 積と余積"
summary: "本書前半の最重要章の一つである。"
---

# 第5章 積と余積

本書前半の最重要章の一つである。

ここから、

> **普遍性**

という圏論の核心が現れる。

## 1. 終対象

圏 \(\mathcal C\) で対象 \(1\) が終対象であるとは、

任意の対象 \(X\) から、

\[
X\to1
\]

という射がただ一つ存在すること。

## 型の圏

Unit 型

```haskell
()
```

が終対象。

任意の型 `a` から、

```haskell
toUnit :: a -> ()
toUnit _ = ()
```

という関数がただ一つ存在する。

## 2. 始対象

対象 \(0\) が始対象とは、

任意の \(X\) に、

\[
0\to X
\]

が一意に存在すること。

Void が対応する。

## 3. 積

集合論なら、

\[
A\times B
\]

はペアの集合。

しかし圏論では内部構造ではなく射で定義する。

積 \(A\times B\) は、

\[
\pi_1:A\times B\to A
\]

\[
\pi_2:A\times B\to B
\]

を持ち、

任意の

\[
f:X\to A
\]

\[
g:X\to B
\]

について唯一の

\[
h:X\to A\times B
\]

が存在して、

\[
\pi_1\circ h=f
\]

\[
\pi_2\circ h=g
\]

を満たす。

## 図

```text
            X
          /   \
         f     g
        /       \
       v         v
       A         B
        ^       ^
         \     /
        π1\   /π2
           A×B
```

より正確には、

```text
          X
          |
          | h
          v
        A × B
       /     \
     π1       π2
     v         v
     A         B
```

## 4. プログラムで見る

```haskell
f :: X -> A
g :: X -> B
```

なら、

```haskell
pair :: X -> (A, B)
pair x = (f x, g x)
```

この `pair` が一意である。

## 5. 余積

すべての射を逆向きにすると余積。

\[
A+B
\]

には、

\[
i_A:A\to A+B
\]

\[
i_B:B\to A+B
\]

がある。

任意の

\[
f:A\to X
\]

\[
g:B\to X
\]

から唯一の

\[
h:A+B\to X
\]

を作れる。

## Haskell

```haskell
Either A B
```

に対応する。

```haskell
Left  :: A -> Either A B
Right :: B -> Either A B
```

## 6. 積と余積の双対

| 積 | 余積 |
|---|---|
| product | coproduct |
| pair | Either |
| projection | injection |
| \(X\to A,B\) | \(A,B\to X\) |
| 情報をまとめる | 場合分けする |

## 7. 最大のポイント

積を、

> 「2つの値のペア」

だけで覚えない。

圏論的本質は、

> **二つの射をまとめる普遍的な方法**

である。
