import { Storage } from '../utils/storage.js';
import { showToast } from '../utils/toast.js';

export function renderSettingsModal(container, { activeCourseId, courseTitle = '現在の教材', onClose, onDataChange } = {}) {
  const preferences = Storage.getReadingPreferences();
  const theme = Storage.getTheme();
  const readCount = activeCourseId ? Storage.getReadChapters(activeCourseId).length : 0;
  const wrongCount = activeCourseId ? Storage.getWrongQuestions(activeCourseId).length : 0;
  const bookmarkCount = activeCourseId ? Storage.getBookmarks(activeCourseId).length : 0;
  const hasReadingPosition = Boolean(activeCourseId && Storage.getReadingPosition(activeCourseId));

  container.innerHTML = `
    <div id="settings-overlay" class="settings-overlay animate-fade-in">
      <section class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header class="settings-header">
          <div><span>アプリ設定</span><h2 id="settings-title">設定</h2></div>
          <button id="btn-close-settings" aria-label="設定を閉じる">✕</button>
        </header>

        <div class="settings-body">
          <section class="settings-section" aria-labelledby="appearance-title">
            <div class="settings-section-copy"><h3 id="appearance-title">表示テーマ</h3><p>画面全体の明るさを選びます。</p></div>
            <div class="settings-choice-group" data-setting="theme">
              <button data-value="light" class="${theme === 'light' ? 'is-active' : ''}">ライト</button>
              <button data-value="dark" class="${theme === 'dark' ? 'is-active' : ''}">ダーク</button>
            </div>
          </section>

          <section class="settings-section" aria-labelledby="font-size-title">
            <div class="settings-section-copy"><h3 id="font-size-title">文字サイズ</h3><p>教材本文の文字サイズを調整します。</p></div>
            <div class="settings-choice-group" data-setting="fontSize">
              ${[[14, '小'], [15, '標準'], [17, '大'], [19, '特大']].map(([value, label]) => `
                <button data-value="${value}" class="${Number(preferences.fontSize) === value ? 'is-active' : ''}">${label}</button>
              `).join('')}
            </div>
          </section>

          <section class="settings-section" aria-labelledby="line-height-title">
            <div class="settings-section-copy"><h3 id="line-height-title">行間</h3><p>文章の密度を読みやすく整えます。</p></div>
            <div class="settings-choice-group" data-setting="lineHeight">
              ${[[1.7, '狭い'], [1.95, '標準'], [2.2, '広い']].map(([value, label]) => `
                <button data-value="${value}" class="${Number(preferences.lineHeight) === value ? 'is-active' : ''}">${label}</button>
              `).join('')}
            </div>
          </section>

          ${activeCourseId ? `
            <section class="settings-data-section" aria-labelledby="data-management-title">
              <div class="settings-data-heading">
                <h3 id="data-management-title">データ管理</h3>
                <p>${courseTitle} の学習データを整理します。</p>
              </div>
              <div class="settings-data-list">
                <div class="settings-data-item" data-data-row="progress">
                  <div><strong>学習進捗をリセット</strong><span>${readCount}章読了${hasReadingPosition ? '・再開位置あり' : ''}</span></div>
                  <button data-reset-action="progress" class="settings-danger-button" ${readCount === 0 && !hasReadingPosition ? 'disabled' : ''}>リセット</button>
                </div>
                <div class="settings-data-item" data-data-row="wrong">
                  <div><strong>要復習問題をリセット</strong><span>${wrongCount}問</span></div>
                  <button data-reset-action="wrong" class="settings-danger-button" ${wrongCount === 0 ? 'disabled' : ''}>リセット</button>
                </div>
                <div class="settings-data-item" data-data-row="bookmarks">
                  <div><strong>ブックマークを一括削除</strong><span>${bookmarkCount}件</span></div>
                  <button data-reset-action="bookmarks" class="settings-danger-button" ${bookmarkCount === 0 ? 'disabled' : ''}>削除</button>
                </div>
              </div>
            </section>
          ` : ''}
        </div>

        <footer class="settings-footer"><span>変更内容は自動で保存されます</span><button id="btn-settings-done">完了</button></footer>

        <div id="settings-confirmation" class="settings-confirmation" hidden>
          <div role="alertdialog" aria-modal="true" aria-labelledby="settings-confirm-title" aria-describedby="settings-confirm-description">
            <span class="settings-confirm-mark" aria-hidden="true">!</span>
            <h3 id="settings-confirm-title"></h3>
            <p id="settings-confirm-description"></p>
            <div><button id="btn-confirm-cancel">キャンセル</button><button id="btn-confirm-action" class="is-danger"></button></div>
          </div>
        </div>
      </section>
    </div>
  `;

  const close = () => {
    document.removeEventListener('keydown', escHandler);
    container.innerHTML = '';
    onClose?.();
  };
  const escHandler = event => { if (event.key === 'Escape') close(); };

  container.querySelector('#btn-close-settings')?.addEventListener('click', close);
  container.querySelector('#btn-settings-done')?.addEventListener('click', close);
  container.querySelector('#settings-overlay')?.addEventListener('click', event => {
    if (event.target.id === 'settings-overlay') close();
  });
  document.addEventListener('keydown', escHandler);

  container.querySelectorAll('[data-setting] button').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.closest('[data-setting]');
      const setting = group.dataset.setting;
      const rawValue = button.dataset.value;
      if (setting === 'theme') Storage.setTheme(rawValue);
      else Storage.setReadingPreferences({ [setting]: Number(rawValue) });
      group.querySelectorAll('button').forEach(item => item.classList.toggle('is-active', item === button));
      const currentPreferences = Storage.getReadingPreferences();
      const chapterBody = document.querySelector('.chapter-body');
      chapterBody?.style.setProperty('--reader-font-size', `${currentPreferences.fontSize}px`);
      chapterBody?.style.setProperty('--reader-line-height', currentPreferences.lineHeight);
      showToast('設定を保存しました', { duration: 1800 });
    });
  });

  const confirmation = container.querySelector('#settings-confirmation');
  const confirmTitle = container.querySelector('#settings-confirm-title');
  const confirmDescription = container.querySelector('#settings-confirm-description');
  const confirmActionButton = container.querySelector('#btn-confirm-action');
  const cancelConfirmation = () => {
    confirmation.hidden = true;
    confirmActionButton.onclick = null;
  };
  container.querySelector('#btn-confirm-cancel')?.addEventListener('click', cancelConfirmation);

  const actionConfig = {
    progress: {
      title: '学習進捗をリセットしますか？',
      description: `「${courseTitle}」の読了状態と再開位置を削除します。演習履歴とブックマークは残ります。`,
      actionLabel: '進捗をリセット',
      success: '学習進捗をリセットしました',
      run: () => Storage.resetCourseProgress(activeCourseId),
      emptyLabel: '0章読了'
    },
    wrong: {
      title: '要復習問題をリセットしますか？',
      description: `「${courseTitle}」の要復習リストを空にします。過去の解答記録は残ります。`,
      actionLabel: '要復習をリセット',
      success: '要復習問題をリセットしました',
      run: () => Storage.resetWrongQuestions(activeCourseId),
      emptyLabel: '0問'
    },
    bookmarks: {
      title: 'ブックマークをすべて削除しますか？',
      description: `「${courseTitle}」に保存したブックマークを一括削除します。`,
      actionLabel: 'すべて削除',
      success: 'ブックマークを一括削除しました',
      run: () => Storage.clearBookmarks(activeCourseId),
      emptyLabel: '0件'
    }
  };

  container.querySelectorAll('[data-reset-action]').forEach(button => {
    button.addEventListener('click', () => {
      const type = button.dataset.resetAction;
      const config = actionConfig[type];
      confirmTitle.textContent = config.title;
      confirmDescription.textContent = config.description;
      confirmActionButton.textContent = config.actionLabel;
      confirmation.hidden = false;
      confirmActionButton.onclick = () => {
        config.run();
        cancelConfirmation();
        const row = container.querySelector(`[data-data-row="${type}"]`);
        row.querySelector('span').textContent = config.emptyLabel;
        row.querySelector('button').disabled = true;
        onDataChange?.(type);
        showToast(config.success);
      };
      confirmActionButton.focus();
    });
  });

  container.querySelector('#btn-close-settings')?.focus();
}
