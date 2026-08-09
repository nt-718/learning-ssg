#!/usr/bin/env node

/** Split the supplied Saito et al. macroeconomics manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, '齊藤ほか_マクロ経済学新版_副読本.md');
const categoryDir = path.join(rootDir, 'courses', 'social_sciences');
const courseDir = path.join(categoryDir, 'saito_macroeconomics');

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function normalizeInline(value) {
  return value
    .replace(/^>\s?/, '')
    .replace(/^[-*]\s+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function listItems(block) {
  return [...block.matchAll(/^\d+\.\s+(.+)$/gm)].map(match => normalizeInline(match[1]));
}

function proseLines(block) {
  return block
    .split('\n')
    .filter(line => !/^\d+\.\s+/.test(line))
    .map(normalizeInline)
    .filter(line => line && line !== '---')
    .join(' ');
}

function chapterCategory(number) {
  if (number <= 4) return 'マクロ経済の計測';
  if (number <= 11) return '基本モデル';
  if (number <= 13) return '経済政策';
  return 'ミクロ的基礎・経済成長';
}

function frontmatter(segment) {
  return `---\nid: ${quote(segment.id)}\nnumber: ${segment.number}\ntitle: ${quote(segment.title)}\nsummary: ${quote(segment.summary)}\n---\n\n# ${segment.title}\n\n`;
}

function extractSummary(rawBody, title) {
  const goalStart = rawBody.indexOf('### 到達目標');
  if (goalStart >= 0) {
    const firstGoal = rawBody.slice(goalStart).match(/^- (.+)$/m)?.[1];
    if (firstGoal) return normalizeInline(firstGoal).slice(0, 90);
  }
  return `${title}の主要概念、理論、統計と政策への応用`;
}

function convertStandardBody(rawBody, segment) {
  let inQuestions = false;
  const lines = rawBody
    .split('\n')
    .slice(1)
    .filter(line => !/^# 第[1-4]部[^\n]*$/.test(line) && line.trim() !== '---')
    .map(line => {
      if (segment.kind === 'chapter' && line === '### 理解度確認問題') {
        inQuestions = true;
        return `### 章末問題${segment.chapterNumber}`;
      }
      if (segment.kind === 'chapter' && line === '### 解答・解説') {
        inQuestions = false;
        return `### 解答・解説${segment.chapterNumber}`;
      }
      if (segment.kind === 'chapter' && inQuestions && /^\d+\.\s+/.test(line)) {
        return line.replace(/^(\d+\.\s+)/, '$1［基礎］');
      }
      if (segment.kind === 'chapter' && line.startsWith('#### ')) return `### ${line.slice(5)}`;
      if (segment.kind === 'chapter' && line.startsWith('### ')) return `## ${line.slice(4)}`;
      return line;
    });

  while (lines[0]?.trim() === '') lines.shift();
  while (lines.at(-1)?.trim() === '') lines.pop();
  const body = lines.join('\n').trim();
  const sectionFallback = body.match(/^## /m) ? '' : `## ${segment.sectionTitle || '概要'}\n\n`;
  return `${frontmatter(segment)}${sectionFallback}${body}\n`;
}

function buildComprehensiveQuiz(rawBody, segment) {
  const body = rawBody.split('\n').slice(1).join('\n');
  const matches = [...body.matchAll(/^## 問題(\d+)　(.+)$/gm)];
  const questions = [];
  const answers = [];

  matches.forEach((match, index) => {
    const number = Number(match[1]);
    const title = match[2].trim();
    const problem = body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.length).trim();
    const answerHeading = /^### 解答(?:例)?\s*$/m.exec(problem);
    if (!answerHeading) throw new Error(`Comprehensive problem ${number}: answer heading is missing`);
    const questionBody = problem.slice(0, answerHeading.index).trim();
    const answerBody = problem.slice(answerHeading.index + answerHeading[0].length).replace(/^---\s*$/gm, '').trim();
    const questionItems = listItems(questionBody);
    const answerItems = listItems(answerBody);
    const context = proseLines(questionBody);

    if (questionItems.length === answerItems.length && questionItems.length > 0) {
      questionItems.forEach((question, itemIndex) => {
        questions.push(`【問題${number} ${title}】${context ? `${context} ` : ''}${question}`);
        answers.push(answerItems[itemIndex]);
      });
      return;
    }

    if (questionItems.length === 0 && answerItems.length === 0) {
      questions.push(`【問題${number} ${title}】${context}`);
      answers.push(proseLines(answerBody));
      return;
    }

    throw new Error(`Comprehensive problem ${number}: ${questionItems.length} questions but ${answerItems.length} answers`);
  });

  if (matches.length !== 12) throw new Error(`Expected 12 comprehensive problems, found ${matches.length}`);

  const quizQuestions = questions.map((question, index) => `${index + 1}. ［総合］${question}`);
  const quizAnswers = answers.map((answer, index) => `${index + 1}. ${answer}`);
  return `${frontmatter(segment)}## 総合問題\n\n各問題の条件を整理し、計算過程や政策の波及経路を明示して解答する。\n\n### 章末問題19\n\n${quizQuestions.join('\n')}\n\n### 解答・解説19\n\n${quizAnswers.join('\n')}\n`;
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const firstPart = source.indexOf('# 第1部　マクロ経済の計測');
const mathStart = source.indexOf('# 数学付録');
const comprehensiveStart = source.indexOf('# 総合演習');
const glossaryStart = source.indexOf('# 重要概念ミニ辞典');
const planStart = source.indexOf('# 16週間の学習計画');
const resourcesStart = source.indexOf('# 統計・追加学習資料');
const closingStart = source.indexOf('# おわりに――マクロ経済学を学ぶときの最重要原則');

const segments = [{
  kind: 'guide', index: 0, end: firstPart, id: 'intro', number: 0, file: '00_guide.md', title: 'はじめに',
  summary: '副読本の目的、学習方法、モデルを読む視点と記号一覧'
}];

const chapterBlock = source.slice(firstPart, mathStart);
const chapterMatches = [...chapterBlock.matchAll(/^## 第(\d+)章　(.+)$/gm)];
chapterMatches.forEach((match, index) => {
  const chapterNumber = Number(match[1]);
  const titleText = match[2].trim();
  const indexInSource = firstPart + match.index;
  const end = firstPart + (chapterMatches[index + 1]?.index ?? chapterBlock.length);
  const rawBody = source.slice(indexInSource, end);
  segments.push({
    kind: 'chapter', index: indexInSource, end, chapterNumber,
    id: `ch${String(chapterNumber).padStart(2, '0')}`,
    number: chapterNumber,
    file: `${String(chapterNumber).padStart(2, '0')}_chapter_${String(chapterNumber).padStart(2, '0')}.md`,
    title: `第${chapterNumber}章 ${titleText}`,
    summary: extractSummary(rawBody, titleText)
  });
});

if (chapterMatches.length !== 18) throw new Error(`Expected 18 chapters, found ${chapterMatches.length}`);

segments.push(
  { kind: 'supplement', index: mathStart, end: comprehensiveStart, id: 'math', number: 19, file: '19_math_appendix.md', title: '数学付録', summary: '関数、最適化、成長率、差分方程式などの数学的準備' },
  { kind: 'comprehensive', index: comprehensiveStart, end: glossaryStart, id: 'comprehensive', number: 20, file: '20_comprehensive.md', title: '総合演習', summary: '統計、短期モデル、成長、財政、金融、政策評価の総合問題' },
  { kind: 'supplement', index: glossaryStart, end: planStart, id: 'glossary', number: 21, file: '21_glossary.md', title: '重要概念ミニ辞典', summary: 'マクロ経済学の重要概念を短く確認する', sectionTitle: '重要概念一覧' },
  { kind: 'supplement', index: planStart, end: resourcesStart, id: 'study_plan', number: 22, file: '22_study_plan.md', title: '16週間の学習計画', summary: '全18章と総合演習を進める16週間の学習計画', sectionTitle: '週間計画' },
  { kind: 'supplement', index: resourcesStart, end: closingStart, id: 'resources', number: 23, file: '23_resources.md', title: '統計・追加学習資料', summary: '原著情報と日本の一次統計を確認するための資料' },
  { kind: 'supplement', index: closingStart, end: source.length, id: 'closing', number: 24, file: '24_closing.md', title: 'おわりに マクロ経済学を学ぶときの最重要原則', summary: '計測、仮定、均衡、政策評価を一貫して考えるための総括', sectionTitle: '学習の総括' }
);

fs.mkdirSync(courseDir, { recursive: true });

const categoryLines = [
  'intro = "ガイド"',
  ...Array.from({ length: 18 }, (_, index) => {
    const number = index + 1;
    return `ch${String(number).padStart(2, '0')} = ${quote(chapterCategory(number))}`;
  }),
  'math = "資料"',
  'comprehensive = "総合演習"',
  'glossary = "資料"',
  'study_plan = "資料"',
  'resources = "資料"',
  'closing = "資料"'
];

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "saito_macroeconomics"\n` +
  `title = "マクロ経済学 新版 学習参考書"\n` +
  `subtitle = "齊藤誠・岩本康志・太田聰一・柴田章久『マクロ経済学 新版』対応"\n` +
  `description = "経済統計、短期・中期・長期モデル、政策、ミクロ的基礎を全18章で体系的に学ぶ副読本"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);

segments.forEach(segment => {
  const rawBody = source.slice(segment.index, segment.end);
  const output = segment.kind === 'comprehensive'
    ? buildComprehensiveQuiz(rawBody, segment)
    : convertStandardBody(rawBody, segment);
  fs.writeFileSync(path.join(courseDir, segment.file), output);
});

console.log(`Imported ${segments.length} chapters into ${path.relative(rootDir, courseDir)}`);
