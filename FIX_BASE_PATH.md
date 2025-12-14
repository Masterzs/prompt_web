# Base 路径修复说明

## ✅ 已完成的修复

根据 GitHub Pages 部署指南，已修复 `vite.config.ts` 中的 base 路径配置。

### 修改前（复杂的环境变量逻辑）
```typescript
const getBasePath = () => {
  // 复杂的环境变量判断逻辑
  if (process.env.VITE_BASE_PATH) { ... }
  // ...
}
base: getBasePath(),
```

### 修改后（直接硬编码，最可靠）
```typescript
// 关键配置：GitHub Pages 部署必须设置 base 路径
// 仓库名是 prompt_web，所以 base 设置为 '/prompt_web/'
// 注意：前后都要有斜杠
base: '/prompt_web/',
```

## 🎯 为什么这样修改？

1. **最可靠**：直接硬编码确保构建时 base 路径一定正确
2. **最简单**：不需要复杂的环境变量判断
3. **符合指南**：按照 Vite + GitHub Pages 部署的最佳实践

## 📝 下一步操作

### 1. 提交并推送更改

```bash
git add vite.config.ts
git commit -m "Fix base path for GitHub Pages deployment"
git push origin main
```

### 2. 等待 GitHub Actions 自动部署

- 推送到 `main` 分支会自动触发部署
- 通常需要 2-5 分钟

### 3. 验证部署

部署完成后：
- 访问：https://masterzs.github.io/prompt_web/
- 打开浏览器控制台（F12）
- 检查是否有 404 错误
- 确认资源路径包含 `/prompt_web/` 前缀

## 🔍 验证构建输出

部署成功后，检查构建的 `index.html`：

**应该看到：**
```html
<script type="module" src="/prompt_web/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/prompt_web/assets/index-xyz789.css">
```

**不应该看到：**
```html
<script type="module" src="/src/main.tsx"></script>
<script type="module" src="/assets/index-abc123.js"></script>
```

## ⚠️ 本地开发说明

由于 base 路径设置为 `/prompt_web/`，本地开发时：

**方法 1：使用完整路径访问**
- 访问：`http://localhost:5173/prompt_web/`

**方法 2：临时修改配置（开发时）**
如果需要本地开发更方便，可以临时修改：
```typescript
base: process.env.NODE_ENV === 'production' ? '/prompt_web/' : '/',
```
但建议保持硬编码，确保部署时不会出错。

## 📚 参考

- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages 文档](https://docs.github.com/en/pages)

