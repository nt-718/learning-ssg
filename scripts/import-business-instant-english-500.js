#!/usr/bin/env node

/** Split the supplied business instant-English manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const sourcePath = path.join(rootDir, 'ビジネス瞬間英作文500.md');
const courseDir = path.join(rootDir, 'courses', 'languages', 'business_instant_english_500');

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function frontmatter({ id, number, title, summary }) {
  return `---\nid: ${quote(id)}\nnumber: ${number}\ntitle: ${quote(title)}\nsummary: ${quote(summary)}\n---\n\n`;
}

function cleanInline(value) {
  return value
    .replace(/^>\s?/, '')
    .replaceAll('**', '')
    .replaceAll('`', '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function exerciseBlocks(body) {
  const matches = [...body.matchAll(/^### (\d+)\s*$/gm)];
  return matches.map((match, index) => ({
    number: Number(match[1]),
    body: body.slice(match.index + match[0].length, matches[index + 1]?.index ?? body.length).trim()
  }));
}

function exerciseQuestion(exercise) {
  const line = exercise.body
    .split('\n')
    .map(item => item.trim())
    .find(item => item && item !== '---' && !item.startsWith('>') && !item.startsWith('**'));
  if (!line) throw new Error(`Exercise ${exercise.number}: Japanese prompt is missing`);
  return cleanInline(line);
}

function exerciseAnswer(exercise) {
  const answer = exercise.body.match(/^>\s?(.+)$/m)?.[1];
  if (!answer) throw new Error(`Exercise ${exercise.number}: model answer is missing`);
  return cleanInline(answer);
}

function quizBlock(exercises, partNumber) {
  const questions = exercises
    .map((exercise, index) => `${index + 1}. ［瞬間英作文］No.${exercise.number} ${exerciseQuestion(exercise)}`)
    .join('\n');
  const answers = exercises
    .map((exercise, index) => `${index + 1}. ${exerciseAnswer(exercise)}`)
    .join('\n');
  return `### 章末問題${partNumber}\n\n${questions}\n\n### 解答・解説${partNumber}\n\n${answers}`;
}

function normalizeBody(body) {
  return body
    .replace(/^# Part \d+[　 ].+$/m, '')
    .replace(/^## \d+[–-]\d+\s*$/m, '')
    .replace(/^---\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const partMatches = [...source.matchAll(/^# Part (\d+)[　 ]+(.+)$/gm)];
if (partMatches.length !== 10) throw new Error(`Expected 10 parts, found ${partMatches.length}`);

const segments = [];
const introStart = source.indexOf('# はじめに');
if (introStart < 0) throw new Error('Introduction heading is missing');
const introBody = source.slice(introStart, partMatches[0].index)
  .replace(/^# はじめに\s*/, '')
  .replace(/^# 学習方法\s*$/m, '## 学習方法')
  .replace(/^---\s*$/gm, '')
  .replace(/\n{3,}/g, '\n\n')
  .trim();
segments.push({
  id: 'intro',
  number: 0,
  file: '00_guide.md',
  title: 'はじめに',
  summary: '500の基本文を反復し、ビジネス英語を瞬時に組み立てるための学習ガイド',
  content: `${frontmatter({ id: 'intro', number: 0, title: 'はじめに', summary: '500の基本文を反復し、ビジネス英語を瞬時に組み立てるための学習ガイド' })}# はじめに\n\n## 本書の目的\n\n${introBody}\n`
});

const allExerciseNumbers = [];
partMatches.forEach((match, index) => {
  const partNumber = Number(match[1]);
  const partTitle = match[2].trim();
  const end = partMatches[index + 1]?.index ?? source.length;
  const rawBody = source.slice(match.index, end);
  const exercises = exerciseBlocks(rawBody);
  if (exercises.length !== 50) {
    throw new Error(`Part ${partNumber}: expected 50 exercises, found ${exercises.length}`);
  }
  const expectedStart = (partNumber - 1) * 50 + 1;
  exercises.forEach((exercise, exerciseIndex) => {
    const expected = expectedStart + exerciseIndex;
    if (exercise.number !== expected) {
      throw new Error(`Part ${partNumber}: expected exercise ${expected}, found ${exercise.number}`);
    }
    allExerciseNumbers.push(exercise.number);
    exerciseQuestion(exercise);
    exerciseAnswer(exercise);
  });

  const title = `第${partNumber}章 ${partTitle}`;
  const summary = `No.${expectedStart}〜${expectedStart + 49}で${partTitle}の瞬間英作文を練習する`;
  const body = normalizeBody(rawBody);
  segments.push({
    id: `ch${String(partNumber).padStart(2, '0')}`,
    number: partNumber,
    file: `${String(partNumber).padStart(2, '0')}_part_${String(partNumber).padStart(2, '0')}.md`,
    title,
    summary,
    content: `${frontmatter({ id: `ch${String(partNumber).padStart(2, '0')}`, number: partNumber, title, summary })}# ${title}\n\n## No.${expectedStart}〜${expectedStart + 49}\n\n${body}\n\n${quizBlock(exercises, partNumber)}\n`
  });
});

if (allExerciseNumbers.length !== 500 || new Set(allExerciseNumbers).size !== 500) {
  throw new Error('Expected 500 unique exercises');
}

fs.mkdirSync(courseDir, { recursive: true });
const categoryLines = [
  'intro = "ガイド"',
  ...partMatches.map(match => `ch${String(Number(match[1])).padStart(2, '0')} = ${quote(match[2].trim())}`)
];
fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "business_instant_english_500"\n` +
  `title = "ビジネス瞬間英作文500"\n` +
  `subtitle = "500の基本文から、数千通りのビジネス表現を作る"\n` +
  `description = "日本語を見て英語を瞬時に組み立てる、ビジネス特化型の反復教材"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);
segments.forEach(segment => fs.writeFileSync(path.join(courseDir, segment.file), segment.content));

console.log(`Imported ${segments.length} chapters and ${allExerciseNumbers.length} exercises into ${path.relative(rootDir, courseDir)}`);
