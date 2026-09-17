<script setup>
/**
 * 加班页：复刻参考站的计时结构，并补上无加班费、倍率和固定金额三种结算方式。
 * 加班收入归属加班开始日，记录结束后写入本地历史，不改变正常工资速度。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { activeSeconds, addBackfill, appStore, formatDuration, formatTimer, money, startTimer, stopTimer } from '../data/store';

const props = defineProps({ perSecond: { type: Number, default: 0 } });
const now = ref(new Date());
const payMode = ref('multiplier');
const multiplier = ref(1.5);
const fixedAmount = ref(0);
const backfillOpen = ref(false);
const backfillStart = ref('');
const backfillEnd = ref('');
let clock;
const running = computed(() => Boolean(appStore.overtime.active));
const seconds = computed(() => running.value ? activeSeconds('overtime', now.value) : appStore.overtime.records[0]?.durationSeconds || 0);
const historyIncome = computed(() => appStore.overtime.records.reduce((total, item) => total + Number(item.earnedAmount || 0), 0));
const achievements = computed(() => [
  ['偶尔晚归', 3600], ['夜色常客', 36000], ['工位守夜人', 108000], ['项目守护者', 360000], ['月光加班王', 1080000],
].map(([title, target]) => ({ title, target, done: appStore.overtime.lifetimeSeconds >= target })));

/** 以当前选中的方式开始加班计时。 */
function beginOvertime() {
  startTimer('overtime', { payMode: payMode.value, multiplier: Number(multiplier.value), fixedAmount: Number(fixedAmount.value) });
}

/** 补记一段加班，沿用开始前选中的结算方式。 */
function saveBackfill() {
  if (addBackfill('overtime', backfillStart.value, backfillEnd.value, { payMode: payMode.value, multiplier: Number(multiplier.value), fixedAmount: Number(fixedAmount.value) })) {
    backfillOpen.value = false;
    backfillStart.value = '';
    backfillEnd.value = '';
  }
}

/** 启动页面时钟，让进行中的加班每秒更新。 */
onMounted(() => { clock = window.setInterval(() => { now.value = new Date(); }, 1000); });

/** 离开页面时清理展示定时器，不影响 store 中的活动计时。 */
onBeforeUnmount(() => window.clearInterval(clock));
</script>

<template>
  <div class="page-frame work-timer-page">
    <header class="page-header simple"><div><span class="date-label">OVERTIME TIMER</span><h1>加班，也得算得明白。</h1><p>有钱就算钱，没钱也把时间记下来。刷新、锁屏或切换页面都不会丢失计时。</p></div></header>
    <section class="timer-layout"><article class="big-timer-card overtime-card"><span class="fish-mark">◒</span><p>{{ running ? '正在记录加班时间' : '今天又要加班吗？' }}</p><strong>{{ formatTimer(seconds) }}</strong><small>本次预计加班收入</small><em>{{ money(running && appStore.overtime.active?.payMode === 'fixed' ? appStore.overtime.active.fixedAmount : seconds * props.perSecond * (payMode === 'multiplier' ? multiplier : 0)) }}</em><button v-if="!running" type="button" @click="beginOvertime">▷ 开始加班</button><button v-else type="button" @click="stopTimer('overtime')">□ 结束加班</button><button class="secondary-action" type="button" @click="backfillOpen = !backfillOpen">◌ 补记已结束加班</button><footer>开始时选择加班费 · 历史加班收入 {{ money(historyIncome) }} · 当前 {{ seconds }}秒</footer></article><aside class="timer-side"><article class="history-card"><div><span>历史加班收入</span><strong>{{ money(historyIncome) }}</strong></div><div><span>当前加班时间</span><strong>{{ formatDuration(appStore.overtime.lifetimeSeconds) }}</strong></div><button v-if="appStore.overtime.records.length" type="button" @click="appStore.overtime.records = []">♧ 清空历史</button><button v-else type="button" disabled>♧ 清空历史</button></article><article class="how-card"><span class="section-kicker">HOW IT WORKS</span><h2>每次开始前，再决定怎么算。</h2><label>加班费方式<select v-model="payMode"><option value="unpaid">无加班费，只记录时间</option><option value="multiplier">按工资倍率</option><option value="fixed">固定金额</option></select></label><label v-if="payMode === 'multiplier'">倍率<input v-model.number="multiplier" type="number" min="0" step="0.1" /></label><label v-if="payMode === 'fixed'">本次金额<input v-model.number="fixedAmount" type="number" min="0" step="0.01" /></label><div v-for="step in [['01', '确认实际开始时间'], ['02', '选择无加班费、倍率或固定金额'], ['03', '结束后自动写入账本']]" :key="step[0]"><b>{{ step[0] }}</b><span>{{ step[1] }}</span></div></article></aside></section>
    <section v-if="backfillOpen" class="backfill-card"><div><strong>补记一段已结束加班</strong><small>收入归属开始日期，时间按设备本地时区解释。</small></div><label>开始<input v-model="backfillStart" type="datetime-local" /></label><label>结束<input v-model="backfillEnd" type="datetime-local" /></label><button type="button" @click="saveBackfill">保存时段</button></section>
    <section class="two-column-lower"><article class="appointment-card"><div class="section-heading"><h2>加班预约</h2><button type="button" disabled>＋ 新增预约</button></div><p>当前版本保留预约展示位，实际计时必须由你主动开始，避免后台自动开始造成工资误差。</p><div class="records-empty">还没有预约，提前安排下一段加班吧。</div></article><article class="achievement-card"><span class="section-kicker">OVERTIME ACHIEVEMENTS</span><h2>加班成就</h2><p>永久累计 {{ formatDuration(appStore.overtime.lifetimeSeconds) }}</p><div class="achievement-progress"><i :style="{ width: `${Math.min(100, appStore.overtime.lifetimeSeconds / 3600 * 100)}%` }"></i></div><ul><li v-for="item in achievements" :key="item.title" :class="{ unlocked: item.done }">{{ item.done ? '●' : '○' }} {{ item.title }} <span>{{ formatDuration(item.target) }}</span></li></ul></article></section>
    <section class="records-section"><div class="section-heading"><div><span class="section-kicker">HISTORY</span><h2>加班记录</h2></div><span>{{ appStore.overtime.records.length }} 次</span></div><div v-if="!appStore.overtime.records.length" class="records-empty">还没有加班记录。</div><div v-else class="record-list"><article v-for="record in appStore.overtime.records" :key="record.id" class="record-card"><div><strong>{{ formatTimer(record.durationSeconds) }}</strong><small>{{ new Date(record.startTime).toLocaleString('zh-CN') }} · {{ record.payMode === 'fixed' ? '固定金额' : record.payMode === 'multiplier' ? `${record.multiplier} 倍` : '无加班费' }}</small></div><b>{{ money(record.earnedAmount) }}</b></article></div></section>
  </div>
</template>
