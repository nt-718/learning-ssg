---
id: "ch21"
number: 21
title: "第21章 モナドと計算効果"
summary: "モナドが実務で重要になる章。"
---

# 第21章 モナドと計算効果

モナドが実務で重要になる章。

## 1. Maybe

失敗可能性。

```haskell
a -> Maybe b
```

## 2. Either

エラー情報付き失敗。

```haskell
a -> Either Error b
```

## 3. List

非決定性。

```haskell
a -> [b]
```

一つの入力に複数結果を持てる。

## 4. Reader

```haskell
type Reader r a =
    r -> a
```

環境依存計算。

## 5. Writer

概念的に、

```haskell
(a, Log)
```

ログ生成計算。

## 6. State

\[
State\ S\ A
\cong
S\to(A,S)
\]

## 例

```haskell
increment
  :: State Int ()
```

という計算なら、

状態を入力し、

更新された状態を返す。

## 7. 共通パターン

普通の関数、

\[
A\to B
\]

ではなく、

\[
A\to M(B)
\]

という関数を合成する。

これを可能にするのがMonad。
