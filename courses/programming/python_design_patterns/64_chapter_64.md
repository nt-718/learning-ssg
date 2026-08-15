---
id: "ch64"
number: 64
title: "第64章 パターン選択ガイド"
summary: "設計上の問題から逆引きします。"
---

# 第64章 パターン選択ガイド

## 概要

設計上の問題から逆引きします。

| 問題 | 候補パターン |
|---|---|
| アルゴリズムを切り替えたい | Strategy |
| 状態によって処理が変わる | State |
| オブジェクト生成が複雑 | Factory / Builder |
| 外部APIを隠したい | Adapter |
| 複雑なシステムを簡単に使いたい | Facade |
| 機能を動的に追加したい | Decorator |
| イベントを複数箇所へ伝えたい | Observer |
| 処理をデータ化したい | Command |
| 木構造を統一的に扱いたい | Composite |
| アクセスを制御したい | Proxy |
| 相互依存を整理したい | Mediator |
| 状態を復元したい | Memento |
| DBからDomainを分離したい | Repository |
| Transactionをまとめたい | Unit of Work |
| 条件を再利用したい | Specification |
