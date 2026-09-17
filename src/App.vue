<script setup>
/**
 * 应用壳层：负责真实浏览器路径、公共计薪状态、主题抽屉和页面组件分发。
 * 每个公开页面由独立组件承载，因此直接访问 /convert、/summary 等路径也能正常渲染。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Sidebar from './components/Sidebar.vue';
import DashboardPage from './components/DashboardPage.vue';
import BasicFormPage from './components/BasicFormPage.vue';
import LedgerPage from './components/LedgerPage.vue';
import SlackingPage from './components/SlackingPage.vue';
import OvertimePage from './components/OvertimePage.vue';
import AttendancePage from './components/AttendancePage.vue';
import JourneyPage from './components/JourneyPage.vue';
import SettingsPage from './components/SettingsPage.vue';
import ThemeDrawer from './components/ThemeDrawer.vue';

const paths = { today: '/', wishlist: '/convert', summary: '/summary', accidents: '/accidents', slacking: '/slacking', overtime: '/overtime', attendance: '/attendance', assets: '/assets', journey: '/journey', settings: '/settings' };
const routeByPath = Object.fromEntries(Object.entries(paths).map(([key, path]) => [path, key]));
const activeRoute = ref(routeByPath[window.location.pathname] || 'today');
const salary = ref(15000);
const currentTime = ref(new Date());
const isWorkEnded = ref(false);
const isBreakActive = ref(false);
const breakSeconds = ref(0);
const showTheme = ref(false);
const activeTheme = ref('classic');
let clockTimer;
let breakTimer;

/** 根据固定作息计算当前页面的工作开始与结束时间。 */
const workWindow = computed(() => {
  const start = new Date(currentTime.value);
  start.setHours(9, 0, 0, 0);
  const end = new Date(currentTime.value);
  end.setHours(18, 0, 0, 0);
  return { start, end };
});

/** 采用 22 个工作日、每天 8.75 小时的演示规则换算每秒收入。 */
const perSecond = computed(() => salary.value / (22 * 8.75 * 60 * 60));

/** 计算今日有效工作秒数；结束工作后暂时归零，恢复时重新跟随当前时间。 */
const workedSeconds = computed(() => {
  if (isWorkEnded.value) {
    return 0;
  }

  const now = currentTime.value;
  const { start, end } = workWindow.value;
  if (now <= start) {
    return 0;
  }

  if (now >= end) {
    return (end.getTime() - start.getTime()) / 1000;
  }

  return (now.getTime() - start.getTime()) / 1000;
});

const earnedToday = computed(() => workedSeconds.value * perSecond.value);
const progress = computed(() => Math.min(100, Math.max(0, workedSeconds.value / 324)));
const monthlyProgress = computed(() => Math.min(100, Math.max(0, 53 + progress.value * 0.1)));
const breakIncome = computed(() => breakSeconds.value * perSecond.value);
const dateLabel = computed(() => currentTime.value.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }));
const timeUntilEnd = computed(() => formatCountdown(Math.max(0, Math.floor((workWindow.value.end.getTime() - currentTime.value.getTime()) / 1000))));
const currentComponent = computed(() => ({ today: DashboardPage, wishlist: BasicFormPage, accidents: BasicFormPage, summary: LedgerPage, slacking: SlackingPage, overtime: OvertimePage, attendance: AttendancePage, assets: BasicFormPage, journey: JourneyPage, settings: SettingsPage }[activeRoute.value] || DashboardPage));
const pageKind = computed(() => ['wishlist', 'accidents', 'assets'].includes(activeRoute.value) ? activeRoute.value : 'wishlist');

/** 格式化页面中的 HH : MM : SS 倒计时。 */
function formatCountdown(totalSeconds) {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours} : ${minutes} : ${seconds}`;
}

/** 导航到公开路由，同时保留浏览器前进/后退能力。 */
function navigate(route) {
  activeRoute.value = route;
  if (window.location.pathname !== paths[route]) {
    window.history.pushState({}, '', paths[route]);
  }
}

/** 启动摸鱼秒表并进入摸鱼页面；秒表跨页面保留在应用壳层。 */
function startBreak() {
  navigate('slacking');
  isBreakActive.value = true;
  window.clearInterval(breakTimer);
  breakTimer = window.setInterval(() => { breakSeconds.value += 1; }, 1000);
}

/** 停止摸鱼秒表，保留累计秒数供首页和摸鱼页展示。 */
function stopBreak() {
  isBreakActive.value = false;
  window.clearInterval(breakTimer);
}

/** 接收设置页的新月薪，让所有计薪卡片即时刷新。 */
function updateSalary(value) {
  salary.value = Number(value) || salary.value;
}

/** 选择主题并关闭抽屉；具体色彩由 styles.css 的主题变量提供。 */
function selectTheme(theme) {
  activeTheme.value = theme;
  showTheme.value = false;
}

function handlePopState() {
  activeRoute.value = routeByPath[window.location.pathname] || 'today';
}

onMounted(() => {
  clockTimer = window.setInterval(() => { currentTime.value = new Date(); }, 1000);
  window.addEventListener('popstate', handlePopState);
});

onBeforeUnmount(() => {
  window.clearInterval(clockTimer);
  window.clearInterval(breakTimer);
  window.removeEventListener('popstate', handlePopState);
});
</script>

<template>
  <div class="app-shell" :class="`theme-${activeTheme}`"><Sidebar :active-route="activeRoute" @navigate="navigate" @open-theme="showTheme = true" /><main class="main-content"><component :is="currentComponent" :kind="pageKind" :date-label="dateLabel" :salary="salary" :earned-today="earnedToday" :per-second="perSecond" :progress="progress" :worked-seconds="workedSeconds" :time-until-end="timeUntilEnd" :monthly-progress="monthlyProgress" :break-income="breakIncome" :break-seconds="breakSeconds" :is-work-ended="isWorkEnded" :is-break-active="isBreakActive" @navigate="navigate" @open-settings="navigate('settings')" @toggle-work="isWorkEnded = !isWorkEnded" @start-break="startBreak" @start="startBreak" @stop="stopBreak" @update-salary="updateSalary" @open-theme="showTheme = true" /></main><ThemeDrawer :open="showTheme" :active-theme="activeTheme" @close="showTheme = false" @select="selectTheme" /></div>
</template>
