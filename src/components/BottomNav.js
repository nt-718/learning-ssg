const homeItem = { id: 'course_select', label: 'ホーム', icon: '<path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9Z"/>' };
const activityItem = { id: 'activity', label: '学習記録', icon: '<path d="M5 19V9m5 10V5m5 14v-7m5 7V3"/>' };
const courseItems = [
  { id: 'chapter', label: '本文', icon: '<path d="M5 4h11a3 3 0 0 1 3 3v13H7a2 2 0 0 1-2-2V4Zm0 13h14M9 8h6M9 12h6"/>' },
  { id: 'quiz', label: '演習', icon: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/>' },
  { id: 'toc', label: '目次', icon: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>' }
];

export function renderBottomNav(container, { activeView, onSelectNav }) {
  const isGlobalView = activeView === 'course_select' || activeView === 'activity';
  const navItems = isGlobalView ? [homeItem, activityItem] : [homeItem, ...courseItems, activityItem];
  container.innerHTML = `
    <nav class="mobile-bottom-nav ${isGlobalView ? 'is-global' : 'is-course'}" style="--nav-count:${navItems.length}" aria-label="メインナビゲーション">
      ${navItems.map(item => `
        <button class="bottom-nav-item ${activeView === item.id ? 'is-active' : ''}" data-nav="${item.id}" ${activeView === item.id ? 'aria-current="page"' : ''}>
          <svg viewBox="0 0 24 24" aria-hidden="true">${item.icon}</svg>
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;

  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => onSelectNav(btn.dataset.nav));
  });
}
