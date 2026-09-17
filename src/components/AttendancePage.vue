<script setup>
/**
 * 薪苦日历：生成真实月份网格，支持对单日进行正常、休息、请假和放假调整。
 * 参考仓库把手工调整保存为业务日期，这里也以 YYYY-MM-DD 作为 localStorage 键。
 */
import { computed, ref } from 'vue';
import { appStore, isWorkday, localDateValue } from '../data/store';

const cursor = ref(new Date());
const selectedDay = ref(new Date().getDate());
const mode = ref('month');
const holidaysEnabled = ref(true);
const monthDays = computed(() => new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 0).getDate());
const monthPrefix = computed(() => `${cursor.value.getFullYear()}-${String(cursor.value.getMonth() + 1).padStart(2, '0')}`);
const days = computed(() => Array.from({ length: monthDays.value }, (_, index) => {
  const day = index + 1;
  const date = `${monthPrefix.value}-${String(day).padStart(2, '0')}`;
  return { day, date, status: appStore.attendance[date] || (isWorkday(date) ? '正常' : '休息') };
}));
const stats = computed(() => ({ adjusted: days.value.filter((item) => appStore.attendance[item.date]).length, leave: days.value.filter((item) => item.status === '请假').length, holiday: days.value.filter((item) => item.status === '放假').length, unpaid: days.value.filter((item) => item.status === '不计薪').length }));

/** 切换账本月份，并将选中日限制在新月份范围内。 */
function shiftMonth(offset) {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + offset, 1);
  selectedDay.value = Math.min(selectedDay.value, monthDays.value);
}

/** 点击日期循环切换手工出勤状态，便于直观看到本地保存效果。 */
function selectDay(item) {
  selectedDay.value = item.day;
  const next = { 正常: '请假', 请假: '放假', 放假: '不计薪', 不计薪: '休息', 休息: '正常' }[item.status] || '正常';
  appStore.attendance[item.date] = next;
}
</script>

<template>
  <div class="page-frame attendance-page"><header class="page-header simple"><div><span class="date-label">ATTENDANCE &amp; SALARY</span><h1>薪苦日历</h1><p>上班、请假还是放假，先选日期，再确认这一天的安排和工资。临时变动只需修改当天。</p></div><div class="header-actions"><button type="button">⚙ 排班设置</button><button type="button">▣ 假期安排</button></div></header><section class="holiday-banner"><strong>◌ 自动识别中国大陆节假日</strong><p>识别法定休假与调休补班，不自动设置加班倍率；手工出勤优先，排班用户可在排班设置中选择是否跟随。</p><small>从首次开启当天起生效，不重算更早的历史工资</small><input v-model="holidaysEnabled" type="checkbox" /></section><section class="calendar-card attendance-calendar"><div class="calendar-heading"><div><span class="section-kicker">ATTENDANCE CALENDAR</span><h2>薪苦日历</h2></div><span class="calendar-icon">▦</span></div><div class="calendar-toolbar"><div class="mode-switch"><button :class="{ active: mode === 'day' }" type="button" @click="mode = 'day'">日</button><button :class="{ active: mode === 'month' }" type="button" @click="mode = 'month'">月</button><button :class="{ active: mode === 'year' }" type="button" @click="mode = 'year'">年</button></div><div class="year-switch"><button type="button" @click="shiftMonth(-1)">‹</button><strong>{{ cursor.getFullYear() }}年 {{ cursor.getMonth() + 1 }}月</strong><button type="button" @click="shiftMonth(1)">›</button></div></div><div class="attendance-grid"><button v-for="item in days" :key="item.date" :class="[item.status === '休息' ? 'rest' : '', item.status === '放假' ? 'holiday' : '', item.status === '请假' ? 'leave' : '', item.day === selectedDay ? 'selected' : '']" type="button" @click="selectDay(item)"><strong>{{ item.day }}<i v-if="item.date === localDateValue()"> · 今</i></strong><small>{{ item.status }}</small></button></div><div class="calendar-legend"><span>● 正常上班</span><span>● 请假 / 特殊出勤</span><span>● 放假</span><span>● 休息日</span><small>点击日期调整出勤</small></div></section><section class="attendance-stats"><article><span>◷</span><small>本月手工调整</small><strong>{{ stats.adjusted }} 天</strong></article><article><span>⌁</span><small>本月请假 / 特殊出勤</small><strong>{{ stats.leave }} 天</strong></article><article><span>▦</span><small>本月放假</small><strong>{{ stats.holiday }} 天</strong></article><article><span>◌</span><small>本月不计薪</small><strong>{{ stats.unpaid }} 天</strong></article></section><p class="attendance-note">平时按已保存的安排计算，有变化时点选日期。点击同一天可以循环查看不同手工状态。</p></div>
</template>
