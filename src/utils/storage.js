// LocalStorage state management utility

const KEYS = {
  THEME: 'fp_app_theme',
  READ_CHAPTERS: 'fp_app_read_chapters',
  BOOKMARKS: 'fp_app_bookmarks',
  QUIZ_HISTORY: 'fp_app_quiz_history',
  WRONG_QUESTIONS: 'fp_app_wrong_questions'
};

export const Storage = {
  getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'dark';
  },
  setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  getReadChapters() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.READ_CHAPTERS)) || [];
    } catch {
      return [];
    }
  },
  toggleReadChapter(chapterId) {
    const list = this.getReadChapters();
    const idx = list.indexOf(chapterId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(chapterId);
    }
    localStorage.setItem(KEYS.READ_CHAPTERS, JSON.stringify(list));
    return list;
  },

  getBookmarks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKMARKS)) || [];
    } catch {
      return [];
    }
  },
  toggleBookmark(itemId) {
    const list = this.getBookmarks();
    const idx = list.indexOf(itemId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(itemId);
    }
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(list));
    return list;
  },

  getQuizHistory() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {};
    } catch {
      return {};
    }
  },
  recordQuizAnswer(questionId, isCorrect, userAns) {
    const history = this.getQuizHistory();
    history[questionId] = {
      isCorrect,
      userAns,
      timestamp: Date.now()
    };
    localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));

    // Manage wrong questions list
    const wrong = this.getWrongQuestions();
    const wIdx = wrong.indexOf(questionId);
    if (!isCorrect && wIdx < 0) {
      wrong.push(questionId);
    } else if (isCorrect && wIdx >= 0) {
      wrong.splice(wIdx, 1);
    }
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify(wrong));
  },

  getWrongQuestions() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
    } catch {
      return [];
    }
  }
};
