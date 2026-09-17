<script setup>
/**
 * 一键换肤抽屉：用多组预览卡复刻参考站的配色选择面板，并通过 CSS 变量切换主色调。
 */
defineProps({ open: Boolean, activeTheme: { type: String, default: 'classic' } });
const emit = defineEmits(['close', 'select']);
const themes = [
  ['classic', '经典薪流', '深林绿 · 青柠米', '#1c2c21', '#d5e0b5'],
  ['blue', '绸云晴川', '绸云黄 · 晴川蓝', '#2d769a', '#d8eaf5'],
  ['ocean', '沧溟玉釉', '沧溟蓝 · 玉釉杏', '#2463a2', '#d7e6fa'],
  ['mist', '霜绒岫烟', '霜绒白 · 岫烟青', '#178b8d', '#e2f2ef'],
  ['rose', '玫瑰月白', '玫瑰粉 · 月白色', '#ad4d70', '#fae0eb'],
  ['sprout', '青岚云绒', '青岚色 · 云绒色', '#597c65', '#e8f0dc'],
];
</script>

<template>
  <div v-if="open" class="theme-overlay" @click.self="emit('close')"><section class="theme-drawer"><div class="drawer-handle"></div><header><div><h2>一键换肤</h2><p>选择喜欢的页面配色，立即生效并自动保存。</p></div><button type="button" @click="emit('close')">×</button></header><div class="theme-grid"><button v-for="theme in themes" :key="theme[0]" class="theme-option" :class="{ active: activeTheme === theme[0] }" type="button" @click="emit('select', theme[0])"><div class="theme-preview" :style="{ '--theme-deep': theme[3], '--theme-soft': theme[4] }"><span>今日已赚</span><strong>¥268.80</strong><i></i><div><b></b><b></b><b></b></div></div><strong>{{ theme[1] }}</strong><small>{{ theme[2] }}</small><em v-if="activeTheme === theme[0]">✓</em></button></div></section></div>
</template>
