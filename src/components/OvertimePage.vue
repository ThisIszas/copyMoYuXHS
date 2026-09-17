<script setup>
/**
 * 加班页：复刻摸鱼页的计时结构，但额外展示“开始前确认加班费”的三步说明。
 */
defineProps({ perSecond: Number });
const running = ref(false);
const seconds = ref(0);
const emit = defineEmits(['navigate']);

import { onBeforeUnmount, onMounted, ref } from 'vue';
let timerId;

/** 启停本地加班计时；每秒更新一次，刷新页面后从示例状态重新开始。 */
function toggleTimer() {
  running.value = !running.value;
  window.clearInterval(timerId);
  if (running.value) {
    timerId = window.setInterval(() => { seconds.value += 1; }, 1000);
  }
}

/** 将秒数格式化为加班页主计时。 */
function formatTimer(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

onMounted(() => window.clearInterval(timerId));
onBeforeUnmount(() => window.clearInterval(timerId));
</script>

<template>
  <div class="page-frame work-timer-page"><header class="page-header simple"><div><span class="date-label">OVERTIME TIMER</span><h1>加班，也得算得明白。</h1><p>有钱就算钱，没钱也把时间记下来。刷新、锁屏或切换页面都不会丢失计时。</p></div></header><section class="timer-layout"><article class="big-timer-card overtime-card"><span class="fish-mark">◒</span><p>{{ running ? '正在记录加班时间' : '今天又要加班吗？' }}</p><strong>{{ formatTimer(seconds) }}</strong><small>本次预计加班收入</small><em>¥ 0.00</em><button type="button" @click="toggleTimer">{{ running ? '□ 结束加班' : '▷ 开始加班' }}</button><button class="secondary-action" type="button">◌ 补记已结束加班</button><footer>开始时再选择有没有加班费 · 历史加班收入 ¥ 0.00 · 当前保留的加班时间 {{ seconds }}秒</footer></article><aside class="timer-side"><article class="history-card"><div><span>历史加班收入</span><strong>¥0.00</strong></div><div><span>当前加班时间</span><strong>{{ seconds }}秒</strong></div><button type="button" disabled>♧ 清空历史</button></article><article class="how-card"><span class="section-kicker">HOW IT WORKS</span><h2>每次开始前，再决定怎么算。</h2><div v-for="step in [['01', '确认实际开始时间'], ['02', '选择无加班费、倍率或固定金额'], ['03', '结束后自动写入账本']]" :key="step[0]"><b>{{ step[0] }}</b><span>{{ step[1] }}</span></div></article></aside></section><section class="two-column-lower"><article class="appointment-card"><div class="section-heading"><h2>加班预约</h2><button type="button">＋ 新增预约</button></div><p>可添加多个未来时段，每条执行一次。应用打开时到点开始；关闭后再次打开，按计划时间补算。</p><div class="records-empty">还没有预约，提前安排下一段加班吧。</div></article><article class="achievement-card"><span class="section-kicker">OVERTIME ACHIEVEMENTS</span><h2>加班成就</h2><p>当前等级 · 等待第一枚勋章</p><strong>永久累计 {{ seconds }}秒</strong><small>距离「偶尔晚归」还差 1小时</small><div class="achievement-progress"><i :style="{ width: `${Math.min(100, seconds / 36)}%` }"></i></div><ul><li>偶尔晚归 <span>累计加班 1 小时</span></li><li>夜色常客 <span>累计加班 10 小时</span></li><li>工位守夜人 <span>累计加班 30 小时</span></li></ul></article></section><section class="records-section"><div class="section-heading"><h2>加班记录</h2></div><div class="records-empty">0 次&nbsp;&nbsp;还没有加班记录。</div></section></div>
</template>
