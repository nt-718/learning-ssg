---
id: "ch28"
number: 28
title: "第28章 Template Method"
summary: "アルゴリズムの骨格を基底クラスで決めます。"
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
