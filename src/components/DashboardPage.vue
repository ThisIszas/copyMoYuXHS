<script setup>
/**
 * 今日总览页：展示参考站首页的收益卡、下班倒计时、概览、本月战绩和心愿空状态。
 */
defineProps({
  dateLabel: String,
  salary: Number,
  earnedToday: Number,
  perSecond: Number,
  progress: Number,
  workedSeconds: Number,
  timeUntilEnd: String,
  monthlyProgress: Number,
  breakIncome: Number,
  breakSeconds: Number,
  isWorkEnded: Boolean,
});
const emit = defineEmits(['toggle-work', 'start-break', 'navigate', 'open-settings']);

/** 将金额格式化成工作台统一的两位小数样式。 */
function money(value) {
  return `¥${Number(value).toFixed(2)}`;
}

/** 将计薪秒数转成中文时长，避免首页出现难读的小数小时。 */
function duration(seconds) {
  return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`;
}
</script>

<template>
  <div class="page-frame">
    <header class="page-header"><div><span class="date-label">{{ dateLabel }}</span><h1>今天的时间，正在变成钱。</h1></div><button class="salary-settings" type="button" @click="emit('open-settings')">薪资设置 <span>↗</span></button></header>
    <section class="hero-grid">
      <article class="income-card"><div class="card-topline"><span>✣ 今日已经赚了</span><span class="schedule-badge"><i></i>固定作息 · 自动计薪</span></div><strong class="income-value">{{ money(earnedToday) }}</strong><span class="income-rate">+ ¥{{ perSecond.toFixed(5) }} / 秒</span><div class="income-actions"><button type="button" @click="emit('toggle-work')">□ {{ isWorkEnded ? '恢复计薪' : '结束工作' }}</button><button type="button">修正时间</button></div><div class="work-line"><span :style="{ width: `${progress}%` }"></span><b :style="{ left: `${progress}%` }"></b></div><div class="work-labels"><span>09:00</span><span>18:00</span></div><div class="income-footer"><span>工作进度 <b>{{ progress.toFixed(0) }}%</b></span><span>已计薪 <b>{{ duration(workedSeconds) }}</b></span><span>今日预计 <b>{{ money(9 * 60 * 60 * perSecond) }}</b></span><button type="button" @click="emit('start-break')">今天弹性上班</button></div></article>
      <article class="deadline-card"><div class="deadline-title"><h2>◷ 盼头倒计时</h2><span>按你的作息</span></div><div class="offwork-card"><span>距离下班</span><strong>{{ timeUntilEnd }}</strong><small>18:00 下班 · 忙完就好好休息</small><button type="button">设置发薪日 ›</button><b class="mug-icon">♧</b></div><div class="mini-stats"><div><span>离下班</span><strong>{{ timeUntilEnd }}</strong><small>18:00 结束工作</small></div><div><span>下一段休息</span><strong>今日休息已结束</strong><small>以实际工作安排为准</small></div><div><span>离休息日</span><strong>2 天</strong><small>9/19 周六休息</small></div><div><span>离节假日</span><strong>8 天</strong><small>中秋</small></div></div></article>
    </section>
    <section class="wide-section overview-section"><div class="section-heading"><div><span class="section-kicker">TODAY OVERVIEW</span><h2>今日概览</h2></div><span class="status-badge">计薪中</span></div><div class="overview-grid"><button type="button" @click="emit('open-settings')"><span class="overview-icon">◷</span><small>时间单价</small><strong>{{ money(perSecond * 3600) }}<em>/ 小时</em></strong><p>{{ money(perSecond * 60) }} / 分钟 <b>↗</b></p></button><button type="button" @click="emit('navigate', 'slacking')"><span class="overview-icon">♧</span><small>摸鱼收益</small><strong>{{ money(breakIncome) }}</strong><p>{{ breakSeconds }}秒 · 0.0% 今日收入 <b>↗</b></p></button><button type="button" @click="emit('navigate', 'overtime')"><span class="overview-icon">▱</span><small>加班收入</small><strong>¥0.00</strong><p>0秒 <b>↗</b></p></button></div></section>
    <section class="monthly-section"><div class="section-heading"><div><span class="section-kicker">MONTHLY SCORE</span><h2>本月战绩</h2></div><span class="section-date">{{ new Date().getFullYear() }}年{{ new Date().getMonth() + 1 }}月</span></div><article class="monthly-card"><div class="monthly-income"><small>本月累计收入</small><strong>{{ money(earnedToday) }}</strong><span>本月预计 {{ money(salary) }}</span></div><div class="monthly-progress"><div><span>计划工时进度</span><b>{{ monthlyProgress.toFixed(0) }}%</b></div><div class="progress-track"><i :style="{ width: `${monthlyProgress}%` }"></i></div><small>4天7小时33分钟 / 7天8小时 · 本月 22 个工作日</small></div><div class="score-stats"><div><span>◷</span><small>累计工作时长</small><strong>4天7小时33...</strong></div><div><span>♧</span><small>其中摸鱼</small><strong>{{ breakSeconds }}秒</strong></div><div><span>⌁</span><small>综合时薪</small><strong>{{ money(perSecond * 3600) }}</strong></div></div><button class="details-button" type="button">查看计算明细⌄</button></article></section>
    <section class="wishlist-section"><div class="section-heading"><div><span class="section-kicker">WISH LIST</span><h2>我的心愿清单</h2></div><button type="button" @click="emit('navigate', 'wishlist')">查看全部 0 项 ↗</button></div><article class="empty-wish"><span>✨</span><div><strong>还没有心愿</strong><p>把想买的东西换算成需要工作的时间。</p></div><button type="button" @click="emit('navigate', 'wishlist')">去心愿清单</button></article></section>
  </div>
</template>
