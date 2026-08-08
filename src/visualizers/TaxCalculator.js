// タックスプランニング 5ステップ所得税シミュレータ & 10所得・損益通算ビジュアル

export function renderTaxCalculator(container) {
  container.innerHTML = `
    <div class="visualizer-card">
      <div class="visualizer-header">
        <div class="visualizer-badge">第5章 体験ツール</div>
        <h3>富士山 損益通算 & 5ステップ税額計算シミュレータ</h3>
        <p>10種類の所得分類、損益通算の「富士山（不動産・事業・山林・譲渡）」の順番、課税所得と所得税額の計算手順をビジュアル体験！</p>
      </div>

      <!-- 10 Incomes & Loss Offset Fuji diagram header -->
      <div class="mb-6 bg-card-bg p-4 rounded-xl border border-glass">
        <h4 class="font-bold text-md mb-2 text-accent">🗻 損益通算の基本イメージ：「富士山（不・事・山・譲）」</h4>
        <p class="text-xs text-muted mb-3">赤字が発生したときに他の黒字所得と相殺できる4つの所得。※不動産所得の土地取得利子は通算不可など試験頻出のひっかけに注意！</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
            <span class="block font-bold text-emerald-400">1. 不動産所得 (不)</span>
            <span class="text-[11px] text-emerald-200/70">賃料収入・駐車場</span>
          </div>
          <div class="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30">
            <span class="block font-bold text-blue-400">2. 事業所得 (事)</span>
            <span class="text-[11px] text-blue-200/70">個人事業・売上</span>
          </div>
          <div class="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30">
            <span class="block font-bold text-amber-400">3. 山林所得 (山)</span>
            <span class="text-[11px] text-amber-200/70">山林の伐採・譲渡</span>
          </div>
          <div class="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30">
            <span class="block font-bold text-purple-400">4. 譲渡所得 (譲)</span>
            <span class="text-[11px] text-purple-200/70">ゴルフ会員権・資産売却</span>
          </div>
        </div>
      </div>

      <!-- Interactive 5-Step Tax Calculator -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Input Form -->
        <div class="calc-panel p-5 bg-card-bg rounded-xl border border-glass">
          <h4 class="font-bold text-md mb-4 text-accent border-b border-glass pb-2">Step 1 & 2: 収入と所得控除の入力</h4>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">給与額面収入 (万円)</label>
            <input type="number" id="tax-salary-income" class="input-field" value="600" step="10">
            <div class="text-xs text-muted mt-1" id="salary-deduct-preview">給与所得控除: 約164万円 → 給与所得: 436万円</div>
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">事業所得・不動産所得の黒字 (万円)</label>
            <input type="number" id="tax-other-income" class="input-field" value="0" step="10">
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">損益通算対象の赤字 (万円)</label>
            <input type="number" id="tax-loss" class="input-field" value="0" step="10" placeholder="例: 不動産所得の赤字50万円">
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">所得控除の合計 (万円)</label>
            <input type="number" id="tax-deduction-sum" class="input-field" value="120" step="5">
            <div class="text-xs text-muted mt-1">基礎控除(48万)＋社会保険料控除＋配偶者控除＋生命保険料控除等</div>
          </div>

          <div class="form-group mb-2">
            <label class="block text-sm font-semibold mb-1">住宅ローン控除などの税額控除 (万円)</label>
            <input type="number" id="tax-credit" class="input-field" value="10" step="1">
          </div>
        </div>

        <!-- Result Breakdown Steps -->
        <div class="result-panel p-5 bg-card-bg rounded-xl border border-glass flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-md mb-3 text-accent border-b border-glass pb-2">5ステップ 税額計算内訳</h4>

            <div class="space-y-3 text-xs">
              <div class="p-2.5 rounded-lg bg-surface/60 border border-glass flex justify-between items-center">
                <div>
                  <span class="font-bold block text-sm text-indigo-300">Step 1: 総所得金額 (損益通算後)</span>
                  <span class="text-muted" id="step1-sub">給与所得436万円 ＋ 他所得0 - 赤字0</span>
                </div>
                <span class="text-base font-bold font-mono text-white" id="step1-val">4,360,000 円</span>
              </div>

              <div class="p-2.5 rounded-lg bg-surface/60 border border-glass flex justify-between items-center">
                <div>
                  <span class="font-bold block text-sm text-indigo-300">Step 2: 課税総所得金額</span>
                  <span class="text-muted">総所得金額 － 所得控除合計</span>
                </div>
                <span class="text-base font-bold font-mono text-white" id="step2-val">3,160,000 円</span>
              </div>

              <div class="p-2.5 rounded-lg bg-surface/60 border border-glass">
                <div class="flex justify-between items-center mb-1">
                  <div>
                    <span class="font-bold block text-sm text-indigo-300">Step 3 & 4: 超過累進税率・算出税額</span>
                    <span class="text-muted" id="step3-sub">税率 10% ／ 控除額 9.75万円</span>
                  </div>
                  <span class="text-base font-bold font-mono text-emerald-400" id="step3-val">218,500 円</span>
                </div>
              </div>

              <div class="p-2.5 rounded-lg bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40">
                <div class="flex justify-between items-center">
                  <div>
                    <span class="font-bold block text-sm text-emerald-300">Step 5: 最終納付所得税額</span>
                    <span class="text-muted" id="step5-sub">算出税額21.85万 － 税額控除10万円</span>
                  </div>
                  <span class="text-xl font-extrabold font-mono text-white" id="step5-val">118,500 円</span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 text-xs text-muted bg-surface/40 p-2.5 rounded border border-glass">
            💡 <strong>試験のツボ:</strong> 「所得控除」は税率を掛ける前の所得を減らすもの。「税額控除」は税額そのものから直接引くので節税効果が大きい！
          </div>
        </div>
      </div>
    </div>
  `;

  const salaryInput = container.querySelector('#tax-salary-income');
  const otherInput = container.querySelector('#tax-other-income');
  const lossInput = container.querySelector('#tax-loss');
  const deductionSumInput = container.querySelector('#tax-deduction-sum');
  const creditInput = container.querySelector('#tax-credit');

  const calculateSalaryDeduction = (income) => {
    // income is in 万円
    if (income <= 162.5) return 55;
    if (income <= 180) return income * 0.4 - 10;
    if (income <= 360) return income * 0.3 + 8;
    if (income <= 660) return income * 0.2 + 44;
    if (income <= 850) return income * 0.1 + 110;
    return 195; // cap at 195万円
  };

  const calculateTaxRate = (taxableMan) => {
    // taxableMan in 万円
    const yen = taxableMan * 10000;
    if (yen <= 1950000) return { rate: 0.05, quick: 0 };
    if (yen <= 3300000) return { rate: 0.10, quick: 97500 };
    if (yen <= 6950000) return { rate: 0.20, quick: 427500 };
    if (yen <= 9000000) return { rate: 0.23, quick: 636000 };
    if (yen <= 18000000) return { rate: 0.33, quick: 1536000 };
    if (yen <= 40000000) return { rate: 0.40, quick: 2796000 };
    return { rate: 0.45, quick: 4796000 };
  };

  const update = () => {
    const salary = parseFloat(salaryInput.value) || 0;
    const other = parseFloat(otherInput.value) || 0;
    const loss = parseFloat(lossInput.value) || 0;
    const deductSum = parseFloat(deductionSumInput.value) || 0;
    const credit = parseFloat(creditInput.value) || 0;

    const salDeduct = calculateSalaryDeduction(salary);
    const salaryIncome = Math.max(0, salary - salDeduct);

    container.querySelector('#salary-deduct-preview').textContent = 
      `給与所得控除: 約${salDeduct.toFixed(1)}万円 → 給与所得: ${salaryIncome.toFixed(1)}万円`;

    // Step 1: Total income after loss offset
    const totalIncome = Math.max(0, salaryIncome + other - loss);

    // Step 2: Taxable total income (rounded down to nearest 1,000 yen)
    const taxableMan = Math.max(0, totalIncome - deductSum);
    const taxableYen = Math.floor((taxableMan * 10000) / 1000) * 1000;

    // Step 3 & 4: Progressive tax rate & calculated tax
    const { rate, quick } = calculateTaxRate(taxableYen / 10000);
    const calculatedTax = Math.max(0, Math.floor(taxableYen * rate - quick));

    // Step 5: Final tax after tax credit
    const creditYen = credit * 10000;
    const finalTax = Math.max(0, calculatedTax - creditYen);

    container.querySelector('#step1-sub').textContent = 
      `給与所得${salaryIncome.toFixed(1)}万 ＋ 他${other}万 － 赤字${loss}万`;
    container.querySelector('#step1-val').textContent = (totalIncome * 10000).toLocaleString() + ' 円';

    container.querySelector('#step2-val').textContent = taxableYen.toLocaleString() + ' 円';

    container.querySelector('#step3-sub').textContent = 
      `適用税率 ${(rate * 100).toFixed(0)}% ／ 控除額 ${(quick/10000).toFixed(2)}万円`;
    container.querySelector('#step3-val').textContent = calculatedTax.toLocaleString() + ' 円';

    container.querySelector('#step5-sub').textContent = 
      `算出税額 ${(calculatedTax/10000).toFixed(2)}万 － 税額控除 ${credit}万円`;
    container.querySelector('#step5-val').textContent = finalTax.toLocaleString() + ' 円';
  };

  [salaryInput, otherInput, lossInput, deductionSumInput, creditInput].forEach(el => {
    el.addEventListener('input', update);
  });

  update();
}
