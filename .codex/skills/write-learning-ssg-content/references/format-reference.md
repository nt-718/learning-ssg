# Learning SSG Markdown format

## Contents

- Chapter location and naming
- Frontmatter
- Body elements
- Alert blockquotes
- Images
- Standard chapter-end quiz
- FP chapter 11 quiz
- Parsing constraints
- Completion checklist

## Chapter location and naming

Place chapter files directly under:

```text
courses/<category>/<course>/<NN>_<descriptive_name>.md
```

Inspect neighboring files and follow their naming pattern. The SSG reads every `.md` file in lexical filename order, then sorts the parsed chapters by frontmatter `number`.

## Frontmatter

Begin the file at byte 1 with this exact shape:

```yaml
---
id: "ch01"
number: 1
title: "第1章 章タイトル"
summary: "章の内容を短く表す説明"
---
```

Fields:

| Field | Purpose | Requirement |
|---|---|---|
| `id` | Navigation and quiz linkage | Unique within the course; use `intro`, `ch01`, `ch02`, etc. |
| `number` | Chapter ordering | Numeric; introduction normally uses `0` |
| `title` | Chapter banner and navigation | Keep consistent with the body H1 |
| `summary` | Chapter banner summary | One concise line |

The frontmatter parser supports only simple `key: value` lines, quoted strings, numeric values, and one-line arrays. Do not use multiline YAML values or nested YAML.

## Body elements

The viewer uses GitHub-Flavored Markdown with hard line breaks enabled. Use standard Markdown:

```markdown
# 第1章　章タイトル

## 1-1　最初の論点

短い導入段落。

### 補足項目

1. 手順1
2. 手順2

| 項目 | 内容 |
|---|---|
| A | 説明 |

**重要語句**を強調する。
```

Every `##` heading becomes a section entry in the table of contents. Use descriptive, unique headings and avoid `##` for decorative text.

## Alert blockquotes

Single-paragraph blockquotes are converted into alert boxes. The contained keywords choose the style:

```markdown
> 【重要】最優先で理解する内容。

> 【試験の軸】判断するときの中心原則。

> 【覚え方】短く再現できる記憶法。

> 【テクニック】問題を解く手順。

> 通常の補足ポイント。
```

- `重要` or `試験の軸`: important alert
- `覚え方` or `テクニック`: tip alert
- Anything else: information alert

Keep an alert to one blockquote paragraph. Complex multi-paragraph blockquotes are not transformed by the current replacement logic.

## Images

Use ordinary image Markdown:

```markdown
![図1-1 図の内容を説明する代替テキスト](images/ch01_example.svg)
```

Put the source file in the same course's `images/` directory. During build, course images are copied into `public/images`, so chapter Markdown normally references `images/<filename>` rather than a path relative to the Markdown file's filesystem location. Write meaningful alt text; it is also displayed as the image caption.

## Standard chapter-end quiz

The standard extractor recognizes one paired block per chapter. Preserve the heading text, blank lines, full-width brackets, levels, numbering, and one-line entries exactly:

```markdown
### 章末問題1

1. ［3級］問題文を一行で記述する。
2. ［2級］問題文を一行で記述する。

### 解答・解説1

1. 解答。根拠や計算過程を一行で記述する。
2. 解答。誤りやすい点も一行で説明する。
```

The numeric suffix may be omitted, but matching chapter numbers are clearer. Only `3級` and `2級` are accepted as levels. Each answer number must match its question number. Questions that wrap onto a second physical line or use `-` bullets are displayed in the chapter but are not extracted into quiz mode.

The Markdown block remains the source of truth, but a successful SSG build removes this standard quiz block from the rendered chapter body and publishes it in the practice view. Do not delete the answers from the source chapter after extraction.

## FP chapter 11 quiz

This is a hardcoded special format only for `ch11` in the Financial Planner content. Sections must use letters `A` through `H`, which map to fixed categories in `scripts/ssg.js`.

```markdown
## 11-1　分野名

### 問題A

1. **A1［3級・正誤］** 問題文を一行で記述する。
2. **A2［2級・計算］** 問題文を一行で記述する。

### 解答・解説A

1. **誤り。** 解説を一行で記述する。
2. **答え。** 計算過程を一行で記述する。
```

Do not use this grammar for ordinary chapters or other courses without first updating the SSG parser.

## Parsing constraints

- The first Markdown H1 becomes a fallback title when frontmatter `title` is absent, but always provide `title`.
- Section navigation is generated only from `##` headings.
- The standard quiz regex stops at the next H1 or H3. Keep the question and answer blocks contiguous.
- Successfully extracted standard chapter-end blocks do not appear in the rendered chapter content; they appear only in practice mode.
- The parser is line-oriented. Keep each quiz question and answer on a single physical line.
- Quiz answers are used for both `answer` and `explanation`; include enough reasoning to teach, not only the final value.
- The special chapter 11 category names and letters are fixed in code.
- Markdown is embedded into generated JavaScript during `npm run build`; do not hand-edit generated data as the source of truth.

## Completion checklist

- Frontmatter has `id`, numeric `number`, `title`, and `summary`.
- H1 agrees with `title`; `##` headings form a useful table of contents.
- Claims, dates, units, formulas, and examples are verified.
- Tables remain readable on a narrow screen.
- Every image exists and has useful alt text.
- Every extracted quiz question has a same-number answer.
- The bundled validator passes.
- `npm run build` passes and quiz counts change as expected.
