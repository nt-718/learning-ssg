import { Storage } from '../utils/storage.js';

export function renderHeader(container, { activeView, activeCourseId, allCourses, onSelectCourse, onOpenSearch, onSelectView, totalChaptersCount = 11 }) {
  const readList = Storage.getReadChapters();
  const totalCh = totalChaptersCount || 1;
  const progressPct = Math.min(100, Math.round((readList.length / totalCh) * 100));
  const currentTheme = Storage.getTheme();
  const isPortal = activeView === 'course_select';
  const isGlobalView = isPortal || activeView === 'activity';
  const currentCourse = (allCourses && allCourses[activeCourseId]) ? allCourses[activeCourseId] : null;
  const courseTitle = isPortal ? 'AnS' : (activeView === 'activity' ? '学習記録' : (currentCourse?.config?.title || '合格参考書'));

  container.innerHTML = `
    <header class="top-header">
      <div class="header-left">
        <button class="header-brand" id="header-brand" aria-label="教材一覧へ戻る">
          <span class="brand-mark">A</span>
          <span class="brand-copy">
            <strong>${courseTitle}</strong>
            ${!isPortal ? '<small>AnS</small>' : ''}
          </span>
        </button>
      </div>

      <div class="header-actions">
        ${!isGlobalView ? `
          <button id="btn-go-portal" class="header-catalog-button">教材一覧</button>
          <select id="course-select-dropdown" class="header-course-select" aria-label="教材を切り替える">
            ${Object.keys(allCourses || {}).map(cId => {
              const cName = allCourses[cId]?.config?.title || cId;
              return `<option value="${cId}" ${cId === activeCourseId ? 'selected' : ''}>${cName}</option>`;
            }).join('')}
          </select>
          <span class="header-progress" id="header-progress-text">${progressPct}%</span>
        ` : ''}
        <button id="btn-trigger-search-mobile" class="header-icon-button" title="検索" aria-label="検索">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>
        </button>
        <button id="btn-theme-toggle" class="header-icon-button" title="テーマ切り替え" aria-label="テーマ切り替え">
          <svg viewBox="0 0 24 24">
            <path d="${currentTheme === 'dark' ? 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.4 6.4-1.5-1.5M7.1 7.1 5.6 5.6m12.8 0-1.5 1.5M7.1 16.9l-1.5 1.5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' : 'M20 15.2A8.5 8.5 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z'}"/>
          </svg>
        </button>
      </div>
    </header>
  `;

  container.querySelector('#btn-trigger-search-mobile').addEventListener('click', onOpenSearch);
  container.querySelector('#btn-go-portal')?.addEventListener('click', () => onSelectView('course_select'));
  container.querySelector('#course-select-dropdown')?.addEventListener('change', (event) => onSelectCourse?.(event.target.value));
  container.querySelector('#header-brand').addEventListener('click', () => onSelectView('course_select'));
  container.querySelector('#btn-theme-toggle').addEventListener('click', () => {
    Storage.setTheme(Storage.getTheme() === 'dark' ? 'light' : 'dark');
    renderHeader(container, { activeView, activeCourseId, allCourses, onSelectCourse, onOpenSearch, onSelectView, totalChaptersCount });
  });
}

export function updateHeaderProgress(totalChaptersCount = 11) {
  const readList = Storage.getReadChapters();
  const progressPct = Math.min(100, Math.round((readList.length / (totalChaptersCount || 1)) * 100));
  const txt = document.querySelector('#header-progress-text');
  if (txt) txt.textContent = `${progressPct}%`;
}
