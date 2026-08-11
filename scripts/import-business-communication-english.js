#!/usr/bin/env node

/** Split the supplied business-communication English manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'ビジネスコミュニケーション英語 完全版.md');
const courseDir = path.join(rootDir, 'courses', 'languages', 'business_communication_english');

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function extractSummary(body, fallback) {
  const paragraph = body
    .split('\n')
    .map(line => line.trim())
    .find(line => line && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('>') && line !== '---');
  return (paragraph || fallback).replaceAll('**', '').replaceAll('`', '').slice(0, 90);
}

function normalizeBlock(block) {
  return block
    .split('\n')
    .map(line => line.trim().replace(/^>\s?/, ''))
    .filter(line => line && line !== '---')
    .join('／');
}

function numberedBlocks(block) {
  const matches = [...block.matchAll(/^(\d+)\.\s*(.*)$/gm)];
  return matches.map((match, index) => ({
    number: Number(match[1]),
    text: normalizeBlock(
      `${match[2]}\n${block.slice(match.index + match[0].length, matches[index + 1]?.index ?? block.length)}`
    )
  }));
}

function extractQuiz(rawBody, chapterNumber) {
  if (chapterNumber === 1) {
    const exercise = /^# 1\.5 演習問題\s*$/m.exec(rawBody);
    const answersHeading = /^# 解答例\s*$/m.exec(rawBody);
    if (!exercise || !answersHeading || answersHeading.index <= exercise.index) {
      throw new Error('Chapter 1 exercise or answers are missing');
    }
    const exerciseBody = rawBody.slice(exercise.index + exercise[0].length, answersHeading.index);
    const questionMatches = [...exerciseBody.matchAll(/^### 問(\d+)\s*$/gm)];
    const questions = questionMatches.map((match, index) => ({
      number: Number(match[1]),
      text: normalizeBlock(exerciseBody.slice(match.index + match[0].length, questionMatches[index + 1]?.index ?? exerciseBody.length))
    }));
    const answers = numberedBlocks(rawBody.slice(answersHeading.index + answersHeading[0].length));
    if (questions.length !== 10 || answers.length !== 10) {
      throw new Error(`Chapter 1 expected 10 questions and answers, found ${questions.length} and ${answers.length}`);
    }
    return { body: rawBody.slice(0, exercise.index), questions, answers };
  }

  if (chapterNumber === 3) {
    const exercise = /^# 3\.6 演習\s*$/m.exec(rawBody);
    const answersHeading = /^### 解答例\s*$/m.exec(rawBody);
    if (!exercise || !answersHeading || answersHeading.index <= exercise.index) {
      throw new Error('Chapter 3 exercise or answers are missing');
    }
    const questions = numberedBlocks(rawBody.slice(exercise.index + exercise[0].length, answersHeading.index));
    const answers = [...rawBody.slice(answersHeading.index + answersHeading[0].length).matchAll(/^>\s*(.+)$/gm)]
      .map((match, index) => ({ number: index + 1, text: match[1].trim() }));
    if (questions.length !== 10 || answers.length !== 10) {
      throw new Error(`Chapter 3 expected 10 questions and answers, found ${questions.length} and ${answers.length}`);
    }
    return { body: rawBody.slice(0, exercise.index), questions, answers };
  }

  return { body: rawBody, questions: [], answers: [] };
}

function convertBody(rawBody, title, chapterNumber) {
  const quiz = extractQuiz(rawBody, chapterNumber);
  const lines = quiz.body.replace(/^# .+\n/, '').split('\n');
  const converted = lines
    .filter(line => !/^# Part [IVX]+/.test(line))
    .map(line => line.startsWith('# ') ? `## ${line.slice(2)}` : line)
    .join('\n')
    .replace(/^---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  const body = /^## /m.test(converted) ? converted : `## 概要\n\n${converted}`;
  const quizBlock = quiz.questions.length > 0
    ? `\n\n### 章末問題${chapterNumber}\n\n${quiz.questions.map(item => `${item.number}. ［実務基礎］${item.text}`).join('\n')}\n\n` +
      `### 解答・解説${chapterNumber}\n\n${quiz.answers.map(item => `${item.number}. ${item.text}`).join('\n')}`
    : '';
  return `# ${title}\n\n${body}${quizBlock}\n`;
}

function frontmatter(segment) {
  return `---\nid: ${quote(segment.id)}\nnumber: ${segment.number}\ntitle: ${quote(segment.title)}\nsummary: ${quote(segment.summary)}\n---\n\n`;
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const partOne = source.indexOf('# Part I');
const partFifteen = source.indexOf('# Part XV');
const partSixteen = source.indexOf('# Part XVI');
const partSeventeen = source.indexOf('# Part XVII');
const finalChecklist = source.indexOf('# 最終チェックリスト');

if ([partOne, partFifteen, partSixteen, partSeventeen, finalChecklist].some(index => index < 0)) {
  throw new Error('Expected manuscript section boundary is missing');
}

const segments = [];
const introStart = source.indexOf('# 本書の目的');
const introBody = source.slice(introStart, partOne);
segments.push({
  id: 'intro', number: 0, file: '00_guide.md', title: 'はじめに',
  summary: '英語で仕事を正確に、円滑に、効率よく進めるための学習ガイド',
  body: introBody
});

const chapterBlock = source.slice(partOne, partFifteen);
const chapterMatches = [...chapterBlock.matchAll(/^# 第(\d+)章[　 ]+(.+)$/gm)];
chapterMatches.forEach((match, index) => {
  const number = Number(match[1]);
  const titleText = match[2].trim();
  const start = partOne + match.index;
  const end = partOne + (chapterMatches[index + 1]?.index ?? chapterBlock.length);
  const body = source.slice(start, end);
  segments.push({
    id: `ch${String(number).padStart(2, '0')}`,
    number,
    file: `${String(number).padStart(2, '0')}_chapter_${String(number).padStart(2, '0')}.md`,
    title: `第${number}章 ${titleText}`,
    summary: extractSummary(body.split('\n').slice(1).join('\n'), `${titleText}の実務的な使い方`),
    body
  });
});

const supplements = [
  {
    id: 'ch16', number: 16, file: '16_case_studies.md', title: '第16章 総合ケーススタディ',
    summary: '海外チーム、上司、部下、顧客、経営会議での実践ケース',
    start: partFifteen, end: partSixteen
  },
  {
    id: 'ch17', number: 17, file: '17_comprehensive_exercises.md', title: '第17章 総合演習100',
    summary: '依頼、確認、報告、会議、問題解決、営業、交渉などの総合演習',
    start: partSixteen, end: partSeventeen
  },
  {
    id: 'ch18', number: 18, file: '18_study_program.md', title: '第18章 学習プログラム',
    summary: '基礎から経営コミュニケーションまでの段階別・30日学習計画',
    start: partSeventeen, end: finalChecklist
  },
  {
    id: 'ch19', number: 19, file: '19_final_check.md', title: '第19章 最終チェック',
    summary: '実務メッセージの確認項目、重要原則、教材全体の到達目標',
    start: finalChecklist, end: source.length
  }
];

supplements.forEach(segment => {
  segments.push({ ...segment, body: source.slice(segment.start, segment.end) });
});

const chapterNumbers = segments.filter(segment => segment.number > 0).map(segment => segment.number);
if (chapterMatches.length !== 15 || new Set(chapterNumbers).size !== 19) {
  throw new Error(`Expected 15 main chapters and 19 numbered chapters, found ${chapterMatches.length} and ${new Set(chapterNumbers).size}`);
}

fs.mkdirSync(courseDir, { recursive: true });

const categories = [
  'intro = "ガイド"',
  'ch01 = "基礎"',
  'ch02 = "基礎"',
  'ch03 = "対人関係"',
  'ch04 = "メール"',
  'ch05 = "チャット"',
  'ch06 = "会議"',
  'ch07 = "報告・進捗"',
  'ch08 = "プレゼン"',
  'ch09 = "交渉"',
  'ch10 = "営業・提案"',
  'ch11 = "マネジメント"',
  'ch12 = "採用・面接"',
  'ch13 = "異文化"',
  'ch14 = "語彙"',
  'ch15 = "表現"',
  'ch16 = "ケーススタディ"',
  'ch17 = "総合演習"',
  'ch18 = "学習計画"',
  'ch19 = "最終確認"'
];

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "business_communication_english"\n` +
  `title = "ビジネスコミュニケーション英語 完全版"\n` +
  `subtitle = "英語で仕事を進めるための教科書・参考書・問題集"\n` +
  `description = "実務で必要な報告、依頼、会議、交渉、提案を体系的に学ぶ教材"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n${categories.join('\n')}\n`
);

segments.sort((a, b) => a.number - b.number).forEach(segment => {
  const content = `${frontmatter(segment)}${convertBody(segment.body, segment.title, segment.number)}`;
  fs.writeFileSync(path.join(courseDir, segment.file), content);
});

console.log(`Imported ${segments.length} chapters into ${path.relative(rootDir, courseDir)}`);
