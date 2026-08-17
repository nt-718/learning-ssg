#!/usr/bin/env node

/** Split the supplied category-theory companion into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const expectedSourceName = '『プログラマーのための圏論』完全副読本・改訂版.md';
const sourceName = fs.readdirSync(rootDir)
  .find(name => name.normalize('NFC') === expectedSourceName.normalize('NFC'));
if (!sourceName) throw new Error(`Source manuscript not found: ${expectedSourceName}`);
const sourcePath = path.join(rootDir, sourceName);
const courseDir = path.join(rootDir, 'courses', 'programming', 'category_theory_for_programmers');

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
    .find(line => line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('\\[') && !line.startsWith('>') && !line.startsWith('-') && line !== '---');
  return (paragraph || fallback).replaceAll('**', '').replaceAll('`', '').slice(0, 90);
}

function normalizeBody(rawBody) {
  let fenceMarker = null;
  return rawBody
    .split('\n')
    .map(line => {
      const fence = line.match(/^\s*(`{3,}|~{3,})/)?.[1] || null;
      if (fence) {
        if (!fenceMarker) {
          fenceMarker = fence;
        } else if (fence[0] === fenceMarker[0] && fence.length >= fenceMarker.length) {
          fenceMarker = null;
        }
        return line;
      }
      if (fenceMarker) return line;
      if (line.startsWith('# ')) return `## ${line.slice(2)}`;
      return line;
    })
    .join('\n')
    .replace(/^---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chapterCategory(number) {
  if (number <= 6) return '圏論の基礎言語';
  if (number <= 10) return '関手と自然変換';
  if (number <= 16) return '普遍性・表現・米田';
  if (number <= 23) return '随伴・モナド';
  return '再帰・高度な普遍構成';
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const chapterMatches = [...source.matchAll(/^# 第(\d+)章[　 ]*(.+)$/gm)];
const chapterNumbers = chapterMatches.map(match => Number(match[1]));
if (chapterMatches.length !== 31 || new Set(chapterNumbers).size !== 31) {
  throw new Error(`Expected 31 unique chapters, found ${chapterMatches.length}`);
}
for (let number = 1; number <= 31; number += 1) {
  if (!chapterNumbers.includes(number)) throw new Error(`Chapter ${number} is missing`);
}

const supplementalSpecs = [
  ['最終統合：31章を一本につなぐ', '最終統合 31章を一本につなぐ', '圏・関手・米田・随伴・モナド・F-代数を一つの流れとして整理する'],
  ['必ず理解したい30語', '必ず理解したい30語', '圏論を理解するための基礎語彙から高度な普遍構成までを確認する'],
  ['典型的な誤解集', '典型的な誤解集', '圏論、関手、自然変換、米田、モナドなどの誤解を修正する'],
  ['学習用総合演習', '学習用総合演習', '15の総合問題と4つのHaskell実践課題で理解を確かめる'],
  ['3周学習法', '3周学習法', '構造、コードと定義、数式の順に理解を深める学習計画'],
  ['数式翻訳トレーニング', '数式翻訳トレーニング', '圏論の主要な式を日本語へ翻訳して意味を定着させる'],
  ['圏論を理解できたか判定する基準', '理解度判定基準', '基礎から高度な普遍構成まで5段階で理解度を確認する'],
  ['「わからなくなったとき」の戻り先', 'わからなくなったときの戻り先', '概念ごとに復習すべき章と中心となる問いを確認する'],
  ['圏論と実務プログラミング', '圏論と実務プログラミング', '合成可能性、法則、インターフェース、計算効果を実務へつなげる'],
  ['最重要理解事項', '最重要理解事項', '圏論の学習後に自分の言葉で説明したい7つの原則'],
  ['最後の概念地図', '最後の概念地図', '本書で扱った概念間の関係を一枚の地図として統合する'],
  ['結論', '結論', '複雑なシステムを合成可能な構造として捉えるための総括']
];
const supplementalMatches = supplementalSpecs.map(([heading, title, summary]) => {
  const marker = `# ${heading}`;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Supplemental heading is missing: ${heading}`);
  return { heading, title, summary, index, marker };
});
supplementalMatches.forEach((match, index) => {
  if (index > 0 && match.index <= supplementalMatches[index - 1].index) {
    throw new Error(`Supplemental headings are out of order near ${match.heading}`);
  }
});

const introStart = source.indexOf('# 0. この副読本の使い方');
if (introStart < 0 || introStart >= chapterMatches[0].index) {
  throw new Error('Course guide boundary is missing');
}
const introTitle = 'はじめに';
const introSummary = '副読本の使い方、全31章の学習地図、最低限の数学記法を確認する';
const introBody = normalizeBody(source.slice(introStart, chapterMatches[0].index));
const segments = [{
  id: 'intro',
  number: 0,
  file: '00_guide.md',
  title: introTitle,
  summary: introSummary,
  content: `${frontmatter({ id: 'intro', number: 0, title: introTitle, summary: introSummary })}# ${introTitle}\n\n${introBody}\n`
}];

chapterMatches.forEach((match, index) => {
  const number = Number(match[1]);
  const nextChapter = chapterMatches[index + 1]?.index ?? supplementalMatches[0].index;
  const end = number === 31 ? supplementalMatches[0].index : nextChapter;
  const rawBody = source.slice(match.index + match[0].length, end);
  const titleText = match[2].trim();
  const title = `第${number}章 ${titleText}`;
  const summary = extractSummary(rawBody, `${titleText}の定義、直観、プログラミングとの接続を学ぶ`);
  const body = normalizeBody(rawBody);
  const id = `ch${String(number).padStart(2, '0')}`;
  segments.push({
    id,
    number,
    file: `${String(number).padStart(2, '0')}_chapter_${String(number).padStart(2, '0')}.md`,
    title,
    summary,
    content: `${frontmatter({ id, number, title, summary })}# ${title}\n\n${/^## /m.test(body) ? body : `## 概要\n\n${body}`}\n`
  });
});

supplementalMatches.forEach((match, index) => {
  const number = 32 + index;
  const end = supplementalMatches[index + 1]?.index ?? source.length;
  const rawBody = source.slice(match.index + match.marker.length, end);
  const body = normalizeBody(rawBody);
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

if (segments.length !== 44) throw new Error(`Expected 44 course files, found ${segments.length}`);

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
  `id = "category_theory_for_programmers"\n` +
  `title = "プログラマーのための圏論 完全副読本・改訂版"\n` +
  `subtitle = "合成・型・関手・米田・随伴・モナドを一本につなぐ"\n` +
  `description = "圏論の基礎から米田、随伴、モナド、高度な普遍構成までをプログラミングと結びつけて学ぶ副読本"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = false\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);
segments.forEach(segment => fs.writeFileSync(path.join(courseDir, segment.file), segment.content));

console.log(`Imported ${segments.length} course files from ${sourceName} into ${path.relative(rootDir, courseDir)}`);
