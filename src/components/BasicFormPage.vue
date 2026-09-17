<script setup>
/**
 * 心愿、意外收支、物品三个表单页共用的轻量工作区。
 * 参考站的共同结构都是“标题说明 + 横向新增卡 + 列表空状态”，因此用 kind 配置差异。
 */
import { computed, ref } from 'vue';

const props = defineProps({ kind: { type: String, required: true } });
const titleData = {
  wishlist: { kicker: 'WISH LIST', title: '按顺序，攒下每一个心愿。', desc: '同一份工作收入只分配一次，攒够一个后自动继续下一个。', formKicker: 'NEW WISH', formTitle: '添加一个心愿', formDesc: '填好名称和价格，默认加入队尾。', name: '想买什么', namePlaceholder: '例如：耳机', listTitle: '心愿清单', empty: '还没有心愿。添加一个想实现的目标吧。', action: '添加心愿' },
  accidents: { kicker: 'UNEXPECTED MONEY', title: '意外，也要算进生活里。', desc: '记录某天突然发生的收入或花费。它不会改变你的薪资速度，但会进入账本统计。', formKicker: 'QUICK ENTRY', formTitle: '记录一笔意外收支', formDesc: '这笔金额会直接进入账本统计。', name: '发生了什么', namePlaceholder: '例如：手机突然碎屏', listTitle: '意外记录', empty: '还没有意外收支。希望“意外”更多是收入。', action: '记一笔' },
  assets: { kicker: 'OWNERSHIP COST', title: '买得贵不贵，时间会给答案。', desc: '持有时间越久，平均每小时成本越低。这里统计的是“持有成本”，不是实际使用时长。', formKicker: 'NEW ITEM', formTitle: '记录一件好物', formDesc: '购买日期越准确，持有成本越真实。', name: '物品名称', namePlaceholder: '例如：降噪耳机', listTitle: '我的好物', empty: '添加一个你已经拥有的东西，看看它现在平均每小时花了多少钱。', action: '添加物品' },
};
const config = computed(() => titleData[props.kind]);
const name = ref('');
const amount = ref('');
const records = ref([]);
const accidentType = ref('expense');

/** 提交一条本地记录，用于让表单按钮有真实反馈。 */
function addRecord() {
  if (!name.value.trim()) {
    name.value = props.kind === 'wishlist' ? '未命名心愿' : props.kind === 'assets' ? '未命名物品' : '未命名收支';
  }
  records.value.push({ name: name.value, amount: Number(amount.value || 0), type: accidentType.value });
  name.value = '';
  amount.value = '';
}
</script>

<template>
  <div class="page-frame form-page"><header class="page-header simple"><div><span class="date-label">{{ config.kicker }}</span><h1>{{ config.title }}</h1><p>{{ config.desc }}</p></div></header><section class="form-workspace"><div class="form-intro"><span class="form-kicker">{{ config.formKicker }}</span><div><strong>{{ config.formTitle }}</strong><small>{{ config.formDesc }}</small></div></div><div v-if="kind === 'accidents'" class="segmented-toggle"><button :class="{ active: accidentType === 'expense' }" type="button" @click="accidentType = 'expense'">↗ 意外花费</button><button :class="{ active: accidentType === 'income' }" type="button" @click="accidentType = 'income'">↙ 意外收入</button></div><label class="field-label">{{ config.name }}<input v-model="name" :placeholder="config.namePlaceholder" /></label><label class="field-label">{{ kind === 'assets' ? '价格' : '金额' }}<input v-model="amount" type="number" min="0" placeholder="¥ 0.00" /></label><label class="field-label">{{ kind === 'assets' ? '购买日期' : kind === 'wishlist' ? '从哪天开始攒' : '发生日期' }}<input type="date" /></label><label v-if="kind === 'assets'" class="field-label">分类<select><option>数码</option><option>家居</option><option>衣物</option><option>其他</option></select></label><button class="primary-submit" type="button" @click="addRecord">＋ {{ config.action }}</button><p class="form-hint">{{ kind === 'wishlist' ? '从这一天起按工作收入估算；未来日期到日后开始。' : kind === 'assets' ? '持有成本会随时间变化，记录后可以继续编辑。' : '记录会直接进入账本统计，不改变当前工资速度。' }}</p></section><section class="records-section"><div class="section-heading"><div><h2>{{ config.listTitle }}</h2></div><span>{{ records.length }} {{ kind === 'assets' ? '件' : kind === 'wishlist' ? '项' : '笔' }}</span></div><div v-if="records.length === 0" class="records-empty">{{ config.empty }}</div><div v-else class="record-list"><article v-for="(record, index) in records" :key="index"><strong>{{ record.name }}</strong><span>¥ {{ record.amount.toFixed(2) }}</span></article></div></section></div>
</template>
