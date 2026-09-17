<script setup>
/**
 * 应用壳层：负责真实浏览器路径、全局时钟、本地数据和页面组件分发。
 * 页面之间不再各自维护孤立演示数据，所有跨路由状态都来自 data/store.js。
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
import { activeSeconds, appStore, calculateRates, earnedAt, formatTimer, localDateValue, startTimer, stopTimer, workedSecondsAt } from './data/store';

const paths = { today: '/', wishlist: '/convert', summary: '/summary', accidents: '/accidents', slacking: '/slacking', overtime: '/overtime', attendance: '/attendance', assets: '/assets', journey: '/journey', settings: '/settings' };
const routeByPath = Object.fromEntries(Object.entries(paths).map(([key, path]) => [path, key]));
const activeRoute = ref(routeByPath[window.location.pathname] || 'today');
const currentTime = ref(new Date());
const showTheme = ref(false);
let clockTimer;

/** 当前设备的本地设置，模板中的 salary 等 computed 会自动响应保存结果。 */
const settings = computed(() => appStore.settings);
const salary = computed(() => Number(settings.value.salary) || 0);
const rates = computed(() => calculateRates(settings.value));
const isWorkEnded = computed(() => appStore.ui.workEnded);
const isBreakActive = computed(() => Boolean(appStore.slacking.active));
const breakSeconds = computed(() => appStore.slacking.active ? activeSeconds('slacking', currentTime.value) : appStore.slacking.records.filter((item) => item.startTime.slice(0, 10) === localDateValue(currentTime.value)).reduce((total, item) => total + item.durationSeconds, 0));
const breakIncome = computed(() => appStore.slacking.records.filter((item) => item.startTime.slice(0, 10) === localDateValue(currentTime.value)).reduce((total, item) => total + Number(item.earnedAmount || 0), 0) + (appStore.slacking.active ? activeSeconds('slacking', currentTime.value) * rates.value.second : 0));
const overtimeSeconds = computed(() => appStore.overtime.active ? activeSeconds('overtime', currentTime.value) : appStore.overtime.records.filter((item) => item.startTime.slice(0, 10) === localDateValue(currentTime.value)).reduce((total, item) => total + item.durationSeconds, 0));
const overtimeIncome = computed(() => appStore.overtime.records.filter((item) => item.startTime.slice(0, 10) === localDateValue(currentTime.value)).reduce((total, item) => total + Number(item.earnedAmount || 0), 0));

/** 返回当天固定作息的起止 Date，倒计时和页面时间轴共用这一组边界。 */
const workWindow = computed(() => {
  const start = new Date(currentTime.value);
  const end = new Date(currentTime.value);
  const [startHour, startMinute] = settings.value.workStart.split(':').map(Number);
  const [endHour, endMinute] = settings.value.workEnd.split(':').map(Number);
  start.setHours(startHour, startMinute, 0, 0);
  end.setHours(endHour, endMinute, 0, 0);
  return { start, end };
});

/** 计算今日已计薪秒数；结束工作后只暂停今日显示，不删除历史记录。 */
const workedSeconds = computed(() => isWorkEnded.value ? 0 : workedSecondsAt(currentTime.value, settings.value));
const earnedToday = computed(() => isWorkEnded.value ? 0 : earnedAt(currentTime.value, settings.value));
const progress = computed(() => Math.min(100, Math.max(0, workedSeconds.value / rates.value.paidSeconds * 100)));
const monthlyProgress = computed(() => Math.min(100, Math.max(0, ((currentTime.value.getDate() - 1) + progress.value / 100) / 21.75 * 100)));
const dateLabel = computed(() => currentTime.value.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }));
const timeUntilEnd = computed(() => formatTimer(Math.max(0, Math.floor((workWindow.value.end.getTime() - currentTime.value.getTime()) / 1000))));
const currentComponent = computed(() => ({ today: DashboardPage, wishlist: BasicFormPage, accidents: BasicFormPage, summary: LedgerPage, slacking: SlackingPage, overtime: OvertimePage, attendance: AttendancePage, assets: BasicFormPage, journey: JourneyPage, settings: SettingsPage }[activeRoute.value] || DashboardPage));
const pageKind = computed(() => ['wishlist', 'accidents', 'assets'].includes(activeRoute.value) ? activeRoute.value : 'wishlist');

/** 导航到公开路由，同时保留浏览器前进/后退能力。 */
function navigate(route) {
  activeRoute.value = route;
  if (window.location.pathname !== paths[route]) window.history.pushState({}, '', paths[route]);
}

/** 开始摸鱼并进入摸鱼页，计时起点写入本地数据以支持刷新恢复。 */
function startBreak() {
  startTimer('slacking');
  navigate('slacking');
}

/** 结束摸鱼并将当前会话写入历史记录。 */
function stopBreak() {
  stopTimer('slacking', currentTime.value);
}

/** 切换今日自动计薪显示，不影响工资、计时和历史账本数据。 */
function toggleWork() {
  appStore.ui.workEnded = !appStore.ui.workEnded;
}

/** 保存设置页提交的工资金额，并立即刷新所有单价和收益卡。 */
function updateSalary(value) {
  const next = Number(value);
  if (Number.isFinite(next) && next >= 0) appStore.settings.salary = next;
}

/** 选择主题并持久化，抽屉关闭由父壳层统一处理。 */
function selectTheme(theme) {
  appStore.ui.theme = theme;
  showTheme.value = false;
}

/** 浏览器前进或后退时同步当前组件。 */
function handlePopState() {
  activeRoute.value = routeByPath[window.location.pathname] || 'today';
}

onMounted(() => {
  clockTimer = window.setInterval(() => { currentTime.value = new Date(); }, 1000);
  window.addEventListener('popstate', handlePopState);
});

onBeforeUnmount(() => {
  window.clearInterval(clockTimer);
  window.removeEventListener('popstate', handlePopState);
});
</script>

<template>
  <div class="app-shell" :class="`theme-${appStore.ui.theme}`">
    <Sidebar :active-route="activeRoute" @navigate="navigate" @open-theme="showTheme = true" />
    <main class="main-content">
      <component :is="currentComponent" :kind="pageKind" :date-label="dateLabel" :salary="salary" :earned-today="earnedToday" :per-second="rates.second" :progress="progress" :worked-seconds="workedSeconds" :time-until-end="timeUntilEnd" :monthly-progress="monthlyProgress" :break-income="breakIncome" :break-seconds="breakSeconds" :overtime-income="overtimeIncome" :overtime-seconds="overtimeSeconds" :is-work-ended="isWorkEnded" :is-break-active="isBreakActive" @navigate="navigate" @open-settings="navigate('settings')" @toggle-work="toggleWork" @start-break="startBreak" @start="startBreak" @stop="stopBreak" @update-salary="updateSalary" @open-theme="showTheme = true" />
    </main>
    <ThemeDrawer :open="showTheme" :active-theme="appStore.ui.theme" @close="showTheme = false" @select="selectTheme" />
  </div>
</template>
