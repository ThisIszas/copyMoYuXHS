<script setup>
/**
 * 共享侧边栏：所有页面复用同一套导航分组，保证路由切换时视觉和入口保持一致。
 */
defineProps({ activeRoute: { type: String, required: true } });
const emit = defineEmits(['navigate', 'open-theme']);

const navGroups = [
  { title: '总览', items: [['today', '今日', '⌁'], ['wishlist', '心愿清单', '♡'], ['summary', '账本', '▥'], ['accidents', '意外收支', '＄']] },
  { title: '工作记录', items: [['slacking', '摸鱼', '♧'], ['overtime', '加班', '▱'], ['attendance', '薪苦日历', '▣'], ['assets', '物品', '✣'], ['journey', '工作旅程', '⌘']] },
];

/** 将内部路由交给父级统一更新 URL 和页面状态。 */
function navigate(route) {
  emit('navigate', route);
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand-row"><div class="brand-icon">⌁</div><div><strong>MoneyDance</strong><small>TIME IS MONEY</small></div><button class="collapse-button" type="button" aria-label="收起侧边栏">▣</button></div>
    <nav class="side-nav" aria-label="MoneyDance 主导航">
      <div v-for="group in navGroups" :key="group.title" class="nav-group">
        <span class="nav-group-title">{{ group.title }}</span>
        <button v-for="item in group.items" :key="item[0]" class="nav-item" :class="{ active: activeRoute === item[0] }" type="button" @click="navigate(item[0])">
          <span class="nav-item-icon">{{ item[2] }}</span><span>{{ item[1] }}</span><i v-if="activeRoute === item[0]">•</i>
        </button>
      </div>
    </nav>
    <div class="sidebar-bottom"><button class="bottom-action" type="button" @click="emit('open-theme')">◌ <span>一键换肤</span></button><button class="bottom-action" type="button" @click="navigate('settings')">⌘ <span>我的</span></button><p>Local-first · 薪资默认只保存在你的浏览器</p></div>
  </aside>
</template>
