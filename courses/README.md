# 教材ディレクトリ

教材のカテゴリーは管理画面ではなく、次のディレクトリ構成で管理します。

```text
courses/
  certifications/
    category.toml
    financial_planner/
      course.toml
      00_intro.md
      01_life_planning.md
      images/
    takken/
      course.toml
      00_intro.md
```

`category.toml`にはカテゴリーのID、表示名、並び順を設定します。

```toml
id = "certifications"
title = "資格試験"
order = 10
```

カテゴリーへ教材を追加する場合は、そのカテゴリーの下に教材ディレクトリを作り、`course.toml`と章ごとのMarkdownを配置します。

```sh
npm run new -- certifications/new_course "新しい教材"
npm run build
```

従来の`courses/<教材>/`形式も読み込み可能ですが、新規教材ではカテゴリー階層を使用してください。
