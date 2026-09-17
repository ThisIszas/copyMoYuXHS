<script setup>
/**
 * 今日总览页：展示工资实时增长、发薪倒计时、今日概览、本月战绩和心愿进度。
 * 这里保留参考站的“卡片化工作台”信息层级，同时使用父壳层传入的真实本地计算值。
 */
import { computed } from 'vue';
import { appStore, formatDuration, money } from '../data/store';

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
  overtimeIncome: Number,
  overtimeSeconds: Number,
  isWorkEnded: Boolean,
});
const emit = defineEmits(['toggle-work', 'start-break', 'navigate', 'open-settings']);
const wishCount = computed(() => appStore.wishes.length);
const monthLabel = computed(() => `${new Date().getFullYear()}年${new Date().getMonth() + 1}月`);

/** 将当前计薪秒数转成工作台短时长。 */
function duration(seconds) {
  return formatDuration(seconds);
}

/** 返回首页心愿区的第一条目标，避免空列表时渲染虚构数据。 */
const firstWish = computed(() => appStore.wishes[0] || null);
</script>

<template>
  <div class="page-frame">
    <header class="page-header"><div><span class="date-label">{{ dateLabel }}</span><h1>今天的时间，正在变成钱。</h1></div><button class="salary-settings" type="button" @click="emit('open-settings')">薪资设置 <span>↗</span></button></header>
    <section class="hero-grid">
      <article class="income-card"><div class="card-topline"><span>✣ 今日已经赚了</span><span class="schedule-badge"><i></i>固定作息 · 自动计薪</span></div><strong class="income-value">{{ money(earnedToday) }}</strong><span class="income-rate">+ {{ money(perSecond) }} / 秒</span><div class="income-actions"><button type="button" @click="emit('toggle-work')">□ {{ isWorkEnded ? '恢复计薪' : '结束工作' }}</button><button type="button" @click="emit('open-settings')">修正时间</button></div><div class="work-line"><span :style="{ width: `${progress}%` }"></span><b :style="{ left: `${progress}%` }"></b></div><div class="work-labels"><span>09:00</span><span>18:00</span></div><div class="income-footer"><span>工作进度 <b>{{ progress.toFixed(0) }}%</b></span><span>已计薪 <b>{{ duration(workedSeconds) }}</b></span><span>今日预计 <b>{{ money(salary / 21.75) }}</b></span><button type="button" @click="emit('start-break')">今天弹性上班</button></div></article>
      <article class="deadline-card"><div class="deadline-title"><h2>◷ 盼头倒计时</h2><span>按你的作息</span></div><div class="offwork-card"><span>距离下班</span><strong>{{ timeUntilEnd }}</strong><small>18:00 下班 · 忙完就好好休息</small><button type="button" @click="emit('open-settings')">设置发薪日 ›</button><b class="mug-icon">♧</b></div><div class="mini-stats"><div><span>离下班</span><strong>{{ timeUntilEnd }}</strong><small>18:00 结束工作</small></div><div><span>摸鱼累计</span><strong>{{ breakSeconds }}秒</strong><small>{{ money(breakIncome) }} 已计入</small></div><div><span>离休息日</span><strong>周末</strong><small>按工作周安排</small></div><div><span>发薪日</span><strong>每月 10 日</strong><small>可在设置中调整</small></div></div></article>
    </section>
    <section class="wide-section overview-section"><div class="section-heading"><div><span class="section-kicker">TODAY OVERVIEW</span><h2>今日概览</h2></div><span class="status-badge">{{ isWorkEnded ? '已结束' : '计薪中' }}</span></div><div class="overview-grid"><button type="button" @click="emit('open-settings')"><span class="overview-icon">◷</span><small>时间单价</small><strong>{{ money(perSecond * 3600) }}<em>/ 小时</em></strong><p>{{ money(perSecond * 60) }} / 分钟 <b>↗</b></p></button><button type="button" @click="emit('navigate', 'slacking')"><span class="overview-icon">♧</span><small>摸鱼收益</small><strong>{{ money(breakIncome) }}</strong><p>{{ breakSeconds }}秒 <b>↗</b></p></button><button type="button" @click="emit('navigate', 'overtime')"><span class="overview-icon">▱</span><small>加班收入</small><strong>{{ money(overtimeIncome) }}</strong><p>{{ overtimeSeconds }}秒 <b>↗</b></p></button></div></section>
    <section class="monthly-section"><div class="section-heading"><div><span class="section-kicker">MONTHLY SCORE</span><h2>本月战绩</h2></div><span class="section-date">{{ monthLabel }}</span></div><article class="monthly-card"><div class="monthly-income"><small>本月累计收入</small><strong>{{ money(earnedToday + overtimeIncome) }}</strong><span>本月预计 {{ money(salary) }}</span></div><div class="monthly-progress"><div><span>计划工时进度</span><b>{{ monthlyProgress.toFixed(0) }}%</b></div><div class="progress-track"><i :style="{ width: `${monthlyProgress}%` }"></i></div><small>{{ duration(workedSeconds) }} / 本月计划 · 21.75 个工作日</small></div><div class="score-stats"><div><span>◷</span><small>累计工作时长</small><strong>{{ duration(workedSeconds) }}</strong></div><div><span>♧</span><small>其中摸鱼</small><strong>{{ breakSeconds }}秒</strong></div><div><span>⌁</span><small>综合时薪</small><strong>{{ money(perSecond * 3600) }}</strong></div></div><button class="details-button" type="button" @click="emit('navigate', 'summary')">查看计算明细⌄</button></article></section>
    <section class="wishlist-section"><div class="section-heading"><div><span class="section-kicker">WISH LIST</span><h2>我的心愿清单</h2></div><button type="button" @click="emit('navigate', 'wishlist')">查看全部 {{ wishCount }} 项 ↗</button></div><article v-if="firstWish" class="wish-preview-card"><span>♡</span><div><strong>{{ firstWish.name }}</strong><p>目标 {{ money(firstWish.price) }} · 从 {{ firstWish.startedAt }} 开始攒</p></div><button type="button" @click="emit('navigate', 'wishlist')">查看详情</button></article><article v-else class="empty-wish"><span>✨</span><div><strong>还没有心愿</strong><p>把想买的东西换算成需要工作的时间。</p></div><button type="button" @click="emit('navigate', 'wishlist')">去心愿清单</button></article></section>
  </div>
</template>
