#!/usr/bin/env node

/**
 * AnS (Static Site Generator CLI Tool)
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

function normalizeCategoryColor(color) {
  if (typeof color !== 'string') return null;
  const normalized = color.trim();
  return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : null;
}

function readCategoryConfig(categoryPath, categoryId) {
  const configPath = path.join(categoryPath, 'category.toml');
  const config = fs.existsSync(configPath)
    ? parseToml(fs.readFileSync(configPath, 'utf-8'))
    : {};
  return {
    id: config.id || categoryId,
    title: config.title || categoryId,
    order: Number.isFinite(config.order) ? config.order : 999,
    color: normalizeCategoryColor(config.color)
  };
}

function discoverCourses() {
  if (!fs.existsSync(COURSES_DIR)) return [];
  const entries = [];
  const topLevelDirs = fs.readdirSync(COURSES_DIR)
    .filter(name => fs.statSync(path.join(COURSES_DIR, name)).isDirectory())
    .sort();

  topLevelDirs.forEach(name => {
    const topPath = path.join(COURSES_DIR, name);
    if (fs.existsSync(path.join(topPath, 'course.toml'))) {
      entries.push({
        directoryId: name,
        coursePath: topPath,
        category: { id: 'uncategorized', title: 'その他', order: 999, color: null }
      });
      return;
    }

    const category = readCategoryConfig(topPath, name);
    fs.readdirSync(topPath)
      .filter(child => {
        const childPath = path.join(topPath, child);
        return fs.statSync(childPath).isDirectory() && fs.existsSync(path.join(childPath, 'course.toml'));
      })
      .sort()
      .forEach(child => {
        entries.push({ directoryId: child, coursePath: path.join(topPath, child), category });
      });
  });

  return entries.sort((a, b) =>
    a.category.order - b.category.order ||
    a.category.title.localeCompare(b.category.title, 'ja') ||
    a.directoryId.localeCompare(b.directoryId, 'ja')
  );
}

function main() {
  console.log(`\n🚀 [AnS] Executing command: '${command}'...\n`);

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
function buildCourse(targetCourseId) {
  if (!fs.existsSync(COURSES_DIR)) {
    console.error(`❌ Courses directory not found: ${COURSES_DIR}`);
    process.exit(1);
  }

  const courseEntries = discoverCourses();

  console.log(`📦 Building ${courseEntries.length} course(s)...`);

  const allCoursesData = {};

  courseEntries.forEach(({ directoryId, coursePath, category }) => {
    const tomlFile = path.join(coursePath, 'course.toml');
    let courseConfig = { id: directoryId, title: directoryId };
    if (fs.existsSync(tomlFile)) {
      courseConfig = parseToml(fs.readFileSync(tomlFile, 'utf-8'));
    }
    const courseId = courseConfig.id || directoryId;
    courseConfig.id = courseId;
    courseConfig.category = category;

    if (allCoursesData[courseId]) {
      throw new Error(`Duplicate course id '${courseId}' found in ${coursePath}`);
    }

    const files = fs.readdirSync(coursePath).filter(f => f.endsWith('.md')).sort();
    const chapters = [];
    const quizQuestions = [];

    files.forEach((file, index) => {
      const raw = fs.readFileSync(path.join(coursePath, file), 'utf-8');
      const { metadata, body } = parseFrontmatter(raw);

      const chId = metadata.id || `ch${index.toString().padStart(2, '0')}`;
      const firstHeader = (body.match(/^#\s+(.*)/m) || [])[1] || file;
      const title = metadata.title || firstHeader;

      const secMatches = [...body.matchAll(/^##\s+(.*)/gm)];
      const sections = secMatches.map((m, sIdx) => ({
        id: `${chId}_sec_${sIdx + 1}`,
        title: m[1].trim()
      }));

      extractQuestionsFromMarkdown(body, chId, title, quizQuestions);

      chapters.push({
        id: chId,
        number: metadata.number ?? index,
        title: title,
        shortTitle: metadata.short_title || title.replace(/^第[0-9]+章\s*/, ''),
        summary: metadata.summary || '',
        sections: sections,
        content: stripStandardChapterQuiz(body)
      });
    });

    chapters.sort((a, b) => a.number - b.number);

    allCoursesData[courseId] = {
      config: courseConfig,
      chapters: chapters,
      quizQuestions: quizQuestions
    };

    console.log(`  ✓ [${category.title}] ${courseId}: ${chapters.length} chapters, ${quizQuestions.length} questions.`);

    // Sync image assets for each course
    const courseImgDir = path.join(coursePath, 'images');
    const srcImgDir = path.join(ROOT_DIR, 'public', 'images');
    if (fs.existsSync(courseImgDir)) {
      fs.mkdirSync(srcImgDir, { recursive: true });
      fs.cpSync(courseImgDir, srcImgDir, { recursive: true });
    }
  });

  const dataDir = path.join(ROOT_DIR, 'src', 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const courseIds = Object.keys(allCoursesData);
  if (courseIds.length === 0) {
    throw new Error('No courses found. Expected courses/<category>/<course>/course.toml');
  }
  const activeId = allCoursesData[targetCourseId] ? targetCourseId : courseIds[0];
  const defaultCourse = allCoursesData[activeId];

  fs.writeFileSync(
    path.join(dataDir, 'coursesData.js'),
    `export const ALL_COURSES = ${JSON.stringify(allCoursesData, null, 2)};\nexport const DEFAULT_COURSE_ID = ${JSON.stringify(activeId)};\n`
  );

  fs.writeFileSync(
    path.join(dataDir, 'contentData.js'),
    `export const CHAPTERS = ${JSON.stringify(defaultCourse.chapters, null, 2)};\nexport const COURSE_CONFIG = ${JSON.stringify(defaultCourse.config, null, 2)};\n`
  );

  fs.writeFileSync(
    path.join(dataDir, 'quizData.js'),
    `export const QUIZ_QUESTIONS = ${JSON.stringify(defaultCourse.quizQuestions, null, 2)};\n`
  );

  console.log(`\n🎉 [AnS] Successfully bundled all courses into src/data/coursesData.js!`);
}

// 2. NEW COURSE COMMAND
function newCourse(coursePathArg, courseTitle) {
  const pathParts = coursePathArg.replaceAll('\\', '/').split('/').filter(Boolean);
  if (pathParts.some(part => part === '..') || pathParts.length > 2) {
    console.error(`❌ Invalid course path: ${coursePathArg}`);
    process.exit(1);
  }
  const courseId = pathParts.pop();
  const categoryId = pathParts.shift() || 'general';
  const categoryDir = path.join(COURSES_DIR, categoryId);
  const newDir = path.join(categoryDir, courseId);
  if (fs.existsSync(newDir)) {
    console.error(`❌ Course directory already exists: ${newDir}`);
    process.exit(1);
  }

  fs.mkdirSync(path.join(newDir, 'images'), { recursive: true });
  const categoryConfigPath = path.join(categoryDir, 'category.toml');
  if (!fs.existsSync(categoryConfigPath)) {
    fs.writeFileSync(categoryConfigPath, `id = "${categoryId}"\ntitle = "${categoryId}"\norder = 999\ncolor = "#2563eb"\n`);
  }

  const tomlContent = `# ${courseTitle} 教材設定ファイル

id = "${courseId}"
title = "${courseTitle}"
subtitle = "標準スマホ学習テキスト"
description = "スマホで読みやすい学習参考書"
author = "AnS"
version = "1.0.0"

[features]
quiz = true
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

この教材は **AnS** によって生成されたスマートフォン向け学習コンテンツです。

## 効率的な学習手順

1. 章ごとに本文を熟読する
2. 図解で重要な仕組みを理解する
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

  console.log(`✨ [AnS] Successfully generated new course template!`);
  console.log(`📂 Location: courses/${categoryId}/${courseId}/`);
  console.log(`👉 Run 'npm run ssg build ${courseId}' to build this new course!\n`);
}

// 3. LIST COMMAND
function listCourses() {
  if (!fs.existsSync(COURSES_DIR)) {
    console.log(`No courses directory found.`);
    return;
  }

  const courseEntries = discoverCourses();

  console.log(`\n📚 [AnS] Available Courses (${courseEntries.length}):\n`);
  console.log(`------------------------------------------------------------------`);
  let currentCategory = '';
  courseEntries.forEach(({ directoryId, coursePath, category }) => {
    if (category.id !== currentCategory) {
      currentCategory = category.id;
      console.log(`\n  ${category.title} [${category.id}]`);
    }
    const cfg = parseToml(fs.readFileSync(path.join(coursePath, 'course.toml'), 'utf-8'));
    const courseId = cfg.id || directoryId;
    const mdFiles = fs.readdirSync(coursePath).filter(f => f.endsWith('.md'));
    console.log(`    - [ID: ${courseId.padEnd(20)}] ${cfg.title || courseId} (${mdFiles.length} chapters)`);
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
function matchStandardChapterQuiz(text) {
  return text.match(/### 章末問題\d*\s*\n\n(.*?)\n\n### 解答・解説\d*\s*\n\n(.*?)(?=\n# |\n### |$)/s);
}

function stripStandardChapterQuiz(text) {
  const match = matchStandardChapterQuiz(text);
  if (!match || match.index === undefined) return text;

  const before = text.slice(0, match.index).trimEnd();
  const after = text.slice(match.index + match[0].length).trimStart();
  return after ? `${before}\n\n${after}` : `${before}\n`;
}

function extractQuestionsFromMarkdown(text, chId, chTitle, questions) {
  // Pattern 1: Chapter 1-8 end questions
  const matchCh = matchStandardChapterQuiz(text);
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
      const mQ = ql.match(/^(\d+)\.\s*［([^］]+)］\s*(.*)/);
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
