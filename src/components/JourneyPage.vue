<script setup>
/**
 * 工作旅程页：复刻参考站的空状态，引导用户建立当前工作或补录过去经历。
 */
defineEmits(['open-settings']);
</script>

<template>
  <div class="page-frame journey-page"><header class="page-header simple"><div><span class="date-label">MY WORK JOURNEY</span><h1>工作旅程，每一段，都算数。</h1><p>把努力留在时间里，也为下一段生活留出空间。</p></div><div class="header-actions"><button type="button">补录过去</button><button class="primary-small" type="button">＋ 建立当前工作</button></div></header><section class="journey-empty"><span class="journey-symbol">⌁</span><p>走过的每一步，都有回响</p><h2>从第一段工作，开始记录你的旅程。</h2><small>已有的工资与计时记录，会按你确认的日期归入工作阶段。</small><div class="journey-stats"><div><strong>0</strong><span>段</span><small>工作经历</small></div><div><strong>0</strong><span>天</span><small>累计任职</small></div></div><div class="journey-guide"><div><h3>让这段工作，有一个自己的位置</h3><p>记录从哪天开始、做过什么，以及认真投入的时间。<br />过去的经历也可以慢慢补齐。</p></div><button type="button">建立当前工作</button></div></section></div>
</template>
