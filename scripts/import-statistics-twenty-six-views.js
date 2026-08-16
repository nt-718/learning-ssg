#!/usr/bin/env node

/** Split the supplied Statistics in Twenty-Six Views companion into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(rootDir, '『統計学二十六景』完全副読本.md');
const courseDir = path.join(rootDir, 'courses', 'social_sciences', 'statistics_twenty_six_views');

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
    .find(line => line && !line.startsWith('#') && !line.startsWith('\\[') && !line.startsWith('>') && !line.startsWith('-') && line !== '---');
  return (paragraph || fallback).replaceAll('**', '').replaceAll('`', '').slice(0, 90);
}

function normalizeBody(rawBody) {
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

function sceneId(first, second) {
  return second
    ? `ch${String(first).padStart(2, '0')}_${String(second).padStart(2, '0')}`
    : `ch${String(first).padStart(2, '0')}`;
}

function sceneCategory(first) {
  if (first <= 4) return '統計学を見る視点';
  if (first <= 9) return '統計的記述';
  if (first <= 14) return '確率・モデル';
  if (first <= 20) return '統計的推論';
  return '歴史・質・批判';
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const sceneMatches = [...source.matchAll(/^# 第(\d+)(?:・(\d+))?景[　 ]+(.+)$/gm)];
const coveredScenes = sceneMatches.flatMap(match => match[2]
  ? [Number(match[1]), Number(match[2])]
  : [Number(match[1])]);
if (sceneMatches.length !== 25 || coveredScenes.length !== 26 || new Set(coveredScenes).size !== 26) {
  throw new Error(`Expected 25 chapter headings covering 26 unique scenes, found ${sceneMatches.length} headings covering ${new Set(coveredScenes).size}`);
}
for (let number = 1; number <= 26; number += 1) {
  if (!coveredScenes.includes(number)) throw new Error(`Scene ${number} is missing`);
}

const supplementalSpecs = [
  ['統計学の最重要公式', '統計学の最重要公式', '期待値、分散、標準誤差、信頼区間、回帰、ベイズの公式集'],
  ['絶対に混同してはいけない12組', '混同してはいけない12組', 'SDとSE、相関と因果など重要な対概念を整理する'],
  ['統計を見る15の質問', '統計を見る15の質問', 'ニュース、論文、広告、社内レポートを批判的に読むチェックリスト'],
  ['学習の4層', '学習の4層', '直観・定義・導出・批判の4層で統計概念を理解する'],
  ['推奨復習順序', '推奨復習順序', 'データ、確率、推論、因果、批判へ進む段階別の復習計画'],
  ['最終理解度試験', '最終理解度試験', '統計学の重要概念50項目を自分の言葉で説明できるか確認する'],
  ['最後に――統計的に考えるとは何か', '最後に 統計的に考えるとは何か', '数字の生成過程と推論の論理を見るための学習の総括']
];
const supplementalMatches = supplementalSpecs.map(([heading, title, summary]) => {
  const marker = `# ${heading}`;
  const index = source.indexOf(marker);
  if (index < 0) throw new Error(`Supplemental heading is missing: ${heading}`);
  return { heading, title, summary, index, marker };
});

for (let index = 1; index < supplementalMatches.length; index += 1) {
  if (supplementalMatches[index].index <= supplementalMatches[index - 1].index) {
    throw new Error('Supplemental headings are out of order');
  }
}

const firstPart = source.indexOf('# 第I部');
const introStart = source.indexOf('# はじめに');
if (introStart < 0 || firstPart < 0 || firstPart <= introStart) {
  throw new Error('Introduction or Part I heading is missing');
}
const introTitle = 'はじめに';
const introSummary = '副読本の目的、三段階の到達目標、統計分析全体の地図を確認する';
const introBody = normalizeBody(source.slice(introStart + '# はじめに――統計学は「数字を計算する学問」ではない'.length, firstPart));
const segments = [{
  id: 'intro',
  number: 0,
  file: '00_guide.md',
  title: introTitle,
  summary: introSummary,
  content: `${frontmatter({ id: 'intro', number: 0, title: introTitle, summary: introSummary })}# ${introTitle}\n\n## 本書の目的\n\n${introBody}\n`
}];

sceneMatches.forEach((match, index) => {
  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : null;
  const sceneLabel = second ? `${first}・${second}` : String(first);
  const id = sceneId(first, second);
  const order = index + 1;
  const nextScene = sceneMatches[index + 1]?.index ?? supplementalMatches[0].index;
  const end = first === 26 ? supplementalMatches[0].index : nextScene;
  const rawBody = source.slice(match.index + match[0].length, end);
  const title = `第${sceneLabel}景 ${match[3].trim()}`;
  const summary = extractSummary(rawBody, `${match[3].trim()}の理論、直観、解釈を学ぶ`);
  const body = normalizeBody(rawBody);
  segments.push({
    id,
    number: order,
    file: `${String(order).padStart(2, '0')}_${id}.md`,
    title,
    summary,
    content: `${frontmatter({ id, number: order, title, summary })}# ${title}\n\n${/^## /m.test(body) ? body : `## 概要\n\n${body}`}\n`
  });
});

supplementalMatches.forEach((match, index) => {
  const number = 26 + index;
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

if (segments.length !== 33) throw new Error(`Expected 33 course files, found ${segments.length}`);

fs.mkdirSync(courseDir, { recursive: true });
const categoryLines = [
  'intro = "ガイド"',
  ...sceneMatches.map(match => {
    const first = Number(match[1]);
    const second = match[2] ? Number(match[2]) : null;
    return `${sceneId(first, second)} = ${quote(sceneCategory(first))}`;
  }),
  ...supplementalMatches.map((_, index) => `supplement${String(index + 1).padStart(2, '0')} = "演習・資料"`)
];
fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "statistics_twenty_six_views"\n` +
  `title = "『統計学二十六景』完全副読本"\n` +
  `subtitle = "視点・難問・矛盾から身につける統計的思考"\n` +
  `description = "二十六の景色から統計理論・解釈・批判的思考を体系的に学ぶ副読本"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = false\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);
segments.forEach(segment => fs.writeFileSync(path.join(courseDir, segment.file), segment.content));

console.log(`Imported ${segments.length} course files covering ${coveredScenes.length} scenes into ${path.relative(rootDir, courseDir)}`);
