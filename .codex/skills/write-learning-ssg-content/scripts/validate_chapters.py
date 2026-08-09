#!/usr/bin/env python3
"""Validate learning-ssg chapter Markdown structure and quiz extraction syntax."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


FRONTMATTER_RE = re.compile(r"\A---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)\Z")
STANDARD_QUIZ_RE = re.compile(
    r"### 章末問題\d*\s*\n\n(.*?)\n\n### 解答・解説\d*\s*\n\n(.*?)(?=\n# |\n### |\Z)",
    re.S,
)
SPECIAL_QUIZ_RE = re.compile(
    r"### 問題([A-H])\s*\n\n(.*?)\n\n### 解答・解説\1\s*\n\n(.*?)(?=\n## |\n# |\n### |\Z)",
    re.S,
)
IMAGE_RE = re.compile(r"!\[([^\]]*)\]\(([^\s)]+)(?:\s+[^)]*)?\)")


def parse_frontmatter(block: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for line in block.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        values[key.strip()] = value.strip().strip('"\'')
    return values


def collect_files(targets: list[str]) -> list[Path]:
    files: set[Path] = set()
    for raw_target in targets:
        target = Path(raw_target)
        if target.is_dir():
            files.update(target.glob("*.md"))
        elif target.is_file() and target.suffix.lower() == ".md":
            files.add(target)
        else:
            print(f"ERROR {target}: Markdown file or course directory not found")
    return sorted(files)


def validate_standard_quiz(path: Path, body: str, errors: list[str]) -> None:
    has_question_heading = bool(re.search(r"^### 章末問題", body, re.M))
    has_answer_heading = bool(re.search(r"^### 解答・解説\d*\s*$", body, re.M))
    match = STANDARD_QUIZ_RE.search(body)
    if (has_question_heading or has_answer_heading) and not match:
        errors.append(f"{path}: standard quiz headings exist but the extractor cannot parse the block")
        return
    if not match:
        return

    question_numbers: list[str] = []
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        question = re.match(r"^(\d+)\.\s*［(3級|2級)］\s*(.+)$", line)
        if not question:
            errors.append(f"{path}: unparseable standard quiz question: {line}")
        else:
            question_numbers.append(question.group(1))

    answer_numbers: list[str] = []
    for line in match.group(2).splitlines():
        if not line.strip():
            continue
        answer = re.match(r"^(\d+)\.\s*(.+)$", line)
        if not answer:
            errors.append(f"{path}: unparseable standard quiz answer: {line}")
        else:
            answer_numbers.append(answer.group(1))

    if question_numbers != answer_numbers:
        errors.append(
            f"{path}: standard quiz question numbers {question_numbers} do not match answers {answer_numbers}"
        )


def validate_special_quizzes(path: Path, metadata: dict[str, str], body: str, errors: list[str]) -> None:
    special_headings = re.findall(r"^### 問題([A-H])\s*$", body, re.M)
    matches = list(SPECIAL_QUIZ_RE.finditer(body))
    if special_headings and metadata.get("id") != "ch11":
        errors.append(f"{path}: A-H special quiz syntax is only extracted for chapter id ch11")
    if len(matches) != len(special_headings):
        errors.append(f"{path}: one or more A-H quiz sections cannot be parsed by the extractor")

    for match in matches:
        letter = match.group(1)
        question_numbers: list[str] = []
        for line in match.group(2).splitlines():
            if not line.strip():
                continue
            question = re.match(
                rf"^(\d+)\.\s*\*\*{letter}(\d+)［(3級|2級)・(.+?)］\*\*\s*(.+)$", line
            )
            if not question:
                errors.append(f"{path}: unparseable special quiz question: {line}")
            else:
                question_numbers.append(question.group(2))

        answer_numbers: list[str] = []
        for line in match.group(3).splitlines():
            if not line.strip():
                continue
            answer = re.match(r"^(\d+)\.\s*(.+)$", line)
            if not answer:
                errors.append(f"{path}: unparseable special quiz answer: {line}")
            else:
                answer_numbers.append(answer.group(1))

        if question_numbers != answer_numbers:
            errors.append(
                f"{path}: special quiz {letter} numbers {question_numbers} do not match answers {answer_numbers}"
            )


def validate_file(path: Path, seen_ids: dict[str, Path], errors: list[str], warnings: list[str]) -> None:
    content = path.read_text(encoding="utf-8")
    frontmatter = FRONTMATTER_RE.match(content)
    if not frontmatter:
        errors.append(f"{path}: missing or malformed frontmatter at the start of the file")
        return

    metadata = parse_frontmatter(frontmatter.group(1))
    body = frontmatter.group(2)
    for field in ("id", "number", "title", "summary"):
        if not metadata.get(field):
            errors.append(f"{path}: missing frontmatter field '{field}'")

    chapter_id = metadata.get("id")
    if chapter_id:
        if not re.fullmatch(r"[A-Za-z0-9_-]+", chapter_id):
            errors.append(f"{path}: id must contain only letters, numbers, underscores, or hyphens")
        elif chapter_id in seen_ids:
            errors.append(f"{path}: duplicate id '{chapter_id}' also used by {seen_ids[chapter_id]}")
        else:
            seen_ids[chapter_id] = path

    if metadata.get("number") and not re.fullmatch(r"-?\d+(?:\.\d+)?", metadata["number"]):
        errors.append(f"{path}: number must be numeric")

    h1 = re.search(r"^#\s+(.+)$", body, re.M)
    if not h1:
        errors.append(f"{path}: missing level-one chapter heading")
    elif metadata.get("title") and re.sub(r"[\s　]+", "", h1.group(1)) != re.sub(
        r"[\s　]+", "", metadata["title"]
    ):
        warnings.append(f"{path}: H1 and frontmatter title differ")

    if not re.search(r"^##\s+", body, re.M):
        warnings.append(f"{path}: no level-two sections; the table of contents will be empty")

    for alt, source in IMAGE_RE.findall(body):
        if not alt.strip():
            warnings.append(f"{path}: image '{source}' has empty alt text")
        if source.startswith(("http://", "https://", "/", "data:")):
            continue
        expected = path.parent / source
        if not expected.exists():
            errors.append(f"{path}: image not found at {expected}")

    validate_standard_quiz(path, body, errors)
    validate_special_quizzes(path, metadata, body, errors)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("targets", nargs="+", help="Chapter Markdown file(s) or one course directory")
    args = parser.parse_args()

    files = collect_files(args.targets)
    if not files:
        print("No chapter Markdown files found.")
        return 1

    errors: list[str] = []
    warnings: list[str] = []
    seen_ids: dict[str, Path] = {}
    for path in files:
        validate_file(path, seen_ids, errors, warnings)

    for warning in warnings:
        print(f"WARNING {warning}")
    for error in errors:
        print(f"ERROR {error}")

    if errors:
        print(f"Validation failed: {len(errors)} error(s), {len(warnings)} warning(s), {len(files)} file(s).")
        return 1
    print(f"Validation passed: {len(files)} file(s), {len(warnings)} warning(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

