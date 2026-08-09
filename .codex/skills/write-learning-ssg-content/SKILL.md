---
name: write-learning-ssg-content
description: Create, edit, review, or validate course Markdown for the learning-ssg application. Use when Codex is asked to add a chapter, write learning material, revise course content, add chapter-end quizzes, insert diagrams or tables, create a course Markdown file, or fix Markdown that is not rendered or extracted correctly under courses/**. Trigger for requests mentioning this app's教材、章、講座、演習問題、章末問題、course Markdown、or chapter files within the courses directory.
---

# Write Learning SSG Content

Create accurate, readable course chapters that conform to this repository's parser and UI.

## Workflow

1. Inspect `course.toml`, neighboring chapter files, and the target course directory before writing. Preserve the course's language, heading numbering, terminology, depth, and filename convention.
2. Read [references/format-reference.md](references/format-reference.md) before creating or structurally editing a chapter. Follow its exact frontmatter and quiz syntax.
3. For a new standard chapter, copy [assets/chapter-template.md](assets/chapter-template.md) into the course directory and replace every placeholder. Do not leave template markers behind.
4. Research claims when the requested content depends on current facts. Prefer primary or authoritative sources. State the applicable date in the chapter when laws, exams, prices, product rules, or other time-sensitive facts are material.
5. Organize the chapter for mobile reading:
   - Use one `#` title matching the frontmatter title.
   - Split the body into focused `##` sections.
   - Prefer short paragraphs, compact tables, concrete examples, and explicit calculation steps.
   - Use blockquotes for key points and Markdown images for diagrams.
   - Avoid raw HTML unless the existing renderer requires it.
6. Add chapter-end questions only when requested or consistent with neighboring chapters. Keep every question and answer on one physical line so the SSG extractor can parse it.
7. Run the bundled validator on every created or changed chapter:

   ```sh
   python3 .codex/skills/write-learning-ssg-content/scripts/validate_chapters.py courses/<category>/<course>
   ```

8. Run `npm run build` after validation. Inspect generated `src/data/coursesData.js` when quiz extraction or chapter ordering changed.
9. Review the diff for factual consistency, duplicate chapter IDs, missing images, accidental generated-file churn, and unintended edits outside the target course.

## Editing Rules

- Preserve user-authored content outside the requested scope.
- Make `id` unique within the course and `number` reflect navigation order.
- Keep local image paths relative to the built app, normally `images/<filename>`; store the source asset in the course's `images/` directory.
- Treat the standard chapter-end format and the FP-specific chapter 11 format as different grammars. Do not invent variations.
- Do not claim that visually rendered questions automatically enter quiz mode. Only the exact extractor formats documented in the reference are imported.
- When source accuracy cannot be established, flag the uncertainty instead of fabricating specifics.
