---
id: "ch12"
number: 12
title: "第12章 極限と余極限"
summary: "積は、"
---

# 第12章 極限と余極限

## 1. 積を一般化する

積は、

```text
A    B
```

という二つの対象に対して、

```text
    X
   / \
  A   B
```

というconeを考え、

その中で普遍的なものを選ぶ構成だった。

## 2. 図式

圏 \(\mathcal J\) から圏 \(\mathcal C\) への関手、

\[
D:\mathcal J\to\mathcal C
\]

を図式と考える。

## 3. Cone

対象 \(N\) と、

図式の各対象への射を持ち、

図式の射と整合するもの。

## 4. Limit

すべてのconeから一意に射が入る普遍的cone。

## 5. 例

### 終対象

空図式のlimit。

### 積

離散的な2対象の図式のlimit。

### Equalizer

平行射、

\[
A\rightrightarrows B
\]

のlimit。

### Pullback

```text
A → C ← B
```

のlimit。

## 6. Colimit

すべての射を逆転したもの。

- 始対象
- 余積
- coequalizer
- pushout

などを統一する。

## 7. 重要ポイント

圏論では、

> 積、pullback、equalizerという別々の構成

が、

> **limit**

という一つの概念に統一される。

これこそ圏論の威力。
