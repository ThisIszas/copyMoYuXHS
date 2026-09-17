<script setup>
/**
 * 薪苦日历页：用月历网格表达正常出勤、休息日和节假日状态，点击日期可切换选中日。
 */
import { ref } from 'vue';

const selectedDay = ref(17);
const days = Array.from({ length: 30 }, (_, index) => {
  const day = index + 1;
  const weekend = [5, 6, 12, 13, 19].includes(day);
  const holiday = [20, 25, 26, 27].includes(day);
  return { day, status: holiday ? '中秋·休' : weekend ? '休息' : day > 17 ? '未到' : '正常' };
});

/** 选中一个日期，模拟参考站的日期调整入口。 */
function selectDay(day) {
  selectedDay.value = day;
}
</script>

<template>
  <div class="page-frame attendance-page"><header class="page-header simple"><div><span class="date-label">ATTENDANCE &amp; SALARY</span><h1>薪苦日历</h1><p>上班、请假还是放假，先选日期，再确认这一天的安排和工资。临时变动只需修改当天。</p></div><div class="header-actions"><button type="button">⚙ 排班设置</button><button type="button">▣ 假期安排</button></div></header><section class="holiday-banner"><strong>◌ 自动识别中国大陆节假日</strong><p>识别法定休假与调休补班，不自动设置加班倍率；手工出勤优先，排班用户可在排班设置中选择是否跟随。</p><small>从 2026-09-17 起生效，不重算更早的历史工资</small><input type="checkbox" checked /></section><section class="calendar-card attendance-calendar"><div class="calendar-heading"><div><span class="section-kicker">ATTENDANCE CALENDAR</span><h2>薪苦日历</h2></div><span class="calendar-icon">▦</span></div><div class="calendar-toolbar"><div class="mode-switch"><button class="active" type="button">日</button><button type="button">月</button><button type="button">年</button></div><div class="year-switch"><button type="button">‹</button><strong>2026年 9月</strong><button type="button">›</button></div></div><div class="attendance-grid"><button v-for="item in days" :key="item.day" :class="[item.status === '休息' ? 'rest' : '', item.status.includes('中秋') ? 'holiday' : '', item.day === selectedDay ? 'selected' : '']" type="button" @click="selectDay(item.day)"><strong>{{ item.day }}<i v-if="item.day === 17"> · 今</i></strong><small>{{ item.status }}</small></button></div><div class="calendar-legend"><span>● 正常上班</span><span>● 请假 / 特殊出勤</span><span>● 放假</span><span>● 休息日</span><small>点击日期调整出勤</small></div></section><section class="attendance-stats"><article><span>◷</span><small>本月手工调整</small><strong>0 天</strong></article><article><span>⌁</span><small>本月请假 / 特殊出勤</small><strong>0 天</strong></article><article><span>▦</span><small>本月放假</small><strong>0 天</strong></article><article><span>◌</span><small>本月不计薪</small><strong>0 天</strong></article></section><p class="attendance-note">平时按已保存的安排计算，有变化时点选日期。请半天假只调整请假半天的工资，保存前可以查看当天金额。</p></div>
</template>
