import test from 'node:test';
import assert from 'node:assert/strict';

class LocalStorageMock {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }
}

globalThis.localStorage = new LocalStorageMock();

const { Storage } = await import('../src/utils/storage.js');

test('read progress is isolated by course', () => {
  Storage.toggleReadChapter('course-a', 'intro');
  Storage.toggleReadChapter('course-b', 'intro');
  Storage.toggleReadChapter('course-a', 'intro');

  assert.deepEqual(Storage.getReadChapters('course-a'), []);
  assert.deepEqual(Storage.getReadChapters('course-b'), ['intro']);
});

test('legacy chapter IDs migrate to the last active course', () => {
  localStorage.setItem('fp_app_read_chapters', JSON.stringify(['intro', 'ch01']));

  Storage.migrateLegacyReadChapters('course-b');

  assert.deepEqual(Storage.getReadChapters('course-a'), []);
  assert.deepEqual(Storage.getReadChapters('course-b'), ['intro', 'ch01']);
});

test('quiz history and review questions are isolated by course', () => {
  Storage.recordQuizAnswer('course-a', 'q_ch01_1', false, 'answer-a');
  Storage.recordQuizAnswer('course-b', 'q_ch01_1', true, 'answer-b');

  assert.deepEqual(Storage.getWrongQuestions('course-a'), ['q_ch01_1']);
  assert.deepEqual(Storage.getWrongQuestions('course-b'), []);
  assert.equal(Storage.getQuizHistory('course-a').q_ch01_1.userAns, 'answer-a');
  assert.equal(Storage.getQuizHistory('course-b').q_ch01_1.userAns, 'answer-b');
});

test('reading positions and bookmarks are isolated by course', () => {
  Storage.setReadingPosition('course-a', 'ch02', 420);
  Storage.setReadingPosition('course-b', 'ch03', 90);
  Storage.toggleBookmark('course-a', 'ch02');
  Storage.toggleBookmark('course-b', 'ch02');

  assert.equal(Storage.getReadingPosition('course-a').chapterId, 'ch02');
  assert.equal(Storage.getReadingPosition('course-a').scrollTop, 420);
  assert.deepEqual(Storage.getBookmarks('course-a'), ['ch02']);
  assert.deepEqual(Storage.getBookmarks('course-b'), ['ch02']);
});

test('quiz answers can be restored after undo', () => {
  const before = Storage.getQuizAnswerSnapshot('course-c', 'q1');
  Storage.recordQuizAnswer('course-c', 'q1', false);
  Storage.restoreQuizAnswer('course-c', 'q1', before);

  assert.equal(Storage.getQuizHistory('course-c').q1, undefined);
  assert.deepEqual(Storage.getWrongQuestions('course-c'), []);
});

test('course data resets affect only the selected course and data type', () => {
  Storage.toggleReadChapter('reset-a', 'ch01');
  Storage.toggleReadChapter('reset-b', 'ch01');
  Storage.setReadingPosition('reset-a', 'ch01', 300);
  Storage.recordQuizAnswer('reset-a', 'q1', false);
  Storage.recordQuizAnswer('reset-b', 'q1', false);
  Storage.toggleBookmark('reset-a', 'ch01');
  Storage.toggleBookmark('reset-b', 'ch01');

  assert.equal(Storage.resetCourseProgress('reset-a'), 1);
  assert.deepEqual(Storage.getReadChapters('reset-a'), []);
  assert.equal(Storage.getReadingPosition('reset-a'), null);
  assert.deepEqual(Storage.getReadChapters('reset-b'), ['ch01']);
  assert.deepEqual(Storage.getWrongQuestions('reset-a'), ['q1']);

  assert.equal(Storage.resetWrongQuestions('reset-a'), 1);
  assert.deepEqual(Storage.getWrongQuestions('reset-a'), []);
  assert.deepEqual(Storage.getWrongQuestions('reset-b'), ['q1']);

  assert.equal(Storage.clearBookmarks('reset-a'), 1);
  assert.deepEqual(Storage.getBookmarks('reset-a'), []);
  assert.deepEqual(Storage.getBookmarks('reset-b'), ['ch01']);
});

test('learning activity is aggregated globally and separated by course', () => {
  const globalBefore = Object.values(Storage.getLearningActivity()).reduce((sum, entry) => sum + (entry.total || 0), 0);
  Storage.recordActivity('read', 'activity-a');
  Storage.recordActivity('quiz', 'activity-a');
  Storage.recordActivity('quiz', 'activity-b');

  const courseA = Object.values(Storage.getLearningActivity('activity-a'));
  const courseB = Object.values(Storage.getLearningActivity('activity-b'));
  const globalAfter = Object.values(Storage.getLearningActivity()).reduce((sum, entry) => sum + (entry.total || 0), 0);

  assert.equal(courseA.reduce((sum, entry) => sum + entry.total, 0), 2);
  assert.equal(courseA.reduce((sum, entry) => sum + entry.read, 0), 1);
  assert.equal(courseA.reduce((sum, entry) => sum + entry.quiz, 0), 1);
  assert.equal(courseB.reduce((sum, entry) => sum + entry.total, 0), 1);
  assert.equal(globalAfter - globalBefore, 3);
});
