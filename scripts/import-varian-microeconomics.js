#!/usr/bin/env node

/** Split the supplied Varian microeconomics manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'varian_microeconomics_study_guide.md');
const categoryDir = path.join(rootDir, 'courses', 'social_sciences');
const courseDir = path.join(categoryDir, 'varian_microeconomics');

const appendixDefinitions = {
  '付録A': { id: 'overview', number: 39, file: '39_overview.md', summary: '全38章の位置づけと共通する分析構造' },
  '付録B': { id: 'formulas', number: 40, file: '40_formulas.md', summary: '消費者・生産者・市場構造・厚生の重要公式' },
  '付録C': { id: 'solution_steps', number: 41, file: '41_solution_steps.md', summary: '最適化、政策分析、ゲーム理論の標準解法' },
  '付録D': { id: 'comprehensive', number: 42, file: '42_comprehensive.md', summary: '消費者理論から情報の経済学までの総合演習' },
  '付録E': { id: 'study_plan', number: 43, file: '43_study_plan.md', summary: '全38章を学ぶ12週間の学習計画' },
  '付録F': { id: 'common_confusions', number: 44, file: '44_common_confusions.md', summary: '頻出する概念・公式・政策効果の混同を整理', sectionTitle: '混同しやすい概念一覧' },
  'おわりに': { id: 'closing', number: 45, file: '45_closing.md', summary: 'ミクロ経済学の考え方を再構成する最終確認' }
};

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function chapterGroup(number) {
  if (number <= 8) return '市場・消費者行動';
  if (number <= 18) return '資産・不確実性・市場需要';
  if (number <= 31) return '企業行動・市場構造';
  return '一般均衡・市場の失敗・情報';
}

function makeFrontmatter(segment) {
  return `---\nid: ${quote(segment.id)}\nnumber: ${segment.number}\ntitle: ${quote(segment.title)}\nsummary: ${quote(segment.summary)}\n---\n\n# ${segment.title}\n\n`;
}

function convertBody(rawBody, segment) {
  let inQuestions = false;
  const lines = rawBody
    .split('\n')
    .slice(1)
    .filter(line => !/^# 第(?:I|II|III|IV)部　/.test(line) && line.trim() !== '---')
    .map(line => {
      if (segment.kind === 'chapter' && line === '### 章末問題') {
        inQuestions = true;
        return `### 章末問題${segment.chapterNumber}`;
      }
      if (segment.kind === 'chapter' && line === '<details><summary>解答・解説</summary>') {
        inQuestions = false;
        return `### 解答・解説${segment.chapterNumber}`;
      }
      if (segment.kind === 'chapter' && line === '</details>') return '';
      if (segment.kind === 'chapter' && inQuestions && /^\d+\.\s+/.test(line)) {
        return line.replace(/^(\d+\.\s+)/, '$1［基礎］');
      }
      if (segment.kind === 'chapter' && line.startsWith('#### ')) return `### ${line.slice(5)}`;
      if (segment.kind === 'chapter' && line.startsWith('### ')) return `## ${line.slice(4)}`;
      return line;
    });

  while (lines[0]?.trim() === '') lines.shift();
  while (lines.at(-1)?.trim() === '') lines.pop();
  const sectionHeading = segment.sectionTitle ? `## ${segment.sectionTitle}\n\n` : '';
  return makeFrontmatter(segment) + `${sectionHeading}${lines.join('\n')}\n`;
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source manuscript not found: ${sourcePath}`);
}

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const segments = [{
  kind: 'guide',
  index: 0,
  id: 'intro',
  number: 0,
  file: '00_guide.md',
  title: 'はじめに',
  summary: '全38章の見取り図、学習方法、前提となる数学と共通記号'
}];

for (const match of source.matchAll(/^## 第(\d+)章　(.+)$/gm)) {
  const chapterNumber = Number(match[1]);
  const chapterTitle = match[2].trim();
  const rawFromChapter = source.slice(match.index);
  const question = rawFromChapter.match(/### この章の問い\s*\n\n([^\n]+)/)?.[1]?.trim();
  segments.push({
    kind: 'chapter',
    index: match.index,
    id: `ch${String(chapterNumber).padStart(2, '0')}`,
    number: chapterNumber,
    chapterNumber,
    file: `${String(chapterNumber).padStart(2, '0')}_chapter_${String(chapterNumber).padStart(2, '0')}.md`,
    title: `第${chapterNumber}章 ${chapterTitle}`,
    summary: question || `${chapterTitle}の基本概念と分析方法`
  });
}

for (const match of source.matchAll(/^# (付録[A-F]|おわりに)(?:　(.+))?$/gm)) {
  const key = match[1];
  const definition = appendixDefinitions[key];
  segments.push({
    kind: 'appendix',
    index: match.index,
    ...definition,
    title: match[2] ? `${key} ${match[2].trim()}` : key
  });
}

segments.sort((a, b) => a.index - b.index);
if (segments.filter(segment => segment.kind === 'chapter').length !== 38) {
  throw new Error('Expected 38 chapter headings in the Varian manuscript');
}

fs.mkdirSync(courseDir, { recursive: true });
const categoryConfigPath = path.join(categoryDir, 'category.toml');
if (!fs.existsSync(categoryConfigPath)) {
  fs.mkdirSync(categoryDir, { recursive: true });
  fs.writeFileSync(categoryConfigPath, 'id = "social_sciences"\ntitle = "人文・社会科学"\norder = 20\ncolor = "#6b5ca5"\n');
}

const categoryLines = [
  'intro = "ガイド"',
  ...Array.from({ length: 38 }, (_, index) => {
    const chapterNumber = index + 1;
    return `ch${String(chapterNumber).padStart(2, '0')} = ${quote(chapterGroup(chapterNumber))}`;
  }),
  'overview = "付録"',
  'formulas = "付録"',
  'solution_steps = "付録"',
  'comprehensive = "付録"',
  'study_plan = "付録"',
  'common_confusions = "付録"',
  'closing = "付録"'
];

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "varian_microeconomics"\n` +
  `title = "入門ミクロ経済学［原著第9版］学習参考書"\n` +
  `subtitle = "ハル・R・ヴァリアン『入門ミクロ経済学』対応"\n` +
  `description = "市場・消費者・企業・一般均衡・情報を全38章で体系的に学ぶ副読本"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);

segments.forEach((segment, index) => {
  const end = segments[index + 1]?.index ?? source.length;
  fs.writeFileSync(path.join(courseDir, segment.file), convertBody(source.slice(segment.index, end), segment));
});

console.log(`Imported ${segments.length} chapters into ${path.relative(rootDir, courseDir)}`);
