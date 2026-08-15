---
id: "supplement08"
number: 72
title: "演習問題と解答"
summary: "設計上の問題を分析し、適切なパターンを選ぶ"
---

# 演習問題と解答

## 問題1

次のコードにはどのような問題があるでしょうか。

```python
def export(data, format):

    if format == "csv":
        ...

    elif format == "json":
        ...

    elif format == "xml":
        ...
```

今後形式が20種類まで増える予定です。

どのパターンが候補になりますか。

## 問題2

次のシステムを設計してください。

```text
Notification

Email
SMS
Slack
LINE
```

さらに、

```text
通常通知
緊急通知
定期通知
```

があります。

継承だけを使った場合の問題を説明し、適切な設計を考えてください。

## 問題3

外部決済APIに、

```python
stripe.charge(amount)
```

があります。

自分のシステムでは、

```python
payment.pay(amount)
```

というインターフェースへ統一したい。

どのパターンを使いますか。

## 問題4

注文確定後、

- メール送信
- 在庫更新
- ポイント付与
- Analytics送信
- 倉庫通知

を実行します。

OrderServiceからこれらを分離する方法を考えてください。

## 問題5

注文状態に、

```text
CREATED
PAID
SHIPPED
DELIVERED
CANCELLED
```

があります。

現在コード中に、

```python
if status == ...
```

が60箇所あります。

どのパターンが候補でしょうか。

## 解答・解説

## 問題1

StrategyまたはFactory + Strategyが候補です。

重要なのは、

```text
formatごとのexport処理
```

が独立した変化軸になっている点です。

```python
class Exporter(Protocol):

    def export(self, data):
        ...
```

として、

```python
CsvExporter
JsonExporter
XmlExporter
```

へ分離できます。

## 問題2

BridgeまたはStrategyによるコンポジションが有効です。

継承すると、

```text
EmailNormal
EmailEmergency
EmailScheduled

SmsNormal
SmsEmergency
SmsScheduled

SlackNormal
...
```

と組み合わせ爆発します。

代わりに、

```text
NotificationType
      +
DeliveryChannel
```

という二軸に分離します。

## 問題3

Adapterです。

```python
class StripeAdapter:

    def pay(self, amount):
        stripe.charge(amount)
```

外部ライブラリへの依存を境界に閉じ込めます。

## 問題4

ObserverまたはDomain Eventです。

```python
publish(OrderCompleted(...))
```

に対して、

```text
MailHandler
InventoryHandler
PointHandler
AnalyticsHandler
WarehouseHandler
```

を登録します。

## 問題5

Stateパターンが候補です。

ただし単純なenum分岐で十分なら、まずロジックを一箇所へ集約するだけでも改善できます。

重要なのは、

```text
60個のif
↓
5個のStateクラス
```

と機械的に変換することではありません。

まず状態遷移を、

```text
Created
  ↓
Paid
  ↓
Shipped
  ↓
Delivered
```

という状態機械としてモデル化します。
