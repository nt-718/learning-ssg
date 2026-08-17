// LocalStorage state management utility

const KEYS = {
  THEME: 'fp_app_theme',
  ACTIVE_COURSE: 'fp_app_active_course',
  APP_STATE: 'fp_app_state',
  READ_CHAPTERS: 'fp_app_read_chapters',
  BOOKMARKS: 'fp_app_bookmarks',
  READING_POSITIONS: 'fp_app_reading_positions',
  READING_PREFERENCES: 'fp_app_reading_preferences',
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

function getQuizQuestionKey(courseId, questionId) {
  return `${courseId}${READ_CHAPTER_SEPARATOR}${questionId}`;
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
      this.recordActivity('read', courseId);
    }
    localStorage.setItem(KEYS.READ_CHAPTERS, JSON.stringify(list));
    return list;
  },
  resetCourseProgress(courseId) {
    if (!courseId) return 0;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(KEYS.READ_CHAPTERS)) || []; } catch { /* noop */ }
    const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
    const removedCount = list.filter(key => typeof key === 'string' && key.startsWith(prefix)).length;
    localStorage.setItem(KEYS.READ_CHAPTERS, JSON.stringify(list.filter(key => typeof key !== 'string' || !key.startsWith(prefix))));

    let positions = {};
    try { positions = JSON.parse(localStorage.getItem(KEYS.READING_POSITIONS)) || {}; } catch { /* noop */ }
    delete positions[courseId];
    localStorage.setItem(KEYS.READING_POSITIONS, JSON.stringify(positions));
    return removedCount;
  },

  getBookmarks(courseId) {
    try {
      const list = JSON.parse(localStorage.getItem(KEYS.BOOKMARKS)) || [];
      if (!courseId) return list;
      const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
      return list
        .filter(key => typeof key === 'string' && key.startsWith(prefix))
        .map(key => key.slice(prefix.length));
    } catch {
      return [];
    }
  },
  toggleBookmark(courseId, itemId) {
    const list = this.getBookmarks();
    const key = getReadChapterKey(courseId, itemId);
    const idx = list.indexOf(key);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(key);
    }
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(list));
    return list;
  },
  clearBookmarks(courseId) {
    const list = this.getBookmarks();
    if (!courseId) {
      localStorage.setItem(KEYS.BOOKMARKS, '[]');
      return list.length;
    }
    const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
    const removedCount = list.filter(key => typeof key === 'string' && key.startsWith(prefix)).length;
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(list.filter(key => typeof key !== 'string' || !key.startsWith(prefix))));
    return removedCount;
  },

  getReadingPosition(courseId) {
    try {
      const positions = JSON.parse(localStorage.getItem(KEYS.READING_POSITIONS)) || {};
      return positions[courseId] || null;
    } catch {
      return null;
    }
  },
  setReadingPosition(courseId, chapterId, scrollTop = 0) {
    if (!courseId || !chapterId) return;
    let positions;
    try {
      positions = JSON.parse(localStorage.getItem(KEYS.READING_POSITIONS)) || {};
    } catch {
      positions = {};
    }
    positions[courseId] = { chapterId, scrollTop: Math.max(0, Math.round(scrollTop)), updatedAt: Date.now() };
    localStorage.setItem(KEYS.READING_POSITIONS, JSON.stringify(positions));
  },

  getReadingPreferences() {
    try {
      return {
        fontSize: 15,
        lineHeight: 1.95,
        ...JSON.parse(localStorage.getItem(KEYS.READING_PREFERENCES))
      };
    } catch {
      return { fontSize: 15, lineHeight: 1.95 };
    }
  },
  setReadingPreferences(preferences) {
    const next = { ...this.getReadingPreferences(), ...preferences };
    localStorage.setItem(KEYS.READING_PREFERENCES, JSON.stringify(next));
    return next;
  },

  getQuizHistory(courseId) {
    try {
      if (!courseId) return {};
      const history = JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {};
      const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
      return Object.fromEntries(
        Object.entries(history)
          .filter(([key]) => key.startsWith(prefix))
          .map(([key, value]) => [key.slice(prefix.length), value])
      );
    } catch {
      return {};
    }
  },
  migrateLegacyQuizData(courseId) {
    if (!courseId) return;
    try {
      const history = JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {};
      const migratedHistory = {};
      Object.entries(history).forEach(([key, value]) => {
        migratedHistory[key.includes(READ_CHAPTER_SEPARATOR) ? key : getQuizQuestionKey(courseId, key)] = value;
      });
      localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(migratedHistory));

      const wrong = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
      const migratedWrong = wrong.map(key =>
        typeof key === 'string' && !key.includes(READ_CHAPTER_SEPARATOR)
          ? getQuizQuestionKey(courseId, key)
          : key
      );
      localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify([...new Set(migratedWrong)]));
    } catch {
      localStorage.setItem(KEYS.QUIZ_HISTORY, '{}');
      localStorage.setItem(KEYS.WRONG_QUESTIONS, '[]');
    }
  },
  recordQuizAnswer(courseId, questionId, isCorrect, userAns) {
    let history;
    try {
      history = JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {};
    } catch {
      history = {};
    }
    const key = getQuizQuestionKey(courseId, questionId);
    history[key] = {
      isCorrect,
      userAns,
      timestamp: Date.now()
    };
    localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));

    // Manage wrong questions list
    let wrong;
    try {
      wrong = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
    } catch {
      wrong = [];
    }
    const wIdx = wrong.indexOf(key);
    if (!isCorrect && wIdx < 0) {
      wrong.push(key);
    } else if (isCorrect && wIdx >= 0) {
      wrong.splice(wIdx, 1);
    }
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify(wrong));
    this.recordActivity('quiz', courseId);
  },

  getQuizAnswerSnapshot(courseId, questionId) {
    let history = {};
    let wrong = [];
    try { history = JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {}; } catch { /* noop */ }
    try { wrong = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || []; } catch { /* noop */ }
    const key = getQuizQuestionKey(courseId, questionId);
    return { answer: history[key] || null, wasWrong: wrong.includes(key) };
  },
  restoreQuizAnswer(courseId, questionId, snapshot) {
    let history = {};
    let wrong = [];
    try { history = JSON.parse(localStorage.getItem(KEYS.QUIZ_HISTORY)) || {}; } catch { /* noop */ }
    try { wrong = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || []; } catch { /* noop */ }
    const key = getQuizQuestionKey(courseId, questionId);
    if (snapshot?.answer) history[key] = snapshot.answer;
    else delete history[key];
    wrong = wrong.filter(id => id !== key);
    if (snapshot?.wasWrong) wrong.push(key);
    localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify(wrong));
  },

  getWrongQuestions(courseId) {
    try {
      if (!courseId) return [];
      const list = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || [];
      const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
      return list
        .filter(key => typeof key === 'string' && key.startsWith(prefix))
        .map(key => key.slice(prefix.length));
    } catch {
      return [];
    }
  },
  resetWrongQuestions(courseId) {
    if (!courseId) return 0;
    let list = [];
    try { list = JSON.parse(localStorage.getItem(KEYS.WRONG_QUESTIONS)) || []; } catch { /* noop */ }
    const prefix = `${courseId}${READ_CHAPTER_SEPARATOR}`;
    const removedCount = list.filter(key => typeof key === 'string' && key.startsWith(prefix)).length;
    localStorage.setItem(KEYS.WRONG_QUESTIONS, JSON.stringify(list.filter(key => typeof key !== 'string' || !key.startsWith(prefix))));
    return removedCount;
  },

  getLearningActivity(courseId) {
    try {
      const activity = JSON.parse(localStorage.getItem(KEYS.LEARNING_ACTIVITY)) || {};
      if (!courseId) return activity;
      return Object.fromEntries(
        Object.entries(activity)
          .filter(([, entry]) => entry?.courses?.[courseId])
          .map(([date, entry]) => [date, entry.courses[courseId]])
      );
    } catch {
      return {};
    }
  },

  recordActivity(type, courseId) {
    const activity = this.getLearningActivity();
    const dateKey = getLocalDateKey();
    const current = activity[dateKey] || { total: 0, read: 0, quiz: 0 };
    current.total = (current.total || 0) + 1;
    current[type] = (current[type] || 0) + 1;
    if (courseId) {
      current.courses = current.courses || {};
      const courseActivity = current.courses[courseId] || { total: 0, read: 0, quiz: 0 };
      courseActivity.total = (courseActivity.total || 0) + 1;
      courseActivity[type] = (courseActivity[type] || 0) + 1;
      current.courses[courseId] = courseActivity;
    }
    activity[dateKey] = current;
    localStorage.setItem(KEYS.LEARNING_ACTIVITY, JSON.stringify(activity));
    return activity;
  }
};
