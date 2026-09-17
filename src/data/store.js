/**
 * MoneyDance 本地数据与计算层。
 *
 * 该模块对应参考项目的 local-first 设计：所有设置、记录和进行中的计时
 * 都保存在当前浏览器的 localStorage，不依赖账号或后端服务。页面组件只
 * 负责展示和触发动作，跨路由共享的数据统一从 appStore 读取。
 */
import { reactive, watch } from 'vue';

const STORAGE_KEY = 'moneydance-replica-state-v2';
const DAY_SECONDS = 24 * 60 * 60;

/** 返回当前设备本地日期，避免使用 UTC 导致账目跨日。 */
export function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 生成不依赖第三方库的本地记录 ID。 */
export function createId(prefix = 'record') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 生成一次全新的默认状态，避免数组引用被多个页面意外共享。 */
function defaultState() {
  return {
    settings: {
      salary: 15000,
      salaryType: 'monthly',
      payday: 10,
      workStart: '09:00',
      workEnd: '18:00',
      breakStart: '12:00',
      breakEnd: '13:00',
      paidBreak: false,
      monthlyWorkDays: 21.75,
      workDaysPerWeek: 5,
      includeLivingCost: false,
      monthlyLivingCost: 0,
      effectiveDate: localDateValue(),
    },
    wishes: [],
    accidents: [],
    assets: [],
    attendance: {},
    slacking: { active: null, records: [], lifetimeSeconds: 0 },
    overtime: { active: null, records: [], lifetimeSeconds: 0 },
    journey: { stages: [] },
    ui: { theme: 'classic', workEnded: false },
  };
}

/** 将旧版本或不完整的本地数据合并到当前状态结构。 */
function mergeState(source = {}) {
  const base = defaultState();
  return {
    ...base,
    ...source,
    settings: { ...base.settings, ...(source.settings || {}) },
    slacking: { ...base.slacking, ...(source.slacking || {}) },
    overtime: { ...base.overtime, ...(source.overtime || {}) },
    journey: { ...base.journey, ...(source.journey || {}) },
    ui: { ...base.ui, ...(source.ui || {}) },
    wishes: Array.isArray(source.wishes) ? source.wishes : base.wishes,
    accidents: Array.isArray(source.accidents) ? source.accidents : base.accidents,
    assets: Array.isArray(source.assets) ? source.assets : base.assets,
    attendance: source.attendance && typeof source.attendance === 'object' ? source.attendance : base.attendance,
  };
}

/** 从浏览器读取数据；解析失败时使用可运行的默认配置。 */
function loadState() {
  if (typeof window === 'undefined') {
    return defaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? mergeState(JSON.parse(raw)) : defaultState();
  } catch (error) {
    console.warn('MoneyDance 本地数据读取失败，将使用默认配置。', error);
    return defaultState();
  }
}

/** 全局响应式状态，页面卸载后仍可通过 localStorage 恢复。 */
export const appStore = reactive(loadState());

/** 深度监听状态变化，确保新增记录和设置修改即时持久化。 */
if (typeof window !== 'undefined') {
  watch(appStore, () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appStore));
    } catch (error) {
      console.warn('MoneyDance 本地数据保存失败。', error);
    }
  }, { deep: true });
}

/** 将金额统一显示为人民币两位小数。 */
export function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

/** 将时长显示成参考站使用的中文短格式。 */
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const days = Math.floor(seconds / DAY_SECONDS);
  const hours = Math.floor((seconds % DAY_SECONDS) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  const result = [];
  if (days) result.push(`${days}天`);
  if (hours) result.push(`${hours}小时`);
  if (minutes) result.push(`${minutes}分钟`);
  if (!days && !hours && !minutes && rest) result.push(`${rest}秒`);
  return result.join('') || '0秒';
}

/** 将计时器秒数固定为 HH:MM:SS，供摸鱼和加班大卡片复用。 */
export function formatTimer(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((part) => String(part).padStart(2, '0')).join(':');
}

/** 将 24 小时制时间转换为当天秒数。 */
export function parseClock(value) {
  const [hours, minutes] = String(value || '00:00').split(':').map(Number);
  return hours * 3600 + minutes * 60;
}

/** 计算跨午夜班次的总秒数。 */
export function shiftDuration(start, end) {
  const duration = parseClock(end) - parseClock(start);
  return duration >= 0 ? duration : DAY_SECONDS + duration;
}

/** 返回参考站的日、时、分、秒单价。 */
export function calculateRates(settings = appStore.settings) {
  const monthlyDays = Math.max(1, Number(settings.monthlyWorkDays) || 21.75);
  const paidSeconds = Math.max(1, shiftDuration(settings.workStart, settings.workEnd) - (settings.paidBreak ? 0 : shiftDuration(settings.breakStart, settings.breakEnd)));
  const monthlySalary = settings.salaryType === 'annual' ? Number(settings.salary || 0) / 12 : Number(settings.salary || 0);
  const grossDaily = settings.salaryType === 'daily'
    ? Number(settings.salary || 0)
    : settings.salaryType === 'hourly'
      ? Number(settings.salary || 0) * (paidSeconds / 3600)
      : monthlySalary / monthlyDays;
  const daily = Math.max(0, grossDaily - (settings.includeLivingCost ? Number(settings.monthlyLivingCost || 0) / monthlyDays : 0));
  const second = daily / paidSeconds;
  return { daily, hourly: second * 3600, minute: second * 60, second, paidSeconds };
}

/** 按固定工作周判断某个本地日期是否为计薪日。 */
export function isWorkday(date, settings = appStore.settings) {
  const weekday = new Date(`${date}T12:00:00`).getDay();
  const workDays = Math.min(7, Math.max(0, Number(settings.workDaysPerWeek) || 5));
  return ((weekday + 6) % 7) < workDays;
}

/** 计算指定时刻在今日固定作息中已经计薪的秒数，并扣除午休。 */
export function workedSecondsAt(now = new Date(), settings = appStore.settings) {
  const today = localDateValue(now);
  if (!isWorkday(today, settings)) return 0;
  const start = parseClock(settings.workStart);
  const end = parseClock(settings.workEnd);
  const current = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const shift = shiftDuration(settings.workStart, settings.workEnd);
  const crossesMidnight = end < start;
  const position = crossesMidnight && current < start ? DAY_SECONDS + current - start : current - start;
  if (position <= 0) return 0;
  const elapsed = Math.min(shift, position);
  if (!crossesMidnight && current < start) return 0;
  if (settings.paidBreak) return Math.max(0, elapsed);
  const breakClock = parseClock(settings.breakStart);
  const breakEndClock = parseClock(settings.breakEnd);
  const breakStart = Math.max(0, breakClock >= start ? breakClock - start : DAY_SECONDS + breakClock - start);
  const breakLength = shiftDuration(settings.breakStart, settings.breakEnd);
  const breakEnd = Math.min(elapsed, breakStart + breakLength);
  return Math.max(0, elapsed - Math.max(0, breakEnd - breakStart));
}

/** 计算今日已赚金额，供首页、账本和设置预览共享。 */
export function earnedAt(now = new Date(), settings = appStore.settings) {
  return workedSecondsAt(now, settings) * calculateRates(settings).second;
}

/** 计算当前进行中的摸鱼或加班时长，刷新页面后也能从开始时间恢复。 */
export function activeSeconds(kind, now = new Date()) {
  const timer = appStore[kind];
  if (!timer.active) return 0;
  return Math.max(0, Math.floor((now.getTime() - Date.parse(timer.active.startTime)) / 1000));
}

/** 开始一次摸鱼或加班记录，重复点击不会创建重叠计时。 */
export function startTimer(kind, options = {}) {
  const timer = appStore[kind];
  if (timer.active) return false;
  timer.active = { startTime: new Date().toISOString(), ...options };
  return true;
}

/** 结束当前计时并落成可追溯的本地历史记录。 */
export function stopTimer(kind, end = new Date()) {
  const timer = appStore[kind];
  if (!timer.active) return null;
  const start = new Date(timer.active.startTime);
  const durationSeconds = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
  const rate = calculateRates().second;
  const multiplier = Number(timer.active.multiplier || 1);
  const earnedAmount = kind === 'overtime' && timer.active.payMode === 'fixed'
    ? Number(timer.active.fixedAmount || 0)
    : durationSeconds * rate * (kind === 'overtime' && timer.active.payMode === 'multiplier' ? multiplier : kind === 'overtime' ? 0 : 1);
  const record = { id: createId(kind), startTime: start.toISOString(), endTime: end.toISOString(), durationSeconds, earnedAmount, ...timer.active };
  timer.records.unshift(record);
  timer.lifetimeSeconds += durationSeconds;
  timer.active = null;
  return record;
}

/** 补记一段已经结束的摸鱼或加班，避免只能依赖实时计时。 */
export function addBackfill(kind, startValue, endValue, options = {}) {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return false;
  const timer = appStore[kind];
  const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  const rate = calculateRates().second;
  const earnedAmount = kind === 'overtime' && options.payMode === 'fixed'
    ? Number(options.fixedAmount || 0)
    : durationSeconds * rate * (kind === 'overtime' ? Number(options.multiplier || 0) : 1);
  timer.records.unshift({ id: createId(kind), startTime: start.toISOString(), endTime: end.toISOString(), durationSeconds, earnedAmount, ...options });
  timer.lifetimeSeconds += durationSeconds;
  return true;
}

/** 从状态中取出某天的意外收入、支出和物品购买账目。 */
export function ledgerEntriesFor(date) {
  const accidents = appStore.accidents.filter((item) => item.date === date).map((item) => ({ ...item, source: '意外收支' }));
  const assets = appStore.assets.filter((item) => item.purchaseDate === date).map((item) => ({ ...item, amount: -Number(item.amount || 0), source: '已购物品' }));
  return [...accidents, ...assets];
}

/** 导出完整本地状态，供设置页下载 JSON 备份。 */
export function exportBackup() {
  return JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), data: appStore }, null, 2);
}

/** 校验并覆盖导入的 JSON 数据，失败时返回错误而不破坏现有状态。 */
export function importBackup(text) {
  try {
    const parsed = JSON.parse(text);
    const next = mergeState(parsed.data || parsed);
    Object.keys(next).forEach((key) => { appStore[key] = next[key]; });
    return true;
  } catch (error) {
    console.warn('MoneyDance 备份导入失败。', error);
    return false;
  }
}
