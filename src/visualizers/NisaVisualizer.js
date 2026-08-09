// 新NISA 制度構造 & 非課税枠比較ビジュアル

export function renderNisaVisualizer(container) {
  container.innerHTML = `
    <div class="visualizer-card">
      <div class="visualizer-header">
        <div class="visualizer-badge">第4章 体験ツール</div>
        <h3>🌱 新NISA 制度構造 & 非課税投資枠インタラクティブマップ</h3>
        <p>年間投資枠、生涯非課税保有限度額（1,800万円）、つみたて投資枠と成長投資枠の併用ルールを対比！</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- つみたて投資枠 -->
        <div class="p-5 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-500/30 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-emerald-200 dark:border-emerald-500/20 pb-2">
            <span class="text-xs font-bold text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-500/20">枠①</span>
            <h4 class="text-lg font-bold text-emerald-800 dark:text-emerald-300">つみたて投資枠</h4>
          </div>
          
          <ul class="space-y-2 text-xs text-muted">
            <li class="flex justify-between border-b border-glass pb-1">
              <span>年間投資枠上限:</span>
              <span class="font-bold text-foreground font-mono">120 万円 / 年</span>
            </li>
            <li class="flex justify-between border-b border-glass pb-1">
              <span>投資方法:</span>
              <span class="font-bold text-foreground">定期かつ継続的な積立のみ</span>
            </li>
            <li class="flex justify-between border-b border-glass pb-1">
              <span>対象商品:</span>
              <span class="font-bold text-foreground">長期・積立・分散に適した公募投資信託</span>
            </li>
            <li class="flex justify-between">
              <span>非課税保有期間:</span>
              <span class="font-bold text-emerald-600 dark:text-emerald-400">無期限化</span>
            </li>
          </ul>
        </div>

        <!-- 成長投資枠 -->
        <div class="p-5 rounded-xl bg-indigo-50 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-500/30 shadow-sm">
          <div class="flex items-center justify-between mb-3 border-b border-indigo-200 dark:border-indigo-500/20 pb-2">
            <span class="text-xs font-bold text-indigo-800 dark:text-indigo-400 px-2 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-500/20">枠②</span>
            <h4 class="text-lg font-bold text-indigo-800 dark:text-indigo-300">成長投資枠</h4>
          </div>

          <ul class="space-y-2 text-xs text-muted">
            <li class="flex justify-between border-b border-glass pb-1">
              <span>年間投資枠上限:</span>
              <span class="font-bold text-foreground font-mono">240 万円 / 年</span>
            </li>
            <li class="flex justify-between border-b border-glass pb-1">
              <span>投資方法:</span>
              <span class="font-bold text-foreground">一括購入 ＆ 積立の両方可能</span>
            </li>
            <li class="flex justify-between border-b border-glass pb-1">
              <span>対象商品:</span>
              <span class="font-bold text-foreground">上場株式・公募投信等 (デリバティブ等除く)</span>
            </li>
            <li class="flex justify-between">
              <span>非課税保有期間:</span>
              <span class="font-bold text-indigo-600 dark:text-indigo-300">無期限化</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Lifetime limit overview -->
      <div class="p-5 rounded-xl bg-surface/80 border border-glass">
        <h4 class="font-bold text-md mb-2 text-accent">💰 生涯非課税保有限度額（総枠 1,800万円）のルール</h4>

        <div class="my-4 p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/30">
          <div class="flex justify-between text-xs text-muted mb-1">
            <span>生涯非課税限度額: 1,800万円</span>
            <span>(うち成長投資枠は最大 1,200万円まで)</span>
          </div>
          <!-- Visual limit bar -->
          <div class="w-full h-6 rounded-full bg-surface/80 flex overflow-hidden border border-glass">
            <div class="h-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-black" style="width: 33.3%;">
              つみたて枠 (無制限)
            </div>
            <div class="h-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white" style="width: 66.7%;">
              成長投資枠 (最大1,200万)
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted">
          <div class="p-2.5 rounded bg-surface/50 border border-glass">
            🔹 <strong>年間最大買付額:</strong> つみたて120万 ＋ 成長240万 ＝ <strong>年間合計 360万円</strong> まで併用可能。
          </div>
          <div class="p-2.5 rounded bg-surface/50 border border-glass">
            🔹 <strong>売却後の枠再利用:</strong> 商品を売却した場合、翌年以降に<strong>簿価（購入時の価額）ベース</strong>で生涯枠が復活・再利用可能！
          </div>
        </div>
      </div>
    </div>
  `;
}
