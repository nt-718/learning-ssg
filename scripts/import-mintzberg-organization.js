#!/usr/bin/env node

/** Split the supplied Mintzberg organization manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, 'ミンツバーグの組織論_副読本.md');
const categoryDir = path.join(rootDir, 'courses', 'social_sciences');
const courseDir = path.join(categoryDir, 'mintzberg_organization');

const segments = [
  { start: '# 『ミンツバーグの組織論』副読本', file: '00_guide.md', id: 'intro', number: 0, title: 'はじめに', summary: '副読本の目的、全体構成、7つの類型と7つの力の見取り図' },
  { start: '# 第1章　私たちを取り巻く組織の世界', file: '01_chapter_01.md', id: 'ch01', number: 1, title: '第1章 私たちを取り巻く組織の世界', summary: '分析単位、形ではなく働きを見る視点、類型は地図であるという前提' },
  { start: '# 第2章　プレーヤーと構成要素', file: '02_chapter_02.md', id: 'ch02', number: 2, title: '第2章 プレーヤーと構成要素', summary: 'オペレーター、マネジャー、アナリスト、チェーン・ハブ・ウェブ・セット' },
  { start: '# 第3章　組織づくりのアート、クラフト、サイエンス', file: '03_chapter_03.md', id: 'ch03', number: 3, title: '第3章 組織づくりのアート、クラフト、サイエンス', summary: '三つの知のあり方、意思決定、意図された戦略と創発戦略、マネジャーの現実' },
  { start: '# 第4章　調整のメカニズム', file: '04_chapter_04.md', id: 'ch04', number: 4, title: '第4章 調整のメカニズム', summary: '六つの調整メカニズム、仕事の複雑性との対応、調整不全の見分け方' },
  { start: '# 第5章　組織デザインのさまざまな要素', file: '05_chapter_05.md', id: 'ch05', number: 5, title: '第5章 組織デザインのさまざまな要素', summary: '役職設計、上部構造、分権化、計画・コントロールと横のつながり' },
  { start: '# 第6章　文脈を踏まえた組織設計', file: '06_chapter_06.md', id: 'ch06', number: 6, title: '第6章 文脈を踏まえた組織設計', summary: '規模、技術的システム、環境、権力という文脈要因と二種類の適合' },
  { start: '# 第7章　パーソナル型組織――個人が君臨する事業', file: '07_chapter_07.md', id: 'ch07', number: 7, title: '第7章 パーソナル型組織', summary: '直接的な監督で動くハブ型組織の構造、強み、弱み、成長時の課題' },
  { start: '# 第8章　プログラム型組織――工程が定められている機械', file: '08_chapter_08.md', id: 'ch08', number: 8, title: '第8章 プログラム型組織', summary: '業務の標準化に支えられたチェーン型組織と、KPIの逆機能' },
  { start: '# 第9章　プロフェッショナル型組織――専門職の寄せ集め', file: '09_chapter_09.md', id: 'ch09', number: 9, title: '第9章 プロフェッショナル型組織', summary: 'スキルの標準化、専門家への権力分散、管理手法の限界' },
  { start: '# 第10章　プロジェクト型組織――革新を目指すプロジェクト', file: '10_chapter_10.md', id: 'ch10', number: 10, title: '第10章 プロジェクト型組織', summary: '相互の調整で動くウェブ型組織と、機能させるための実務' },
  { start: '# 第11章　4つの基本形態を比較する', file: '11_chapter_11.md', id: 'ch11', number: 11, title: '第11章 4つの基本形態を比較する', summary: '基本4形態の比較表、反対関係、形態選択の簡易ロジック' },
  { start: '# 第12章　4つの組織形態で作用する4つの力', file: '12_chapter_12.md', id: 'ch12', number: 12, title: '第12章 4つの組織形態で作用する4つの力', summary: '統合、効率、熟達、協働という四つの力とそのポートフォリオ' },
  { start: '# 第13章　すべての組織形態に関わる3つの力', file: '13_chapter_13.md', id: 'ch13', number: 13, title: '第13章 すべての組織形態に関わる3つの力', summary: '分離、文化の注入、対立の浸食と、文化と対立の共存' },
  { start: '# 第14章　事業部型組織', file: '14_chapter_14.md', id: 'ch14', number: 14, title: '第14章 事業部型組織', summary: '成果の標準化による分離、本社と事業部の役割、コングロマリットの問題' },
  { start: '# 第15章　コミュニティシップ型組織', file: '15_chapter_15.md', id: 'ch15', number: 15, title: '第15章 コミュニティシップ型組織', summary: '規範の標準化、文化形成の過程、強みと弱み、文化は設計できるか' },
  { start: '# 第16章　政治アリーナ型組織', file: '16_chapter_16.md', id: 'ch16', number: 16, title: '第16章 政治アリーナ型組織', summary: '対立が支配する状態の構造、政治の機能と破壊的政治への対処' },
  { start: '# 第17章　暴走を防ぐ「錨」の役割', file: '17_chapter_17.md', id: 'ch17', number: 17, title: '第17章 暴走を防ぐ「錨」の役割', summary: '錨の概念、エクセレントの落とし穴、汚染と封じ込め' },
  { start: '# 第18章　ハイブリッド型の素晴らしい世界', file: '18_chapter_18.md', id: 'ch18', number: 18, title: '第18章 ハイブリッド型の素晴らしい世界', summary: 'ブレンド型と寄せ集め型、裂け目の管理、設計キャンバス' },
  { start: '# 第19章　組織のライフサイクルと組織形態の変遷', file: '19_chapter_19.md', id: 'ch19', number: 19, title: '第19章 組織のライフサイクルと組織形態の変遷', summary: 'ライフサイクル各局面、典型的な移行、変革の単位' },
  { start: '# 第20章　外へ向かう組織', file: '20_chapter_20.md', id: 'ch20', number: 20, title: '第20章 外へ向かう組織', summary: '組織境界の設計、内製と外製、プラットフォームとエコシステム' },
  { start: '# 第21章　組織デザインのプロセスを開放する', file: '21_chapter_21.md', id: 'ch21', number: 21, title: '第21章 組織デザインのプロセスを開放する', summary: '開かれたデザインの原則、実務12ステップ、組織再編の評価指標' },
  { start: '# 統合理解1　ミンツバーグ組織論と他の理論', file: '22_theory_comparison.md', id: 'theory_comparison', number: 22, title: '統合理解1 ミンツバーグ組織論と他の理論', summary: 'ウェーバー、テイラー、サイモン、チャンドラーなど主要理論との接続' },
  { start: '# 統合理解2　現代組織への応用', file: '23_modern_applications.md', id: 'modern_applications', number: 23, title: '統合理解2 現代組織への応用', summary: 'リモートワーク、生成AI、アジャイル、プラットフォーム、DAOへの応用' },
  { start: '# 実践ケース集', file: '24_case_studies.md', id: 'case_studies', number: 24, title: '実践ケース集', summary: 'SaaS、病院、製造業、大学など7ケースの診断と再設計' },
  { start: '# 組織診断ワークブック', file: '25_diagnostic_workbook.md', id: 'diagnostic_workbook', number: 25, title: '組織診断ワークブック', summary: 'プレーヤーマップから再設計仮説までの診断手順' },
  { start: '# よくある20の誤解', file: '26_misconceptions.md', id: 'misconceptions', number: 26, title: 'よくある20の誤解', summary: '組織論をめぐる典型的な誤読を20項目で修正する' },
  { start: '# 用語集', file: '29_glossary.md', id: 'glossary', number: 29, title: '用語集', summary: 'ミンツバーグ組織論の主要用語を短く確認する', sectionTitle: '用語一覧' },
  { start: '# 6週間学習プラン', file: '30_study_plan.md', id: 'study_plan', number: 30, title: '6週間学習プラン', summary: '地図づくりから境界設計まで6週間で一巡する学習計画' },
  { start: '# 最終まとめ――この理論で何が見えるようになるか', file: '31_closing.md', id: 'closing', number: 31, title: '最終まとめ', summary: 'この理論で何が見えるようになるかを振り返る', sectionTitle: '学習の到達点' },
  { start: '# 参考文献・発展学習', file: '32_references.md', id: 'references', number: 32, title: '参考文献・発展学習', summary: '中心文献、関連著作、読む順番と利用上の注意' }
];

const quizSegment = {
  file: '27_comprehensive.md',
  id: 'comprehensive',
  number: 27,
  title: '理解度確認問題',
  summary: '基礎20問・応用10問で全21章の理解を点検する'
};

const essaySegment = {
  file: '28_essay_questions.md',
  id: 'essay_questions',
  number: 28,
  title: '論述問題',
  summary: '8つの論述課題と、答案を組み立てる基本構成'
};

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function frontmatter({ id, number, title, summary }) {
  return `---\nid: ${quote(id)}\nnumber: ${number}\ntitle: ${quote(title)}\nsummary: ${quote(summary)}\n---\n`;
}

function trimBlank(lines) {
  const out = [...lines];
  while (out[0]?.trim() === '') out.shift();
  while (out.at(-1)?.trim() === '') out.pop();
  return out;
}

/** Drop the original H1, the part dividers, and the decorative horizontal rules. */
function cleanBody(rawBody) {
  return trimBlank(
    rawBody
      .split('\n')
      .slice(1)
      .filter(line => !/^# 第[ⅠⅡⅢⅣⅤⅥⅦ]部　/.test(line) && line.trim() !== '---')
  );
}

function buildChapter(rawBody, segment) {
  const sectionHeading = segment.sectionTitle ? `## ${segment.sectionTitle}\n\n` : '';
  return `${frontmatter(segment)}\n# ${segment.title}\n\n${sectionHeading}${cleanBody(rawBody).join('\n')}\n`;
}

/** Extract "1. text" entries from a numbered list block. */
function numberedEntries(block) {
  const entries = [];
  block.split('\n').forEach(line => {
    const match = line.match(/^(\d+)\.\s+(.*)$/);
    if (match) entries.push({ number: Number(match[1]), text: match[2].trim() });
  });
  return entries;
}

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Marker not found: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Marker not found: ${endMarker}`);
  return source.slice(start + startMarker.length, end);
}

/**
 * The manuscript keeps questions and answers in two separate top-level sections.
 * Rejoin them into the single 章末問題 / 解答・解説 pair the SSG quiz extractor reads.
 */
function buildComprehensive(source) {
  const basicQuestions = numberedEntries(sliceBetween(source, '## A. 基礎問題', '## B. 応用問題'));
  const appliedQuestions = numberedEntries(sliceBetween(source, '## B. 応用問題', '## C. 論述問題'));
  const basicAnswers = numberedEntries(sliceBetween(source, '## 基礎問題の要点', '## 応用問題の解答指針'));
  const appliedAnswers = numberedEntries(sliceBetween(source, '## 応用問題の解答指針', '## 論述の基本構成'));

  const questions = [
    ...basicQuestions.map(entry => ({ ...entry, level: '基礎' })),
    ...appliedQuestions.map(entry => ({ ...entry, level: '応用' }))
  ];
  const answers = new Map([...basicAnswers, ...appliedAnswers].map(entry => [entry.number, entry.text]));

  questions.forEach(question => {
    if (!answers.has(question.number)) throw new Error(`Missing answer for question ${question.number}`);
  });

  const questionLines = questions.map(q => `${q.number}. ［${q.level}］${q.text}`).join('\n');
  const answerLines = questions.map(q => `${q.number}. ${answers.get(q.number)}`).join('\n');

  return `${frontmatter(quizSegment)}\n# ${quizSegment.title}\n\n` +
    '## 問題の使い方\n\n' +
    '基礎問題は用語と因果関係の確認、応用問題は事例を診断して設計案を述べる練習である。' +
    '答えを読む前に、必ず自分の言葉で説明を組み立てる。\n\n' +
    `### 章末問題\n\n${questionLines}\n\n### 解答・解説\n\n${answerLines}\n`;
}

function buildEssays(source) {
  const essayQuestions = trimBlank(sliceBetween(source, '## C. 論述問題', '# 解答・解説').split('\n').filter(line => line.trim() !== '---'));
  const essayStructure = trimBlank(source.slice(source.indexOf('## 論述の基本構成') + '## 論述の基本構成'.length, source.indexOf('# 用語集')).split('\n').filter(line => line.trim() !== '---'));

  return `${frontmatter(essaySegment)}\n# ${essaySegment.title}\n\n` +
    `## 論述課題\n\n${essayQuestions.join('\n')}\n\n` +
    `## 論述の基本構成\n\n${essayStructure.join('\n')}\n`;
}

if (!fs.existsSync(sourcePath)) {
  throw new Error(`Source manuscript not found: ${sourcePath}`);
}

const source = fs.readFileSync(sourcePath, 'utf-8').replaceAll('\r\n', '\n');
const locatedSegments = segments.map(segment => {
  const index = source.indexOf(segment.start);
  if (index < 0) throw new Error(`Heading not found: ${segment.start}`);
  return { ...segment, index };
});
// 理解度確認問題 and 解答・解説 are rebuilt separately, so the glossary must not absorb them.
const glossaryIndex = locatedSegments.find(segment => segment.id === 'glossary').index;

fs.mkdirSync(courseDir, { recursive: true });
fs.writeFileSync(
  path.join(categoryDir, 'category.toml'),
  'id = "social_sciences"\ntitle = "人文・社会科学"\norder = 20\ncolor = "#6b5ca5"\n'
);

const chapterCategory = id => {
  const chapterNumber = Number(String(id).replace('ch', ''));
  if (chapterNumber <= 3) return '組織を再検討する';
  if (chapterNumber <= 6) return '組織デザインの構成要素';
  if (chapterNumber <= 11) return '4つの基本形態';
  if (chapterNumber <= 13) return '7つの力';
  if (chapterNumber <= 16) return 'さらに3つの形態';
  if (chapterNumber <= 19) return '類型を超える力';
  return '境界とデザイン実践';
};

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "mintzberg_organization"\n` +
  `title = "『ミンツバーグの組織論』副読本"\n` +
  `subtitle = "ヘンリー・ミンツバーグ『ミンツバーグの組織論――7つの類型と力学、そしてその先へ』対応"\n` +
  `description = "7つの組織類型と7つの力、組織デザインの実践を全21章で学ぶ副読本"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n` +
  `intro = "ガイド"\n` +
  Array.from({ length: 21 }, (_, index) => {
    const id = `ch${String(index + 1).padStart(2, '0')}`;
    return `${id} = "${chapterCategory(id)}"`;
  }).join('\n') + '\n' +
  `theory_comparison = "発展学習"\nmodern_applications = "発展学習"\n` +
  `case_studies = "実践演習"\ndiagnostic_workbook = "実践演習"\nmisconceptions = "実践演習"\n` +
  `comprehensive = "総合演習"\nessay_questions = "総合演習"\n` +
  `glossary = "資料"\nstudy_plan = "資料"\nclosing = "資料"\nreferences = "資料"\n`
);

locatedSegments.forEach((segment, index) => {
  const nextIndex = locatedSegments[index + 1]?.index ?? source.length;
  // Segments before the glossary must stop at the quiz sections that precede it.
  const end = segment.index < glossaryIndex ? Math.min(nextIndex, source.indexOf('# 理解度確認問題')) : nextIndex;
  fs.writeFileSync(path.join(courseDir, segment.file), buildChapter(source.slice(segment.index, end), segment));
});

fs.writeFileSync(path.join(courseDir, quizSegment.file), buildComprehensive(source));
fs.writeFileSync(path.join(courseDir, essaySegment.file), buildEssays(source));

console.log(`Imported ${locatedSegments.length + 2} chapters into ${path.relative(rootDir, courseDir)}`);
