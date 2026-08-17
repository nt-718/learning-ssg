---
id: "supplement11"
number: 42
title: "最後の概念地図"
summary: "本書で扱った概念間の関係を一枚の地図として統合する"
---

# 最後の概念地図

## 概要

```text
                     ┌────────────┐
                     │    合成     │
                     └─────┬──────┘
                           │
                           ▼
                     ┌────────────┐
                     │     圏      │
                     └─────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
         積・余積                     関手
              │                         │
              ▼                         ▼
          普遍性                    自然変換
              │                         │
              ▼                         │
        極限・余極限                    │
              │                         │
              └──────────┬──────────────┘
                         │
                         ▼
                    Hom 関手
                         │
                         ▼
                   表現可能関手
                         │
                         ▼
                      Yoneda
                         │
                         ▼
                       随伴
                         │
            ┌────────────┴───────────┐
            │                        │
            ▼                        ▼
       自由/忘却                   Monad
                                     │
                       ┌─────────────┴────────────┐
                       │                          │
                       ▼                          ▼
                  Kleisli圏                  T-algebra
                       │
                       ▼
                  計算効果

再帰型
   │
   ▼
Functor
   │
   ▼
F-algebra
   │
   ▼
Initial algebra
   │
   ▼
Catamorphism / Fold

さらに一般化
   │
   ├─ End / Coend
   │
   ├─ Kan Extension
   │
   ├─ Enriched Category
   │
   ├─ Topos
   │
   └─ Lawvere Theory
```
