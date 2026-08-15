# Pythonで学ぶデザインパターン
## 設計原則からGoF・Pythonic設計・アーキテクチャまで

---

# はじめに

デザインパターンを学ぶとき、最も避けたいのは、

> 「このコードはFactory Methodです」
>
> 「これはObserverです」

と名前だけを覚えることです。

デザインパターンの本質は、クラス図の形ではありません。

本質は、

> **繰り返し現れる設計上の問題に対して、どのように責務を分割し、どこに変化を閉じ込めるか**

という問題解決の知識です。

たとえば、次のコードを考えてください。

```python
def calculate_price(customer_type, price):
    if customer_type == "normal":
        return price
    elif customer_type == "premium":
        return price * 0.9
    elif customer_type == "vip":
        return price * 0.8
```

プログラムとしては問題なく動きます。

しかし今後、

- 学生割引
- 法人割引
- キャンペーン割引
- 会員ランク別割引
- 地域別割引

が増え続けたらどうでしょうか。

`if` が増え続け、価格計算という一つの関数が、多数のルールを知ることになります。

そこで「割引アルゴリズムそのものを交換可能にする」という発想が生まれます。

```python
from typing import Protocol


class Discount(Protocol):
    def apply(self, price: float) -> float:
        ...


class NormalDiscount:
    def apply(self, price: float) -> float:
        return price


class PremiumDiscount:
    def apply(self, price: float) -> float:
        return price * 0.9


class VipDiscount:
    def apply(self, price: float) -> float:
        return price * 0.8


def calculate_price(price: float, discount: Discount) -> float:
    return discount.apply(price)
```

これはStrategyパターンと呼ばれる考え方です。

しかし重要なのは、

> 「Strategyというクラス構造を覚えること」

ではありません。

重要なのは、

> **変化するアルゴリズムを、利用側から分離する**

という設計思想です。

本書では、このように

1. 何が問題なのか
2. 素朴な実装では何が起こるか
3. どの責務を分離すればよいか
4. デザインパターンではどう表現するか
5. Pythonならもっと簡潔に書けないか
6. いつ使うべきか
7. いつ使わないべきか

という順序で学習します。

---

# 本書の構成

## 第I部　デザインパターンを学ぶ前に

1. デザインパターンとは何か
2. 良い設計とは何か
3. SOLID原則
4. 結合度と凝集度
5. 継承とコンポジション
6. Pythonにおける抽象化

## 第II部　生成に関するパターン

7. Factory Method
8. Abstract Factory
9. Builder
10. Prototype
11. Singleton

## 第III部　構造に関するパターン

12. Adapter
13. Bridge
14. Composite
15. Decorator
16. Facade
17. Flyweight
18. Proxy

## 第IV部　振る舞いに関するパターン

19. Chain of Responsibility
20. Command
21. Interpreter
22. Iterator
23. Mediator
24. Memento
25. Observer
26. State
27. Strategy
28. Template Method
29. Visitor

## 第V部　Pythonらしいパターン

30. First-Class Function
31. Callable Object
32. Decorator
33. Context Manager
34. Generator
35. Descriptor
36. ProtocolとDuck Typing
37. Dependency Injection
38. Registry
39. Null Object
40. Sentinel
41. Lazy Evaluation

## 第VI部　アプリケーション設計

42. Repository
43. Service Layer
44. Unit of Work
45. Specification
46. DTO
47. Mapper
48. Domain Model
49. Dependency Inversion
50. Event-Driven Architecture

## 第VII部　より大きな設計パターン

51. MVC
52. MVP
53. MVVM
54. Layered Architecture
55. Hexagonal Architecture
56. Clean Architecture
57. CQRS
58. Event Sourcing

## 第VIII部　設計力を鍛える

59. デザインパターンの組み合わせ
60. リファクタリングからパターンを発見する
61. アンチパターン
62. Pythonにおける過剰設計
63. 実践ケーススタディ
64. 総合演習

---

# 第I部　デザインパターンを学ぶ前に

# 第1章　デザインパターンとは何か

## 1.1 パターンとは「コード」ではない

デザインパターンとは、

> ソフトウェア設計で繰り返し発生する問題に対する、再利用可能な設計上の考え方

です。

重要なのは「設計」であって、特定のコードではありません。

同じObserverパターンでも、

```python
class Observer:
    ...
```

とクラスとして実装することもあれば、

```python
callbacks = []

def subscribe(callback):
    callbacks.append(callback)
```

のように関数だけで実装することもあります。

Pythonでは後者のほうが自然な場合も珍しくありません。

---

# 第2章　良い設計とは何か

「良いコード」を考えるとき、短さだけでは評価できません。

```python
def f(x):
    return x.a.b.c() if x.a and x.a.b else None
```

短くても保守しにくいことがあります。

反対に多少コード量が増えても、

- 責務が明確
- 変更箇所が限定される
- テストしやすい
- 名前から意図が分かる

なら、長期的には良い設計です。

## 2.1 設計で考えるべき4つの変化

特に次を意識します。

### ① データの変化

```text
User
↓
属性が増える
↓
DB構造が変わる
```

### ② ルールの変化

```text
価格計算
認可
税率
ランキング
```

### ③ 外部システムの変化

```text
Stripe → 別決済API
MySQL → PostgreSQL
AWS → GCP
```

### ④ フローの変化

```text
注文
↓
決済
↓
在庫確保
↓
通知
```

どの種類の変化からシステムを守りたいのかによって、適切なパターンは変わります。

---

# 第3章　SOLID原則

デザインパターンを理解するうえで重要なのがSOLIDです。

---

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

---

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

---

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

---

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

---

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

---

# 第4章　凝集度と結合度

設計を評価するときの基本原則です。

## 凝集度

> 一つのモジュール内部の要素が、どれだけ同じ目的に集中しているか。

高いほうが望ましい。

## 結合度

> モジュール同士が、どれだけ互いの詳細に依存しているか。

低いほうが望ましい。

理想：

```text
高凝集
低結合
```

です。

---

# 第5章　継承よりコンポジション

GoFで非常に重要な原則があります。

> Favor object composition over class inheritance.

すなわち、

> クラス継承よりオブジェクト合成を優先する。

たとえば、

```python
class FlyingBird(Bird):
    ...
```

のように継承で能力を表現すると、

```text
Bird
├─ FlyingBird
├─ SwimmingBird
├─ FlyingSwimmingBird
...
```

と増殖しやすくなります。

そこで、

```python
class Bird:
    def __init__(self, fly_behavior):
        self.fly_behavior = fly_behavior
```

と振る舞いを注入します。

これはStrategyにもつながります。

---

# 第6章　Pythonにおける抽象化

PythonではJavaのように、必ずinterfaceを定義する必要はありません。

## Duck Typing

Pythonでは、

> 同じ操作ができれば同じものとして扱う

という考え方が一般的です。

```python
def save(repository, user):
    repository.save(user)
```

`repository`が何クラスなのかは問いません。

`save()`があれば動きます。

---

## Protocol

静的型チェックも利用したいなら、

```python
from typing import Protocol


class Repository(Protocol):
    def save(self, obj) -> None:
        ...
```

と書けます。

Pythonのデザインパターンでは非常に重要な道具です。

---

# 第II部　生成パターン

# 第7章 Factory Method

## 問題

生成するオブジェクトを条件分岐で決めているとします。

```python
def create_notification(kind):
    if kind == "email":
        return EmailNotification()
    if kind == "sms":
        return SmsNotification()
```

種類が増えるほど変更箇所が増えます。

---

## 基本思想

> オブジェクト生成の決定を分離する。

```python
class NotificationFactory:
    @staticmethod
    def create(kind):
        if kind == "email":
            return EmailNotification()

        if kind == "sms":
            return SmsNotification()

        raise ValueError(kind)
```

利用側：

```python
notification = NotificationFactory.create("email")
notification.send()
```

---

## Pythonic Factory

Pythonでは辞書を使う方法も非常に有効です。

```python
FACTORIES = {
    "email": EmailNotification,
    "sms": SmsNotification,
}


def create_notification(kind):
    try:
        return FACTORIES[kind]()
    except KeyError:
        raise ValueError(f"Unknown notification: {kind}")
```

ここからRegistryパターンにも発展します。

---

# 第8章 Abstract Factory

Factory Methodが一種類の生成を扱うのに対して、Abstract Factoryは、

> 関連するオブジェクト群をまとめて生成する

ために使います。

例：

```text
UIFactory
├─ WindowsFactory
│   ├─ WindowsButton
│   └─ WindowsDialog
│
└─ MacFactory
    ├─ MacButton
    └─ MacDialog
```

Python：

```python
class WindowsFactory:
    def create_button(self):
        return WindowsButton()

    def create_dialog(self):
        return WindowsDialog()
```

利用側：

```python
def render(factory):
    button = factory.create_button()
    dialog = factory.create_dialog()
```

利用側はWindowsかMacか知る必要がありません。

---

# 第9章 Builder

大量の引数があるオブジェクトを考えます。

```python
User(
    name="Alice",
    age=30,
    country="Japan",
    language="ja",
    newsletter=True,
    admin=False,
    ...
)
```

Builderでは段階的に構築します。

```python
builder = UserBuilder()

user = (
    builder
    .name("Alice")
    .age(30)
    .newsletter(True)
    .build()
)
```

---

## ただしPythonでは？

Pythonには、

- keyword arguments
- dataclass
- default value

があります。

```python
@dataclass
class User:
    name: str
    age: int | None = None
    newsletter: bool = False
```

このためJavaほどBuilderが必要ではありません。

Builderが有効なのは、

> 「生成手順そのものが複雑」

な場合です。

たとえばSQL構築、

```python
query = (
    QueryBuilder()
    .select("name", "age")
    .from_("users")
    .where("age > 20")
    .order_by("name")
    .build()
)
```

などです。

---

# 第10章 Prototype

既存オブジェクトを複製して新しいオブジェクトを生成します。

Pythonでは標準ライブラリがあります。

```python
import copy

new_obj = copy.copy(obj)
```

深いコピー：

```python
new_obj = copy.deepcopy(obj)
```

PythonではPrototype専用クラスを作るより、

```python
copy.copy()
copy.deepcopy()
```

が自然です。

---

# 第11章 Singleton

インスタンスを一つだけにします。

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
```

しかしPythonではSingletonを多用すべきではありません。

なぜなら、

```text
Singleton
≈ Global State
```

になりやすいからです。

テストが難しくなります。

Pythonでは、

```python
# config.py

settings = Settings()
```

のようにmodule自体の一回ロードを利用するだけで十分なことも多いです。

---

# 第III部　構造パターン

# 第12章 Adapter

## 問題

自分のコードは、

```python
mailer.send(message)
```

を期待している。

しかし外部ライブラリは、

```python
third_party.send_email(body)
```

というAPIだったとします。

Adapterを作ります。

```python
class MailAdapter:
    def __init__(self, third_party):
        self.third_party = third_party

    def send(self, message):
        self.third_party.send_email(message)
```

利用側から見ると、

```python
mailer.send(message)
```

で統一できます。

---

## Adapterの意味

Adapterとは、

> インターフェースの翻訳者

です。

外部APIへの依存を内部へ漏らさないために非常に重要です。

---

# 第13章 Bridge

Bridgeでは、

> 抽象と実装を別々に変化させる

ことを目指します。

例：

```text
Notification
├─ Alert
└─ Reminder

Sender
├─ Email
├─ SMS
└─ Slack
```

継承だけなら、

```text
EmailAlert
SmsAlert
SlackAlert
EmailReminder
SmsReminder
SlackReminder
```

となります。

組み合わせ爆発です。

Bridgeなら、

```python
class Alert:
    def __init__(self, sender):
        self.sender = sender

    def send(self, message):
        self.sender.send(message)
```

として独立させます。

---

# 第14章 Composite

木構造を、単体と集合で同じように扱います。

典型例：

```text
Folder
├─ File
├─ File
└─ Folder
   ├─ File
   └─ File
```

```python
class File:
    def size(self):
        return self._size


class Directory:
    def __init__(self, children):
        self.children = children

    def size(self):
        return sum(child.size() for child in self.children)
```

利用者は、

```python
node.size()
```

だけ使えばよく、

```text
Fileなのか
Directoryなのか
```

を意識しません。

---

# 第15章 Decorator

Decoratorは、

> 元のオブジェクトを変更せず、機能を重ねる

パターンです。

```python
class LoggingRepository:
    def __init__(self, repository):
        self.repository = repository

    def save(self, obj):
        print("saving", obj)
        return self.repository.save(obj)
```

さらに、

```python
repository = LoggingRepository(
    CacheRepository(
        DatabaseRepository()
    )
)
```

のように積み重ねられます。

---

## Pythonの@decoratorとの違い

Pythonの、

```python
@cache
def get_user():
    ...
```

も根本思想は似ています。

ただしGoF Decoratorは、

> オブジェクトを包む

ことが中心です。

Python decoratorは、

> callableを包む

場合が多いです。

---

# 第16章 Facade

複雑なサブシステムを簡単なAPIで包みます。

```python
class OrderFacade:

    def place_order(self, user, product):
        inventory.reserve(product)
        payment.charge(user)
        shipping.schedule(product)
        mail.send_confirmation(user)
```

利用側：

```python
order.place_order(user, product)
```

で済みます。

Facadeの目的は、

> 内部の複雑性を外へ漏らさないこと

です。

---

# 第17章 Flyweight

大量のオブジェクトが同じ情報を共有するとき、その情報を共有します。

たとえばゲームに100万本の木がある場合、

```text
木の種類
テクスチャ
モデル
```

を各木が持つ必要はありません。

共有：

```python
class TreeType:
    def __init__(self, texture):
        self.texture = texture
```

個別：

```python
class Tree:
    def __init__(self, x, y, tree_type):
        self.x = x
        self.y = y
        self.tree_type = tree_type
```

となります。

---

# 第18章 Proxy

本物のオブジェクトの代理を置きます。

```python
class ImageProxy:
    def __init__(self, path):
        self.path = path
        self._image = None

    def display(self):
        if self._image is None:
            self._image = load_image(self.path)

        self._image.display()
```

これはLazy Loadingです。

Proxyには、

- Remote Proxy
- Virtual Proxy
- Protection Proxy
- Cache Proxy

などがあります。

---

# 第IV部　振る舞いパターン

# 第19章 Chain of Responsibility

複数の処理候補を順番に試します。

```python
class Handler:
    def __init__(self, next_handler=None):
        self.next = next_handler

    def handle(self, request):
        if self.can_handle(request):
            return self.process(request)

        if self.next:
            return self.next.handle(request)
```

例：

```text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Business Logic
```

Web Frameworkのmiddlewareは、この思想に近いものです。

---

# 第20章 Command

処理をオブジェクトとして表現します。

```python
class DeleteUserCommand:
    def __init__(self, service, user_id):
        self.service = service
        self.user_id = user_id

    def execute(self):
        self.service.delete(self.user_id)
```

メリット：

- キューへ入れられる
- ログへ保存できる
- Undoできる
- リトライできる

つまり、

> 「処理」をデータのように扱える

ことが重要です。

---

# 第21章 Interpreter

小さな言語や式をオブジェクト構造として表現します。

たとえば、

```text
age > 20 AND country == "Japan"
```

という検索条件。

```python
class And:
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def evaluate(self, obj):
        return (
            self.left.evaluate(obj)
            and self.right.evaluate(obj)
        )
```

ただし本格的な言語処理では、

- Parser
- Lexer
- AST

を利用するほうが一般的です。

---

# 第22章 Iterator

PythonではIteratorが言語レベルに統合されています。

```python
for user in users:
    ...
```

内部では、

```python
iter(users)
next(iterator)
```

が利用されています。

自作：

```python
class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration

        value = self.current
        self.current -= 1
        return value
```

しかしPythonなら、

```python
def countdown(start):
    while start > 0:
        yield start
        start -= 1
```

のほうが自然です。

ここに、

> GoFパターンが言語機能に吸収される

典型例があります。

---

# 第23章 Mediator

オブジェクト同士が直接通信すると、

```text
A ↔ B
A ↔ C
A ↔ D
B ↔ C
B ↔ D
...
```

と依存関係が爆発します。

Mediatorを置いて、

```text
     Mediator
    ↗   ↑   ↖
   A    B    C
```

とします。

```python
class ChatRoom:
    def send(self, sender, message):
        for user in self.users:
            if user != sender:
                user.receive(message)
```

各Userは他Userを知る必要がありません。

---

# 第24章 Memento

オブジェクトの過去状態を保存します。

```python
history = []

history.append(copy.deepcopy(document))
```

Undo機能などで利用します。

典型例：

```text
State 1
 ↓
State 2
 ↓
State 3
 ↓ Undo
State 2
```

---

# 第25章 Observer

非常に重要なパターンです。

> あるオブジェクトの変化を複数の購読者へ通知する。

```python
class EventBus:
    def __init__(self):
        self.listeners = {}

    def subscribe(self, event, callback):
        self.listeners.setdefault(event, []).append(callback)

    def publish(self, event, data):
        for callback in self.listeners.get(event, []):
            callback(data)
```

登録：

```python
bus.subscribe("user_created", send_welcome_mail)
bus.subscribe("user_created", create_profile)
```

発火：

```python
bus.publish("user_created", user)
```

---

## 重要な発展

Observer

↓

Publish/Subscribe

↓

Domain Events

↓

Event-Driven Architecture

へ発展します。

---

# 第26章 State

状態ごとの`if`が増殖する問題を解決します。

悪い例：

```python
if order.status == "new":
    ...
elif order.status == "paid":
    ...
elif order.status == "shipped":
    ...
```

State：

```python
class PaidState:
    def ship(self, order):
        order.state = ShippedState()
```

状態自身に振る舞いを持たせます。

---

## State Machineとして考える

```text
Created
  ↓ pay
Paid
  ↓ ship
Shipped
  ↓ deliver
Delivered
```

状態遷移が重要なドメイン、

- 採用選考
- 注文
- ワークフロー
- チケット管理
- 承認フロー

などで有効です。

---

# 第27章 Strategy

最重要パターンの一つです。

> アルゴリズムを交換可能にする。

```python
class PricingStrategy(Protocol):
    def calculate(self, price):
        ...
```

```python
class NormalPricing:
    def calculate(self, price):
        return price


class PremiumPricing:
    def calculate(self, price):
        return price * 0.9
```

Context：

```python
class PriceCalculator:
    def __init__(self, strategy):
        self.strategy = strategy

    def calculate(self, price):
        return self.strategy.calculate(price)
```

---

## Pythonic Strategy

クラスすら不要な場合があります。

```python
def normal(price):
    return price


def premium(price):
    return price * 0.9
```

そして、

```python
def calculate(price, strategy):
    return strategy(price)
```

Pythonでは関数がfirst-class objectなので、こちらのほうが簡潔です。

---

# 第28章 Template Method

アルゴリズムの骨格を基底クラスで決めます。

```python
class Importer:

    def import_data(self):
        raw = self.read()
        data = self.parse(raw)
        self.save(data)

    def read(self):
        raise NotImplementedError

    def parse(self, raw):
        raise NotImplementedError

    def save(self, data):
        ...
```

CSV：

```python
class CsvImporter(Importer):

    def read(self):
        ...

    def parse(self, raw):
        ...
```

---

## Strategyとの比較

Template Method：

```text
継承
```

Strategy：

```text
コンポジション
```

現代的な設計ではStrategyのほうが柔軟な場合が多いです。

---

# 第29章 Visitor

Visitorは複雑ですが重要です。

オブジェクト構造を変えずに、新しい操作を追加します。

たとえばAST：

```text
Add
├─ Number
└─ Multiply
   ├─ Number
   └─ Number
```

ここに、

- 評価
- 表示
- 型検査
- 最適化

などの操作を追加したい。

Visitor：

```python
class Evaluator:

    def visit_number(self, node):
        return node.value

    def visit_add(self, node):
        return (
            node.left.accept(self)
            + node.right.accept(self)
        )
```

CompilerやAST処理で重要になります。

---

# 第V部　Python固有の設計パターン

# 第30章 First-Class Function

Pythonでは関数自体が値です。

```python
def greet():
    print("hello")


x = greet
x()
```

リストにも入れられます。

```python
handlers = [
    validate,
    normalize,
    save,
]
```

これにより、

- Strategy
- Command
- Observer

などをクラスなしで実装できます。

---

# 第31章 Callable Object

`__call__`を実装するとオブジェクトを関数のように扱えます。

```python
class Retry:
    def __init__(self, times):
        self.times = times

    def __call__(self, func):
        ...
```

「状態を持つ関数」が欲しいとき便利です。

---

# 第32章 Python Decorator

```python
def log(func):

    def wrapper(*args, **kwargs):
        print("start")
        result = func(*args, **kwargs)
        print("end")
        return result

    return wrapper
```

利用：

```python
@log
def calculate():
    ...
```

用途：

- logging
- caching
- authorization
- retry
- metrics
- transaction

---

# 第33章 Context Manager

```python
with open("file.txt") as f:
    ...
```

これは、

> リソース取得と解放を安全にペアにする

パターンです。

自作：

```python
class Transaction:

    def __enter__(self):
        self.begin()
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type:
            self.rollback()
        else:
            self.commit()
```

---

# 第34章 Generator

Generatorは、

> 全データを一度に作らず、必要になったときだけ生成する

仕組みです。

```python
def users():
    for row in database:
        yield User(row)
```

大量データ処理では重要です。

```text
List
→ 全件メモリ

Generator
→ 一件ずつ
```

---

# 第35章 Descriptor

Pythonの高度な機構です。

```python
class Positive:

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__[self.name]

    def __set__(self, instance, value):
        if value <= 0:
            raise ValueError()

        instance.__dict__[self.name] = value
```

利用：

```python
class Product:
    price = Positive()
```

`property`やORMのFieldなどの理解にもつながります。

---

# 第36章 ProtocolとDuck Typing

Pythonにおいて非常に重要な設計思想です。

Java的には、

```text
interface Repository
```

を明示します。

Pythonでは、

```python
class Repository(Protocol):
    def save(self, obj) -> None:
        ...
```

とできます。

利用：

```python
def register(
    repository: Repository,
):
    ...
```

しかし実装側は、

```python
class MySQLRepository:
    def save(self, obj):
        ...
```

だけでよく、Repositoryを継承する必要さえありません。

これをstructural typingと呼びます。

---

# 第37章 Dependency Injection

依存オブジェクトを内部生成しないで、外部から渡します。

悪い：

```python
class UserService:

    def __init__(self):
        self.repo = MySQLRepository()
```

良い：

```python
class UserService:

    def __init__(self, repo):
        self.repo = repo
```

テスト：

```python
service = UserService(
    FakeRepository()
)
```

非常にテストしやすくなります。

---

# 第38章 Registry

種類と実装の対応表を登録します。

```python
registry = {}


def register(name):
    def decorator(cls):
        registry[name] = cls
        return cls

    return decorator
```

利用：

```python
@register("csv")
class CsvImporter:
    ...
```

取得：

```python
importer = registry["csv"]()
```

Plugin Architectureの基礎として重要です。

---

# 第39章 Null Object

`None`チェックを繰り返す代わりに何もしないオブジェクトを使います。

悪い：

```python
if logger is not None:
    logger.log(message)
```

Null Object：

```python
class NullLogger:
    def log(self, message):
        pass
```

すると、

```python
logger.log(message)
```

だけで済みます。

---

# 第40章 Sentinel

`None`自体が有効値の場合に特殊値を作ります。

```python
MISSING = object()
```

```python
def update(value=MISSING):

    if value is MISSING:
        ...
```

Pythonライブラリ設計で非常に便利です。

---

# 第41章 Lazy Evaluation

必要になるまで計算しません。

```python
class User:

    @cached_property
    def profile(self):
        return expensive_load()
```

Proxy、Generator、Cacheとも密接に関係します。

---

# 第VI部　アプリケーション設計パターン

# 第42章 Repository

Domain ModelからDB操作を切り離します。

```python
class UserRepository(Protocol):

    def get(self, user_id: int) -> User:
        ...

    def save(self, user: User) -> None:
        ...
```

MySQL：

```python
class MySQLUserRepository:

    def get(self, user_id):
        ...

    def save(self, user):
        ...
```

Service：

```python
class UserService:

    def __init__(self, repository):
        self.repository = repository
```

---

# 第43章 Service Layer

ビジネスユースケースをまとめるレイヤーです。

```python
class TransferService:

    def transfer(
        self,
        sender_id,
        receiver_id,
        amount,
    ):
        sender = self.accounts.get(sender_id)
        receiver = self.accounts.get(receiver_id)

        sender.withdraw(amount)
        receiver.deposit(amount)

        self.accounts.save(sender)
        self.accounts.save(receiver)
```

Controllerにビジネスロジックを書かないことが重要です。

---

# 第44章 Unit of Work

複数Repositoryを一つのtransactionとしてまとめます。

```python
with uow:

    user = uow.users.get(user_id)

    order = Order(user)

    uow.orders.add(order)

    uow.commit()
```

失敗すればrollbackします。

---

# 第45章 Specification

条件をオブジェクトとして表します。

```python
class Adult:

    def is_satisfied_by(self, user):
        return user.age >= 18
```

組み合わせ：

```python
adult & japanese & active
```

などへ発展できます。

複雑な業務条件の再利用に有効です。

---

# 第46章 DTO

Data Transfer Object。

層をまたいでデータを運ぶためのオブジェクトです。

```python
@dataclass
class UserDTO:
    id: int
    name: str
    email: str
```

Domain Objectを直接APIへ露出させないために使います。

---

# 第47章 Mapper

異なるモデル間を変換します。

```text
Database Row
     ↓
Domain Model
     ↓
DTO
     ↓
JSON
```

例：

```python
def row_to_user(row):
    return User(
        id=row["id"],
        name=row["name"],
    )
```

---

# 第48章 Domain Model

データとビジネスルールを一緒にします。

悪い例：

```python
class User:
    name: str
    age: int
```

ただのデータ袋です。

Rich Domain Model：

```python
class Account:

    def withdraw(self, amount):
        if amount <= 0:
            raise InvalidAmount()

        if self.balance < amount:
            raise InsufficientFunds()

        self.balance -= amount
```

ルールがDomain Model内部にあります。

---

# 第49章 Dependency Inversion

アプリケーション中心の依存関係を作ります。

悪い構造：

```text
Domain
 ↓
SQLAlchemy
 ↓
PostgreSQL
```

良い構造：

```text
Infrastructure
      ↓
Application
      ↓
Domain
```

重要なのは、

> 外部技術が内側へ依存する

ことです。

Domainは、

- FastAPI
- Django
- SQLAlchemy
- PostgreSQL
- AWS

などを知る必要がありません。

---

# 第50章 Domain Events

たとえば注文が完了したとします。

直接、

```python
send_email()
update_points()
notify_warehouse()
send_analytics()
```

するとOrderServiceが巨大化します。

代わりに、

```python
OrderCompleted(order_id)
```

というイベントを発行します。

購読者：

```text
OrderCompleted
 ├─ SendEmail
 ├─ AddPoints
 ├─ NotifyWarehouse
 └─ Analytics
```

となります。

---

# 第VII部　アーキテクチャパターン

# 第51章 MVC

```text
Model
View
Controller
```

Controller：

```text
HTTP Request
     ↓
Controller
     ↓
Model
     ↓
View
```

Web Frameworkで広く使われる思想です。

---

# 第52章 MVP

```text
Model
View
Presenter
```

Viewをより受動的にします。

GUIアプリケーションなどで利用されます。

---

# 第53章 MVVM

```text
Model
View
ViewModel
```

データバインディングとの相性がよい構造です。

---

# 第54章 Layered Architecture

典型：

```text
Presentation
     ↓
Application
     ↓
Domain
     ↓
Infrastructure
```

初心者にも理解しやすいアーキテクチャです。

ただしInfrastructureへの依存方向には注意が必要です。

---

# 第55章 Hexagonal Architecture

別名Ports and Adapters。

中心：

```text
         Web
          ↓
       Adapter
          ↓
Database → Port ← External API
          ↓
       Domain
```

正確には、

```text
External
   ↓
Adapter
   ↓
Port
   ↓
Application
```

という形で外界との境界を明確にします。

Repository interfaceなどがPortです。

---

# 第56章 Clean Architecture

中心にビジネスルールを置きます。

```text
┌───────────────────────────┐
│ Framework / Infrastructure│
│  ┌─────────────────────┐  │
│  │ Interface Adapter   │  │
│  │  ┌───────────────┐  │  │
│  │  │ Application   │  │  │
│  │  │  ┌─────────┐  │  │  │
│  │  │  │ Domain  │  │  │  │
│  │  │  └─────────┘  │  │  │
│  │  └───────────────┘  │  │
│  └─────────────────────┘  │
└───────────────────────────┘
```

依存方向は、

```text
外 → 内
```

です。

中心ほど、

- 安定
- 技術非依存
- ビジネス価値が高い

コードになります。

---

# 第57章 CQRS

Command Query Responsibility Segregation。

更新と参照を分けます。

従来：

```python
repository.save()
repository.find()
```

CQRS：

```text
Command Side
  ↓
Write Model

Query Side
  ↓
Read Model
```

複雑なシステムでは、

```text
Write DB
Read DB
```

まで分離することがあります。

---

# 第58章 Event Sourcing

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

---

# 第VIII部　デザインパターンを使いこなす

# 第59章 パターンは組み合わせる

実際のコードでは一つだけ使うことは少ないです。

たとえば通知システム。

```text
Factory
 ↓
Notification生成

Strategy
 ↓
送信方法

Decorator
 ↓
Retry / Logging

Observer
 ↓
イベント通知

Adapter
 ↓
外部API接続
```

このように複数のパターンが協調します。

---

# 第60章 リファクタリングからパターンを発見する

最初からパターンを入れる必要はありません。

むしろ、

```text
素朴な実装
    ↓
問題発生
    ↓
重複・条件分岐増加
    ↓
責務を分析
    ↓
リファクタリング
    ↓
結果としてパターンになる
```

という順番が理想です。

---

## 例

最初：

```python
if payment == "card":
    ...
elif payment == "bank":
    ...
```

3種類程度なら問題ありません。

10種類になった。

さらに各方式で処理が20行ある。

そこで、

```python
PaymentStrategy
```

へ分離する。

これが自然なStrategy導入です。

---

# 第61章 アンチパターン

## God Object

何でも担当する巨大クラス。

```python
class ApplicationManager:
    ...
```

が、

- DB
- Email
- Auth
- Payment
- Logging
- Validation
- Analytics

すべてを担当する状態です。

---

## Spaghetti Code

依存関係が複雑化して、

```text
A → B
↑ ↘ ↓
D ← C
```

変更影響を予測できない状態です。

---

## Shotgun Surgery

一つの機能変更のために、

```text
20ファイル変更
```

が必要になる状態。

責務の分散を疑います。

---

## Lava Flow

昔必要だったコードが、

> 「何に使われているか分からないから消せない」

状態です。

AIコーディングでも特に注意すべき問題です。

---

## Golden Hammer

覚えたパターンを何にでも使います。

Strategyを覚えた直後、

```text
全部Strategy
```

にしてしまうような状態です。

---

# 第62章 Pythonにおける過剰設計

Pythonでは特に、

> Java的なデザインパターンをそのまま持ち込まない

ことが重要です。

---

## Java的Factory

```python
class UserFactory:

    @staticmethod
    def create():
        return User()
```

しかし、

```python
User()
```

でよいならFactoryは不要です。

---

## Interfaceの乱造

```python
class IUserService(ABC):
    ...
```

```python
class UserService(IUserService):
    ...
```

実装が一つしかなく、差し替え予定もないなら無意味なことがあります。

PythonではProtocolやDuck Typingで十分なケースも多いです。

---

## 重要原則

> Abstraction is not free.

抽象化にはコストがあります。

- ファイルが増える
- 名前が増える
- 間接層が増える
- 追跡が難しくなる

したがって、

> 未来の変化を想像して抽象化するのではなく、実際の変化軸が見えてから抽象化する

ことが重要です。

---

# 第63章 ケーススタディ
# ECサイトを設計する

次のシステムを考えます。

```text
ECサイト

User
Product
Cart
Order
Payment
Shipping
Notification
```

---

## Step 1 Domain Model

```python
class Order:

    def __init__(self, user, items):
        self.user = user
        self.items = items
        self.status = "created"

    def total(self):
        return sum(
            item.price * item.quantity
            for item in self.items
        )
```

---

# Step 2 Repository

```python
class OrderRepository(Protocol):

    def save(self, order):
        ...

    def get(self, order_id):
        ...
```

---

# Step 3 Payment Strategy

```python
class PaymentMethod(Protocol):

    def pay(self, amount):
        ...
```

```python
class CreditCardPayment:

    def pay(self, amount):
        ...
```

---

# Step 4 External API Adapter

```python
class StripePaymentAdapter:

    def __init__(self, stripe_client):
        self.client = stripe_client

    def pay(self, amount):
        self.client.create_charge(amount)
```

---

# Step 5 Service Layer

```python
class OrderService:

    def __init__(
        self,
        orders,
        payment,
        event_bus,
    ):
        self.orders = orders
        self.payment = payment
        self.event_bus = event_bus

    def place_order(self, order):

        amount = order.total()

        self.payment.pay(amount)

        order.mark_paid()

        self.orders.save(order)

        self.event_bus.publish(
            "order_paid",
            order,
        )
```

---

# Step 6 Observer

```python
event_bus.subscribe(
    "order_paid",
    send_confirmation_email,
)

event_bus.subscribe(
    "order_paid",
    reserve_inventory,
)

event_bus.subscribe(
    "order_paid",
    notify_shipping,
)
```

最終構造：

```text
                  Controller
                      │
                      ▼
                OrderService
                /     |      \
               /      |       \
              ▼       ▼        ▼
        Repository  Payment   EventBus
             ▲        ▲
             │        │
          Adapter   Adapter
             │        │
             ▼        ▼
             DB     Stripe
```

ここには、

- Strategy
- Adapter
- Repository
- Observer
- Dependency Injection
- Service Layer
- Dependency Inversion

が組み合わされています。

---

# 第64章　パターン選択ガイド

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

---

# パターン比較

## Strategy vs State

構造は非常に似ています。

### Strategy

利用側が、

> どのアルゴリズムを使うか

決めます。

```python
calculator.strategy = PremiumPricing()
```

### State

オブジェクト自身が、

> 現在の状態

によって振る舞いを変えます。

```python
order.pay()
# state automatically changes
```

---

# Factory vs Builder

Factory：

> どのオブジェクトを作るか

Builder：

> どのような手順で作るか

---

# Adapter vs Facade

Adapter：

> インターフェースを変換する。

Facade：

> 複雑なインターフェースを簡単にする。

---

# Decorator vs Proxy

どちらもラップします。

Decorator：

> 機能追加

Proxy：

> アクセス制御

が主目的です。

---

# Observer vs Mediator

Observer：

```text
1 → N
```

変更通知。

Mediator：

```text
N → 1 → N
```

相互通信の整理。

---

# Command vs Strategy

Strategy：

> 「どう処理するか」

Command：

> 「何を実行するか」

Commandは、

```text
Queue
Undo
Retry
Logging
```

などと相性がよいのが特徴です。

---

# デザインパターンを読むための共通テンプレート

今後、新しいパターンに出会ったら次の7項目で分析してください。

## 1. Problem

何が問題なのか。

## 2. Forces

どの要求が衝突しているか。

## 3. Intent

何を達成したいのか。

## 4. Structure

どのような責務分割か。

## 5. Consequences

メリットとデメリット。

## 6. Alternatives

他の方法はないか。

## 7. Pythonic Alternative

Pythonならもっと簡単にできないか。

この最後の視点が非常に重要です。

---

# デザインパターンを使う判断基準

パターンを知ることと、使うことは別です。

次の順番で考えてください。

```text
① 本当に問題があるか
      ↓
② 何が変化しているか
      ↓
③ どの責務が混ざっているか
      ↓
④ 最も単純な分離方法は何か
      ↓
⑤ 既知のパターンに一致するか
```

逆に、

```text
Strategyを使いたい
      ↓
Strategyを入れられる場所を探す
```

という考え方は危険です。

---

# 「if文がある＝Strategy」ではない

たとえば、

```python
if age >= 18:
    return "adult"

return "child"
```

この程度の分岐を、

```python
class AdultStrategy:
    ...
```

へ分割する必要はありません。

重要なのはコード量ではなく、

> **独立して変化する理由が存在するか**

です。

---

# デザインパターンとリファクタリング

代表的な兆候を覚えておきましょう。

## Long Method

↓

Extract Method

---

## Large Class

↓

Extract Class

---

## Switch Statements

↓

Strategy / State / Polymorphism

---

## Feature Envy

↓

Move Method

---

## Primitive Obsession

↓

Value Object

---

## Duplicate Code

↓

Template Method / Function Extraction

ただし、この対応も機械的に適用してはいけません。

---

# テストとの関係

良い設計はテストしやすいことが多いです。

例：

```python
class UserService:

    def __init__(self, repository):
        self.repository = repository
```

テスト：

```python
class FakeRepository:

    def __init__(self):
        self.users = []

    def save(self, user):
        self.users.append(user)
```

```python
repo = FakeRepository()

service = UserService(repo)

service.register("Alice")

assert len(repo.users) == 1
```

Dependency InjectionとRepositoryによってDB不要でテストできます。

---

# Pythonで重要な優先順位

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

---

# 演習問題

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

---

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

---

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

---

## 問題4

注文確定後、

- メール送信
- 在庫更新
- ポイント付与
- Analytics送信
- 倉庫通知

を実行します。

OrderServiceからこれらを分離する方法を考えてください。

---

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

---

# 解答・解説

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

---

# 問題2

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

---

# 問題3

Adapterです。

```python
class StripeAdapter:

    def pay(self, amount):
        stripe.charge(amount)
```

外部ライブラリへの依存を境界に閉じ込めます。

---

# 問題4

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

---

# 問題5

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

---

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

---

# 最終章
# デザインパターンの本当の目的

デザインパターンを学習すると、

```text
Factory
Strategy
Observer
Adapter
Decorator
...
```

という単語が増えていきます。

しかし最終的には、パターン名を意識しなくなることが理想です。

コードを見て、

> この部分はアルゴリズムの変化だ。

> この部分は外部API依存だ。

> この部分は状態遷移だ。

> この部分は生成責務だ。

> この部分は横断的関心事だ。

と考えられるようになる。

すると自然に、

```text
アルゴリズムを分離する
→ Strategy

外部APIを包む
→ Adapter

生成を分離する
→ Factory

通知を疎結合にする
→ Observer

状態をオブジェクト化する
→ State
```

という設計へたどり着きます。

つまり、デザインパターンの本質は、

> **パターンをコードに適用することではなく、ソフトウェアの「変化の構造」を見抜くこと**

です。

---

# 学習ロードマップ

最初に優先して習得するなら、次の順番を推奨します。

```text
1. SOLID
2. Dependency Injection
3. Strategy
4. Factory
5. Adapter
6. Decorator
7. Observer
8. State
9. Command
10. Repository
11. Service Layer
12. Domain Events
13. Hexagonal Architecture
14. Clean Architecture
```

その後、

```text
Composite
Bridge
Proxy
Mediator
Visitor
Unit of Work
Specification
CQRS
Event Sourcing
```

へ進みます。

特にPythonでは、

```text
デザインパターン
        ×
Python言語機能
        ×
リファクタリング
        ×
アーキテクチャ
```

を一体として理解することが重要です。

これによって、

> 「GoFの23パターンを知っている」

という段階から、

> **コードを見て、変化・責務・依存関係を分析し、適切な構造へ設計し直せる**

という実践的な設計能力へ進むことができます。