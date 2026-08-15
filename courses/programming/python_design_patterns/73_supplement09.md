---
id: "supplement09"
number: 73
title: "総合演習"
summary: "注文処理システムの要件から設計を組み立てる"
---

# 総合演習

次の採用管理システムを設計してください。

## 要件

候補者には状態があります。

```text
Applied
Screening
Interview
Offer
Hired
Rejected
```

通知方法：

```text
Email
LINE
SMS
```

候補者状態が変わると、

```text
通知
Analytics
Slack通知
履歴記録
```

を実行します。

候補者情報は、

```text
MySQL
```

へ保存します。

将来的に、

```text
PostgreSQL
```

へ変更する可能性があります。

外部メールサービスも、

```text
SendGrid
↓
AWS SES
```

へ変更する可能性があります。

## 設計候補

状態：

```text
State
```

通知チャネル：

```text
Strategy
```

外部メールAPI：

```text
Adapter
```

状態変更イベント：

```text
Observer / Domain Event
```

DB：

```text
Repository
```

依存関係：

```text
Dependency Injection
```

ユースケース：

```text
Service Layer
```

全体：

```text
Hexagonal Architecture
```

と整理できます。
