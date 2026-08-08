// Mobile-First Bottom Navigation Bar Component

export function renderBottomNav(container, { activeView, onSelectNav }) {
  container.innerHTML = `
    <nav class="mobile-bottom-nav bg-header-bg border-t border-glass backdrop-blur-lg px-2 py-1 flex items-center justify-around shadow-2xl pb-[env(safe-area-inset-bottom)]">
      
      <!-- Textbook Chapter View -->
      <button 
        class="bottom-nav-item flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-bold transition ${activeView === 'chapter' ? 'text-accent' : 'text-muted hover:text-white'}"
        data-nav="chapter"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
        <span>参考書本文</span>
      </button>

      <!-- Tools Simulators View -->
      <button 
        class="bottom-nav-item flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-bold transition ${activeView === 'tool' ? 'text-accent' : 'text-muted hover:text-white'}"
        data-nav="tool"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
        </svg>
        <span>電卓・工具</span>
      </button>

      <!-- Quiz View -->
      <button 
        class="bottom-nav-item flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-bold transition ${activeView === 'quiz' ? 'text-emerald-400' : 'text-muted hover:text-white'}"
        data-nav="quiz"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>160問演習</span>
      </button>

      <!-- Search Trigger -->
      <button 
        class="bottom-nav-item flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-bold text-muted hover:text-white transition"
        data-nav="search"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <span>検索</span>
      </button>

      <!-- Chapter Drawer Menu -->
      <button 
        class="bottom-nav-item flex flex-col items-center justify-center min-w-[56px] py-1 text-[10px] font-bold text-muted hover:text-white transition"
        data-nav="drawer"
      >
        <svg class="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <span>章目次</span>
      </button>

    </nav>
  `;

  container.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSelectNav(btn.dataset.nav);
    });
  });
}
