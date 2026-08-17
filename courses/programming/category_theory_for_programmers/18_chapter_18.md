---
id: "ch18"
number: 18
title: "第18章 随伴"
summary: "本書で最も重要な章の一つ。"
---

# 第18章 随伴

本書で最も重要な章の一つ。

ここを急いではいけない。

## 1. 随伴とは

関手、

\[
F:\mathcal C\to\mathcal D
\]

と、

\[
G:\mathcal D\to\mathcal C
\]

について、

\[
Hom_{\mathcal D}(F(A),B)
\cong
Hom_{\mathcal C}(A,G(B))
\]

がA,Bについて自然に成立するとき、

\[
F\dashv G
\]

と書く。

## 2. 日本語にする

左辺：

> F(A)からBへ射を作る方法

右辺：

> AからG(B)へ射を作る方法

が一対一対応する。

## 3. カリー化

\[
Hom(A\times B,C)
\cong
Hom(A,C^B)
\]

これは、

```haskell
(A,B) -> C
```

と、

```haskell
A -> B -> C
```

の対応。

## 4. 随伴は逆関数ではない

ここが非常に重要。

随伴は、

\[
F^{-1}=G
\]

ではない。

対象そのものが往復して元に戻る必要はない。

対応するのは、

> **Hom集合**

である。

## 5. Unit

随伴、

\[
F\dashv G
\]

から、

\[
\eta:
Id_{\mathcal C}
\Rightarrow
G F
\]

という自然変換が得られる。

各対象Aについて、

\[
\eta_A:A\to GF(A)
\]

## 6. Counit

同様に、

\[
\varepsilon:
FG
\Rightarrow
Id_{\mathcal D}
\]

つまり、

\[
\varepsilon_B:FG(B)\to B
\]

## 7. 三角恒等式

unitとcounitは勝手な自然変換ではない。

\[
F
\xrightarrow{F\eta}
FGF
\xrightarrow{\varepsilon F}
F
\]

が恒等変換になる。

同様にG側でも、

\[
G
\xrightarrow{\eta G}
GFG
\xrightarrow{G\varepsilon}
G
\]

が恒等変換。

## 8. 直観

随伴を、

> **異なる表現体系の間で最適な翻訳を提供する関係**

と考える。

## 9. なぜ重要なのか

多くの数学的構成は随伴として現れる。

さらに、

\[
F\dashv G
\]

から、

\[
GF
\]

というモナドが生まれる。

したがって、

```text
随伴
 ↓
モナド
```

という依存関係は必須。
