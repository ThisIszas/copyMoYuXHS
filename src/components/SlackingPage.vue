<script setup>
/**
 * 摸鱼页：把参考站的实时计时、补记、历史收益、里程碑和五级成就做成可用交互。
 * 计时起点写入 localStorage，因此刷新或切换页面不会把进行中的时间清零。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { activeSeconds, addBackfill, appStore, formatDuration, formatTimer, money } from '../data/store';

const props = defineProps({ perSecond: { type: Number, default: 0 } });
const emit = defineEmits(['start', 'stop']);
const now = ref(new Date());
const backfillOpen = ref(false);
const backfillStart = ref('');
const backfillEnd = ref('');
let clock;
const running = computed(() => Boolean(appStore.slacking.active));
const seconds = computed(() => running.value ? activeSeconds('slacking', now.value) : appStore.slacking.records[0]?.durationSeconds || 0);
const historySeconds = computed(() => appStore.slacking.records.reduce((total, item) => total + Number(item.durationSeconds || 0), 0));
const historyIncome = computed(() => appStore.slacking.records.reduce((total, item) => total + Number(item.earnedAmount || 0), 0));
const achievements = computed(() => [
  ['鱼苗试水', 1800], ['带薪入门', 10800], ['鱼塘常客', 36000], ['摸鱼大师', 108000], ['传说鱼王', 360000],
].map(([title, target]) => ({ title, target, done: appStore.slacking.lifetimeSeconds >= target })));

/** 提交补记表单，将遗漏的已结束时段写入摸鱼历史。 */
function saveBackfill() {
  if (addBackfill('slacking', backfillStart.value, backfillEnd.value)) {
    backfillOpen.value = false;
    backfillStart.value = '';
    backfillEnd.value = '';
  }
}

/** 启动页面时钟，仅用于让进行中的计时每秒刷新，不替代本地起止时间。 */
onMounted(() => { clock = window.setInterval(() => { now.value = new Date(); }, 1000); });

/** 离开页面时释放刷新定时器，计时本身仍留在 store 中继续运行。 */
onBeforeUnmount(() => window.clearInterval(clock));
</script>

<template>
  <div class="page-frame work-timer-page">
    <header class="page-header simple"><div><span class="date-label">SLACKING TIMER</span><h1>摸鱼，也要有收益感。</h1><p>计时基于真实时间戳，刷新、锁屏、切换页面都不会让时间丢失。</p></div></header>
    <section class="timer-layout">
      <article class="big-timer-card"><span class="fish-mark">🐟</span><p>{{ running ? '正在记录这段摸鱼时间' : '今天准备摸一会儿？' }}</p><strong>{{ formatTimer(seconds) }}</strong><small>老板已为这段时间支付</small><em>{{ money(seconds * props.perSecond) }}</em><button v-if="!running" type="button" @click="emit('start')">▷ 开始摸鱼</button><button v-else type="button" @click="emit('stop')">□ 结束摸鱼</button><button class="secondary-action" type="button" @click="backfillOpen = !backfillOpen">◌ 补记已结束摸鱼</button><footer>+ {{ money(props.perSecond) }} / 秒 · 历史累计 {{ formatDuration(appStore.slacking.lifetimeSeconds) }}</footer></article>
      <aside class="timer-side"><article class="history-card"><div><span>历史摸鱼收益</span><strong>{{ money(historyIncome) }}</strong></div><div><span>累计摸鱼时间</span><strong>{{ formatDuration(historySeconds) }}</strong></div><button v-if="appStore.slacking.records.length" type="button" @click="appStore.slacking.records = []">♧ 清空历史</button><button v-else type="button" disabled>♧ 清空历史</button></article><article class="milestone-card"><span class="section-kicker">WAGE MILESTONES</span><h2>这份工资，摸回多少了？</h2><small>按当前到手薪资折算</small><div v-for="item in [['摸回 1 天工资', 652.17], ['摸回 1 周工资', 3260.87], ['摸回 1 个月工资', 15000]]" :key="item[0]" class="milestone-row"><span>♕</span><div><small>{{ item[0] }}</small><strong>{{ money(Math.min(item[1], historyIncome)) }}</strong><i :style="{ width: `${Math.min(100, historyIncome / item[1] * 100)}%` }"></i><em>还差 {{ money(Math.max(0, item[1] - historyIncome)) }}</em></div></div></article></aside>
    </section>
    <section v-if="backfillOpen" class="backfill-card"><div><strong>补记一段已结束摸鱼</strong><small>不能与进行中的同类记录重叠，时间按设备本地时区解释。</small></div><label>开始<input v-model="backfillStart" type="datetime-local" /></label><label>结束<input v-model="backfillEnd" type="datetime-local" /></label><button type="button" @click="saveBackfill">保存时段</button></section>
    <section class="two-column-lower"><article class="appointment-card"><div class="section-heading"><h2>摸鱼预约</h2><button type="button" disabled>＋ 新增预约</button></div><p>参考实现会在这里展示未来计划；当前版本先保留记录入口，避免后台自动开始造成误计时。</p><div class="records-empty">还没有预约，提前安排下一段摸鱼吧。</div></article><article class="achievement-card"><span class="section-kicker">SLACKING ACHIEVEMENTS</span><h2>摸鱼成就</h2><p>永久累计 {{ formatDuration(appStore.slacking.lifetimeSeconds) }}</p><div class="achievement-progress"><i :style="{ width: `${Math.min(100, appStore.slacking.lifetimeSeconds / 1800 * 100)}%` }"></i></div><ul><li v-for="item in achievements" :key="item.title" :class="{ unlocked: item.done }">{{ item.done ? '●' : '○' }} {{ item.title }} <span>{{ formatDuration(item.target) }}</span></li></ul></article></section>
    <section class="records-section"><div class="section-heading"><div><span class="section-kicker">HISTORY</span><h2>摸鱼记录</h2></div><span>{{ appStore.slacking.records.length }} 次</span></div><div v-if="!appStore.slacking.records.length" class="records-empty">还没有摸鱼记录。</div><div v-else class="record-list"><article v-for="record in appStore.slacking.records" :key="record.id" class="record-card"><div><strong>{{ formatTimer(record.durationSeconds) }}</strong><small>{{ new Date(record.startTime).toLocaleString('zh-CN') }} · {{ new Date(record.endTime).toLocaleTimeString('zh-CN') }}</small></div><b>{{ money(record.earnedAmount) }}</b></article></div></section>
  </div>
</template>
