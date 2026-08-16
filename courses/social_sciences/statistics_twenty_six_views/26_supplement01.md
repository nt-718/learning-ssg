---
id: "supplement01"
number: 26
title: "統計学の最重要公式"
summary: "期待値、分散、標準誤差、信頼区間、回帰、ベイズの公式集"
---

# 統計学の最重要公式

ここは何度も復習する。

## 期待値

\[
E[X]
\]

## 分散

\[
Var(X)
=
E[(X-E[X])^2]
\]

## 分散公式

\[
Var(X)
=
E[X^2]-E[X]^2
\]

## 共分散

\[
Cov(X,Y)
=
E[(X-E[X])(Y-E[Y])]
\]

## 和の分散

\[
Var(X+Y)
=
Var(X)+Var(Y)+2Cov(X,Y)
\]

## 標本平均

\[
\bar X
=
\frac1n\sum X_i
\]

## 標本平均の分散

\[
Var(\bar X)
=
\frac{\sigma^2}{n}
\]

## 標準誤差

\[
SE(\bar X)
=
\frac{\sigma}{\sqrt n}
\]

## z標準化

\[
Z
=
\frac{X-\mu}{\sigma}
\]

## 中心極限定理

\[
\frac{\bar X-\mu}{\sigma/\sqrt n}
\xrightarrow d
N(0,1)
\]

## 信頼区間

\[
\bar X
\pm
z_{\alpha/2}
\frac{\sigma}{\sqrt n}
\]

## t統計量

\[
T
=
\frac{\bar X-\mu}
{S/\sqrt n}
\]

## 相関

\[
\rho
=
\frac{Cov(X,Y)}
{\sigma_X\sigma_Y}
\]

## 回帰モデル

\[
Y
=
\beta_0+\beta_1X+\varepsilon
\]

## ベイズ

\[
P(A\mid B)
=
\frac{
P(B\mid A)P(A)
}{
P(B)
}
\]
