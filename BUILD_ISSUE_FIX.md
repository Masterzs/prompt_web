# 构建问题修复指南

## 🔍 问题诊断

**错误信息**：`GET https://masterzs.github.io/src/main.tsx 404 (Not Found)`

**问题原因**：
- 浏览器正在尝试加载 `/src/main.tsx`（开发环境路径）
- 在生产构建中，Vite 应该自动将 `index.html` 中的 `/src/main.tsx` 替换为打包后的文件路径（如 `/prompt_web/assets/index-*.js`）
- 如果构建后的 `index.html` 仍然包含 `/src/main.tsx`，说明构建过程有问题

## ✅ 已添加的修复

1. **构建验证步骤** (`.github/workflows/deploy.yml`)
   - 检查 `dist/` 目录是否存在
   - 验证 `index.html` 中的脚本路径是否正确

## 🔧 解决方案

### 方案 1：检查 GitHub Actions 构建日志

1. **访问 Actions 页面**
   - https://github.com/Masterzs/prompt_web/actions

2. **查看最新的构建日志**
   - 点击最新的 "Deploy to GitHub Pages" 工作流
   - 展开 "Build" 作业
   - 查看 "Verify build output" 步骤的输出

3. **检查构建输出**
   - `dist/index.html` 中的脚本路径应该是 `/prompt_web/assets/index-*.js`
   - 如果仍然是 `/src/main.tsx`，说明构建有问题

### 方案 2：手动触发重新构建

1. **访问 Actions 页面**
   - https://github.com/Masterzs/prompt_web/actions

2. **手动运行工作流**
   - 点击左侧 "Deploy to GitHub Pages"
   - 点击 "Run workflow"
   - 选择分支 `main`
   - 点击 "Run workflow"

3. **等待构建完成**
   - 通常需要 2-5 分钟
   - 检查构建日志中的 "Verify build output" 步骤

### 方案 3：本地测试构建

如果可能，在本地测试构建过程：

```bash
# 设置环境变量
$env:NODE_ENV = "production"
$env:VITE_BASE_PATH = "/prompt_web/"

# 构建
npm run build

# 检查构建输出
cat dist/index.html | Select-String -Pattern "script|link"
```

**预期输出**：
- 脚本路径应该是 `/prompt_web/assets/index-*.js`
- 不应该包含 `/src/main.tsx`

## 🐛 可能的原因

### 原因 1：构建失败但未报错

**症状**：GitHub Actions 显示成功，但 `dist/index.html` 仍然是源文件

**解决**：
- 检查构建日志中的错误
- 确认 `npm run build` 是否真的成功完成

### 原因 2：TypeScript 编译错误

**症状**：`tsc` 命令失败，导致构建停止

**解决**：
- 检查 TypeScript 错误
- 修复代码中的类型错误
- 或者暂时跳过类型检查：`vite build`（不运行 `tsc`）

### 原因 3：Vite 配置问题

**症状**：Vite 构建成功，但 `index.html` 未正确转换

**解决**：
- 确认 `vite.config.ts` 中的 `base` 路径配置正确
- 确认 `index.html` 在项目根目录

## 📋 检查清单

- [ ] GitHub Actions 构建成功（绿色）
- [ ] "Verify build output" 步骤显示正确的脚本路径
- [ ] `dist/index.html` 中的脚本路径包含 `/prompt_web/assets/`
- [ ] 没有 `/src/main.tsx` 路径
- [ ] 部署成功后，浏览器控制台没有 404 错误

## 🔄 下一步

1. **提交当前更改**
   ```bash
   git add .
   git commit -m "Add build verification step"
   git push origin main
   ```

2. **等待 GitHub Actions 完成**
   - 查看构建日志
   - 检查 "Verify build output" 步骤的输出

3. **验证部署**
   - 访问：https://masterzs.github.io/prompt_web/
   - 打开浏览器控制台（F12）
   - 检查是否还有 404 错误

## 💡 调试技巧

### 在浏览器中检查部署的文件

1. **查看页面源代码**
   - 右键 → "查看网页源代码"
   - 或按 `Ctrl+U`

2. **检查脚本标签**
   ```html
   <!-- 正确示例 -->
   <script type="module" src="/prompt_web/assets/index-abc123.js"></script>
   
   <!-- 错误示例 -->
   <script type="module" src="/src/main.tsx"></script>
   ```

3. **检查 Network 标签**
   - 打开开发者工具（F12）
   - 切换到 Network 标签
   - 刷新页面
   - 查看哪些文件加载失败

## 🔗 相关链接

- **仓库**：https://github.com/Masterzs/prompt_web
- **Actions**：https://github.com/Masterzs/prompt_web/actions
- **Pages 设置**：https://github.com/Masterzs/prompt_web/settings/pages

