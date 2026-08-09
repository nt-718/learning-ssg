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

export function renderActivityViewer(container) {
  const activity = Storage.getLearningActivity();
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

  container.innerHTML = `
    <div class="activity-page max-w-3xl mx-auto px-5 md:px-8 py-8 md:py-12 animate-fade-in">
      <header class="activity-page-header">
        <p class="portal-kicker">ACTIVITY</p>
        <h2>学習記録</h2>
        <p>積み重ねた学習を振り返ります。</p>
      </header>

      <section class="activity-overview" aria-label="学習記録の概要">
        <div><strong>${activeDaysThisWeek}</strong><span>今週の学習日数</span></div>
        <div><strong>${streak}</strong><span>連続学習日数</span></div>
        <div><strong>${totalActivities}</strong><span>16週間の取り組み</span></div>
      </section>

      <section class="activity-card activity-page-card" aria-labelledby="activity-map-title">
        <div class="activity-heading">
          <div>
            <p class="portal-kicker">16 WEEKS</p>
            <h3 id="activity-map-title">取り組みの記録</h3>
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
}
