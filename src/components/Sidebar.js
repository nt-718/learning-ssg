import { Storage } from '../utils/storage.js';

export function renderSidebar(container, { chapters = [], quizQuestions = [], courseConfig = {}, activeView, activeChapterId, activeQuizFilter = 'all', onSelectView, onClose, mode = 'sidebar' }) {
  const readChapters = Storage.getReadChapters(courseConfig.id);
  const wrongCount = Storage.getWrongQuestions(courseConfig.id).length;
  const categories = courseConfig.categories || {};
  const courseChIds = chapters.map(ch => ch.id);
  const readCount = readChapters.filter(id => courseChIds.includes(id)).length;
  const progressPct = chapters.length > 0 ? Math.min(100, Math.round((readCount / chapters.length) * 100)) : 0;
  const courseMark = courseConfig.id?.includes('takken') || courseConfig.title?.includes('宅建')
    ? '宅'
    : courseConfig.id?.includes('financial') || courseConfig.title?.includes('FP')
      ? 'FP'
      : courseConfig.id?.includes('econom') || courseConfig.title?.includes('経済')
        ? '経'
        : courseConfig.id?.includes('chinese') || courseConfig.title?.includes('中国語')
          ? '中'
          : courseConfig.id?.includes('english') || courseConfig.title?.includes('英語')
            ? '英'
            : '学';
  const levelCounts = quizQuestions.reduce((counts, question) => {
    const level = question.level || '演習';
    counts.set(level, (counts.get(level) || 0) + 1);
    return counts;
  }, new Map());
  const levelLabel = level => level === '3級' ? '3級 基礎問題' : level === '2級' ? '2級 応用問題' : `${level} 問題`;

  const getChapterLabel = (chapter, index) => {
    if (chapter.id === 'intro') return '序';
    return String(chapter.number ?? index).padStart(2, '0');
  };

  container.innerHTML = `
    <aside class="sidebar-nav ${mode === 'page' ? 'toc-page' : ''}">
      <div class="sidebar-header">
        <div>
          <span class="sidebar-eyebrow">LEARNING SSG</span>
          <h2>目次</h2>
        </div>
        ${mode === 'sidebar' ? `
          <button id="btn-sidebar-close" class="sidebar-close-button" aria-label="目次を閉じる">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
          </button>
        ` : ''}
      </div>

      <div class="sidebar-course">
        <div class="sidebar-course-top">
          <div class="sidebar-book-mark" aria-hidden="true">${courseMark}</div>
          <div class="sidebar-course-copy">
            <span>学習中の教材</span>
            <strong>${courseConfig.title || '合格参考書'}</strong>
          </div>
        </div>
        <div class="sidebar-progress-label">
          <span>学習進捗</span>
          <strong>${readCount}/${chapters.length}章 · ${progressPct}%</strong>
        </div>
        <div class="sidebar-progress-track" aria-hidden="true"><div style="width:${progressPct}%"></div></div>
        <button id="btn-sidebar-portal" class="sidebar-switch-button">教材を切り替える</button>
      </div>

      <section class="sidebar-section" aria-labelledby="sidebar-chapters-title">
        <div class="sidebar-section-heading">
          <h3 id="sidebar-chapters-title">章一覧</h3>
          <span>${chapters.length}章</span>
        </div>
        <nav class="sidebar-chapter-list">
          ${chapters.map((chapter, index) => {
            const isRead = readChapters.includes(chapter.id);
            const isActive = (activeView === 'chapter' || activeView === 'toc') && activeChapterId === chapter.id;
            const category = categories[chapter.id] || '';
            return `
              <button class="sidebar-chapter-item ${isActive ? 'is-active' : ''} ${isRead ? 'is-read' : ''}" data-ch-id="${chapter.id}">
                <span class="sidebar-chapter-index">${getChapterLabel(chapter, index)}</span>
                <span class="sidebar-chapter-copy">
                  <strong>${chapter.shortTitle || chapter.title}</strong>
                  ${category ? `<small>${category}</small>` : ''}
                </span>
                ${isRead ? '<span class="sidebar-read-check" aria-label="読了済み">✓</span>' : '<span class="sidebar-chevron" aria-hidden="true">›</span>'}
              </button>
            `;
          }).join('')}
        </nav>
      </section>

      ${quizQuestions.length ? `<section class="sidebar-section sidebar-practice" aria-labelledby="sidebar-practice-title">
        <div class="sidebar-section-heading">
          <h3 id="sidebar-practice-title">問題演習</h3>
        </div>
        <nav>
          <button class="sidebar-practice-item ${activeView === 'quiz' && activeQuizFilter === 'all' ? 'is-active' : ''}" data-quiz-filter="all">
            <span>すべての問題</span><span>›</span>
          </button>
          ${[...levelCounts.entries()].map(([level, count]) => `
            <button class="sidebar-practice-item ${activeView === 'quiz' && activeQuizFilter === level ? 'is-active' : ''}" data-quiz-filter="${level}">
              <span>${levelLabel(level)}</span><span>${count}</span>
            </button>
          `).join('')}
          <button class="sidebar-practice-item ${activeView === 'quiz' && activeQuizFilter === 'wrong' ? 'is-active' : ''}" data-quiz-filter="wrong">
            <span>要復習</span><span>${wrongCount > 0 ? wrongCount : '›'}</span>
          </button>
        </nav>
      </section>` : ''}
    </aside>
  `;

  container.querySelector('#btn-sidebar-close')?.addEventListener('click', () => onClose?.());
  container.querySelector('#btn-sidebar-portal')?.addEventListener('click', () => onSelectView('course_select'));
  container.querySelectorAll('[data-ch-id]').forEach(btn => {
    btn.addEventListener('click', () => onSelectView('chapter', btn.dataset.chId));
  });
  container.querySelectorAll('[data-quiz-filter]').forEach(btn => {
    btn.addEventListener('click', () => onSelectView('quiz', btn.dataset.quizFilter));
  });
}
