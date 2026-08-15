---
id: "supplement07"
number: 71
title: "Pythonでの設計優先順位"
summary: "可読性、単純さ、標準機能を優先して設計する"
---

# Pythonでの設計優先順位

## 概要

Pythonで設計するときは、概ね次の順番を検討します。

```text
単純なコード
    ↓
関数
    ↓
辞書
    ↓
高階関数
    ↓
dataclass
    ↓
Protocol
    ↓
コンポジション
    ↓
継承
    ↓
複雑なパターン
```

最初からクラス階層を構築する必要はありません。
