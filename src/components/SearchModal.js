// Full-text search modal component

export function renderSearchModal(container, { chapters = [], quizQuestions = [], onClose, onSelectResult }) {
  container.innerHTML = `
    <div id="search-overlay" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 px-4 animate-fade-in">
      <div class="w-full max-w-2xl bg-card-bg border border-glass rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        <!-- Search Input Header -->
        <div class="p-4 border-b border-glass flex items-center gap-3">
          <svg class="w-5 h-5 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"></path></svg>
          <input
            type="text"
            id="search-input"
            class="w-full bg-transparent border-none text-foreground text-base focus:outline-none placeholder-muted"
            placeholder="キーワード・制度名・問題を入力..."
            autofocus
          >
          <button id="btn-close-search" class="p-1 rounded text-muted hover:text-foreground transition">
            ✕
          </button>
        </div>

        <!-- Search Results List -->
        <div id="search-results" class="p-4 overflow-y-auto space-y-3 flex-1">
          <div class="text-center py-8 text-xs text-muted">
            キーワードを入力すると本文および演習問題から即座に全文検索します
          </div>
        </div>

        <div class="p-3 border-t border-glass bg-surface/40 text-[11px] text-muted flex justify-between items-center">
          <span>Escキーで閉じる</span>
          <span>学習検索</span>
        </div>
      </div>
    </div>
  `;

  const overlay = container.querySelector('#search-overlay');
  const input = container.querySelector('#search-input');
  const resultsDiv = container.querySelector('#search-results');
  const closeBtn = container.querySelector('#btn-close-search');

  const close = () => {
    container.innerHTML = '';
    if (onClose) onClose();
  };

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escHandler);
      close();
    }
  });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      resultsDiv.innerHTML = `
        <div class="text-center py-8 text-xs text-muted">
          キーワードを入力すると本文および演習問題から即座に全文検索します
        </div>
      `;
      return;
    }

    const matchedChs = [];
    chapters.forEach(ch => {
      if ((ch.title && ch.title.toLowerCase().includes(q)) || (ch.content && ch.content.toLowerCase().includes(q))) {
        const idx = ch.content ? ch.content.toLowerCase().indexOf(q) : -1;
        const start = Math.max(0, idx - 40);
        const end = Math.min(ch.content ? ch.content.length : 0, idx + 80);
        const snippet = ch.content ? ch.content.slice(start, end).replace(/\n/g, ' ') : '';
        matchedChs.push({ ch, snippet });
      }
    });

    const matchedQuizzes = quizQuestions.filter(qz =>
      (qz.question && qz.question.toLowerCase().includes(q)) ||
      (qz.explanation && qz.explanation.toLowerCase().includes(q)) ||
      (qz.qNumber && qz.qNumber.toLowerCase().includes(q))
    );

    if (matchedChs.length === 0 && matchedQuizzes.length === 0) {
      resultsDiv.innerHTML = `
        <div class="text-center py-8 text-xs text-muted">
          「${q}」に一致する内容が見つかりませんでした
        </div>
      `;
      return;
    }

    resultsDiv.innerHTML = `
      ${matchedChs.length > 0 ? `
        <div class="mb-4">
          <div class="text-[11px] font-bold uppercase text-accent mb-2">本文ヒット (${matchedChs.length}件)</div>
          <div class="space-y-2">
            ${matchedChs.slice(0, 5).map(m => `
              <div 
                class="search-item p-3 rounded-xl bg-surface/60 border border-glass hover:border-accent cursor-pointer transition"
                data-type="ch"
                data-id="${m.ch.id}"
              >
                <div class="text-xs font-bold text-foreground mb-1">${m.ch.title}</div>
                <div class="text-[11px] text-muted truncate">...${m.snippet}...</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${matchedQuizzes.length > 0 ? `
        <div>
          <div class="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2">演習問題ヒット (${matchedQuizzes.length}件)</div>
          <div class="space-y-2">
            ${matchedQuizzes.slice(0, 5).map(qz => `
              <div 
                class="search-item p-3 rounded-xl bg-surface/60 border border-glass hover:border-emerald-500/50 cursor-pointer transition"
                data-type="quiz"
                data-id="${qz.id}"
              >
                <div class="flex justify-between text-xs font-bold mb-1">
                  <span class="text-foreground">${qz.chapterTitle || ''} (${qz.qNumber || ''})</span>
                  <span class="text-emerald-600 dark:text-emerald-400 text-[10px]">${qz.level || ''}</span>
                </div>
                <div class="text-[11px] text-muted truncate">${qz.question}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    resultsDiv.querySelectorAll('[data-type]').forEach(el => {
      el.addEventListener('click', () => {
        const type = el.dataset.type;
        const id = el.dataset.id;
        close();
        if (onSelectResult) onSelectResult(type, id);
      });
    });
  });
}
