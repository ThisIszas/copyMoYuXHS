/**
 * Vite 构建配置。
 * 通过官方 Vue 插件让 Vite 正确解析单文件组件（SFC），开发和生产构建共用同一套入口。
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
