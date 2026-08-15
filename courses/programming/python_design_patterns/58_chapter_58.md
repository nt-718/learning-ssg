---
id: "ch58"
number: 58
title: "第58章 Event Sourcing"
summary: "現在状態ではなく、"
---

# 第58章 Event Sourcing

## 概要

現在状態ではなく、

> 状態を作ったイベント履歴

を保存します。

通常：

```text
balance = 1200
```

Event Sourcing：

```text
AccountCreated
Deposit 1000
Withdraw 300
Deposit 500
```

再生すると、

```text
0
+1000
-300
+500
=1200
```

になります。

監査履歴が重要なシステムで強力ですが、非常に複雑になるため安易に採用してはいけません。
