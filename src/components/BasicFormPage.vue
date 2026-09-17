<script setup>
/**
 * 心愿、意外收支、物品页面共用表单骨架。
 * 与参考仓库的 Converter、Accidents、Assets 三页一样，新增记录后会进入
 * 本地数据层，刷新页面或切换路由不会丢失；危险删除操作要求二次确认。
 */
import { computed, ref } from 'vue';
import { appStore, calculateRates, createId, formatDuration, localDateValue, money } from '../data/store';

const props = defineProps({ kind: { type: String, required: true } });
const titleData = {
  wishlist: { kicker: 'WISH LIST', title: '按顺序，攒下每一个心愿。', desc: '同一份工作收入只分配一次，攒够一个后自动继续下一个。', formKicker: 'NEW WISH', formTitle: '添加一个心愿', formDesc: '填好名称、价格和开始日期，默认加入队尾。', name: '想买什么', namePlaceholder: '例如：降噪耳机', listTitle: '心愿清单', empty: '还没有心愿。添加一个想实现的目标吧。', action: '添加心愿' },
  accidents: { kicker: 'UNEXPECTED MONEY', title: '意外，也要算进生活里。', desc: '记录某天突然发生的收入或花费。它不会改变你的薪资速度，但会进入账本统计。', formKicker: 'QUICK ENTRY', formTitle: '记录一笔意外收支', formDesc: '金额会直接进入账本统计。', name: '发生了什么', namePlaceholder: '例如：手机突然碎屏', listTitle: '意外记录', empty: '还没有意外收支。希望“意外”更多是收入。', action: '记一笔' },
  assets: { kicker: 'OWNERSHIP COST', title: '买得贵不贵，时间会给答案。', desc: '持有时间越久，平均每小时成本越低。这里统计的是持有成本，不是实际使用时长。', formKicker: 'NEW ITEM', formTitle: '记录一件好物', formDesc: '购买日期越准确，持有成本越真实。', name: '物品名称', namePlaceholder: '例如：降噪耳机', listTitle: '我的好物', empty: '添加一个已经拥有的东西，看看它现在平均每小时花了多少钱。', action: '添加物品' },
};
const config = computed(() => titleData[props.kind]);
const name = ref('');
const amount = ref('');
const recordDate = ref(localDateValue());
const category = ref('数码');
const accidentType = ref('expense');
const records = computed(() => appStore[props.kind === 'wishlist' ? 'wishes' : props.kind]);
const rates = computed(() => calculateRates());

/** 提交表单并写入对应的本地集合。 */
function addRecord() {
  const safeName = name.value.trim() || (props.kind === 'wishlist' ? '未命名心愿' : props.kind === 'assets' ? '未命名物品' : '未命名收支');
  const safeAmount = Math.max(0, Number(amount.value || 0));
  if (props.kind === 'wishlist') appStore.wishes.push({ id: createId('wish'), name: safeName, price: safeAmount, startedAt: recordDate.value, createdAt: new Date().toISOString(), purchasedAt: null });
  if (props.kind === 'accidents') appStore.accidents.unshift({ id: createId('accident'), name: safeName, amount: safeAmount, type: accidentType.value, date: recordDate.value, createdAt: new Date().toISOString() });
  if (props.kind === 'assets') appStore.assets.unshift({ id: createId('asset'), name: safeName, amount: safeAmount, category: category.value, purchaseDate: recordDate.value, createdAt: new Date().toISOString() });
  name.value = '';
  amount.value = '';
}

/** 删除一条记录；参考项目对破坏性动作统一使用二次确认。 */
function removeRecord(record) {
  if (!window.confirm(`确定删除“${record.name}”吗？`)) return;
  const collection = props.kind === 'wishlist' ? appStore.wishes : props.kind === 'accidents' ? appStore.accidents : appStore.assets;
  const index = collection.findIndex((item) => item.id === record.id);
  if (index >= 0) collection.splice(index, 1);
}

/** 计算心愿需要的纯工作时长，展示比单纯价格更接近产品核心。 */
function wishDuration(price) {
  return formatDuration(Number(price || 0) / Math.max(0.000001, rates.value.second));
}

/** 估算物品从购买到现在的持有成本，避免日期差为零时出现无穷大。 */
function ownershipCost(record) {
  const hours = Math.max(1, (Date.now() - Date.parse(`${record.purchaseDate}T12:00:00`)) / 3600000);
  return money(Number(record.amount || 0) / hours);
}
</script>

<template>
  <div class="page-frame form-page">
    <header class="page-header simple"><div><span class="date-label">{{ config.kicker }}</span><h1>{{ config.title }}</h1><p>{{ config.desc }}</p></div></header>
    <section class="form-workspace">
      <div class="form-intro"><span class="form-kicker">{{ config.formKicker }}</span><div><strong>{{ config.formTitle }}</strong><small>{{ config.formDesc }}</small></div></div>
      <div v-if="kind === 'accidents'" class="segmented-toggle"><button :class="{ active: accidentType === 'expense' }" type="button" @click="accidentType = 'expense'">↗ 意外花费</button><button :class="{ active: accidentType === 'income' }" type="button" @click="accidentType = 'income'">↙ 意外收入</button></div>
      <label class="field-label">{{ config.name }}<input v-model="name" :placeholder="config.namePlaceholder" /></label>
      <label class="field-label">{{ kind === 'assets' ? '价格' : '金额' }}<input v-model="amount" type="number" min="0" step="0.01" placeholder="¥ 0.00" /></label>
      <label class="field-label">{{ kind === 'assets' ? '购买日期' : kind === 'wishlist' ? '从哪天开始攒' : '发生日期' }}<input v-model="recordDate" type="date" /></label>
      <label v-if="kind === 'assets'" class="field-label">分类<select v-model="category"><option>数码</option><option>家居</option><option>衣物</option><option>其他</option></select></label>
      <button class="primary-submit" type="button" @click="addRecord">＋ {{ config.action }}</button>
      <p class="form-hint">{{ kind === 'wishlist' ? '从这一天起按工作收入估算；未来日期到日后开始。' : kind === 'assets' ? '持有成本会随时间变化，记录后可以继续编辑。' : '记录会直接进入账本统计，不改变当前工资速度。' }}</p>
    </section>
    <section class="records-section">
      <div class="section-heading"><div><span class="section-kicker">{{ config.kicker }}</span><h2>{{ config.listTitle }}</h2></div><span>{{ records.length }} {{ kind === 'assets' ? '件' : kind === 'wishlist' ? '项' : '笔' }}</span></div>
      <div v-if="records.length === 0" class="records-empty">{{ config.empty }}</div>
      <div v-else class="record-list">
        <article v-for="record in records" :key="record.id" class="record-card">
          <div class="record-card-main"><span class="record-symbol">{{ kind === 'wishlist' ? '♡' : kind === 'assets' ? '▣' : record.type === 'income' ? '↙' : '↗' }}</span><div><strong>{{ record.name }}</strong><small v-if="kind === 'wishlist'">从 {{ record.startedAt }} 开始 · 需要 {{ wishDuration(record.price) }}</small><small v-else-if="kind === 'assets'">{{ record.category }} · {{ record.purchaseDate }} · 持有成本 {{ ownershipCost(record) }}/小时</small><small v-else>{{ record.date }} · {{ record.type === 'income' ? '意外收入' : '意外花费' }}</small></div></div>
          <div class="record-card-side"><strong>{{ money(record.price ?? record.amount) }}</strong><button type="button" @click="removeRecord(record)">删除</button></div>
        </article>
      </div>
    </section>
  </div>
</template>
