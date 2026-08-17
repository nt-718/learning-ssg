import { Storage } from '../utils/storage.js';

export function renderHeader(container, { activeView, activeCourseId, allCourses, onSelectCourse, onOpenSearch, onOpenSettings, onSelectView, totalChaptersCount = 11 }) {
  const readList = Storage.getReadChapters(activeCourseId);
  const totalCh = totalChaptersCount || 1;
  const progressPct = Math.min(100, Math.round((readList.length / totalCh) * 100));
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
        <button id="btn-open-settings" class="header-icon-button" title="設定" aria-label="設定">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>
          </svg>
        </button>
      </div>
    </header>
  `;

  container.querySelector('#btn-trigger-search-mobile').addEventListener('click', onOpenSearch);
  container.querySelector('#btn-open-settings').addEventListener('click', onOpenSettings);
  container.querySelector('#course-select-dropdown')?.addEventListener('change', (event) => onSelectCourse?.(event.target.value));
  container.querySelector('#header-brand').addEventListener('click', () => onSelectView('course_select'));
}

export function updateHeaderProgress(courseId, totalChaptersCount = 11) {
  const readList = Storage.getReadChapters(courseId);
  const progressPct = Math.min(100, Math.round((readList.length / (totalChaptersCount || 1)) * 100));
  const txt = document.querySelector('#header-progress-text');
  if (txt) txt.textContent = `${progressPct}%`;
}
