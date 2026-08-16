// Quiz & Flashcard practice component

import { renderMarkdownInline } from '../utils/markdown.js';
import { Storage } from '../utils/storage.js';

const icons = {
  lightbulb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4M8.5 14.5A6 6 0 1 1 15.5 14.5c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 12 4 4 8-8"/></svg>',
  review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
  left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
};

function renderInlineMarkdown(value) {
  return renderMarkdownInline(value || '');
}

export function renderQuizViewer(container, filterType = 'all', quizQuestions = [], courseConfig = {}) {
  let questionsList = quizQuestions.length > 0 ? [...quizQuestions] : [];
  const courseId = courseConfig.id;

  const availableLevels = new Set(quizQuestions.map(question => question.level).filter(Boolean));
  if (availableLevels.has(filterType)) {
    questionsList = questionsList.filter(q => q.level === filterType);
  } else if (filterType === 'wrong') {
    const wrongIds = Storage.getWrongQuestions(courseId);
    questionsList = questionsList.filter(q => wrongIds.includes(q.id));
  } else if (filterType && filterType.startsWith('ch')) {
    questionsList = questionsList.filter(q => q.chapterId === filterType);
  }

  const categoryColor = courseConfig.category?.color;
  const categoryStyle = categoryColor ? ` style="--quiz-accent:${categoryColor}"` : '';
  const filterLabel = filterType === 'all'
    ? 'すべての問題'
    : filterType === 'wrong'
      ? '要復習の問題'
      : availableLevels.has(filterType)
        ? `${filterType}の問題`
        : questionsList[0]?.chapterTitle || '章別演習';

  if (questionsList.length === 0) {
    container.innerHTML = `
      <div class="quiz-container quiz-empty"${categoryStyle}>
        <span class="quiz-empty-mark" aria-hidden="true">✓</span>
        <p class="quiz-eyebrow">問題演習</p>
        <h2>該当する問題はありません</h2>
        <p>要復習の問題がないか、指定した条件に一致する問題がありません。</p>
        <button id="btn-quiz-reset-all" class="quiz-primary-button">すべての問題を表示</button>
      </div>
    `;
    container.querySelector('#btn-quiz-reset-all')?.addEventListener('click', () => {
      renderQuizViewer(container, 'all', quizQuestions, courseConfig);
    });
    return;
  }

  let currentIndex = 0;
  let showAnswer = false;

  const renderCard = () => {
    const q = questionsList[currentIndex];
    const wrongIds = Storage.getWrongQuestions(courseId);
    const isWrong = wrongIds.includes(q.id);
    const progressPct = Math.round(((currentIndex + 1) / questionsList.length) * 100);

    container.innerHTML = `
      <div class="quiz-container"${categoryStyle}>
        <header class="quiz-page-header">
          <div>
            <p class="quiz-eyebrow">問題演習</p>
            <h2>理解度を確かめる</h2>
            <p>${filterLabel}</p>
          </div>
          <div class="quiz-count" aria-label="${questionsList.length}問中${currentIndex + 1}問目">
            <strong>${currentIndex + 1}</strong><span>/ ${questionsList.length}</span>
          </div>
        </header>

        <div class="quiz-progress-track" aria-hidden="true">
          <div style="width:${progressPct}%"></div>
        </div>

        <div class="quiz-meta-row">
          <span class="quiz-level quiz-level-${q.level === '3級' ? 'basic' : q.level === '2級' ? 'advanced' : 'general'}">${q.level || '演習'}</span>
          <span class="quiz-location">${q.chapterTitle || ''}${q.qNumber ? `<b>・${q.qNumber}</b>` : ''}</span>
          ${isWrong ? '<span class="quiz-review-label">要復習</span>' : ''}
        </div>

        <article class="quiz-card">
          <div class="quiz-question-label"><span>Q</span> 問題</div>
          <h3>${renderInlineMarkdown(q.question)}</h3>

          ${!showAnswer ? `
            <div class="quiz-reveal-area">
              <p>答えを考えてから、解説を確認しましょう。</p>
              <button id="btn-show-ans" class="quiz-primary-button">
                ${icons.lightbulb}<span>解答・解説を見る</span>
              </button>
            </div>
          ` : `
            <div class="quiz-answer animate-fade-in">
              <div class="quiz-answer-heading">
                <span>${icons.check}</span>
                <strong>解答・解説</strong>
              </div>
              <div class="quiz-answer-content">${renderInlineMarkdown(q.explanation || q.answer)}</div>

              <div class="quiz-assessment">
                <div>
                  <strong>自己採点</strong>
                  <span>理解できたか記録してください</span>
                </div>
                <div class="quiz-assessment-actions">
                  <button id="btn-mark-correct" class="quiz-assessment-button is-correct">
                    ${icons.check}<span>理解できた</span>
                  </button>
                  <button id="btn-mark-wrong" class="quiz-assessment-button is-review">
                    ${icons.review}<span>要復習にする</span>
                  </button>
                </div>
              </div>
            </div>
          `}
        </article>

        <nav class="quiz-navigation" aria-label="問題の移動">
          <button id="btn-prev-q" class="quiz-nav-button" ${currentIndex === 0 ? 'disabled' : ''}>
            ${icons.left}<span>前の問題</span>
          </button>
          <span>${currentIndex + 1} / ${questionsList.length}</span>
          <button id="btn-next-q" class="quiz-nav-button" ${currentIndex === questionsList.length - 1 ? 'disabled' : ''}>
            <span>次の問題</span>${icons.right}
          </button>
        </nav>
      </div>
    `;

    container.querySelector('#btn-show-ans')?.addEventListener('click', () => {
      showAnswer = true;
      renderCard();
    });

    container.querySelector('#btn-mark-correct')?.addEventListener('click', () => {
      Storage.recordQuizAnswer(courseId, q.id, true);
      showAnswer = false;
      if (currentIndex < questionsList.length - 1) currentIndex++;
      renderCard();
    });

    container.querySelector('#btn-mark-wrong')?.addEventListener('click', () => {
      Storage.recordQuizAnswer(courseId, q.id, false);
      showAnswer = false;
      if (currentIndex < questionsList.length - 1) currentIndex++;
      renderCard();
    });

    container.querySelector('#btn-prev-q')?.addEventListener('click', () => {
      showAnswer = false;
      currentIndex--;
      renderCard();
    });

    container.querySelector('#btn-next-q')?.addEventListener('click', () => {
      showAnswer = false;
      currentIndex++;
      renderCard();
    });
  };

  renderCard();
}
