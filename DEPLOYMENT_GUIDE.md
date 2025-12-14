# GitHub Pages 部署指南（2024-2025 最新版）

## 📋 部署配置检查清单

根据最新的 GitHub Pages 部署文档，以下是完整的配置检查清单：

### ✅ 1. GitHub Pages 设置

1. **访问仓库设置**
   - https://github.com/Masterzs/prompt_web/settings/pages

2. **确认 Source 设置**
   - ✅ **必须选择：GitHub Actions**
   - ❌ 不要选择 "Deploy from a branch"

3. **保存设置**

### ✅ 2. GitHub Actions 工作流配置

当前工作流文件：`.github/workflows/deploy.yml`

**关键配置点：**

1. **权限设置**（已正确）
   ```yaml
   permissions:
     contents: read
     pages: write
     id-token: write
   ```

2. **构建步骤**（已正确）
   - 使用 `actions/checkout@v4`
   - 使用 `actions/setup-node@v4`
   - 使用 `actions/configure-pages@v4`
   - 使用 `actions/upload-pages-artifact@v3`
   - 使用 `actions/deploy-pages@v4`

3. **环境变量**（已正确）
   ```yaml
   env:
     NODE_ENV: production
     VITE_BASE_PATH: '/prompt_web/'
   ```

### ✅ 3. Vite 配置

当前配置文件：`vite.config.ts`

**关键配置点：**

1. **Base 路径**
   - ✅ 已正确设置为 `/prompt_web/`
   - ✅ 支持环境变量 `VITE_BASE_PATH`

2. **构建输出**
   - ✅ `outDir: 'dist'`
   - ✅ `assetsDir: 'assets'`

### ✅ 4. 构建验证

工作流中已添加构建验证步骤，会检查：
- ✅ `dist/` 目录是否存在
- ✅ `index.html` 是否存在
- ✅ 脚本路径是否正确（不包含 `/src/main.tsx`）
- ✅ Base 路径是否正确（包含 `/prompt_web/`）

## 🔧 部署流程

### 步骤 1：提交代码

```bash
git add .
git commit -m "Update GitHub Pages deployment configuration"
git push origin main
```

### 步骤 2：触发部署

**自动触发：**
- 推送到 `main` 分支会自动触发部署

**手动触发：**
1. 访问：https://github.com/Masterzs/prompt_web/actions
2. 点击左侧 "Deploy to GitHub Pages"
3. 点击 "Run workflow"
4. 选择分支 `main`
5. 点击 "Run workflow"

### 步骤 3：检查构建日志

1. **访问 Actions 页面**
   - https://github.com/Masterzs/prompt_web/actions

2. **查看构建日志**
   - 点击最新的工作流运行
   - 展开 "build" 作业
   - 查看 "Verify build output" 步骤的输出

3. **确认构建成功**
   - ✅ 所有步骤显示绿色
   - ✅ "Verify build output" 显示所有检查通过
   - ✅ 没有错误信息

### 步骤 4：验证部署

1. **等待部署完成**
   - 通常需要 2-5 分钟

2. **访问网站**
   - https://masterzs.github.io/prompt_web/

3. **检查浏览器控制台**
   - 按 `F12` 打开开发者工具
   - 切换到 Console 标签
   - 应该没有 404 错误

4. **检查 Network 标签**
   - 切换到 Network 标签
   - 刷新页面
   - 所有资源应该成功加载（200 状态）

## 🐛 常见问题排查

### 问题 1：构建失败

**症状**：GitHub Actions 显示红色（失败）

**排查步骤：**
1. 查看构建日志中的错误信息
2. 检查 TypeScript 编译错误
3. 检查依赖安装是否成功

**解决方案：**
- 修复代码中的错误
- 确保 `package.json` 和 `package-lock.json` 正确
- 检查 Node.js 版本是否兼容

### 问题 2：构建成功但页面空白

**症状**：构建成功，但网站显示空白

**排查步骤：**
1. 查看 "Verify build output" 步骤的输出
2. 检查 `index.html` 中的脚本路径
3. 检查浏览器控制台的错误

**可能原因：**
- `index.html` 仍然包含 `/src/main.tsx`（开发路径）
- Base 路径配置不正确
- 资源文件路径错误

**解决方案：**
- 确认构建时 `VITE_BASE_PATH` 环境变量已设置
- 检查 `vite.config.ts` 中的 base 路径配置
- 重新触发构建

### 问题 3：404 错误

**症状**：访问网站显示 404

**排查步骤：**
1. 检查 GitHub Pages 设置中的 Source
2. 确认 Source 设置为 "GitHub Actions"
3. 检查部署是否成功完成

**解决方案：**
- 将 Source 改为 "GitHub Actions"
- 等待部署完成（可能需要几分钟）
- 清除浏览器缓存

### 问题 4：资源加载失败

**症状**：页面加载但资源（CSS、JS、图片）加载失败

**排查步骤：**
1. 检查浏览器 Network 标签
2. 查看失败的资源路径
3. 确认路径是否包含 `/prompt_web/` 前缀

**解决方案：**
- 确认 base 路径配置正确
- 检查资源文件是否在 `dist/` 目录中
- 重新构建并部署

## 📊 构建验证输出示例

**成功的构建验证输出：**

```
=== Build Output Verification ===

Files in dist/:
total 1234
drwxr-xr-x 3 runner docker 4096 Jan 15 10:00 .
drwxr-xr-x 5 runner docker 4096 Jan 15 10:00 ..
-rw-r--r-- 1 runner docker 1234 Jan 15 10:00 index.html
drwxr-xr-x 2 runner docker 4096 Jan 15 10:00 assets

Checking index.html:
Script and link tags in index.html:
<script type="module" src="/prompt_web/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/prompt_web/assets/index-xyz789.css">

Checking for /src/main.tsx (should NOT exist):
✓ No /src/main.tsx found (good)

Checking for base path /prompt_web/ (should exist):
✓ Base path /prompt_web/ found in index.html (good)

=== Verification Complete ===
```

**失败的构建验证输出：**

```
=== Build Output Verification ===
ERROR: index.html still contains /src/main.tsx (development path)
This means the build did not properly transform the HTML
```

## 🔗 相关链接

- **GitHub Pages 文档**：https://docs.github.com/en/pages
- **GitHub Actions 文档**：https://docs.github.com/en/actions
- **Vite 部署指南**：https://vitejs.dev/guide/static-deploy.html
- **仓库**：https://github.com/Masterzs/prompt_web
- **Actions**：https://github.com/Masterzs/prompt_web/actions
- **Pages 设置**：https://github.com/Masterzs/prompt_web/settings/pages
- **网站**：https://masterzs.github.io/prompt_web/

## 💡 最佳实践

1. **始终检查构建日志**
   - 不要只看构建是否成功
   - 查看 "Verify build output" 步骤的详细输出

2. **本地测试构建**
   - 在推送前，本地运行 `npm run build`
   - 检查 `dist/index.html` 中的路径是否正确

3. **使用环境变量**
   - 通过环境变量设置 base 路径
   - 避免硬编码路径

4. **定期更新 Actions**
   - 使用最新版本的 GitHub Actions
   - 当前使用：v4 版本

5. **监控部署状态**
   - 定期检查 GitHub Actions 的运行状态
   - 及时处理构建失败

