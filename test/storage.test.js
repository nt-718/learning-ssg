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
