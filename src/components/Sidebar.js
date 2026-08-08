// Sidebar navigation component

import { CHAPTERS } from '../data/contentData.js';
import { Storage } from '../utils/storage.js';

export function renderSidebar(container, { activeView, activeChapterId, activeToolId, onSelectView }) {
  const readChapters = Storage.getReadChapters();
  const wrongCount = Storage.getWrongQuestions().length;

  const toolsList = [
    { id: 'six_coefficients', title: '⚡ 6係数 電卓 & 診断', badge: '第1章' },
    { id: 'pension_sim', title: '🏛️ 公的年金 繰上/繰下試算', badge: '第2章' },
    { id: 'tax_calc', title: '🗻 富士山 損益通算 & 税金', badge: '第5章' },
    { id: 'real_estate_sim', title: '🏙️ 建蔽率・容積率 2D', badge: '第6章' },
    { id: 'nisa_map', title: '🌱 新NISA 制度マップ', badge: '第4章' },
    { id: 'inheritance_tree', title: '🌳 法定相続分 & 控除ツリー', badge: '第7章' }
  ];

  container.innerHTML = `
    <aside class="sidebar-nav w-64 bg-sidebar-bg border-r border-glass flex flex-col h-full overflow-y-auto">
      <div class="p-4 space-y-6">
        
        <!-- Main Navigation Section -->
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 px-2">参考書 本文 (全11章)</div>
          <nav class="space-y-1">
            ${CHAPTERS.map(ch => {
              const isRead = readChapters.includes(ch.id);
              const isActive = activeView === 'chapter' && activeChapterId === ch.id;
              return `
                <button 
                  class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${isActive ? 'bg-primary/30 text-accent font-bold border border-primary/40' : 'hover:bg-surface/50 text-foreground'}"
                  data-ch-id="${ch.id}"
                >
                  <span class="truncate flex-1">${ch.shortTitle}</span>
                  ${isRead ? '<span class="text-emerald-400 text-xs font-bold ml-1">✓</span>' : ''}
                </button>
              `;
            }).join('')}
          </nav>
        </div>

        <!-- Interactive Simulators Section -->
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-accent mb-2 px-2 flex items-center gap-1">
            <span>🛠️ インタラクティブ図解・工具</span>
          </div>
          <nav class="space-y-1">
            ${toolsList.map(t => {
              const isActive = activeView === 'tool' && activeToolId === t.id;
              return `
                <button 
                  class="nav-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${isActive ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' : 'hover:bg-surface/50 text-muted hover:text-white'}"
                  data-tool-id="${t.id}"
                >
                  <span class="truncate flex-1">${t.title}</span>
                  <span class="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-glass text-muted">${t.badge}</span>
                </button>
              `;
            }).join('')}
          </nav>
        </div>

        <!-- Problem Sets & Quiz Section -->
        <div>
          <div class="text-[11px] font-bold uppercase tracking-wider text-muted mb-2 px-2">問題演習・復習</div>
          <nav class="space-y-1">
            <button 
              class="nav-quiz-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition ${activeView === 'quiz' ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/40' : 'hover:bg-surface/50 text-muted hover:text-white'}"
              data-quiz-filter="all"
            >
              <span class="flex items-center gap-2">
                <span>📝 全160問 演習モード</span>
              </span>
            </button>

            <button 
              class="nav-quiz-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-surface/50 text-muted hover:text-white transition"
              data-quiz-filter="3級"
            >
              <span>3級 基礎問題のみ</span>
            </button>

            <button 
              class="nav-quiz-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-surface/50 text-muted hover:text-white transition"
              data-quiz-filter="2級"
            >
              <span>2級 深掘り問題のみ</span>
            </button>

            <button 
              class="nav-quiz-item w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left hover:bg-surface/50 text-amber-300 transition"
              data-quiz-filter="wrong"
            >
              <span class="flex items-center justify-between w-full">
                <span>⚠️ 要復習ノート</span>
                ${wrongCount > 0 ? `<span class="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">${wrongCount}</span>` : ''}
              </span>
            </button>
          </nav>
        </div>

      </div>
    </aside>
  `;

  // Attach handlers
  container.querySelectorAll('[data-ch-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSelectView('chapter', btn.dataset.chId);
    });
  });

  container.querySelectorAll('[data-tool-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSelectView('tool', btn.dataset.toolId);
    });
  });

  container.querySelectorAll('[data-quiz-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      onSelectView('quiz', btn.dataset.quizFilter);
    });
  });
}
