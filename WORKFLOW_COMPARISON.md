# GitHub Actions 工作流对比说明

## ❌ Jekyll 工作流（不适用于我们的项目）

你看到的示例是 **Jekyll** 的工作流，适用于：
- Jekyll 静态网站生成器（Ruby）
- 使用 `actions/jekyll-build-pages@v1` 构建
- 输出到 `./_site` 目录

```yaml
# Jekyll 工作流（不适用）
- name: Build with Jekyll
  uses: actions/jekyll-build-pages@v1
  with:
    source: ./
    destination: ./_site
```

## ✅ 我们的 Vite + React 工作流（当前配置）

我们的项目是 **Vite + React**，需要：
- Node.js 环境
- 使用 `npm run build` 构建
- 输出到 `./dist` 目录

```yaml
# Vite + React 工作流（正确）
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    VITE_BASE_PATH: '/prompt_web/'
```

## 📊 配置对比

| 项目 | Jekyll 工作流 | 我们的 Vite + React 工作流 |
|------|--------------|---------------------------|
| **构建工具** | Jekyll (Ruby) | Vite (Node.js) |
| **构建命令** | `jekyll build` | `npm run build` |
| **输出目录** | `./_site` | `./dist` |
| **Actions 版本** | `configure-pages@v5` | `configure-pages@v4` |
| **Node.js** | 不需要 | 需要（v20） |
| **npm** | 不需要 | 需要 |

## ✅ 当前配置检查

我们的 `.github/workflows/deploy.yml` 已经正确配置：

1. ✅ **使用 Node.js** - 正确
2. ✅ **安装依赖** - `npm ci` - 正确
3. ✅ **构建项目** - `npm run build` - 正确
4. ✅ **设置 base 路径** - `VITE_BASE_PATH: '/prompt_web/'` - 正确
5. ✅ **输出目录** - `./dist` - 正确
6. ✅ **上传构建产物** - `upload-pages-artifact@v3` - 正确
7. ✅ **部署到 GitHub Pages** - `deploy-pages@v4` - 正确

## 🔄 可选优化：更新 Actions 版本

你提供的示例中使用了 `configure-pages@v5`，我们可以考虑更新：

```yaml
# 当前版本
- name: Setup Pages
  uses: actions/configure-pages@v4

# 可以更新为（可选）
- name: Setup Pages
  uses: actions/configure-pages@v5
```

**注意**：v5 可能还没有正式发布，v4 是稳定版本，建议继续使用 v4。

## 🎯 结论

**不需要修改工作流配置！**

我们的配置已经是正确的，适用于 Vite + React 项目。Jekyll 的工作流不适用于我们的项目。

## 📝 下一步

如果 GitHub Pages 仍然有问题，应该检查：

1. **GitHub Pages 设置**
   - Source 是否设置为 "GitHub Actions"
   - 不是 "Deploy from a branch"

2. **构建日志**
   - 查看 GitHub Actions 的构建日志
   - 检查 "Verify build output" 步骤的输出
   - 确认构建是否成功

3. **构建输出**
   - 确认 `dist/index.html` 中的脚本路径正确
   - 不应该包含 `/src/main.tsx`
   - 应该包含 `/prompt_web/assets/index-*.js`

