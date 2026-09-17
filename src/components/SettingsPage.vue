<script setup>
/**
 * 设置页：集中承载工资、发薪日、排班和备份入口；折叠区用本地状态模拟参考站交互。
 */
import { computed, ref, watch } from 'vue';

const props = defineProps({ salary: { type: Number, required: true } });
const emit = defineEmits(['update-salary', 'open-theme']);
const draftSalary = ref(props.salary);
const openSections = ref(['salary']);
watch(() => props.salary, (value) => { draftSalary.value = value; });
const hourly = computed(() => draftSalary.value / (22 * 8.75));

/** 展开或收起设置区块，保持多个区块可以同时展开。 */
function toggleSection(section) {
  openSections.value = openSections.value.includes(section) ? openSections.value.filter((item) => item !== section) : [...openSections.value, section];
}

/** 保存当前演示工资并通知父页面更新首页数据。 */
function saveSalary() {
  emit('update-salary', Number(draftSalary.value) || 0);
}
</script>

<template>
  <div class="page-frame settings-page"><header class="page-header simple"><div><span class="date-label">PROFILE &amp; APPEARANCE</span><h1>设置工资，确认上班安排。</h1><p>工资与作息按生效日期保存，每段时间沿用当时的规则。</p></div></header><section class="rate-preview"><span>当前时间单价预览</span><div><small>税前 参考时薪</small><strong>¥{{ hourly.toFixed(2) }}</strong><em>2026-09-17　生效当天的折算结果</em></div><div><small>日薪</small><strong>¥ {{ (hourly * 8).toFixed(2) }}</strong></div><div><small>每分钟</small><strong>¥ {{ (hourly / 60).toFixed(3) }}</strong></div><div><small>每秒</small><strong>¥ {{ (hourly / 3600).toFixed(5) }}</strong></div></section><button class="settings-accordion" type="button" @click="emit('open-theme')"><span>外观与配色</span><small>经典主题与 11 组双配色</small><b>⌄</b></button><section class="settings-accordion open"><button type="button" @click="toggleSection('salary')"><span>工资与发薪</span><small>¥{{ draftSalary }} / 月</small><b>{{ openSections.includes('salary') ? '⌃' : '⌄' }}</b></button><div v-if="openSections.includes('salary')" class="settings-body"><p>换工作或暂时休息时，可以把每段经历分别保存。</p><label>工资金额<input v-model.number="draftSalary" type="number" min="1000" step="500" /></label><label>工资周期<select><option>月薪</option><option>周薪</option><option>日薪</option></select></label><label>每月发薪日<input type="number" value="10" min="1" max="31" /></label><fieldset><legend>工资如何分摊</legend><label><input type="radio" name="salary-rule" checked /> 按月工资分摊 <small>推荐 · 按本月计薪日分摊</small></label><label><input type="radio" name="salary-rule" /> 按固定日单价估算 <small>使用月平均天数折算</small></label></fieldset></div></section><button v-for="item in [['schedule', '上班安排', '每周 5 天 · 09:00–18:00'], ['cost', '扣除与生活成本', '工资扣除项和每月生活支出'], ['history', '历史账本与规则记录', '自动记薪起点、已保存的工资与作息']]" :key="item[0]" class="settings-accordion" type="button" @click="toggleSection(item[0])"><span>{{ item[1] }}</span><small>{{ item[2] }}</small><b>{{ openSections.includes(item[0]) ? '⌃' : '⌄' }}</b></button><section class="effective-card"><strong>本次修改的生效范围</strong><span>本次工资与作息从哪天生效</span><input type="date" value="2026-09-17" /><p>之前沿用原规则；从这天起使用本次设置，直到下一条已保存规则生效。</p><button type="button" @click="saveSalary">保存薪资设置</button></section><section class="backup-card"><span class="section-kicker">DATA BACKUP</span><h2>数据备份与迁移</h2><p>把这些日子的积累，带到另一台设备。网页、安卓和桌面端通用。</p><div><button type="button">⇧ 导出备份</button><button type="button">＋ 选择备份导入</button></div><small>导出的文件包含工资等个人信息，请妥善保存。</small></section></div>
</template>
