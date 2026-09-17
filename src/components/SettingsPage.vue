<script setup>
/**
 * 设置页：对照参考仓库的工资、作息、扣除、历史生效和数据迁移结构。
 * 表单先编辑 draft，点击保存后才覆盖 appStore，避免输入一半就改变首页口径。
 */
import { computed, reactive, ref, watch } from 'vue';
import { appStore, calculateRates, exportBackup, importBackup } from '../data/store';

const props = defineProps({ salary: { type: Number, required: true } });
const emit = defineEmits(['update-salary', 'open-theme']);
const draft = reactive({ ...appStore.settings });
const openSections = ref(['salary', 'work']);
const saved = ref(false);
const fileInput = ref(null);
const rates = computed(() => calculateRates(draft));
watch(() => props.salary, (value) => { draft.salary = value; });

/** 展开或收起设置区块，允许多个区块同时保持打开。 */
function toggleSection(section) {
  openSections.value = openSections.value.includes(section) ? openSections.value.filter((item) => item !== section) : [...openSections.value, section];
}

/** 保存当前草稿，所有页面随后从同一个本地状态读取新规则。 */
function saveSettings() {
  Object.assign(appStore.settings, { ...draft, salary: Number(draft.salary) || 0, payday: draft.payday ? Number(draft.payday) : null, monthlyWorkDays: Number(draft.monthlyWorkDays) || 21.75, workDaysPerWeek: Number(draft.workDaysPerWeek) || 5, monthlyLivingCost: Number(draft.monthlyLivingCost) || 0 });
  emit('update-salary', appStore.settings.salary);
  saved.value = true;
  window.setTimeout(() => { saved.value = false; }, 1800);
}

/** 下载当前设备的完整 JSON 备份，不上传任何数据。 */
function downloadBackup() {
  const blob = new Blob([exportBackup()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `moneydance-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/** 读取用户选择的 JSON 备份，并在校验成功后替换本地状态。 */
function readBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { saved.value = importBackup(String(reader.result)) ? '已导入' : '导入失败'; window.setTimeout(() => { saved.value = false; }, 1800); };
  reader.readAsText(file);
  event.target.value = '';
}
</script>

<template>
  <div class="page-frame settings-page">
    <header class="page-header simple"><div><span class="date-label">PROFILE &amp; APPEARANCE</span><h1>设置工资，确认上班安排。</h1><p>工资与作息按生效日期保存，每段时间沿用当时的规则。</p></div></header>
    <section class="rate-preview"><span>当前时间单价预览</span><div><small>税前参考时薪</small><strong>¥{{ rates.hourly.toFixed(2) }}</strong><em>{{ draft.effectiveDate }} 生效当天的折算结果</em></div><div><small>日薪</small><strong>¥{{ rates.daily.toFixed(2) }}</strong></div><div><small>每分钟</small><strong>¥{{ rates.minute.toFixed(3) }}</strong></div><div><small>每秒</small><strong>¥{{ rates.second.toFixed(5) }}</strong></div></section>
    <button class="settings-accordion" type="button" @click="emit('open-theme')"><span>外观与配色</span><small>经典主题与 11 组双配色</small><b>⌄</b></button>
    <section class="settings-accordion open"><button type="button" @click="toggleSection('salary')"><span>工资与发薪</span><small>¥{{ draft.salary }} / {{ draft.salaryType === 'monthly' ? '月' : draft.salaryType }}</small><b>{{ openSections.includes('salary') ? '⌃' : '⌄' }}</b></button><div v-if="openSections.includes('salary')" class="settings-body"><p>换工作或调薪时，先编辑当前规则，再通过生效日期保存。</p><label>工资金额<input v-model.number="draft.salary" type="number" min="0" step="500" /></label><label>工资周期<select v-model="draft.salaryType"><option value="monthly">月薪</option><option value="annual">年薪</option><option value="daily">日薪</option><option value="hourly">时薪</option></select></label><label>每月发薪日<input v-model.number="draft.payday" type="number" min="1" max="31" placeholder="例如：10" /></label><fieldset><legend>工资如何分摊</legend><label><input type="radio" name="salary-rule" checked /> 按计薪日分摊 <small>推荐 · 当前 21.75 天</small></label><label><input type="radio" name="salary-rule" /> 按固定日单价估算 <small>用于手动核算</small></label></fieldset></div></section>
    <section class="settings-accordion open"><button type="button" @click="toggleSection('work')"><span>上班安排</span><small>每周 {{ draft.workDaysPerWeek }} 天 · {{ draft.workStart }}–{{ draft.workEnd }}</small><b>{{ openSections.includes('work') ? '⌃' : '⌄' }}</b></button><div v-if="openSections.includes('work')" class="settings-body"><label>每周工作日<input v-model.number="draft.workDaysPerWeek" type="number" min="1" max="7" /></label><label>上班时间<input v-model="draft.workStart" type="time" /></label><label>下班时间<input v-model="draft.workEnd" type="time" /></label><label>午休开始<input v-model="draft.breakStart" type="time" /></label><label>午休结束<input v-model="draft.breakEnd" type="time" /></label><label class="check-label"><input v-model="draft.paidBreak" type="checkbox" /> 休息时间计薪</label><p>跨午夜班次按开始日期归属；重叠休息不会重复扣除。</p></div></section>
    <button v-for="item in [['cost', '扣除与生活成本', '工资扣除项和每月生活支出'], ['history', '历史账本与规则记录', '自动记薪起点、已保存的工资与作息']]" :key="item[0]" class="settings-accordion" type="button" @click="toggleSection(item[0])"><span>{{ item[1] }}</span><small>{{ item[2] }}</small><b>{{ openSections.includes(item[0]) ? '⌃' : '⌄' }}</b></button>
    <section class="effective-card"><strong>本次修改的生效范围</strong><span>本次工资与作息从哪天生效</span><input v-model="draft.effectiveDate" type="date" /><p>之前沿用原规则；从这天起使用本次设置，直到下一条已保存规则生效。</p><button type="button" @click="saveSettings">{{ saved === true ? '已保存' : '保存薪资设置' }}</button></section>
    <section class="backup-card"><span class="section-kicker">DATA BACKUP</span><h2>数据备份与迁移</h2><p>把这些日子的积累带到另一台设备。网页、安卓和桌面端通用。</p><div><button type="button" @click="downloadBackup">⇧ 导出备份</button><button type="button" @click="fileInput?.click()">＋ 选择备份导入</button><input ref="fileInput" class="visually-hidden" type="file" accept="application/json,.json" @change="readBackup" /></div><small>{{ saved === '已导入' ? '备份导入成功，页面数据已更新。' : saved === '导入失败' ? '文件格式不正确，原数据未改变。' : '导出的文件包含工资等个人信息，请妥善保存。' }}</small></section>
  </div>
</template>
