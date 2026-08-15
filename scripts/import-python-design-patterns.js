#!/usr/bin/env node

/** Split the supplied Python design-pattern manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(rootDir, 'Pythonで学ぶデザインパターン — 設計原則からGoF・Pythonic設計・アーキテクチャまで.md');
const courseDir = path.join(rootDir, 'courses', 'programming', 'python_design_patterns');

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function frontmatter({ id, number, title, summary }) {
  return `---\nid: ${quote(id)}\nnumber: ${number}\ntitle: ${quote(title)}\nsummary: ${quote(summary)}\n---\n\n`;
}

function extractSummary(body, fallback) {
  const paragraph = body
    .split('\n')
    .map(line => line.trim())
    .find(line => line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('>') && !line.startsWith('-') && line !== '---');
  return (paragraph || fallback).replaceAll('**', '').replaceAll('`', '').slice(0, 90);
}

function normalizeHeadings(rawBody) {
  let inFence = false;
  return rawBody
    .split('\n')
    .map(line => {
      if (/^```/.test(line.trim())) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      if (/^# 第[IVX]+部/.test(line)) return '';
      if (line.startsWith('# ')) return `## ${line.slice(2)}`;
      return line;
    })
    .join('\n')
    .replace(/^---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chapterCategory(number) {
  if (number <= 6) return '設計の基礎';
  if (number <= 11) return '生成パターン';
  if (number <= 18) return '構造パターン';
  if (number <= 29) return '振る舞いパターン';
  if (number <= 41) return 'Pythonic設計';
  if (number <= 50) return 'アプリケーション設計';
  if (number <= 58) return 'アーキテクチャ';
  return '設計力を鍛える';
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const chapterMatches = [...source.matchAll(/^# 第(\d+)章[　 ]*(.+)$/gm)];
if (chapterMatches.length !== 64 || new Set(chapterMatches.map(match => Number(match[1]))).size !== 64) {
  throw new Error(`Expected 64 unique chapters, found ${chapterMatches.length}`);
}

const supplementalSpecs = [
  ['パターン比較', 'パターン比較', '似ているパターンの意図と使い分け'],
  ['デザインパターンを読むための共通テンプレート', 'パターン読解テンプレート', 'Problem・Forces・Intent・Structure・Consequencesでパターンを読む'],
  ['デザインパターンを使う判断基準', 'パターンを使う判断基準', '変化、複雑性、テスト容易性から導入を判断する'],
  ['「if文がある＝Strategy」ではない', 'Strategyを選ぶ前に', '条件分岐と交換可能なアルゴリズムの違いを見極める'],
  ['デザインパターンとリファクタリング', 'パターンとリファクタリング', 'コードの兆候から適切な設計改善を考える'],
  ['テストとの関係', 'デザインパターンとテスト', '依存の分離とテスト容易性の関係を理解する'],
  ['Pythonで重要な優先順位', 'Pythonでの設計優先順位', '可読性、単純さ、標準機能を優先して設計する'],
  ['演習問題', '演習問題と解答', '設計上の問題を分析し、適切なパターンを選ぶ'],
  ['総合演習', '総合演習', '注文処理システムの要件から設計を組み立てる'],
  ['最終章', '最終章 デザインパターンの本当の目的', '変化を局所化し、理解しやすいコードを作るための総括'],
  ['学習ロードマップ', '学習ロードマップ', '基礎からアーキテクチャまで段階的に復習する']
];
const supplementalMatches = supplementalSpecs.map(([heading, title, summary]) => {
  const match = new RegExp(`^# ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').exec(source);
  if (!match) throw new Error(`Supplemental heading is missing: ${heading}`);
  return { heading, title, summary, index: match.index, headingText: match[0] };
});

const firstPart = source.indexOf('# 第I部');
if (firstPart < 0) throw new Error('Part I heading is missing');
const introStart = source.indexOf('# はじめに');
const introRaw = source.slice(introStart, firstPart)
  .replace(/^# はじめに\s*/, '')
  .replace(/^# 本書の構成\s*$/m, '## 本書の構成');
const introTitle = 'はじめに';
const introSummary = '設計上の問題、責務の分割、変化の局所化を軸にデザインパターンを学ぶ';
const segments = [{
  id: 'intro', number: 0, file: '00_guide.md', title: introTitle, summary: introSummary,
  content: `${frontmatter({ id: 'intro', number: 0, title: introTitle, summary: introSummary })}# ${introTitle}\n\n## 本書の目的\n\n${normalizeHeadings(introRaw)}\n`
}];

chapterMatches.forEach((match, index) => {
  const number = Number(match[1]);
  const titleText = match[2].trim();
  const nextChapter = chapterMatches[index + 1]?.index ?? supplementalMatches[0].index;
  const end = number === 64 ? supplementalMatches[0].index : nextChapter;
  const rawBody = source.slice(match.index + match[0].length, end);
  const title = `第${number}章 ${titleText}`;
  const summary = extractSummary(rawBody, `${titleText}の目的、構造、Pythonでの実装を学ぶ`);
  const body = normalizeHeadings(rawBody);
  segments.push({
    id: `ch${String(number).padStart(2, '0')}`,
    number,
    file: `${String(number).padStart(2, '0')}_chapter_${String(number).padStart(2, '0')}.md`,
    title,
    summary,
    content: `${frontmatter({ id: `ch${String(number).padStart(2, '0')}`, number, title, summary })}# ${title}\n\n${/^## /m.test(body) ? body : `## 概要\n\n${body}`}\n`
  });
});

supplementalMatches.forEach((match, index) => {
  const number = 65 + index;
  const end = supplementalMatches[index + 1]?.index ?? source.length;
  const rawBody = source.slice(match.index + match.headingText.length, end);
  const body = normalizeHeadings(rawBody);
  const id = `supplement${String(index + 1).padStart(2, '0')}`;
  segments.push({
    id,
    number,
    file: `${String(number).padStart(2, '0')}_${id}.md`,
    title: match.title,
    summary: match.summary,
    content: `${frontmatter({ id, number, title: match.title, summary: match.summary })}# ${match.title}\n\n${/^## /m.test(body) ? body : `## 概要\n\n${body}`}\n`
  });
});

if (segments.length !== 76) throw new Error(`Expected 76 course files, found ${segments.length}`);

fs.mkdirSync(courseDir, { recursive: true });
const categoryLines = [
  'intro = "ガイド"',
  ...chapterMatches.map(match => {
    const number = Number(match[1]);
    return `ch${String(number).padStart(2, '0')} = ${quote(chapterCategory(number))}`;
  }),
  ...supplementalMatches.map((_, index) => `supplement${String(index + 1).padStart(2, '0')} = "演習・資料"`)
];
fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "python_design_patterns"\n` +
  `title = "Pythonで学ぶデザインパターン"\n` +
  `subtitle = "設計原則からGoF・Pythonic設計・アーキテクチャまで"\n` +
  `description = "設計上の問題と変化を軸に、64の章と演習でPythonの設計を体系的に学ぶ教材"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = false\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);
segments.forEach(segment => fs.writeFileSync(path.join(courseDir, segment.file), segment.content));

console.log(`Imported ${segments.length} course files into ${path.relative(rootDir, courseDir)}`);
