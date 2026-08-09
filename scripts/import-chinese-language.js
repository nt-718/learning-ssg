#!/usr/bin/env node

/** Split the supplied Chinese-language manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'chinese_language_textbook_ja.md');
const categoryDir = path.join(rootDir, 'courses', 'languages');
const courseDir = path.join(categoryDir, 'chinese_language');

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

function sectionBlocks(block) {
  const headings = [...block.matchAll(/^### ([A-F])(?:[　 \t]+([^\n]+))?$/gm)];
  return headings.map((match, index) => ({
    key: match[1],
    title: match[2]?.trim() || match[1],
    body: block.slice(match.index + match[0].length, headings[index + 1]?.index ?? block.length).trim()
  }));
}

function proseAnswer(block) {
  const quoteLines = block.split('\n').filter(line => line.startsWith('>')).map(normalizeInline);
  if (quoteLines.length) return quoteLines.join(' ');
  const tableRows = block.split('\n').filter(line => /^\|/.test(line) && !/^\|[-:| ]+\|?$/.test(line));
  if (tableRows.length > 1) {
    return `採点基準：${tableRows.slice(1).map(line => line.split('|').map(cell => cell.trim()).filter(Boolean).join('・')).join('／')}`;
  }
  return block.split('\n').map(normalizeInline).filter(Boolean).join(' ');
}

function extractAnswerChapters(source) {
  const answerStart = source.indexOf('# 第VII部　解答・解説');
  const answerEnd = source.indexOf('# 第VIII部　学習計画と自学法');
  const answerSource = source.slice(answerStart, answerEnd);
  const matches = [...answerSource.matchAll(/^### 第(\d+)章[^\n]*$/gm)];
  const answers = new Map();
  matches.forEach(match => {
    const number = Number(match[1]);
    const contentStart = match.index + match[0].length;
    const following = answerSource.slice(contentStart);
    const boundary = following.search(/^(?:### 第\d+章|## )/m);
    const body = following.slice(0, boundary < 0 ? following.length : boundary)
      .replace(/^---\s*$/gm, '')
      .trim();
    answers.set(number, body);
  });
  for (const match of answerSource.matchAll(/^## 第(49|50)章[^\n]*$/gm)) {
    const number = Number(match[1]);
    const contentStart = match.index + match[0].length;
    const following = answerSource.slice(contentStart);
    const boundary = following.search(/^## /m);
    answers.set(number, following.slice(0, boundary < 0 ? following.length : boundary).replace(/^---\s*$/gm, '').trim());
  }
  return answers;
}

function quizLevel(number) {
  if (number <= 32) return '初級';
  if (number <= 42) return '中級';
  if (number === 49) return '初級総合';
  return '中級総合';
}

function buildRegularQuiz(number, exerciseBody, answerBody) {
  const questions = listItems(exerciseBody);
  const answers = listItems(answerBody);
  let finalQuestions = questions;
  let finalAnswers = answers;

  if (answers.length === 0) {
    const promptLines = exerciseBody.split('\n').map(normalizeInline).filter(Boolean);
    finalQuestions = [promptLines.join('／')];
    finalAnswers = [proseAnswer(answerBody)];
  } else if (questions.length !== answers.length) {
    throw new Error(`Chapter ${number}: ${questions.length} questions but ${answers.length} answers`);
  }

  const level = quizLevel(number);
  return {
    questions: finalQuestions.map((question, index) => `${index + 1}. ［${level}］${question}`),
    answers: finalAnswers.map((answer, index) => `${index + 1}. ${answer}`)
  };
}

function buildTestQuiz(number, exerciseBody, answerBody) {
  const questionSections = sectionBlocks(exerciseBody);
  const answerSections = new Map(sectionBlocks(answerBody).map(section => [section.key, section]));
  const questions = [];
  const answers = [];

  questionSections.forEach(section => {
    const answerSection = answerSections.get(section.key);
    if (!answerSection) throw new Error(`Chapter ${number}: answer section ${section.key} is missing`);
    const sectionQuestions = listItems(section.body);
    const sectionAnswers = listItems(answerSection.body);

    if (sectionAnswers.length === sectionQuestions.length) {
      sectionQuestions.forEach((question, index) => {
        questions.push(`【${section.key} ${section.title}】${question}`);
        answers.push(sectionAnswers[index]);
      });
      return;
    }

    if (sectionAnswers.length === 0) {
      questions.push(`【${section.key} ${section.title}】${section.body.split('\n').map(normalizeInline).filter(Boolean).join('／')}`);
      answers.push(proseAnswer(answerSection.body));
      return;
    }

    throw new Error(`Chapter ${number} section ${section.key}: ${sectionQuestions.length} questions but ${sectionAnswers.length} answers`);
  });

  const level = quizLevel(number);
  return {
    questions: questions.map((question, index) => `${index + 1}. ［${level}］${question}`),
    answers: answers.map((answer, index) => `${index + 1}. ${answer}`)
  };
}

function chapterCategory(number) {
  if (number <= 4) return '発音・文字';
  if (number <= 24) return '基礎文法';
  if (number <= 32) return '場面別会話';
  if (number <= 42) return '中級文法・運用';
  if (number <= 48) return '語彙・文型資料';
  if (number <= 50) return '総合テスト';
  return '学習計画';
}

function extractSummary(body, title) {
  const paragraph = body
    .split('\n')
    .map(line => line.trim())
    .find(line => line && !line.startsWith('#') && !line.startsWith('|') && !line.startsWith('-') && !line.startsWith('>'));
  return (paragraph || `${title}の要点と実践的な使い方`).replace(/`/g, '').slice(0, 90);
}

function frontmatter(segment) {
  return `---\nid: ${quote(segment.id)}\nnumber: ${segment.number}\ntitle: ${quote(segment.title)}\nsummary: ${quote(segment.summary)}\n---\n\n# ${segment.title}\n\n`;
}

function convertBody(rawBody, segment, answerBody = '') {
  let body = rawBody.split('\n').slice(1).join('\n');
  body = body
    .replace(/^---\s*$/gm, '')
    .replace(/^# 第[IVX]+部[^\n]*$/gm, '')
    .trim();
  let quiz = null;

  if (segment.kind === 'chapter' && segment.chapterNumber <= 42) {
    const exercisePattern = new RegExp(`^### (?:確認問題|練習)${segment.chapterNumber}\\s*$`, 'm');
    const match = exercisePattern.exec(body);
    if (!match) throw new Error(`Chapter ${segment.chapterNumber}: exercise heading is missing`);
    const exerciseBody = body.slice(match.index + match[0].length).trim();
    body = body.slice(0, match.index).trim();
    quiz = buildRegularQuiz(segment.chapterNumber, exerciseBody, answerBody);
  } else if (segment.kind === 'chapter' && [49, 50].includes(segment.chapterNumber)) {
    quiz = buildTestQuiz(segment.chapterNumber, body, answerBody);
    body = body.replace(/^### [A-F](?:[　\s]+.+)?$[\s\S]*$/m, '').trim();
  }

  const converted = body
    .split('\n')
    .map(line => {
      if (line.startsWith('#### ')) return `### ${line.slice(5)}`;
      if (line.startsWith('### ')) return `## ${line.slice(4)}`;
      return line;
    })
    .join('\n')
    .trim();

  const sectionFallback = converted.match(/^## /m) ? '' : `## ${segment.sectionTitle || '概要'}\n\n`;
  const quizBlock = quiz
    ? `\n\n### 章末問題${segment.chapterNumber}\n\n${quiz.questions.join('\n')}\n\n### 解答・解説${segment.chapterNumber}\n\n${quiz.answers.join('\n')}`
    : '';
  return `${frontmatter(segment)}${sectionFallback}${converted}${quizBlock}\n`;
}

if (!fs.existsSync(sourcePath)) throw new Error(`Source manuscript not found: ${sourcePath}`);

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const answers = extractAnswerChapters(source);
const partOne = source.indexOf('# 第I部　発音と文字');
const answerPart = source.indexOf('# 第VII部　解答・解説');
const partEight = source.indexOf('# 第VIII部　学習計画と自学法');
const appendixStart = source.indexOf('# 付録', partEight);
const segments = [{
  kind: 'guide', index: 0, end: partOne, id: 'intro', number: 0, file: '00_guide.md', title: 'はじめに',
  summary: '本書の構成、到達目標、学習方法、表記の読み方', sectionTitle: '本書の使い方'
}];

function addChapterSegments(blockStart, blockEnd) {
  const block = source.slice(blockStart, blockEnd);
  const matches = [...block.matchAll(/^## 第(\d+)章　(.+)$/gm)];
  matches.forEach((match, index) => {
    const chapterNumber = Number(match[1]);
    const titleText = match[2].trim();
    const indexInSource = blockStart + match.index;
    const end = blockStart + (matches[index + 1]?.index ?? block.length);
    const rawBody = source.slice(indexInSource, end);
    segments.push({
      kind: 'chapter', index: indexInSource, end, chapterNumber,
      id: `ch${String(chapterNumber).padStart(2, '0')}`,
      number: chapterNumber,
      file: `${String(chapterNumber).padStart(2, '0')}_chapter_${String(chapterNumber).padStart(2, '0')}.md`,
      title: `第${chapterNumber}章 ${titleText}`,
      summary: extractSummary(rawBody.split('\n').slice(1).join('\n'), titleText)
    });
  });
}

addChapterSegments(partOne, answerPart);
addChapterSegments(partEight, appendixStart);

const appendixBlock = source.slice(appendixStart);
const appendixMatches = [...appendixBlock.matchAll(/^## (付録[A-D]|おわりに)(?:　(.+))?$/gm)];
appendixMatches.forEach((match, index) => {
  const number = 53 + index;
  const key = match[1];
  const subtitle = match[2]?.trim();
  const indexInSource = appendixStart + match.index;
  const end = appendixStart + (appendixMatches[index + 1]?.index ?? appendixBlock.length);
  segments.push({
    kind: 'appendix', index: indexInSource, end,
    id: key === 'おわりに' ? 'closing' : `appendix_${key.slice(-1).toLowerCase()}`,
    number,
    file: `${number}_${key === 'おわりに' ? 'closing' : `appendix_${key.slice(-1).toLowerCase()}`}.md`,
    title: subtitle ? `${key} ${subtitle}` : key,
    summary: subtitle || (key === 'おわりに' ? '学習を継続し、使える中国語へつなげるための指針' : `${key}の参考資料`),
    sectionTitle: key === 'おわりに' ? '学習を終えたら' : '資料'
  });
});

const chapterNumbers = segments.filter(segment => segment.kind === 'chapter').map(segment => segment.chapterNumber);
if (chapterNumbers.length !== 52 || new Set(chapterNumbers).size !== 52) {
  throw new Error(`Expected 52 unique chapters, found ${chapterNumbers.length}`);
}

fs.mkdirSync(courseDir, { recursive: true });
fs.writeFileSync(
  path.join(categoryDir, 'category.toml'),
  'id = "languages"\ntitle = "語学"\norder = 15\ncolor = "#168c8c"\n'
);

const categoryLines = [
  'intro = "ガイド"',
  ...Array.from({ length: 52 }, (_, index) => {
    const number = index + 1;
    return `ch${String(number).padStart(2, '0')} = ${quote(chapterCategory(number))}`;
  }),
  'appendix_a = "付録"',
  'appendix_b = "付録"',
  'appendix_c = "付録"',
  'appendix_d = "付録"',
  'closing = "付録"'
];

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "chinese_language"\n` +
  `title = "ゼロから中級まで学ぶ 中国語総合教科書・参考書"\n` +
  `subtitle = "発音・基礎文法・会話・中級運用を一冊で学ぶ"\n` +
  `description = "日本語話者が中国語をゼロから中級まで体系的に学ぶ総合教材"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n${categoryLines.join('\n')}\n`
);

segments.sort((a, b) => a.number - b.number).forEach(segment => {
  const rawBody = source.slice(segment.index, segment.end);
  fs.writeFileSync(path.join(courseDir, segment.file), convertBody(rawBody, segment, answers.get(segment.chapterNumber) || ''));
});

console.log(`Imported ${segments.length} chapters into ${path.relative(rootDir, courseDir)}`);
