// 6係数 インタラクティブ電卓 & 使い分けダイアグラム

export function renderSixCoefficients(container) {
  container.innerHTML = `
    <div class="visualizer-card">
      <div class="visualizer-header">
        <div class="visualizer-badge">第1章 体験ツール</div>
        <h3>⚡ 6つの係数 インタラクティブ電卓 & 診断チャート</h3>
        <p>文章で覚えるだけでなく、数値を動かして時間価値の変化と毎年の計算式を体感しよう！</p>
      </div>

      <!-- Decision flowchart tab -->
      <div class="flowchart-box mb-6">
        <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
          <span>🧭 どの係数を使う？ 迷ったときの対話型診断</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button class="coeff-tab-btn active" data-type="future_one">
            <span class="block font-bold">手元の元本を運用</span>
            <span class="text-xs opacity-80">【一括】現在 → 将来額 (終価係数)</span>
          </button>
          <button class="coeff-tab-btn" data-type="present_one">
            <span class="block font-bold">将来必要額の元本</span>
            <span class="text-xs opacity-80">【一括】将来 → 現在額 (現価係数)</span>
          </button>
          <button class="coeff-tab-btn" data-type="accum_future">
            <span class="block font-bold">毎月積立てた将来合計</span>
            <span class="text-xs opacity-80">【積立】積立 → 将来額 (年金終価係数)</span>
          </button>
          <button class="coeff-tab-btn" data-type="target_accum">
            <span class="block font-bold">目標額のための毎年積立</span>
            <span class="text-xs opacity-80">【積立】目標 → 毎年積立 (減債基金係数)</span>
          </button>
          <button class="coeff-tab-btn" data-type="withdraw_yearly">
            <span class="block font-bold">元本取り崩しの毎年受取</span>
            <span class="text-xs opacity-80">【取崩】元本 → 毎年受取 (資本回収係数)</span>
          </button>
          <button class="coeff-tab-btn" data-type="yearly_present">
            <span class="block font-bold">毎年定額受取の必要元本</span>
            <span class="text-xs opacity-80">【取崩】毎年受取 → 元本 (年金現価係数)</span>
          </button>
        </div>
      </div>

      <!-- Interactive Calculator Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="calc-panel p-5 bg-card-bg rounded-xl border border-glass">
          <h4 class="font-bold text-md mb-4 text-accent border-b border-glass pb-2">入力パラメータ</h4>
          
          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">基準となる金額 (円)</label>
            <input type="number" id="coeff-amount" class="input-field" value="10000000" step="100000">
            <div class="text-xs text-muted mt-1" id="coeff-amount-label">例: 元本1,000万円</div>
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">年利 (%): <span id="coeff-rate-val" class="text-accent font-bold">2.0%</span></label>
            <input type="range" id="coeff-rate" min="0.1" max="10.0" step="0.1" value="2.0" class="range-slider">
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">期間 (年): <span id="coeff-years-val" class="text-accent font-bold">10年</span></label>
            <input type="range" id="coeff-years" min="1" max="40" step="1" value="10" class="range-slider">
          </div>

          <div class="coef-info-card bg-primary-dark/30 p-3 rounded-lg border border-primary/20 text-xs">
            <span class="font-bold block mb-1" id="coef-name-title">終価係数 (FV Factor)</span>
            <p id="coef-description">現在の元本を複利運用した場合、将来いくらになるかを求める係数。</p>
            <div class="mt-2 text-muted font-mono" id="coef-formula">数式: (1 + r)^n</div>
          </div>
        </div>

        <!-- Result Breakdown Card -->
        <div class="result-panel p-5 bg-card-bg rounded-xl border border-glass flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-md mb-2 text-accent border-b border-glass pb-2">計算結果 & 試算内訳</h4>
            
            <div class="result-highlight my-4 p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
              <div class="text-xs text-indigo-100 mb-1 font-medium" id="result-type-label">10年後の将来価値</div>
              <div class="text-3xl font-extrabold text-white tracking-tight" id="result-final-val">12,189,944 円</div>
              <div class="text-xs text-indigo-100 mt-2" id="result-subtext">元本 1,000万円 ＋ 運用益 約219.0万円</div>
            </div>

            <!-- All 6 coefficients summary table -->
            <div class="overflow-x-auto text-xs">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-glass text-muted">
                    <th class="py-1">係数名</th>
                    <th class="py-1 text-right">係数値</th>
                    <th class="py-1 text-right">計算結果</th>
                  </tr>
                </thead>
                <tbody id="all-coef-tbody">
                  <!-- JS populated -->
                </tbody>
              </table>
            </div>
          </div>

          <div class="mt-4 text-xs text-muted bg-surface/50 p-2 rounded">
            💡 <strong>FP試験テクニック:</strong> 一括は「終価・現価」、積立は「年金終価・減債基金」、取崩は「資本回収・年金現価」で暗記！
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers
  const typeBtns = container.querySelectorAll('.coeff-tab-btn');
  const amountInput = container.querySelector('#coeff-amount');
  const rateInput = container.querySelector('#coeff-rate');
  const yearsInput = container.querySelector('#coeff-years');
  
  let currentType = 'future_one';

  const update = () => {
    const amount = parseFloat(amountInput.value) || 0;
    const r = (parseFloat(rateInput.value) || 0) / 100;
    const n = parseInt(yearsInput.value) || 1;

    container.querySelector('#coeff-rate-val').textContent = (r * 100).toFixed(1) + '%';
    container.querySelector('#coeff-years-val').textContent = n + '年';

    // Calculate all 6 factors
    // 1. 終価係数
    const f_fv = Math.pow(1 + r, n);
    // 2. 現価係数
    const f_pv = 1 / Math.pow(1 + r, n);
    // 3. 年金終価係数
    const f_afv = (Math.pow(1 + r, n) - 1) / r;
    // 4. 減債基金係数
    const f_sinking = r / (Math.pow(1 + r, n) - 1);
    // 5. 資本回収係数
    const f_cap_rec = (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    // 6. 年金現価係数
    const f_apv = (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));

    const factors = {
      future_one: { name: '終価係数', val: f_fv, label: '現在の元本→将来額', desc: '手元の元本を複利運用した場合、将来いくらになるかを求める係数。', formula: '(1 + r)^n' },
      present_one: { name: '現価係数', val: f_pv, label: '将来必要額→現在元本', desc: '将来必要な金額を得るために、現在いくらの元本が必要かを求める係数。', formula: '1 / (1 + r)^n' },
      accum_future: { name: '年金終価係数', val: f_afv, label: '毎年積立→将来積立合計', desc: '毎年一定額を積み立てた場合、将来合計いくらになるかを求める係数。', formula: '((1 + r)^n - 1) / r' },
      target_accum: { name: '減債基金係数', val: f_sinking, label: '目標額→毎年の積立額', desc: '将来の目標額を達成するために、毎年いくら積み立てる必要があるかを求める係数。', formula: 'r / ((1 + r)^n - 1)' },
      withdraw_yearly: { name: '資本回収係数', val: f_cap_rec, label: '現在元本→毎年の取崩受取額', desc: '手元の元本を運用しながら一定期間で取り崩す場合、毎年いくら受け取れるかを求める係数。', formula: '(r(1 + r)^n) / ((1 + r)^n - 1)' },
      yearly_present: { name: '年金現価係数', val: f_apv, label: '毎年の目標受取額→必要元本', desc: '将来毎年一定額を受け取るために、現在いくらの元本が必要かを求める係数。', formula: '((1 + r)^n - 1) / (r(1 + r)^n)' }
    };

    const active = factors[currentType];
    const calcResult = amount * active.val;

    container.querySelector('#coef-name-title').textContent = active.name;
    container.querySelector('#coef-description').textContent = active.desc;
    container.querySelector('#coef-formula').textContent = '数式: ' + active.formula;

    container.querySelector('#result-type-label').textContent = `${n}年後の ${active.label}`;
    container.querySelector('#result-final-val').textContent = Math.round(calcResult).toLocaleString() + ' 円';

    if (currentType === 'future_one') {
      container.querySelector('#result-subtext').textContent = `元本 ${Math.round(amount).toLocaleString()}円 ＋ 運用益 ${Math.round(calcResult - amount).toLocaleString()}円`;
    } else if (currentType === 'target_accum') {
      container.querySelector('#result-subtext').textContent = `目標 ${Math.round(amount).toLocaleString()}円 に対し、年間 ${Math.round(calcResult).toLocaleString()}円 (月約 ${Math.round(calcResult/12).toLocaleString()}円) 積立`;
    } else if (currentType === 'withdraw_yearly') {
      container.querySelector('#result-subtext').textContent = `元本 ${Math.round(amount).toLocaleString()}円 を運用しつつ毎年 ${Math.round(calcResult).toLocaleString()}円 受取り`;
    } else {
      container.querySelector('#result-subtext').textContent = `係数値: ${active.val.toFixed(4)}`;
    }

    // Populate summary table
    const tbody = container.querySelector('#all-coef-tbody');
    tbody.innerHTML = Object.keys(factors).map(k => {
      const f = factors[k];
      const res = Math.round(amount * f.val);
      const isSel = k === currentType;
      return `
        <tr class="${isSel ? 'bg-primary/20 font-bold text-accent' : 'hover:bg-surface/30'}">
          <td class="py-1.5">${f.name}</td>
          <td class="py-1.5 text-right font-mono">${f.val.toFixed(4)}</td>
          <td class="py-1.5 text-right font-mono">${res.toLocaleString()} 円</td>
        </tr>
      `;
    }).join('');
  };

  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      update();
    });
  });

  amountInput.addEventListener('input', update);
  rateInput.addEventListener('input', update);
  yearsInput.addEventListener('input', update);

  update();
}
