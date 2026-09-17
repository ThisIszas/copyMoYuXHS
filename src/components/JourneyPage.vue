<script setup>
/**
 * 工作旅程页：支持建立当前工作和补录过去经历，统计经历段数与累计任职天数。
 * 参考实现不会用当前工资反推未知历史，因此这里仅保存用户明确填写的日期。
 */
import { computed, ref } from 'vue';
import { appStore, createId, localDateValue } from '../data/store';

const formOpen = ref(false);
const form = ref({ name: '', company: '', role: '', startDate: localDateValue(), endDate: '' });
const stages = computed(() => appStore.journey.stages);
const totalDays = computed(() => stages.value.reduce((total, stage) => {
  const end = stage.endDate ? Date.parse(`${stage.endDate}T12:00:00`) : Date.now();
  return total + Math.max(0, Math.floor((end - Date.parse(`${stage.startDate}T12:00:00`)) / 86400000) + 1);
}, 0));

/** 打开经历编辑区，并把开始日期预填为今天。 */
function openForm() {
  form.value = { name: '', company: '', role: '', startDate: localDateValue(), endDate: '' };
  formOpen.value = true;
}

/** 保存一段明确填写的工作经历。 */
function saveStage() {
  if (!form.value.name.trim() || !form.value.startDate) return;
  appStore.journey.stages.unshift({ id: createId('stage'), ...form.value, name: form.value.name.trim(), createdAt: new Date().toISOString() });
  formOpen.value = false;
}

/** 删除工作经历前要求确认，避免误删历史阶段。 */
function removeStage(stage) {
  if (!window.confirm(`确定删除“${stage.name}”吗？`)) return;
  const index = appStore.journey.stages.findIndex((item) => item.id === stage.id);
  if (index >= 0) appStore.journey.stages.splice(index, 1);
}
</script>

<template>
  <div class="page-frame journey-page"><header class="page-header simple"><div><span class="date-label">MY WORK JOURNEY</span><h1>工作旅程，每一段，都算数。</h1><p>把努力留在时间里，也为下一段生活留出空间。</p></div><div class="header-actions"><button type="button" @click="openForm">补录过去</button><button class="primary-small" type="button" @click="openForm">＋ 建立当前工作</button></div></header><section v-if="formOpen" class="journey-form"><label>工作名称<input v-model="form.name" placeholder="例如：现在这份工作" /></label><label>公司 / 团队<input v-model="form.company" placeholder="可选" /></label><label>职位<input v-model="form.role" placeholder="可选" /></label><label>开始日期<input v-model="form.startDate" type="date" /></label><label>结束日期<input v-model="form.endDate" type="date" /></label><div><button type="button" @click="saveStage">保存经历</button><button type="button" @click="formOpen = false">取消</button></div></section><section v-if="!stages.length" class="journey-empty"><span class="journey-symbol">⌁</span><p>走过的每一步，都有回响</p><h2>从第一段工作，开始记录你的旅程。</h2><small>已有的工资与计时记录，会按你确认的日期归入工作阶段。</small><div class="journey-stats"><div><strong>0</strong><span>段</span><small>工作经历</small></div><div><strong>0</strong><span>天</span><small>累计任职</small></div></div><div class="journey-guide"><div><h3>让这段工作，有一个自己的位置</h3><p>记录从哪天开始、做过什么，以及认真投入的时间。<br />过去的经历也可以慢慢补齐。</p></div><button type="button" @click="openForm">建立当前工作</button></div></section><section v-else class="journey-list"><div class="section-heading"><div><span class="section-kicker">TIMELINE</span><h2>我的工作阶段</h2></div><span>{{ stages.length }} 段 · {{ totalDays }} 天</span></div><article v-for="stage in stages" :key="stage.id" class="journey-stage"><span class="journey-stage-dot">●</span><div><strong>{{ stage.name }}</strong><small>{{ stage.company || '未填写团队' }} · {{ stage.role || '未填写职位' }}</small><p>{{ stage.startDate }} 至 {{ stage.endDate || '至今' }}</p></div><button type="button" @click="removeStage(stage)">删除</button></article></section></div>
</template>
