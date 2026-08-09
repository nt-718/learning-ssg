import { Storage } from '../utils/storage.js';

export function renderCourseSelectViewer(container, { allCourses = {}, activeCourseId, onSelectCourse }) {
  const readList = Storage.getReadChapters();
  const courseIds = Object.keys(allCourses);
  const totalChapterIds = courseIds.flatMap(id => (allCourses[id]?.chapters || []).map(ch => ch.id));
  const totalReadCount = readList.filter(id => totalChapterIds.includes(id)).length;

  const getCourseMark = (id, title) => {
    if (id.includes('takken') || title.includes('宅建')) return '宅';
    if (id.includes('financial') || title.includes('FP')) return 'FP';
    if (id.includes('boki') || title.includes('簿記')) return '簿';
    return '学';
  };

  const categories = new Map();
  courseIds.forEach(courseId => {
    const category = allCourses[courseId]?.config?.category || { id: 'uncategorized', title: 'その他', order: 999 };
    if (!categories.has(category.id)) categories.set(category.id, { ...category, courseIds: [] });
    categories.get(category.id).courseIds.push(courseId);
  });
  const categoryGroups = [...categories.values()].sort((a, b) =>
    (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title, 'ja')
  );

  const renderCourseCard = (courseId) => {
    const course = allCourses[courseId];
    const config = course?.config || {};
    const chapters = course?.chapters || [];
    const quizQuestions = course?.quizQuestions || [];
    const isCurrent = courseId === activeCourseId;
    const mark = getCourseMark(courseId, config.title || '');
    const chapterIds = chapters.map(ch => ch.id);
    const readCount = readList.filter(id => chapterIds.includes(id)).length;
    const progressPct = chapters.length > 0 ? Math.min(100, Math.round((readCount / chapters.length) * 100)) : 0;

    return `
      <article class="course-card ${isCurrent ? 'is-current' : ''}" data-course-id="${courseId}">
        <div class="course-card-main">
          <div class="course-mark" aria-hidden="true">
            <span>${mark}</span>
            <small>STUDY BOOK</small>
          </div>
          <div class="course-card-copy">
            <div class="course-meta">
              <span>${config.author || 'AnS'}</span>
              ${config.version ? `<span>v${config.version}</span>` : ''}
              ${isCurrent ? '<span class="current-label">学習中</span>' : ''}
            </div>
            <h4>${config.title || courseId}</h4>
            ${config.subtitle ? `<p class="course-subtitle">${config.subtitle}</p>` : ''}
            ${config.description ? `<p class="course-description">${config.description}</p>` : ''}
          </div>
        </div>

        <div class="course-details">
          <div class="course-stats" aria-label="教材の内容">
            <span>全${chapters.length}章</span>
            <span>演習${quizQuestions.length}問</span>
          </div>
          <div class="course-progress">
            <div class="course-progress-label"><span>学習進捗</span><span>${progressPct}%</span></div>
            <div class="course-progress-track" aria-hidden="true"><div style="width:${progressPct}%"></div></div>
          </div>
          <button class="btn-start-course">
            <span>${progressPct > 0 ? '続きから学ぶ' : 'この教材をはじめる'}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </button>
        </div>
      </article>
    `;
  };

  container.innerHTML = `
    <div class="course-portal-container max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-16 animate-fade-in">
      <section class="portal-intro">
        <div>
          <p class="portal-kicker">学習ホーム</p>
          <h2 class="portal-title">今日も、少しずつ。</h2>
          <p class="portal-description">続けることが、いちばんの近道です。</p>
        </div>
        <div class="portal-summary" aria-label="読了した章数">
          <strong>${totalReadCount}</strong>
          <span>章 読了</span>
        </div>
      </section>

      <section aria-labelledby="course-list-title">
        <div class="course-list-heading">
          <h3 id="course-list-title">教材</h3>
          <span>${courseIds.length}コース</span>
        </div>
        <div class="course-category-list">
          ${categoryGroups.map(category => `
            <section class="course-category" aria-labelledby="category-${category.id}">
              <div class="course-category-heading">
                <h4 id="category-${category.id}">${category.title}</h4>
                <span>${category.courseIds.length}</span>
              </div>
              <div class="course-list">
                ${category.courseIds.map(renderCourseCard).join('')}
              </div>
            </section>
          `).join('')}
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll('[data-course-id]').forEach(card => {
    card.addEventListener('click', () => onSelectCourse?.(card.dataset.courseId));
  });
}
