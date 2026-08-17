---
id: "ch20"
number: 20
title: "第20章 モナド：プログラマーの定義"
summary: "次の関数を考える。"
---

# 第20章 モナド：プログラマーの定義

## 1. モナドの前に問題を見る

次の関数を考える。

```haskell
parse :: String -> Maybe Int
inverse :: Int -> Maybe Double
```

普通には合成できない。

## 2. bind

```haskell
(>>=)
  :: m a
  -> (a -> m b)
  -> m b
```

これを使う。

```haskell
parse s >>= inverse
```

## 3. return / pure

```haskell
return :: a -> m a
```

## 4. Kleisli composition

```haskell
(>=>)
  :: (a -> m b)
  -> (b -> m c)
  -> a
  -> m c
```

## 5. Monad laws

## 左単位元

```haskell
return a >>= f
=
f a
```

## 右単位元

```haskell
m >>= return
=
m
```

## 結合律

```haskell
(m >>= f) >>= g
=
m >>= (\x -> f x >>= g)
```

## 6. なぜこの法則が必要か

モナドが、

> 「合成の仕組み」

だから。

圏の合成と同様、

- 単位元
- 結合律

が必要になる。

## 7. 最大の誤解

### モナド＝箱

ではない。

`Maybe` や `List` は箱っぽいが、

`Reader` や `State` はそう理解するとむしろ混乱する。

## 8. より良い定義

> **モナドは特定の計算文脈に入った計算を、法則的に合成するための構造。**
