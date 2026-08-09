#!/usr/bin/env node

/** Split the supplied social psychology manuscript into a learning-ssg course. */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourcePath = path.join(rootDir, '社会心理学_補訂版_学習参考書.md');
const categoryDir = path.join(rootDir, 'courses', 'social_sciences');
const courseDir = path.join(categoryDir, 'social_psychology');

const segments = [
  { start: '# 有斐閣『社会心理学〔補訂版〕』対応 学習参考書', file: '00_guide.md', id: 'intro', number: -1, title: 'はじめに', summary: '参考書の目的、研究知見の読み方、効果的な学習方法' },
  { start: '# 序章　社会と心をどう結びつけるか', file: '01_foundations.md', id: 'ch00', number: 0, title: '序章 社会と心をどう結びつけるか', summary: '分析水準、因果推論、研究法、再現性と研究倫理' },
  { start: '# 第1章　社会的認知の基礎', file: '02_social_cognition.md', id: 'ch01', number: 1, title: '第1章 社会的認知の基礎', summary: 'スキーマ、カテゴリー化、ヒューリスティック、二重過程' },
  { start: '# 第2章　気分・感情・主観的感覚', file: '03_emotion.md', id: 'ch02', number: 2, title: '第2章 気分・感情・主観的感覚', summary: '感情と気分、誤帰属、感情調整、主観的感覚' },
  { start: '# 第3章　自動的・非意識的過程', file: '04_automatic_processes.md', id: 'ch03', number: 3, title: '第3章 自動的・非意識的過程', summary: '自動性、プライミング、潜在的認知と行動制御' },
  { start: '# 第4章　自己', file: '05_self.md', id: 'ch04', number: 4, title: '第4章 自己', summary: '自己概念、自己評価、自己呈示、文化と自己' },
  { start: '# 第5章　他者についての認知・推論', file: '06_person_perception.md', id: 'ch05', number: 5, title: '第5章 他者についての認知・推論', summary: '印象形成、帰属、他者理解と判断の偏り' },
  { start: '# 第6章　態度と態度変化', file: '07_attitudes.md', id: 'ch06', number: 6, title: '第6章 態度と態度変化', summary: '態度の構造、説得、認知的不協和、行動変容' },
  { start: '# 第7章　対人関係', file: '08_relationships.md', id: 'ch07', number: 7, title: '第7章 対人関係', summary: '対人魅力、関係形成、愛着、葛藤と関係維持' },
  { start: '# 第8章　集団の中の個人', file: '09_groups.md', id: 'ch08', number: 8, title: '第8章 集団の中の個人', summary: '同調、集団意思決定、リーダーシップ、社会的影響' },
  { start: '# 第9章　集団間関係', file: '10_intergroup_relations.md', id: 'ch09', number: 9, title: '第9章 集団間関係', summary: '社会的アイデンティティ、ステレオタイプ、偏見と差別' },
  { start: '# 第10章　コミュニケーション', file: '11_communication.md', id: 'ch10', number: 10, title: '第10章 コミュニケーション', summary: '共通基盤、言語行動、誤解、対話の設計' },
  { start: '# 第11章　ソーシャル・ネットワーク', file: '12_social_networks.md', id: 'ch11', number: 11, title: '第11章 ソーシャル・ネットワーク', summary: 'ネットワーク構造、社会関係資本、拡散と選択' },
  { start: '# 第12章　マスメディアとインターネット', file: '13_media.md', id: 'ch12', number: 12, title: '第12章 マスメディアとインターネット', summary: 'メディア効果、フレーミング、選択的接触、情報環境' },
  { start: '# 第13章　参加と信頼', file: '14_participation_and_trust.md', id: 'ch13', number: 13, title: '第13章 参加と信頼', summary: '市民参加、制度への信頼、集合的効力感' },
  { start: '# 第14章　世論と社会過程', file: '15_public_opinion.md', id: 'ch14', number: 14, title: '第14章 世論と社会過程', summary: '世論形成、多元的無知、分極化と社会規範' },
  { start: '# 第15章　消費者行動・環境行動', file: '16_consumer_environment.md', id: 'ch15', number: 15, title: '第15章 消費者行動・環境行動', summary: '意思決定、規範、持続可能な行動と制度設計' },
  { start: '# 第16章　組織と個人のダイナミクス', file: '17_organizations.md', id: 'ch16', number: 16, title: '第16章 組織と個人のダイナミクス', summary: '組織行動、公正、心理的安全性、組織変革' },
  { start: '# 第17章　集合行動とマイクロ＝マクロ過程', file: '18_collective_behavior.md', id: 'ch17', number: 17, title: '第17章 集合行動とマイクロ＝マクロ過程', summary: '集合行動、創発、社会運動、個人と社会の接続' },
  { start: '# 第18章　心の文化差', file: '19_cultural_differences.md', id: 'ch18', number: 18, title: '第18章 心の文化差', summary: '文化比較、測定等価性、WEIRD標本と一般化可能性' },
  { start: '# 第19章　心と文化の相互構成', file: '20_mutual_constitution.md', id: 'ch19', number: 19, title: '第19章 心と文化の相互構成', summary: '文化と心理の循環、制度、相互作用と自己形成' },
  { start: '# 章別発展問題', file: '21_advanced_questions.md', id: 'advanced', number: 20, title: '章別発展問題', summary: '説明・比較・応用を通じて19章の理解を深める' },
  { start: '# 総合整理　19章をつなぐ', file: '22_synthesis.md', id: 'synthesis', number: 21, title: '総合整理 19章をつなぐ', summary: '個人、関係、集団、社会、文化の分析水準を統合する' },
  { start: '# 総合理解度確認問題', file: '23_comprehensive_questions.md', id: 'comprehensive', number: 22, title: '総合理解度確認問題', summary: '複数章を横断する事例問題と解答・解説' },
  { start: '# 重要用語集', file: '24_glossary.md', id: 'glossary', number: 23, title: '重要用語集', summary: '社会心理学の主要概念を短く確認する', sectionTitle: '用語一覧' },
  { start: '# 学習のための研究読解チェックリスト', file: '25_research_checklist.md', id: 'research_checklist', number: 24, title: '研究読解チェックリスト', summary: '研究デザイン、測定、統計、一般化可能性を点検する' },
  { start: '# 参考文献・発展学習', file: '26_references.md', id: 'references', number: 25, title: '参考文献・発展学習', summary: '公式資料、主要レビュー、発展的な研究文献' },
  { start: '# 最終学習チェック', file: '27_final_check.md', id: 'final_check', number: 26, title: '最終学習チェック', summary: '学習成果を振り返るための最終確認項目', sectionTitle: '確認項目' }
];

function quote(value) {
  return `"${String(value).replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`;
}

function convertChapterBody(rawBody, segment) {
  let inQuestions = false;
  const quizSuffix = segment.id === 'ch00' ? '0' : String(segment.number);
  const lines = rawBody
    .split('\n')
    .slice(1)
    .filter(line => !/^# 第[123]部　/.test(line) && line.trim() !== '---')
    .map(line => {
      if (line === '## 理解度確認問題') {
        inQuestions = true;
        return `### 章末問題${quizSuffix}`;
      }
      if (line === '## 解答・解説') {
        inQuestions = false;
        return `### 解答・解説${quizSuffix}`;
      }
      if (inQuestions && /^\d+\.\s+/.test(line)) {
        return line.replace(/^(\d+\.\s+)/, '$1［基礎］');
      }
      if (line.startsWith('# ')) return `## ${line.slice(2)}`;
      return line;
    });

  while (lines[0]?.trim() === '') lines.shift();
  while (lines.at(-1)?.trim() === '') lines.pop();

  const sectionHeading = segment.sectionTitle ? `## ${segment.sectionTitle}\n\n` : '';
  return `---\nid: ${quote(segment.id)}\nnumber: ${segment.number}\ntitle: ${quote(segment.title)}\nsummary: ${quote(segment.summary)}\n---\n\n# ${segment.title}\n\n${sectionHeading}${lines.join('\n')}\n`;
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

fs.mkdirSync(courseDir, { recursive: true });
fs.writeFileSync(
  path.join(categoryDir, 'category.toml'),
  'id = "social_sciences"\ntitle = "人文・社会科学"\norder = 20\ncolor = "#6b5ca5"\n'
);

fs.writeFileSync(
  path.join(courseDir, 'course.toml'),
  `id = "social_psychology"\n` +
  `title = "社会心理学〔補訂版〕学習参考書"\n` +
  `subtitle = "有斐閣『社会心理学〔補訂版〕』対応"\n` +
  `description = "社会心理学の理論・研究法・応用を19章で体系的に学ぶ参考書"\n` +
  `author = "AnS"\n` +
  `version = "1.0.0"\n\n` +
  `[features]\nquiz = true\nsearch = true\n\n` +
  `[categories]\n` +
  `intro = "ガイド"\nch00 = "基礎"\n` +
  Array.from({ length: 6 }, (_, index) => `ch${String(index + 1).padStart(2, '0')} = "人や社会をとらえる心"`).join('\n') + '\n' +
  Array.from({ length: 5 }, (_, index) => `ch${String(index + 7).padStart(2, '0')} = "関係・集団・ネットワーク"`).join('\n') + '\n' +
  Array.from({ length: 8 }, (_, index) => `ch${String(index + 12).padStart(2, '0')} = "社会・組織・文化"`).join('\n') + '\n' +
  `advanced = "発展学習"\nsynthesis = "発展学習"\ncomprehensive = "発展学習"\nglossary = "資料"\nresearch_checklist = "資料"\nreferences = "資料"\nfinal_check = "資料"\n`
);

locatedSegments.forEach((segment, index) => {
  const end = locatedSegments[index + 1]?.index ?? source.length;
  const rawBody = source.slice(segment.index, end);
  fs.writeFileSync(path.join(courseDir, segment.file), convertChapterBody(rawBody, segment));
});

console.log(`Imported ${locatedSegments.length} chapters into ${path.relative(rootDir, courseDir)}`);
