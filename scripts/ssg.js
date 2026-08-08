#!/usr/bin/env node

/**
 * Learning SSG (Static Site Generator CLI Tool)
 * Inspired by ntea-blog architecture
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { parseFrontmatter, parseToml } from './parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const COURSES_DIR = path.join(ROOT_DIR, 'courses');

const args = process.argv.slice(2);
const command = args[0] || 'build';
const courseIdArg = args[1] || 'financial_planner';

function main() {
  console.log(`\n🚀 [Learning SSG] Executing command: '${command}'...\n`);

  switch (command) {
    case 'build':
      buildCourse(courseIdArg);
      break;
    case 'new':
      const titleArg = args[2] || '新資格・講座テキスト';
      newCourse(courseIdArg, titleArg);
      break;
    case 'list':
      listCourses();
      break;
    case 'serve':
      buildCourse(courseIdArg);
      serveCourse();
      break;
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log(`Available commands: build, new, list, serve`);
      process.exit(1);
  }
}

// 1. BUILD COMMAND
function buildCourse(courseId) {
  const coursePath = path.join(COURSES_DIR, courseId);
  if (!fs.existsSync(coursePath)) {
    console.error(`❌ Course directory not found: ${coursePath}`);
    process.exit(1);
  }

  console.log(`📦 Building course '${courseId}' from ${coursePath}...`);

  // Parse course.toml
  const tomlFile = path.join(coursePath, 'course.toml');
  let courseConfig = { id: courseId, title: courseId };
  if (fs.existsSync(tomlFile)) {
    courseConfig = parseToml(fs.readFileSync(tomlFile, 'utf-8'));
  }

  // Parse all markdown files
  const files = fs.readdirSync(coursePath).filter(f => f.endsWith('.md')).sort();
  const chapters = [];
  const quizQuestions = [];

  files.forEach((file, index) => {
    const raw = fs.readFileSync(path.join(coursePath, file), 'utf-8');
    const { metadata, body } = parseFrontmatter(raw);

    const chId = metadata.id || `ch${index.toString().padStart(2, '0')}`;
    const firstHeader = (body.match(/^#\s+(.*)/m) || [])[1] || file;
    const title = metadata.title || firstHeader;

    // Extract H2 sections
    const secMatches = [...body.matchAll(/^##\s+(.*)/gm)];
    const sections = secMatches.map((m, sIdx) => ({
      id: `${chId}_sec_${sIdx + 1}`,
      title: m[1].trim()
    }));

    chapters.append ? chapters.append() : chapters.push({
      id: chId,
      number: metadata.number ?? index,
      title: title,
      shortTitle: metadata.short_title || title.replace(/^第[0-9]+章\s*/, ''),
      summary: metadata.summary || '',
      sections: sections,
      content: body
    });

    // Extract quiz questions (Chapter 1-8 end-of-chapter questions & Chapter 11 questions)
    extractQuestionsFromMarkdown(body, chId, title, quizQuestions);
  });

  // Sort chapters by number
  chapters.sort((a, b) => a.number - b.number);

  console.log(`✅ Parsed ${chapters.length} chapter files and ${quizQuestions.length} practice questions.`);

  // Write dataset JS files
  const dataDir = path.join(ROOT_DIR, 'src', 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(
    path.join(dataDir, 'contentData.js'),
    `export const CHAPTERS = ${JSON.stringify(chapters, null, 2)};\nexport const COURSE_CONFIG = ${JSON.stringify(courseConfig, null, 2)};\n`
  );

  fs.writeFileSync(
    path.join(dataDir, 'quizData.js'),
    `export const QUIZ_QUESTIONS = ${JSON.stringify(quizQuestions, null, 2)};\n`
  );

  // Sync image assets
  const courseImgDir = path.join(coursePath, 'images');
  const srcImgDir = path.join(ROOT_DIR, 'images');
  if (fs.existsSync(courseImgDir)) {
    fs.mkdirSync(srcImgDir, { recursive: true });
    fs.cpSync(courseImgDir, srcImgDir, { recursive: true });
  }

  // Execute Vite build
  console.log(`⚡ Running Vite build for AWS S3 static deployment...`);
  try {
    execSync('npx vite build', { cwd: ROOT_DIR, stdio: 'inherit' });
    
    // Copy images to dist/images
    const distImgDir = path.join(ROOT_DIR, 'dist', 'images');
    if (fs.existsSync(courseImgDir)) {
      fs.mkdirSync(distImgDir, { recursive: true });
      fs.cpSync(courseImgDir, distImgDir, { recursive: true });
    }

    console.log(`\n🎉 [Learning SSG] BUILD SUCCESSFUL!`);
    console.log(`📁 Production bundle ready in dist/ directory for S3 hosting.\n`);
  } catch (err) {
    console.error(`❌ Vite build failed:`, err.message);
    process.exit(1);
  }
}

// 2. NEW COURSE COMMAND
function newCourse(courseId, courseTitle) {
  const newDir = path.join(COURSES_DIR, courseId);
  if (fs.existsSync(newDir)) {
    console.error(`❌ Course directory already exists: ${newDir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(newDir, 'images'), { recursive: true });

  const tomlContent = `# ${courseTitle} 教材設定ファイル

id = "${courseId}"
title = "${courseTitle}"
subtitle = "標準スマホ学習テキスト"
description = "スマホファーストのインタラクティブ学習参考書"
author = "Learning SSG Author"
version = "1.0.0"

[features]
quiz = true
simulators = false
search = true
`;
  fs.writeFileSync(path.join(newDir, 'course.toml'), tomlContent);

  const introMd = `---
id: "intro"
number: 0
title: "はじめに"
summary: "本教材の学習目標と効果的な活用方法"
---

# はじめに

この教材は **Learning SSG** によって自動生成されたスマホ専用学習コンテンツです。

## 効率的な学習手順

1. 章ごとに本文を熟読する
2. インタラクティブツールで視覚的に理解する
3. 章末問題と演習テストで反復復習する
`;
  fs.writeFileSync(path.join(newDir, '00_intro.md'), introMd);

  const ch1Md = `---
id: "ch01"
number: 1
title: "第1章　基礎概念と重要ポイント"
summary: "基礎理論と基本原則の理解"
---

# 第1章　基礎概念と重要ポイント

## 1-1　最初のステップ

学習の基本原則について整理します。

> 【重要】試験で高頻度に出題される重要用語をチェックしましょう。

### 章末問題1

1. ［3級］学習効果を高めるために最も重要な要素は反復練習であるか。

### 解答・解説1

1. **正しい。** 定期的な反復学習と問題演習が合格への近道です。
`;
  fs.writeFileSync(path.join(newDir, '01_chapter1.md'), ch1Md);

  console.log(`✨ [Learning SSG] Successfully generated new course template!`);
  console.log(`📂 Location: courses/${courseId}/`);
  console.log(`👉 Run 'npm run ssg build ${courseId}' to build this new course!\n`);
}

// 3. LIST COMMAND
function listCourses() {
  if (!fs.existsSync(COURSES_DIR)) {
    console.log(`No courses directory found.`);
    return;
  }

  const dirs = fs.readdirSync(COURSES_DIR).filter(d => fs.statSync(path.join(COURSES_DIR, d)).isDirectory());

  console.log(`\n📚 [Learning SSG] Available Courses (${dirs.length}):\n`);
  console.log(`------------------------------------------------------------------`);
  dirs.forEach(d => {
    const cPath = path.join(COURSES_DIR, d);
    const tomlPath = path.join(cPath, 'course.toml');
    let title = d;
    if (fs.existsSync(tomlPath)) {
      const cfg = parseToml(fs.readFileSync(tomlPath, 'utf-8'));
      title = cfg.title || d;
    }
    const mdFiles = fs.readdirSync(cPath).filter(f => f.endsWith('.md'));
    console.log(`  - [ID: ${d.padEnd(20)}] ${title} (${mdFiles.length} chapters)`);
  });
  console.log(`------------------------------------------------------------------\n`);
}

// 4. SERVE COMMAND
function serveCourse() {
  console.log(`🌐 Launching Vite development server for preview...`);
  try {
    execSync('npx vite --port 3000', { cwd: ROOT_DIR, stdio: 'inherit' });
  } catch (err) {
    // Process terminated
  }
}

// Helper to extract quiz questions from markdown text
function extractQuestionsFromMarkdown(text, chId, chTitle, questions) {
  // Pattern 1: Chapter 1-8 end questions
  const patternCh = /### 章末問題\d*\s*\n\n(.*?)\n\n### 解答・解説\d*\s*\n\n(.*?)(?=\n# |\n### |\Z)/s;
  const matchCh = text.match(patternCh);
  if (matchCh) {
    const qBlock = matchCh[1].trim();
    const ansBlock = matchCh[2].trim();
    const qLines = qBlock.split('\n').filter(l => l.trim());
    const ansLines = ansBlock.split('\n').filter(l => l.trim());

    const ansMap = {};
    ansLines.forEach(al => {
      const mA = al.match(/^(\d+)\.\s*(.*)/);
      if (mA) ansMap[mA[1]] = mA[2];
    });

    qLines.forEach(ql => {
      const mQ = ql.match(/^(\d+)\.\s*［(3級|2級)］\s*(.*)/);
      if (mQ) {
        const qNo = mQ[1];
        const level = mQ[2];
        const qText = mQ[3];
        const explanation = ansMap[qNo] || '';
        questions.push({
          id: `q_${chId}_${qNo}`,
          chapterId: chId,
          chapterTitle: chTitle,
          level: level,
          qNumber: `章末-${qNo}`,
          question: qText,
          answer: explanation,
          explanation: explanation
        });
      }
    });
  }

  // Pattern 2: Chapter 11 additional questions
  const sectionsC11 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const secNames = ["ライフプランニング", "社会保険・年金", "リスク管理", "金融資産運用", "タックスプランニング", "不動産", "相続・事業承継", "実技・複合"];

  sectionsC11.forEach((letter, idx) => {
    const p11 = new RegExp(`### 問題${letter}\\s*\\n\\n(.*?)\\n\\n### 解答・解説${letter}\\s*\\n\\n(.*?)(?=\\n## |\\n# |\\n### |\\Z)`, 's');
    const m11 = text.match(p11);
    if (m11) {
      const qBlock = m11[1].strip ? m11[1].strip() : m11[1].trim();
      const ansBlock = m11[2].trim();
      const qLines = qBlock.split('\n').filter(l => l.trim());
      const ansLines = ansBlock.split('\n').filter(l => l.trim());

      const ansMap = {};
      ansLines.forEach(al => {
        const mA = al.match(/^(\d+)\.\s*(.*)/);
        if (mA) ansMap[mA[1]] = mA[2];
      });

      qLines.forEach(ql => {
        const mQ = ql.match(new RegExp(`^(\\d+)\\.\\s*\\*\\*${letter}(\\d+)［(3級|2級)・(.*?)］\\*\\*\\s*(.*)`));
        if (mQ) {
          const qNo = mQ[2];
          const level = mQ[3];
          const qType = mQ[4];
          const qText = mQ[5];
          const explanation = ansMap[qNo] || '';
          questions.push({
            id: `q_ch11_${letter}${qNo}`,
            chapterId: 'ch11',
            chapterTitle: `第11章 (${secNames[idx]})`,
            level: level,
            qNumber: `11-${letter}${qNo}`,
            qType: qType,
            category: secNames[idx],
            question: qText,
            answer: explanation,
            explanation: explanation
          });
        }
      });
    }
  });
}

main();
