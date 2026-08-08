// Mobile-First Header Component

import { Storage } from '../utils/storage.js';

export function renderHeader(container, { onOpenSearch, onToggleSidebar, onSelectView }) {
  const readList = Storage.getReadChapters();
  const progressPct = Math.round((readList.length / 11) * 100);
  const currentTheme = Storage.getTheme();

  container.innerHTML = `
    <header class="top-header flex items-center justify-between px-3 py-2 bg-header-bg border-b border-glass sticky top-0 z-30 backdrop-blur-md">
      
      <!-- Brand Logo / Drawer trigger -->
      <div class="flex items-center gap-2">
        <button id="btn-toggle-sidebar" class="p-2 rounded-xl hover:bg-surface/50 text-muted hover:text-white transition md:block" title="章目次を開く">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <div class="flex items-center gap-2 cursor-pointer" id="header-brand">
          <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-md">
            FP
          </div>
          <div>
            <h1 class="text-xs font-bold tracking-tight text-white leading-tight">FP 3級→2級</h1>
            <span class="text-[9px] text-accent font-medium hidden sm:inline">合格参考書 2026</span>
          </div>
        </div>
      </div>

      <!-- Center Search Bar for Tablet/Desktop -->
      <div class="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <button id="btn-trigger-search-desktop" class="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-surface/60 border border-glass text-muted text-xs hover:border-accent transition">
          <span class="flex items-center gap-2">
            <svg class="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            検索...
          </span>
          <kbd class="px-1 py-0.5 rounded bg-surface text-[9px] text-muted">Ctrl K</kbd>
        </button>
      </div>

      <!-- Right Controls -->
      <div class="flex items-center gap-2">
        <!-- Progress pill -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface/50 border border-glass text-[11px]">
          <span class="text-muted text-[10px]">進捗</span>
          <span id="header-progress-text" class="font-bold text-emerald-400 font-mono">${progressPct}%</span>
        </div>

        <!-- Search button for mobile -->
        <button id="btn-trigger-search-mobile" class="p-2 rounded-xl bg-surface/50 md:hidden text-accent" title="検索">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 0114 0z"></path></svg>
        </button>

        <!-- Theme Toggle -->
        <button id="btn-theme-toggle" class="p-2 rounded-xl hover:bg-surface/50 text-muted hover:text-white transition" title="テーマ切り替え">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${currentTheme === 'dark' ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'}"></path>
          </svg>
        </button>
      </div>
    </header>
  `;

  container.querySelector('#btn-toggle-sidebar').addEventListener('click', onToggleSidebar);
  
  const searchDt = container.querySelector('#btn-trigger-search-desktop');
  if (searchDt) searchDt.addEventListener('click', onOpenSearch);

  const searchMb = container.querySelector('#btn-trigger-search-mobile');
  if (searchMb) searchMb.addEventListener('click', onOpenSearch);

  container.querySelector('#header-brand').addEventListener('click', () => onSelectView('chapter', 'intro'));

  const themeBtn = container.querySelector('#btn-theme-toggle');
  themeBtn.addEventListener('click', () => {
    const nextTheme = Storage.getTheme() === 'dark' ? 'light' : 'dark';
    Storage.setTheme(nextTheme);
    renderHeader(container, { onOpenSearch, onToggleSidebar, onSelectView });
  });
}

export function updateHeaderProgress() {
  const readList = Storage.getReadChapters();
  const progressPct = Math.round((readList.length / 11) * 100);
  const txt = document.querySelector('#header-progress-text');
  if (txt) txt.textContent = `${progressPct}%`;
}
