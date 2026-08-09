// Chapter viewer component for Markdown text and images

import { marked } from 'marked';
import { Storage } from '../utils/storage.js';
import { updateHeaderProgress } from './Header.js';

export function renderChapterViewer(container, chapterId, { chapters = [], courseConfig = {}, onNavigateChapter, onSelectView }) {
  const currentChapters = chapters.length > 0 ? chapters : [];
  const chapter = currentChapters.find(c => c.id === chapterId) || currentChapters[0] || { title: '', content: '' };
  const readList = Storage.getReadChapters();
  const isRead = readList.includes(chapter.id);
  const isDark = Storage.getTheme() === 'dark';

  // Configure marked
  marked.setOptions({
    gfm: true,
    breaks: true
  });

  let rawHtml = marked.parse(chapter.content || '');

  // Replace image markdown tags with stylized image containers
  rawHtml = rawHtml.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*\/?>/g, (match, src, alt) => {
    return `
      <div class="my-6 p-4 bg-surface/80 rounded-2xl border border-glass text-center shadow-md group">
        <div class="overflow-hidden rounded-xl border border-glass bg-card-bg p-2">
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

  const chIndex = currentChapters.findIndex(c => c.id === chapter.id);
  const prevCh = chIndex > 0 ? currentChapters[chIndex - 1] : null;
  const nextCh = chIndex < currentChapters.length - 1 ? currentChapters[chIndex + 1] : null;

  container.innerHTML = `
    <div class="chapter-container max-w-4xl mx-auto px-4 py-8">
      
      <!-- Chapter Banner Header -->
      <div class="chapter-banner mb-8 p-6 rounded-2xl bg-card-bg border border-glass shadow-lg relative overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <span class="chapter-course-label">
              ${courseConfig.title || '合格参考書'}
            </span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">${chapter.title}</h2>
            ${chapter.summary ? `<p class="mt-2 text-xs md:text-sm text-muted">${chapter.summary}</p>` : ''}
          </div>

          <button id="btn-toggle-read" class="chapter-read-button ${isRead ? 'is-read' : ''}">
            <span>${isRead ? '✓ 読了済み' : '読了にする'}</span>
          </button>
        </div>
      </div>

      <!-- Main Chapter Body HTML -->
      <article class="prose ${isDark ? 'prose-invert' : 'prose-slate'} max-w-none prose-headings:font-extrabold prose-a:text-accent prose-table:w-full prose-table:border-collapse">
        ${rawHtml}
      </article>

      <!-- Chapter Bottom Navigation -->
      <div class="chapter-footer mt-12 pt-6 border-t border-glass flex flex-col sm:flex-row items-center justify-between gap-4">
        ${prevCh ? `
          <button id="btn-prev-ch" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-foreground transition flex items-center justify-center gap-2">
            <span>← ${prevCh.shortTitle || prevCh.title}</span>
          </button>
        ` : '<div></div>'}

        <button id="btn-footer-quiz" class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition">
          この章の演習問題を解く
        </button>

        ${nextCh ? `
          <button id="btn-next-ch" class="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-foreground transition flex items-center justify-center gap-2">
            <span>${nextCh.shortTitle || nextCh.title} →</span>
          </button>
        ` : '<div></div>'}
      </div>

    </div>
  `;

  // Attach handlers
  const readBtn = container.querySelector('#btn-toggle-read');
  if (readBtn) {
    readBtn.addEventListener('click', () => {
      Storage.toggleReadChapter(chapter.id);
      updateHeaderProgress(currentChapters.length);
      renderChapterViewer(container, chapterId, { chapters, courseConfig, onNavigateChapter, onSelectView });
    });
  }

  const prevBtn = container.querySelector('#btn-prev-ch');
  if (prevBtn && prevCh) prevBtn.addEventListener('click', () => onNavigateChapter(prevCh.id));

  const nextBtn = container.querySelector('#btn-next-ch');
  if (nextBtn && nextCh) nextBtn.addEventListener('click', () => onNavigateChapter(nextCh.id));

  const quizBtn = container.querySelector('#btn-footer-quiz');
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      onSelectView('quiz', chapter.id);
    });
  }
}
