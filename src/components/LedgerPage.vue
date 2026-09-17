<script setup>
/**
 * 账本页：用月份网格复刻参考站的收支日历，数据默认展示当前月份的工资收入。
 */
import { ref } from 'vue';

defineProps({ earnedToday: { type: Number, default: 0 } });
const mode = ref('month');
const selectedMonth = ref(new Date().getMonth());
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

/** 切换账本日历粒度，让参考页上的三个粒度控件有可见状态。 */
function changeMode(nextMode) {
  mode.value = nextMode;
}

/** 在月份网格中前后移动选中的月份。 */
function shiftMonth(offset) {
  selectedMonth.value = (selectedMonth.value + offset + 12) % 12;
}
</script>

<template>
  <div class="page-frame ledger-page"><header class="page-header simple"><div><span class="date-label">MONEY LEDGER</span><h1>账本</h1><p>把薪资、已买物品和意外收支放到同一本账里，按日、月、年看清真实结余。</p></div></header><section class="calendar-card"><div class="calendar-heading"><div><span class="section-kicker">INCOME &amp; EXPENSE</span><h2>收支日历</h2></div><span class="calendar-icon">▦</span></div><div class="mode-switch"><button v-for="item in [['day', '日'], ['month', '月'], ['year', '年']]" :key="item[0]" :class="{ active: mode === item[0] }" type="button" @click="changeMode(item[0])">{{ item[1] }}</button></div><div class="year-switch"><button type="button" @click="shiftMonth(-1)">‹</button><strong>2026年</strong><button type="button" @click="shiftMonth(1)">›</button></div><div class="month-grid"><button v-for="(month, index) in months" :key="month" :class="{ selected: index === selectedMonth }" type="button" @click="selectedMonth = index"><strong>{{ month }}</strong><small>{{ index === selectedMonth ? `+${earnedToday.toFixed(2)}` : '0.00' }}</small></button></div><div class="calendar-legend"><span>◌ 收入结余</span><span>◌ 支出结余</span><small>点击日期查看明细</small></div></section><section class="ledger-totals"><article><span>收入合计</span><strong>{{ `¥${earnedToday.toFixed(2)}` }}</strong></article><article><span>支出合计</span><strong>¥0.00</strong></article><article><span>账本结余</span><strong>{{ `¥${earnedToday.toFixed(2)}` }}</strong></article></section><section class="detail-section"><div class="section-heading"><h2>收支明细</h2><button type="button">＋ 新增明细</button></div><article class="ledger-record"><span class="record-dot">＋</span><div><strong>工资收入</strong><small>薪资 · 2026/09/17</small></div><b>+ ¥ {{ earnedToday.toFixed(2) }}</b><button type="button">编辑</button><button type="button">删除</button></article></section></div>
</template>
