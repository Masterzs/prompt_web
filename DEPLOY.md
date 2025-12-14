# GitHub Pages 部署指南

## 快速开始

### 1. 准备 GitHub 仓库

```bash
# 初始化 git（如果还没有）
git init

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/username/prompt_web.git

# 或者如果仓库名是 username.github.io（个人主页）
git remote add origin https://github.com/username/username.github.io.git
```

### 2. 配置 base 路径

根据你的仓库名称，修改 `vite.config.ts` 中的 base 路径：

**情况 A：普通仓库（如 `prompt_web`）**
- 访问地址：`https://username.github.io/prompt_web/`
- `base` 应设置为：`'/prompt_web/'`
- 当前配置已默认为此值

**情况 B：个人主页仓库（`username.github.io`）**
- 访问地址：`https://username.github.io/`
- `base` 应设置为：`'/'`
- 需要修改 `vite.config.ts` 中的默认值

### 3. 提交代码

```bash
# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Ready for GitHub Pages"

# 推送到 GitHub
git push -u origin main
```

### 4. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 部分，选择 **GitHub Actions**
4. 保存设置

### 5. 触发部署

GitHub Actions 会在以下情况自动触发：
- 推送到 `main` 分支（或 `master` 分支）
- 手动触发（Actions → Deploy to GitHub Pages → Run workflow）

### 6. 查看部署状态

1. 进入仓库的 **Actions** 标签页
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待构建和部署完成（通常 2-5 分钟）

### 7. 访问网站

部署完成后，访问：
- 普通仓库：`https://username.github.io/prompt_web/`
- 个人主页：`https://username.github.io/`

## 手动设置 base 路径

如果自动检测不工作，可以通过环境变量手动设置：

### 方法 1：修改 vite.config.ts

直接修改 `getBasePath()` 函数的返回值：

```typescript
return '/your-repo-name/'  // 替换为你的仓库名
```

### 方法 2：使用环境变量

在 GitHub Actions 工作流中设置：

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
    VITE_BASE_PATH: '/your-repo-name/'
```

## 常见问题

### Q: 页面显示空白或 404？

**A:** 检查 base 路径是否正确：
1. 确认仓库名称
2. 检查 `vite.config.ts` 中的 base 设置
3. 重新构建并部署

### Q: 资源文件（图片、CSS）加载失败？

**A:** 这通常是 base 路径问题：
1. 确保 base 路径以 `/` 开头和结尾
2. 检查浏览器控制台的错误信息
3. 确认资源路径是否正确

### Q: 如何更新部署？

**A:** 只需推送新的代码到 main 分支，GitHub Actions 会自动重新部署。

### Q: 如何回退到之前的版本？

**A:** 在 GitHub Actions 中查看历史部署，可以重新运行之前的成功部署。

## 本地测试生产构建

在部署前，可以在本地测试生产构建：

```bash
# 构建
npm run build

# 预览（使用生产 base 路径）
npm run preview
```

或者使用 serve：

```bash
# 安装 serve（如果还没有）
npm install -g serve

# 在 dist 目录启动服务器
cd dist
serve -s . -l 3000
```

然后访问 `http://localhost:3000/prompt_web/` 测试。

## 自定义域名

如果你想使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名：
   ```
   example.com
   ```

2. 在域名 DNS 设置中添加 CNAME 记录：
   - 类型：CNAME
   - 名称：@ 或 www
   - 值：username.github.io

3. 重新部署后，GitHub Pages 会自动识别 CNAME 文件。

## 注意事项

- ⚠️ 首次部署可能需要几分钟时间
- ⚠️ 确保所有静态资源路径使用相对路径或正确的 base 路径
- ⚠️ 如果修改了 base 路径，需要重新构建和部署
- ⚠️ GitHub Pages 有构建时间限制（通常 10 分钟）

