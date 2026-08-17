import { Storage } from '../utils/storage.js';

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getActivityLevel(count) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

export function renderActivityViewer(container, { allCourses = {}, selectedCourseId = 'all' } = {}) {
  let isAllCourses = selectedCourseId === 'all';
  if (!isAllCourses && !allCourses[selectedCourseId]) {
    selectedCourseId = 'all';
    isAllCourses = true;
  }
  const currentCourse = allCourses[selectedCourseId];
  const activity = Storage.getLearningActivity(selectedCourseId === 'all' ? undefined : selectedCourseId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const heatmapStart = new Date(today);
  heatmapStart.setDate(today.getDate() - today.getDay() - (15 * 7));

  const activityDays = Array.from({ length: 16 * 7 }, (_, index) => {
    const date = new Date(heatmapStart);
    date.setDate(heatmapStart.getDate() + index);
    const key = toDateKey(date);
    const entry = activity[key] || {};
    return { date, key, count: entry.total || 0, isFuture: date > today };
  });

  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay());
  const activeDaysThisWeek = activityDays.filter(day => day.date >= currentWeekStart && day.date <= today && day.count > 0).length;
  const totalActivities = activityDays.reduce((sum, day) => sum + day.count, 0);
  const totalActiveDays = activityDays.filter(day => day.count > 0).length;
  let streak = 0;
  const streakCursor = new Date(today);
  while ((activity[toDateKey(streakCursor)]?.total || 0) > 0) {
    streak += 1;
    streakCursor.setDate(streakCursor.getDate() - 1);
  }

  const activeDateKeys = Object.keys(activity).filter(key => (activity[key]?.total || 0) > 0).sort();
  const lastActivityKey = activeDateKeys.at(-1);
  const lastActivityLabel = lastActivityKey
    ? new Intl.DateTimeFormat('ja-JP', { month: 'numeric', day: 'numeric' }).format(new Date(`${lastActivityKey}T00:00:00`))
    : '—';
  const readCount = selectedCourseId === 'all' ? 0 : Storage.getReadChapters(selectedCourseId).length;
  const answeredCount = selectedCourseId === 'all' ? 0 : Object.keys(Storage.getQuizHistory(selectedCourseId)).length;
  const hasLegacyCourseProgress = !isAllCourses && activeDateKeys.length === 0 && (readCount > 0 || answeredCount > 0);
  const courseColor = currentCourse?.config?.category?.color;

  container.innerHTML = `
    <div class="activity-page max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-12 animate-fade-in"${courseColor ? ` style="--activity-course-color:${courseColor}"` : ''}>
      <header class="activity-page-header">
        <div>
          <p class="portal-kicker">ACTIVITY</p>
          <h2>学習記録</h2>
          <p>積み重ねた学習を振り返ります。</p>
        </div>
        <label class="activity-course-filter">
          <span>表示する教材</span>
          <select id="activity-course-select">
            <option value="all" ${selectedCourseId === 'all' ? 'selected' : ''}>すべての教材</option>
            ${Object.entries(allCourses).map(([courseId, course]) => `
              <option value="${courseId}" ${selectedCourseId === courseId ? 'selected' : ''}>${course.config?.title || courseId}</option>
            `).join('')}
          </select>
        </label>
      </header>

      <section class="activity-overview" aria-label="学習記録の概要">
        ${selectedCourseId === 'all' ? `
          <div><strong>${activeDaysThisWeek}</strong><span>今週の学習日数</span></div>
          <div><strong>${streak}</strong><span>連続学習日数</span></div>
          <div><strong>${totalActivities}</strong><span>16週間の取り組み</span></div>
        ` : `
          <div><strong>${readCount}</strong><span>読了した章</span></div>
          <div><strong>${answeredCount}</strong><span>解答済み問題</span></div>
          <div><strong class="is-date">${lastActivityLabel}</strong><span>最終学習日</span></div>
        `}
      </section>

      ${hasLegacyCourseProgress ? '<p class="activity-migration-note">教材別の日付記録は、今回の機能追加後の学習から反映されます。</p>' : ''}

      <section class="activity-card activity-page-card" aria-labelledby="activity-map-title">
        <div class="activity-heading">
          <div>
            <p class="portal-kicker">16 WEEKS</p>
            <h3 id="activity-map-title">${selectedCourseId === 'all' ? '全教材' : currentCourse.config?.title || selectedCourseId}の取り組み</h3>
          </div>
          <span class="activity-days-total">${totalActiveDays}日活動</span>
        </div>
        <div class="activity-grid-wrap">
          <div class="activity-grid" aria-label="直近16週間の学習記録">
            ${activityDays.map(day => `
              <span class="activity-cell level-${getActivityLevel(day.count)} ${day.isFuture ? 'is-future' : ''}" title="${day.key}: ${day.count}件" aria-label="${day.key} ${day.count}件"></span>
            `).join('')}
          </div>
        </div>
        <div class="activity-legend" aria-hidden="true">
          <span>少ない</span>
          <i class="level-0"></i><i class="level-1"></i><i class="level-2"></i><i class="level-3"></i><i class="level-4"></i>
          <span>多い</span>
        </div>
      </section>
    </div>
  `;

  container.querySelector('#activity-course-select')?.addEventListener('change', event => {
    renderActivityViewer(container, { allCourses, selectedCourseId: event.target.value });
  });
}
