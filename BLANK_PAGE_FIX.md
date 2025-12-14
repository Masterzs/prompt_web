# 页面空白问题修复指南

## 🔍 问题诊断

访问 `https://masterzs.github.io/prompt_web/` 显示空白页面。

## ✅ 已添加的修复

1. **错误边界组件** (`src/components/ErrorBoundary.tsx`)
   - 捕获 React 渲染错误
   - 显示友好的错误信息
   - 提供刷新按钮

2. **全局错误处理** (`src/main.tsx`)
   - 捕获未处理的错误
   - 捕获 Promise 拒绝

## 🔧 排查步骤

### 步骤 1：检查浏览器控制台

1. **打开开发者工具**
   - 按 `F12` 或右键 → "检查"
   - 切换到 **Console** 标签

2. **查看错误信息**
   - 红色错误 = JavaScript 错误
   - 黄色警告 = 资源加载警告
   - 常见错误：
     - `Failed to load resource` = 资源路径错误
     - `Uncaught Error` = JavaScript 错误
     - `404 Not Found` = 文件不存在

### 步骤 2：检查网络请求

1. **切换到 Network 标签**
2. **刷新页面**（F5）
3. **检查失败的请求**（红色）
   - 查看哪些文件加载失败
   - 检查文件路径是否正确

### 步骤 3：检查资源路径

在 Network 标签中，检查以下资源：

**应该成功加载：**
- ✅ `/prompt_web/index.html`
- ✅ `/prompt_web/assets/index-*.js`（主 JavaScript 文件）
- ✅ `/prompt_web/assets/index-*.css`（样式文件）

**如果路径错误：**
- ❌ `/assets/index-*.js`（缺少 `/prompt_web/` 前缀）
- ❌ `/index.html`（应该是 `/prompt_web/index.html`）

### 步骤 4：验证 Base 路径

1. **查看页面源代码**
   - 右键 → "查看网页源代码"
   - 或按 `Ctrl+U`

2. **检查脚本标签**
   ```html
   <!-- 正确示例 -->
   <script type="module" src="/prompt_web/assets/index-abc123.js"></script>
   
   <!-- 错误示例 -->
   <script type="module" src="/assets/index-abc123.js"></script>
   ```

3. **检查链接标签**
   ```html
   <!-- 正确示例 -->
   <link rel="stylesheet" href="/prompt_web/assets/index-abc123.css">
   
   <!-- 错误示例 -->
   <link rel="stylesheet" href="/assets/index-abc123.css">
   ```

## 🐛 常见问题及解决方案

### 问题 1：资源路径缺少 base 前缀

**症状**：Network 标签显示 404，路径是 `/assets/...` 而不是 `/prompt_web/assets/...`

**原因**：构建时 base 路径未正确设置

**解决**：
1. 确认 `.github/workflows/deploy.yml` 中有：
   ```yaml
   env:
     NODE_ENV: production
     VITE_BASE_PATH: '/prompt_web/'
   ```

2. 重新触发部署：
   - 访问：https://github.com/Masterzs/prompt_web/actions
   - 点击 "Deploy to GitHub Pages"
   - 点击 "Run workflow"

### 问题 2：JavaScript 错误导致页面不渲染

**症状**：Console 有红色错误，页面空白

**解决**：
1. 查看错误详情
2. 检查错误边界是否显示（应该显示错误信息）
3. 如果错误边界也没显示，可能是更严重的问题

### 问题 3：数据加载失败

**症状**：页面有结构但内容为空

**解决**：
1. 检查 Console 是否有数据加载错误
2. 检查 Network 标签中 JSON 文件是否加载成功
3. 确认 `/prompt_web/src/data/*.json` 文件存在

### 问题 4：CORS 或安全策略问题

**症状**：Console 显示 CORS 错误

**解决**：
- GitHub Pages 通常不会有 CORS 问题
- 如果出现，检查 `public/_headers` 文件

## 🔄 快速修复步骤

1. **清除浏览器缓存**
   - `Ctrl+Shift+Delete`
   - 或使用无痕模式（`Ctrl+Shift+N`）

2. **检查 GitHub Actions**
   - 访问：https://github.com/Masterzs/prompt_web/actions
   - 确认最新部署成功（绿色）

3. **等待几分钟**
   - GitHub Pages 更新可能需要时间

4. **重新部署**
   - 如果问题持续，手动触发部署

## 📋 检查清单

- [ ] 浏览器控制台没有红色错误
- [ ] Network 标签中所有资源都成功加载（200 状态）
- [ ] 资源路径包含 `/prompt_web/` 前缀
- [ ] GitHub Actions 部署成功
- [ ] 已清除浏览器缓存
- [ ] 等待了足够的时间让 GitHub Pages 更新

## 💡 调试技巧

### 在控制台运行诊断

打开浏览器控制台，运行以下代码：

```javascript
// 检查 base 路径
console.log('Current path:', window.location.pathname);

// 检查资源加载
const scripts = document.querySelectorAll('script[src]');
console.log('Scripts:', Array.from(scripts).map(s => s.src));

// 检查根元素
const root = document.getElementById('root');
console.log('Root element:', root);
console.log('Root content:', root?.innerHTML);

// 检查 React
console.log('React loaded:', typeof React !== 'undefined');
```

## 🔗 相关链接

- **仓库**：https://github.com/Masterzs/prompt_web
- **Actions**：https://github.com/Masterzs/prompt_web/actions
- **Pages 设置**：https://github.com/Masterzs/prompt_web/settings/pages
- **网站**：https://masterzs.github.io/prompt_web/

