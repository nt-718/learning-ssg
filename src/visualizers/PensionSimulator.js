// 公的年金 繰上げ・繰下げ受給 & 2階建て構造インタラクティブシミュレータ

export function renderPensionSimulator(container) {
  container.innerHTML = `
    <div class="visualizer-card">
      <div class="visualizer-header">
        <div class="visualizer-badge">第2章 体験ツール</div>
        <h3>🏛️ 公的年金 繰上げ・繰下げ & 損益分岐点シミュレータ</h3>
        <p>受給開始年齢（60歳〜75歳）を変更して、毎月の年金額の増減率と生涯受給額の分岐点をビジュアル比較！</p>
      </div>

      <!-- Pension 2-layer structure visualization -->
      <div class="mb-6 p-4 bg-card-bg rounded-xl border border-glass shadow-sm">
        <h4 class="font-bold text-md mb-2 text-accent">⛩️ 日本の公的年金の「2階建て」構造</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30">
            <div class="font-bold text-amber-800 dark:text-amber-400 text-sm mb-1">【3階】私的年金</div>
            <p class="text-muted">iDeCo、企業型DC、確定給付企業年金 (DB)</p>
          </div>
          <div class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-500/40">
            <div class="font-bold text-indigo-800 dark:text-indigo-300 text-sm mb-1">【2階】厚生年金保険</div>
            <p class="text-muted">会社員・公務員（第2号被保険者）が加入。報酬比例給付</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-500/40">
            <div class="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">【1階】国民年金 (基礎年金)</div>
            <p class="text-muted">20歳以上60歳未満の全員。満額約81.6万円/年 (2026年基準)</p>
          </div>
        </div>
      </div>

      <!-- Interactive Pension Age Slider -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="calc-panel p-5 bg-card-bg rounded-xl border border-glass shadow-sm">
          <h4 class="font-bold text-md mb-4 text-accent border-b border-glass pb-2">受給開始条件の設定</h4>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">65歳時点の本来受給額 (月額・万円)</label>
            <input type="number" id="pension-base-monthly" class="input-field" value="16" step="1">
            <div class="text-xs text-muted mt-1">※平均的な会社員モデル: 老齢基礎年金6.8万 ＋ 老齢厚生年金9.2万 ＝ 計16万円/月</div>
          </div>

          <div class="form-group mb-4">
            <label class="block text-sm font-semibold mb-1">
              受給開始年齢: <span id="pension-age-val" class="text-2xl font-bold text-accent">65歳</span> (原則)
            </label>
            <input type="range" id="pension-age" min="60" max="75" step="1" value="65" class="range-slider">
            <div class="flex justify-between text-[11px] text-muted mt-1">
              <span>60歳 (繰上げ)</span>
              <span>65歳 (標準)</span>
              <span>75歳 (繰下げ)</span>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-surface border border-glass text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-muted">増減率の基準:</span>
              <span class="font-bold" id="pension-rate-label">0.0% (増減なし)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">繰上げ減額率:</span>
              <span>1か月あたり -0.4% (最大 -24.0%)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">繰下げ増額率:</span>
              <span>1か月あたり +0.7% (最大 +84.0%)</span>
            </div>
          </div>
        </div>

        <!-- Result & Break-even analysis -->
        <div class="result-panel p-5 bg-card-bg rounded-xl border border-glass shadow-sm flex flex-col justify-between">
          <div>
            <h4 class="font-bold text-md mb-3 text-accent border-b border-glass pb-2">受給額 & 損益分岐点</h4>

            <div class="result-highlight my-3 p-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
              <div class="text-xs text-indigo-100 mb-1 font-medium" id="pension-result-title">65歳から受給開始する場合</div>
              <div class="text-3xl font-extrabold text-white" id="pension-monthly-val">16.0 万円 / 月</div>
              <div class="text-xs text-indigo-100 mt-1" id="pension-yearly-val">年間: 192.0 万円</div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="p-2.5 rounded-lg bg-surface flex justify-between">
                <span>80歳時点の累積受給額:</span>
                <span class="font-bold font-mono text-foreground" id="pension-cum-80">2,880 万円</span>
              </div>
              <div class="p-2.5 rounded-lg bg-surface flex justify-between">
                <span>85歳時点の累積受給額:</span>
                <span class="font-bold font-mono text-foreground" id="pension-cum-85">3,840 万円</span>
              </div>
              <div class="p-2.5 rounded-lg bg-surface flex justify-between">
                <span>90歳時点の累積受給額:</span>
                <span class="font-bold font-mono text-foreground" id="pension-cum-90">4,800 万円</span>
              </div>
            </div>
          </div>

          <div class="mt-4 text-xs text-muted bg-surface/40 p-2.5 rounded border border-glass">
            💡 <strong>損益分岐点目安:</strong> 繰下げ受給の場合、受給開始から約12年後の年齢（70歳開始なら82歳、75歳開始なら87歳）を超えると65歳受給開始より総受給額が多くなります！
          </div>
        </div>
      </div>
    </div>
  `;

  const baseInput = container.querySelector('#pension-base-monthly');
  const ageInput = container.querySelector('#pension-age');

  const update = () => {
    const baseMonthly = parseFloat(baseInput.value) || 0;
    const age = parseInt(ageInput.value) || 65;

    let rate = 0;
    if (age < 65) {
      const months = (65 - age) * 12;
      rate = -0.004 * months; // -0.4% per month
    } else if (age > 65) {
      const months = (age - 65) * 12;
      rate = 0.007 * months; // +0.7% per month
    }

    const actualMonthly = baseMonthly * (1 + rate);
    const actualYearly = actualMonthly * 12;

    container.querySelector('#pension-age-val').textContent = age + '歳';
    container.querySelector('#pension-rate-label').textContent = 
      (rate >= 0 ? '+' : '') + (rate * 100).toFixed(1) + '% ' + (age < 65 ? '(減額)' : age > 65 ? '(増額)' : '');

    container.querySelector('#pension-result-title').textContent = `${age}歳から受給開始する場合`;
    container.querySelector('#pension-monthly-val').textContent = actualMonthly.toFixed(2) + ' 万円 / 月';
    container.querySelector('#pension-yearly-val').textContent = `年間: ${actualYearly.toFixed(1)} 万円`;

    const getCum = (targetAge) => {
      if (targetAge < age) return 0;
      const years = targetAge - age;
      return (years * actualYearly).toFixed(0);
    };

    container.querySelector('#pension-cum-80').textContent = getCum(80) + ' 万円';
    container.querySelector('#pension-cum-85').textContent = getCum(85) + ' 万円';
    container.querySelector('#pension-cum-90').textContent = getCum(90) + ' 万円';
  };

  baseInput.addEventListener('input', update);
  ageInput.addEventListener('input', update);

  update();
}
