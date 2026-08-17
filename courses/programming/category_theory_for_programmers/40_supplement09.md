---
id: "supplement09"
number: 40
title: "圏論と実務プログラミング"
summary: "合成可能性、法則、インターフェース、計算効果を実務へつなげる"
---

# 圏論と実務プログラミング

圏論を学ぶ価値は、

`Category` や `Monad` という名前をコードに増やすことではない。

## 1. 合成可能性を考える

悪いAPI：

```text
呼ぶ
↓
内部状態変更
↓
別APIが暗黙依存
↓
さらに副作用
```

良いAPI：

```text
Input
 ↓
Transform
 ↓
Output
```

## 2. Lawを重視する

単に、

> この関数が動く

ではなく、

> この抽象化はどんな法則を満たすべきか

を見る。

Functorなら、

```haskell
fmap id = id
```

など。

## 3. 実装よりinterfaceを見る

圏論では対象内部を見ない。

ソフトウェアでも、

> 内部実装ではなくobservable behavior

を重視する。

## 4. Effectを型へ表す

隠された副作用ではなく、

```haskell
A -> Maybe B
```

```haskell
A -> Either Error B
```

```haskell
A -> State S B
```

のように、

> 計算の性質を型へ露出させる

という思想につながる。
