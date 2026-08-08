// Quiz & Flashcard practice component for all 160 questions

import { QUIZ_QUESTIONS } from '../data/quizData.js';
import { Storage } from '../utils/storage.js';

export function renderQuizViewer(container, filterType = 'all') {
  let questionsList = [...QUIZ_QUESTIONS];

  if (filterType === '3級' || filterType === '2級') {
    questionsList = questionsList.filter(q => q.level === filterType);
  } else if (filterType === 'wrong') {
    const wrongIds = Storage.getWrongQuestions();
    questionsList = questionsList.filter(q => wrongIds.includes(q.id));
  } else if (filterType && filterType.startsWith('ch')) {
    questionsList = questionsList.filter(q => q.chapterId === filterType);
  }

  if (questionsList.length === 0) {
    container.innerHTML = `
      <div class="max-w-xl mx-auto px-4 py-16 text-center">
        <div class="text-4xl mb-4">🎉</div>
        <h3 class="text-xl font-bold text-white mb-2">該当する問題がありません</h3>
        <p class="text-xs text-muted mb-6">要復習ノートは空か、指定の条件に一致する問題がまだありません。</p>
        <button id="btn-quiz-reset-all" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition">
          全160問を表示する
        </button>
      </div>
    `;
    container.querySelector('#btn-quiz-reset-all').addEventListener('click', () => {
      renderQuizViewer(container, 'all');
    });
    return;
  }

  let currentIndex = 0;
  let showAnswer = false;

  const renderCard = () => {
    const q = questionsList[currentIndex];
    const history = Storage.getQuizHistory();
    const qRecord = history[q.id];
    const wrongIds = Storage.getWrongQuestions();
    const isWrong = wrongIds.includes(q.id);

    container.innerHTML = `
      <div class="quiz-container max-w-3xl mx-auto px-4 py-8">
        
        <!-- Header status bar -->
        <div class="flex items-center justify-between gap-4 mb-6">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-md text-xs font-bold ${q.level === '3級' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'}">
              ${q.level}
            </span>
            <span class="text-xs text-muted font-bold">${q.chapterTitle}・${q.qNumber}</span>
          </div>

          <div class="text-xs font-mono font-bold text-accent">
            ${currentIndex + 1} / ${questionsList.length} 問
          </div>
        </div>

        <!-- Question Card -->
        <div class="quiz-card p-6 md:p-8 rounded-2xl bg-card-bg border border-glass shadow-2xl relative mb-6">
          
          ${isWrong ? '<div class="absolute top-4 right-4 text-xs font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">⚠️ 要復習</div>' : ''}

          <div class="text-xs text-muted uppercase font-bold tracking-wider mb-2">【問題】</div>
          <h3 class="text-lg md:text-xl font-bold text-white leading-relaxed mb-6">
            ${q.question}
          </h3>

          <!-- Reveal Answer Button or Answer Details -->
          ${!showAnswer ? `
            <div class="text-center py-6 border-t border-glass">
              <button id="btn-show-ans" class="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition">
                💡 解答・解説を表示する
              </button>
            </div>
          ` : `
            <div class="answer-box mt-6 pt-6 border-t border-glass animate-fade-in">
              <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">【解答・公式解説】</div>
              <div class="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-sm md:text-base text-emerald-100 font-medium leading-relaxed mb-6">
                ${q.explanation}
              </div>

              <!-- Self-assessment score buttons -->
              <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button id="btn-mark-correct" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2">
                  <span>⭕ 正解した！（次へ）</span>
                </button>
                <button id="btn-mark-wrong" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2">
                  <span>❌ 間違えた / 要復習</span>
                </button>
              </div>
            </div>
          `}

        </div>

        <!-- Controls Footer -->
        <div class="flex items-center justify-between gap-4">
          <button id="btn-prev-q" ${currentIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed px-4 py-2 rounded-xl bg-surface border border-glass text-xs text-muted"' : 'class="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-white transition"'}>
            ← 前の問題
          </button>

          <button id="btn-next-q" ${currentIndex === questionsList.length - 1 ? 'disabled class="opacity-40 cursor-not-allowed px-4 py-2 rounded-xl bg-surface border border-glass text-xs text-muted"' : 'class="px-4 py-2 rounded-xl bg-surface hover:bg-surface/80 border border-glass text-xs font-semibold text-muted hover:text-white transition"'}>
            次の問題 →
          </button>
        </div>

      </div>
    `;

    // Attach listeners
    const showAnsBtn = container.querySelector('#btn-show-ans');
    if (showAnsBtn) {
      showAnsBtn.addEventListener('click', () => {
        showAnswer = true;
        renderCard();
      });
    }

    const markCorrectBtn = container.querySelector('#btn-mark-correct');
    if (markCorrectBtn) {
      markCorrectBtn.addEventListener('click', () => {
        Storage.recordQuizAnswer(q.id, true);
        showAnswer = false;
        if (currentIndex < questionsList.length - 1) {
          currentIndex++;
        }
        renderCard();
      });
    }

    const markWrongBtn = container.querySelector('#btn-mark-wrong');
    if (markWrongBtn) {
      markWrongBtn.addEventListener('click', () => {
        Storage.recordQuizAnswer(q.id, false);
        showAnswer = false;
        if (currentIndex < questionsList.length - 1) {
          currentIndex++;
        }
        renderCard();
      });
    }

    const prevQBtn = container.querySelector('#btn-prev-q');
    if (prevQBtn && currentIndex > 0) {
      prevQBtn.addEventListener('click', () => {
        showAnswer = false;
        currentIndex--;
        renderCard();
      });
    }

    const nextQBtn = container.querySelector('#btn-next-q');
    if (nextQBtn && currentIndex < questionsList.length - 1) {
      nextQBtn.addEventListener('click', () => {
        showAnswer = false;
        currentIndex++;
        renderCard();
      });
    }
  };

  renderCard();
}
