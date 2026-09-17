/**
 * 应用入口：创建 Vue 根实例并加载全局样式。
 * 该文件只负责启动应用，业务状态统一放在 App.vue 中，便于后续拆分页面模块。
 */
import { createApp } from 'vue';
import App from './App.vue';
import './styles.css';

createApp(App).mount('#app');
