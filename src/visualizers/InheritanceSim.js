// 相続・贈与 法定相続分 & 相続税基礎控除計算インタラクティブツリー

export function renderInheritanceSim(container) {
  container.innerHTML = `
    <div class="visualizer-card">
      <div class="visualizer-header">
        <div class="visualizer-badge">第7章 体験ツール</div>
        <h3>🌳 法定相続分 & 相続税基礎控除ツリーシミュレータ</h3>
        <p>家族構成を選択すると、法定相続人の範囲、法定相続分（割合）、および相続税の基礎控除額を自動計算！</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Family Configuration Form -->
        <div class="calc-panel p-5 bg-card-bg rounded-xl border border-glass">
          <h4 class="font-bold text-md mb-4 text-accent border-b border-glass pb-2">家族構成の設定</h4>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">配偶者の有無</label>
            <select id="inh-spouse" class="input-field">
              <option value="yes" selected>配偶者あり</option>
              <option value="no">配偶者なし (配偶者死亡・離婚等)</option>
            </select>
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">実子・養子の人数 (第1順位): <span id="inh-children-val" class="text-accent font-bold">2人</span></label>
            <input type="range" id="inh-children" min="0" max="5" step="1" value="2" class="range-slider">
          </div>

          <div class="form-group mb-4" id="inh-parents-group">
            <label class="block text-sm font-semibold mb-1">直系尊属 (親・祖父母) の人数 (第2順位: 子が0人の場合)</label>
            <input type="range" id="inh-parents" min="0" max="2" step="1" value="0" class="range-slider" disabled>
            <div class="text-xs text-muted mt-1" id="inh-parents-note">※第1順位（子）がいるため第2順位へはまわりません</div>
          </div>

          <div class="form-group mb-4" id="inh-siblings-group">
            <label class="block text-sm font-semibold mb-1">兄弟姉妹の人数 (第3順位: 子・親が0人の場合)</label>
            <input type="range" id="inh-siblings" min="0" max="4" step="1" value="0" class="range-slider" disabled>
          </div>

          <div class="form-group mb-2">
            <label class="block text-sm font-semibold mb-1">遺産総額 (課税価格の合計・万円)</label>
            <input type="number" id="inh-estate-val" class="input-field" value="8000" step="500">
          </div>
        </div>

        <!-- Result Breakdown -->
        <div class="result-panel p-5 bg-card-bg rounded-xl border border-glass flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-md mb-3 text-accent border-b border-glass pb-2">法定相続分 & 基礎控除内訳</h4>

            <div class="result-highlight my-3 p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-md">
              <div class="text-xs text-emerald-100 mb-1 font-medium">相続税の基礎控除額 (非課税枠)</div>
              <div class="text-3xl font-extrabold text-white" id="inh-deduction-val">4,800 万円</div>
              <div class="text-xs text-emerald-100/90 mt-1" id="inh-deduction-formula">3,000万円 ＋ (600万円 × 法定相続人 3人)</div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-2.5 rounded bg-surface border border-glass flex justify-between items-center">
                <div>
                  <span class="font-bold text-sm block text-foreground" id="inh-spouse-title">配偶者の法定相続分</span>
                  <span class="text-muted">配偶者 1/2</span>
                </div>
                <span class="text-base font-bold font-mono text-indigo-700 dark:text-indigo-300" id="inh-spouse-share">1/2 (4,000万円)</span>
              </div>

              <div class="p-2.5 rounded bg-surface border border-glass flex justify-between items-center">
                <div>
                  <span class="font-bold text-sm block text-foreground" id="inh-others-title">子の法定相続分 (全体 1/2)</span>
                  <span class="text-muted" id="inh-others-sub">1人あたり 1/4</span>
                </div>
                <span class="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400" id="inh-others-share">1人2,000万円</span>
              </div>
            </div>
          </div>

          <div class="mt-4 text-xs text-muted bg-surface/40 p-2.5 rounded border border-glass">
            💡 <strong>試験ポイント:</strong> 相続放棄をした者がいても、<strong>基礎控除額を計算する際の法定相続人の数にはその放棄者も含めて計算</strong>します！
          </div>
        </div>
      </div>
    </div>
  `;

  const spouseSelect = container.querySelector('#inh-spouse');
  const childrenInput = container.querySelector('#inh-children');
  const parentsInput = container.querySelector('#inh-parents');
  const siblingsInput = container.querySelector('#inh-siblings');
  const estateInput = container.querySelector('#inh-estate-val');

  const update = () => {
    const hasSpouse = spouseSelect.value === 'yes';
    const numChildren = parseInt(childrenInput.value) || 0;
    const numParents = parseInt(parentsInput.value) || 0;
    const numSiblings = parseInt(siblingsInput.value) || 0;
    const estateVal = parseFloat(estateInput.value) || 0;

    container.querySelector('#inh-children-val').textContent = numChildren + '人';

    // Enable / disable order inputs based on rules
    if (numChildren > 0) {
      parentsInput.disabled = true;
      siblingsInput.disabled = true;
      container.querySelector('#inh-parents-note').textContent = '※第1順位（子）がいるため第2順位・第3順位へはまわりません';
    } else if (numParents > 0) {
      parentsInput.disabled = false;
      siblingsInput.disabled = true;
      container.querySelector('#inh-parents-note').textContent = '※子が0人のため、第2順位（親）が相続人になります';
    } else {
      parentsInput.disabled = false;
      siblingsInput.disabled = false;
      container.querySelector('#inh-parents-note').textContent = '※子も親も0人のため、第3順位（兄弟姉妹）が相続人になります';
    }

    // Determine legal heirs count & shares
    let totalHeirs = hasSpouse ? 1 : 0;
    let spouseFraction = 0;
    let othersFractionTotal = 0;
    let categoryName = '';
    let categoryCount = 0;

    if (numChildren > 0) {
      totalHeirs += numChildren;
      categoryName = '子';
      categoryCount = numChildren;
      if (hasSpouse) {
        spouseFraction = 1 / 2;
        othersFractionTotal = 1 / 2;
      } else {
        spouseFraction = 0;
        othersFractionTotal = 1.0;
      }
    } else if (numParents > 0) {
      totalHeirs += numParents;
      categoryName = '直系尊属';
      categoryCount = numParents;
      if (hasSpouse) {
        spouseFraction = 2 / 3;
        othersFractionTotal = 1 / 3;
      } else {
        spouseFraction = 0;
        othersFractionTotal = 1.0;
      }
    } else if (numSiblings > 0) {
      totalHeirs += numSiblings;
      categoryName = '兄弟姉妹';
      categoryCount = numSiblings;
      if (hasSpouse) {
        spouseFraction = 3 / 4;
        othersFractionTotal = 1 / 4;
      } else {
        spouseFraction = 0;
        othersFractionTotal = 1.0;
      }
    } else {
      // Only spouse
      if (hasSpouse) {
        spouseFraction = 1.0;
      }
    }

    const deduction = 3000 + 600 * totalHeirs;
    container.querySelector('#inh-deduction-val').textContent = deduction.toLocaleString() + ' 万円';
    container.querySelector('#inh-deduction-formula').textContent = 
      `3,000万円 ＋ (600万円 × 法定相続人 ${totalHeirs}人)`;

    const spouseMoney = estateVal * spouseFraction;
    const othersMoneyTotal = estateVal * othersFractionTotal;
    const eachOtherMoney = categoryCount > 0 ? othersMoneyTotal / categoryCount : 0;
    const eachOtherFrac = categoryCount > 0 ? othersFractionTotal / categoryCount : 0;

    container.querySelector('#inh-spouse-title').textContent = hasSpouse ? '配偶者の法定相続分' : '配偶者なし';
    container.querySelector('#inh-spouse-share').textContent = hasSpouse ?
      `${spouseFraction === 0.5 ? '1/2' : spouseFraction === 2/3 ? '2/3' : spouseFraction === 0.75 ? '3/4' : '100%'} (${spouseMoney.toLocaleString()}万円)` : '0円';

    container.querySelector('#inh-others-title').textContent = categoryCount > 0 ? `${categoryName}の法定相続分 (全体 ${(othersFractionTotal*100).toFixed(0)}%)` : '他の相続人なし';
    container.querySelector('#inh-others-sub').textContent = categoryCount > 0 ? `1人あたり 割合 ${(eachOtherFrac*100).toFixed(1)}%` : '';
    container.querySelector('#inh-others-share').textContent = categoryCount > 0 ? `1人あたり ${eachOtherMoney.toLocaleString()}万円` : '0円';
  };

  [spouseSelect, childrenInput, parentsInput, siblingsInput, estateInput].forEach(el => {
    el.addEventListener('input', update);
  });

  update();
}
