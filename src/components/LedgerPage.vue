<script setup>
/**
 * 账本页：按日、月、年切换查看本地收入和支出，并显示选中日期明细。
 * 工资使用父层实时收入作为当天预览，意外收支与物品购买从 store 中读取。
 */
import { computed, ref } from 'vue';
import { appStore, earnedAt, ledgerEntriesFor, localDateValue, money } from '../data/store';

const props = defineProps({ earnedToday: { type: Number, default: 0 } });
const emit = defineEmits(['navigate']);
const mode = ref('month');
const viewingDate = ref(new Date());
const selectedDate = ref(localDateValue());
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/** 返回当前账本视图所在月份的天数。 */
const monthDays = computed(() => new Date(viewingDate.value.getFullYear(), viewingDate.value.getMonth() + 1, 0).getDate());
const monthLabel = computed(() => `${viewingDate.value.getFullYear()}年${viewingDate.value.getMonth() + 1}月`);
const monthExpenses = computed(() => appStore.accidents.filter((item) => item.type === 'expense' && item.date.startsWith(`${viewingDate.value.getFullYear()}-${String(viewingDate.value.getMonth() + 1).padStart(2, '0')}`)).reduce((total, item) => total + Number(item.amount || 0), 0) + appStore.assets.filter((item) => item.purchaseDate.startsWith(`${viewingDate.value.getFullYear()}-${String(viewingDate.value.getMonth() + 1).padStart(2, '0')}`)).reduce((total, item) => total + Number(item.amount || 0), 0));
const monthAccidentIncome = computed(() => appStore.accidents.filter((item) => item.type === 'income' && item.date.startsWith(`${viewingDate.value.getFullYear()}-${String(viewingDate.value.getMonth() + 1).padStart(2, '0')}`)).reduce((total, item) => total + Number(item.amount || 0), 0));
const monthIncome = computed(() => props.earnedToday + monthAccidentIncome.value);
const selectedEntries = computed(() => ledgerEntriesFor(selectedDate.value));

/** 在账本粒度之间切换，保留当前选中月份和日期。 */
function changeMode(nextMode) {
  mode.value = nextMode;
}

/** 前后移动账本月份，并把选中日期同步到新月份第一天。 */
function shiftMonth(offset) {
  viewingDate.value = new Date(viewingDate.value.getFullYear(), viewingDate.value.getMonth() + offset, 1);
  selectedDate.value = `${viewingDate.value.getFullYear()}-${String(viewingDate.value.getMonth() + 1).padStart(2, '0')}-01`;
}

/** 选择某天后展示该日收入、意外收支和物品购买。 */
function selectDay(day) {
  selectedDate.value = `${viewingDate.value.getFullYear()}-${String(viewingDate.value.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
</script>

<template>
  <div class="page-frame ledger-page"><header class="page-header simple"><div><span class="date-label">MONEY LEDGER</span><h1>账本</h1><p>把薪资、已买物品和意外收支放到同一本账里，按日、月、年看清真实结余。</p></div></header><section class="calendar-card"><div class="calendar-heading"><div><span class="section-kicker">INCOME &amp; EXPENSE</span><h2>收支日历</h2></div><span class="calendar-icon">▦</span></div><div class="mode-switch"><button v-for="item in [['day', '日'], ['month', '月'], ['year', '年']]" :key="item[0]" :class="{ active: mode === item[0] }" type="button" @click="changeMode(item[0])">{{ item[1] }}</button></div><div class="year-switch"><button type="button" @click="shiftMonth(-1)">‹</button><strong>{{ mode === 'year' ? `${viewingDate.getFullYear()}年` : monthLabel }}</strong><button type="button" @click="shiftMonth(1)">›</button></div><div v-if="mode === 'year'" class="month-grid"><button v-for="(month, index) in months" :key="month" :class="{ selected: index === viewingDate.getMonth() }" type="button" @click="viewingDate = new Date(viewingDate.getFullYear(), index, 1)"><strong>{{ month }}</strong><small>{{ index === viewingDate.getMonth() ? `+${monthIncome.toFixed(2)}` : '0.00' }}</small></button></div><div v-else class="ledger-day-grid"><button v-for="day in monthDays" :key="day" :class="{ selected: selectedDate.endsWith(`-${String(day).padStart(2, '0')}`) }" type="button" @click="selectDay(day)"><strong>{{ day }}</strong><small>{{ day === new Date().getDate() && viewingDate.getMonth() === new Date().getMonth() ? `+${props.earnedToday.toFixed(2)}` : '—' }}</small></button></div><div class="calendar-legend"><span>◌ 收入结余</span><span>◌ 支出结余</span><small>点击日期查看明细</small></div></section><section class="ledger-totals"><article><span>收入合计</span><strong>{{ money(monthIncome) }}</strong></article><article><span>支出合计</span><strong>{{ money(monthExpenses) }}</strong></article><article><span>账本结余</span><strong>{{ money(monthIncome - monthExpenses) }}</strong></article></section><section class="detail-section"><div class="section-heading"><div><span class="section-kicker">{{ selectedDate }}</span><h2>收支明细</h2></div><button type="button" @click="emit('navigate', 'accidents')">＋ 新增明细</button></div><article class="ledger-record"><span class="record-dot">＋</span><div><strong>工资收入</strong><small>薪资 · {{ localDateValue() }}</small></div><b>+ {{ money(props.earnedToday) }}</b></article><article v-for="entry in selectedEntries" :key="entry.id" class="ledger-record"><span class="record-dot">{{ entry.amount >= 0 ? '+' : '−' }}</span><div><strong>{{ entry.name }}</strong><small>{{ entry.source }} · {{ entry.date || entry.purchaseDate }}</small></div><b :class="{ expense: entry.amount < 0 }">{{ entry.amount >= 0 ? '+' : '' }} {{ money(entry.amount) }}</b></article><div v-if="!selectedEntries.length" class="records-empty">这一天还没有其他手工明细。</div></section></div>
</template>
