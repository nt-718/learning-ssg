// LocalStorage state management utility

const KEYS = {
  THEME: 'fp_app_theme',
  ACTIVE_COURSE: 'fp_app_active_course',
  APP_STATE: 'fp_app_state',
  READ_CHAPTERS: 'fp_app_read_chapters',
  BOOKMARKS: 'fp_app_bookmarks',
  QUIZ_HISTORY: 'fp_app_quiz_history',
  WRONG_QUESTIONS: 'fp_app_wrong_questions',
  LEARNING_ACTIVITY: 'fp_app_learning_activity'
};

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const READ_CHAPTER_SEPARATOR = '::';

function getReadChapterKey(courseId, chapterId) {
  return `${courseId}${READ_CHAPTER_SEPARATOR}${chapterId}`;
}

export const Storage = {
  getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'light';
  },
  setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  getActiveCourseId() {
    return localStorage.getItem(KEYS.ACTIVE_COURSE) || 'financial_planner';
  },
  setActiveCourseId(courseId) {
    localStorage.setItem(KEYS.ACTIVE_COURSE, courseId);
  },

  getAppState() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.APP_STATE)) || null;
    } catch {
      return null;
    }
  },
  setAppState(state) {
    try {
      localStorage.setItem(KEYS.APP_STATE, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  },

  getReadChapters(courseId) {
    try {
      if (!courseId) return [];
      const list = JSON.parse(localStorage.getItem(KEYS.READ_CHAPTERS)) || [];
      const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
      return list
        .filter(key => typeof key === 'string' && key.startsWith(prefix))
        .map(key => key.slice(prefix.length));
    } catch {
      return [];
    }
  },
  migrateLegacyReadChapters(courseId) {
    if (!courseId) return;
    try {
      const list = JSON.parse(localStorage.getItem(KEYS.READ_CHAPTERS)) || [];
      const migrated = list.map(key => {
        if (typeof key !== 'string' || key.includes(READ_CHAPTER_SEPARATOR)) return key;
        return getReadChapterKey(courseId, key);
      });
      localStorage.setItem(KEYS.READ_CHAPTERS, JSON.stringify([...new Set(migrated)]));
    } catch {
      localStorage.setItem(KEYS.READ_CHAPTERS, '[]');
    }
  },
  toggleReadChapter(courseId, chapterId) {
    let list;
    try {
      list = JSON.parse(localStorage.getItem(KEYS.READ_CHAPTERS)) || [];
    } catch {
      list = [];
    }
    const key = getReadChapterKey(courseId, chapterId);
    const idx = list.indexOf(key);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(key);
      this.recordActivity('read');
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
    this.recordActivity('quiz');
  },

  getWrongQuestions() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
    } catch {
      return [];
    }
  },

  getLearningActivity() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.LEARNING_ACTIVITY)) || {};
    } catch {
      return {};
    }
  },

  recordActivity(type) {
    const activity = this.getLearningActivity();
    const dateKey = getLocalDateKey();
    const current = activity[dateKey] || { total: 0, read: 0, quiz: 0 };
    current.total = (current.total || 0) + 1;
    current[type] = (current[type] || 0) + 1;
    activity[dateKey] = current;
    localStorage.setItem(KEYS.LEARNING_ACTIVITY, JSON.stringify(activity));
    return activity;
  }
};
