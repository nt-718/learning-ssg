---
id: "ch62"
number: 62
title: "第62章 Pythonにおける過剰設計"
summary: "Pythonでは特に、"
---

# 第62章 Pythonにおける過剰設計

Pythonでは特に、

> Java的なデザインパターンをそのまま持ち込まない

ことが重要です。

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
