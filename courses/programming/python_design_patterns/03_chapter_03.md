---
id: "ch03"
number: 3
title: "第3章 SOLID原則"
summary: "デザインパターンを理解するうえで重要なのがSOLIDです。"
---

# 第3章 SOLID原則

デザインパターンを理解するうえで重要なのがSOLIDです。

## 3.1 SRP — Single Responsibility Principle

単一責任原則。

> クラスが変更される理由は、一つであるべきである。

悪い例：

```python
class UserService:
    def create_user(self, data):
        ...

    def send_email(self, user):
        ...

    def save_database(self, user):
        ...

    def generate_pdf(self, user):
        ...
```

一つのクラスが、

- ユーザー生成
- メール
- DB
- PDF

まで担当しています。

分割すると、

```python
class UserService:
    def create_user(self, data):
        ...

class UserRepository:
    def save(self, user):
        ...

class Mailer:
    def send(self, user):
        ...

class PdfGenerator:
    def generate(self, user):
        ...
```

となります。

## 3.2 OCP — Open/Closed Principle

> 拡張に対して開き、変更に対して閉じる。

たとえば、

```python
def pay(method, amount):
    if method == "credit":
        ...
    elif method == "bank":
        ...
```

では決済方法追加のたびに`pay()`を変更します。

Strategyを使えば、

```python
class PaymentMethod(Protocol):
    def pay(self, amount: int) -> None:
        ...
```

新しい決済方法を追加するだけで済みます。

## 3.3 LSP — Liskov Substitution Principle

> 基底型を、その派生型へ置き換えてもプログラムが成立するべき。

典型例がRectangle/Square問題です。

```python
class Rectangle:
    def set_width(self, width):
        self.width = width

    def set_height(self, height):
        self.height = height
```

SquareをRectangleとして扱おうとすると、

```python
square.set_width(10)
```

で高さまで変更する必要が生じます。

「正方形は数学的には長方形」という関係と、

「ソフトウェアで継承可能」

は同じではありません。

## 3.4 ISP — Interface Segregation Principle

> 利用しない機能への依存を強制しない。

悪い例：

```python
class Worker(Protocol):
    def work(self):
        ...

    def eat(self):
        ...
```

ロボットには`eat()`がありません。

そこで、

```python
class Workable(Protocol):
    def work(self):
        ...

class Eatable(Protocol):
    def eat(self):
        ...
```

と分割します。

## 3.5 DIP — Dependency Inversion Principle

非常に重要です。

> 上位レベルのモジュールが、下位レベルの具体実装へ直接依存しない。

悪い例：

```python
class OrderService:
    def __init__(self):
        self.repository = MySQLOrderRepository()
```

改善：

```python
class OrderRepository(Protocol):
    def save(self, order):
        ...

class OrderService:
    def __init__(self, repository: OrderRepository):
        self.repository = repository
```

依存関係が、

```text
OrderService
    ↓
MySQL
```

ではなく、

```text
OrderService
    ↓
Repository interface
    ↑
MySQL
```

となります。

これはClean ArchitectureやHexagonal Architectureの基礎になります。
