# Prompt Hub

一个提示词管理和搜索平台，支持多种数据源和智能搜索。

## 功能特性

- 🔍 智能搜索提示词
- 📁 多数据源支持（prompts、banana、gpt4o）
- 🏷️ 分类筛选（剧本、写作、营销、代码等）
- 📱 响应式设计
- 🎨 美观的卡片式展示

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署到 GitHub Pages

### 方法一：使用 GitHub Actions（推荐）

1. **配置仓库名称**
   - 如果仓库名是 `prompt_web`，`vite.config.ts` 中的 `base` 已设置为 `/prompt_web/`
   - 如果仓库名是 `username.github.io`（个人主页），需要将 `base` 改为 `/`

2. **启用 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "GitHub Actions"

3. **推送代码**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **自动部署**
   - GitHub Actions 会自动构建并部署
   - 部署完成后，访问：`https://username.github.io/prompt_web/`

### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **配置 GitHub Pages**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `gh-pages`，目录选择 `/ (root)`

3. **推送 dist 目录到 gh-pages 分支**
   ```bash
   npm run build
   git subtree push --prefix dist origin gh-pages
   ```

## 项目结构

```
prompt_web/
├── src/
│   ├── components/     # React 组件
│   ├── data/           # JSON 数据文件
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── scripts/            # 数据转换脚本
├── public/             # 静态资源
└── dist/               # 构建输出
```

## 数据源

项目支持多个数据源：
- `prompts.json` - 主数据源
- `banana-prompts.json` - Banana 数据源
- `gpt4o-prompts.json` - GPT4o 数据源

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Fuse.js (搜索)

## License

MIT
