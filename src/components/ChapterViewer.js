// Chapter viewer component with markdown rendering and embedded visual tools

import { marked } from 'marked';
import { CHAPTERS } from '../data/contentData.js';
import { Storage } from '../utils/storage.js';
import { updateHeaderProgress } from './Header.js';
import { renderSixCoefficients } from '../visualizers/SixCoefficients.js';
import { renderPensionSimulator } from '../visualizers/PensionSimulator.js';
import { renderTaxCalculator } from '../visualizers/TaxCalculator.js';
import { renderRealEstateSim } from '../visualizers/RealEstateSim.js';
import { renderNisaVisualizer } from '../visualizers/NisaVisualizer.js';
import { renderInheritanceSim } from '../visualizers/InheritanceSim.js';

export function renderChapterViewer(container, chapterId, { onNavigateChapter, onSelectView }) {
  const chapter = CHAPTERS.find(c => c.id === chapterId) || CHAPTERS[0];
  const readList = Storage.getReadChapters();
  const isRead = readList.includes(chapter.id);

  // Configure marked
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  // Render markdown content
  let rawHtml = marked.parse(chapter.content);

  // Replace image markdown tags with stylized image containers
  // e.g. <img src="images/ch01_cashflow_bs.svg" alt="...">
  rawHtml = rawHtml.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*\/?>/g, (match, src, alt) => {
    return `
      <div class="my-6 p-4 bg-surface/80 rounded-2xl border border-glass text-center shadow-lg group">
        <div class="overflow-hidden rounded-xl border border-primary/20 bg-indigo-950/20 p-2">
          <img src="${src}" alt="${alt}" class="w-full h-auto max-h-[500px] object-contain mx-auto transition transform group-hover:scale-[1.01]" />
        </div>
        ${alt ? `<p class="mt-2 text-xs font-semibold text-accent">${alt}</p>` : ''}
      </div>
    `;
  });

  // Replace blockquotes with customized Alert boxes
  rawHtml = rawHtml.replace(/<blockquote>\s*<p>(.*?)<\/p>\s*<\/blockquote>/gs, (match, content) => {
    let alertClass = 'alert-info';
    let icon = '💡';
    let title = 'POINT';

    if (content.includes('重要') || content.includes('試験の軸')) {
      alertClass = 'alert-important';
      icon = '🎯';
      title = '試験の軸・最重要';
    } else if (content.includes('覚え方') || content.includes('テクニック')) {
      alertClass = 'alert-tip';
      icon = '⚡';
      title = '解法・覚え方';
    }

    return `
      <div class="alert-box ${alertClass} my-4 p-4 rounded-xl border flex gap-3 items-start">
        <span class="text-xl">${icon}</span>
        <div>
          <div class="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">${title}</div>
          <div class="text-sm leading-relaxed">${content}</div>
        </div>
      </div>
    `;
  });

  const chIndex = CHAPTERS.findIndex(c => c.id === chapter.id);
  const prevCh = chIndex > 0 ? CHAPTERS[chIndex - 1] : null;
  const nextCh = chIndex < CHAPTERS.length - 1 ? CHAPTERS[chIndex + 1] : null;

  container.innerHTML = `
    <div class="chapter-container max-w-4xl mx-auto px-4 py-8">
      
      <!-- Chapter Banner Header -->
      <div class="chapter-banner mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-card-bg to-blue-950/40 border border-glass shadow-xl relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span class="inline-block px-3 py-1 rounded-full bg-primary/20 text-accent text-xs font-bold mb-2 border border-primary/30">
              FP技能士 3級→2級
            </span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">${chapter.title}</h2>
            ${chapter.summary ? `<p class="mt-2 text-xs md:text-sm text-muted">${chapter.summary}</p>` : ''}
          </div>

          <button id="btn-toggle-read" class="px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${isRead ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50' : 'bg-surface text-muted hover:text-white border-glass'} shadow-md">
            <span>${isRead ? '✓ 読了済み' : '〇 読了に移動'}</span>
          </button>
        </div>
      </div>

      <!-- Embedded Interactive Tool Card if Chapter matched -->
      <div id="chapter-embedded-tool" class="mb-10"></div>

      <!-- Main Chapter Body HTML -->
      <article class="prose prose-invert max-w-none prose-headings:text-white prose-a:text-accent prose-table:w-full prose-table:border-collapse">
        ${rawHtml}
      </article>

      <!-- Chapter Bottom Navigation -->
      <div class="chapter-footer mt-12 pt-6 border-t border-glass flex flex-col sm:flex-row items-center justify-between gap-4">
        ${prevCh ? `
          <button id="btn-prev-ch" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-white transition flex items-center justify-center gap-2">
            <span>← ${prevCh.shortTitle}</span>
          </button>
        ` : '<div></div>'}

        <button id="btn-footer-quiz" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition">
          この章の章末問題を解く
        </button>

        ${nextCh ? `
          <button id="btn-next-ch" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-white transition flex items-center justify-center gap-2">
            <span>${nextCh.shortTitle} →</span>
          </button>
        ` : '<div></div>'}
      </div>

    </div>
  `;

  // Embed specific visualizer tool into chapter top if applicable
  const toolContainer = container.querySelector('#chapter-embedded-tool');
  if (chapterId === 'ch01') renderSixCoefficients(toolContainer);
  else if (chapterId === 'ch02') renderPensionSimulator(toolContainer);
  else if (chapterId === 'ch04') renderNisaVisualizer(toolContainer);
  else if (chapterId === 'ch05') renderTaxCalculator(toolContainer);
  else if (chapterId === 'ch06') renderRealEstateSim(toolContainer);
  else if (chapterId === 'ch07') renderInheritanceSim(toolContainer);

  // Attach handlers
  const readBtn = container.querySelector('#btn-toggle-read');
  readBtn.addEventListener('click', () => {
    Storage.toggleReadChapter(chapter.id);
    updateHeaderProgress();
    renderChapterViewer(container, chapterId, { onNavigateChapter, onSelectView });
  });

  const prevBtn = container.querySelector('#btn-prev-ch');
  if (prevBtn) prevBtn.addEventListener('click', () => onNavigateChapter(prevCh.id));

  const nextBtn = container.querySelector('#btn-next-ch');
  if (nextBtn) nextBtn.addEventListener('click', () => onNavigateChapter(nextCh.id));

  container.querySelector('#btn-footer-quiz').addEventListener('click', () => {
    onSelectView('quiz', chapter.id);
  });
}
