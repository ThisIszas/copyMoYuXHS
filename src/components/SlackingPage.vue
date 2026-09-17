<script setup>
/**
 * 摸鱼页：按参考站分成实时计时主卡、历史统计、工资里程碑、预约、成就和记录区。
 */
defineProps({ perSecond: Number, breakSeconds: Number, breakIncome: Number, isBreakActive: Boolean });
const emit = defineEmits(['start', 'stop']);

/** 格式化摸鱼秒数，主计时使用固定宽度。 */
function timer(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function money(value) {
  return `¥${Number(value).toFixed(2)}`;
}
</script>

<template>
  <div class="page-frame work-timer-page"><header class="page-header simple"><div><span class="date-label">SLACKING TIMER</span><h1>摸鱼，也要有收益感。</h1><p>计时基于真实时间戳，刷新、锁屏、切换页面都不会让时间丢失。</p></div></header><section class="timer-layout"><article class="big-timer-card"><span class="fish-mark">🐟</span><p>今天准备摸一会儿？</p><strong>{{ timer(breakSeconds) }}</strong><small>老板已为这段时间支付</small><em>{{ money(breakIncome) }}</em><button v-if="!isBreakActive" type="button" @click="emit('start')">▷ 开始摸鱼</button><button v-else type="button" @click="emit('stop')">□ 结束摸鱼</button><button class="secondary-action" type="button">◌ 补记已结束摸鱼</button><footer>+ ¥{{ perSecond.toFixed(5) }} / 秒 · 按工作时段折算，午休和寒暑假等休息时段不计收益</footer></article><aside class="timer-side"><article class="history-card"><div><span>历史摸鱼收益</span><strong>¥0.00</strong></div><div><span>累计摸鱼时间</span><strong>{{ breakSeconds }}秒</strong></div><button type="button" disabled>♧ 清空历史</button></article><article class="milestone-card"><span class="section-kicker">WAGE MILESTONES</span><h2>这份工资，摸回多少了？</h2><small>按当前到手薪资折算</small><div v-for="item in [['摸回 1 天工资', '652.17'], ['摸回 1 周工资', '3260.87'], ['摸回 1 个月工资', '15000.00']]" :key="item[0]" class="milestone-row"><span>♕</span><div><small>{{ item[0] }}</small><strong>¥{{ item[1] }}</strong><i></i><em>还差 ¥{{ item[1] }}</em></div></div></article></aside></section><section class="two-column-lower"><article class="appointment-card"><div class="section-heading"><h2>摸鱼预约</h2><button type="button">＋ 新增预约</button></div><p>可添加多个未来时段，每条执行一次。应用打开时到点开始；关闭后再次打开，按计划时间补算。</p><div class="records-empty">还没有预约，提前安排下一段摸鱼吧。</div></article><article class="achievement-card"><span class="section-kicker">SLACKING ACHIEVEMENTS</span><h2>摸鱼成就</h2><p>当前等级 · 等待第一枚勋章</p><strong>永久累计 {{ breakSeconds }}秒</strong><small>距离「鱼苗试水」还差 30分钟</small><div class="achievement-progress"><i :style="{ width: `${Math.min(100, breakSeconds / 18)}%` }"></i></div><ul><li>鱼苗试水 <span>累计摸鱼 30 分钟</span></li><li>带薪入门 <span>累计摸鱼 3 小时</span></li><li>鱼塘常客 <span>累计摸鱼 10 小时</span></li></ul></article></section><section class="records-section"><div class="section-heading"><h2>摸鱼记录</h2></div><div class="records-empty">0 次&nbsp;&nbsp;还没有摸鱼记录。</div></section></div>
</template>
