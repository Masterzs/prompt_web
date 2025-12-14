# 工作流失败排查指南

## 🔍 如何查看失败原因

### 步骤 1：打开失败的工作流

1. 访问：https://github.com/Masterzs/prompt_web/actions
2. 点击最新的失败工作流（红色 ❌ 标记）
3. 点击 "build" 作业（左侧）

### 步骤 2：查看失败的步骤

在构建日志中，找到失败的步骤：
- 如果是 "Install dependencies" 失败 → 依赖安装问题
- 如果是 "Build" 失败 → 构建过程问题
- 如果是 "Verify build output" 失败 → 构建输出问题

### 步骤 3：查看错误信息

展开失败的步骤，查看具体的错误信息：
- 复制错误信息
- 查看完整的错误堆栈

## 🐛 常见失败原因及解决方案

### 问题 1：TypeScript 编译错误

**错误信息示例：**
```
error TS2307: Cannot find module './xxx'
```

**解决方案：**
- 检查导入路径是否正确
- 检查文件是否存在
- 修复 TypeScript 错误

### 问题 2：依赖安装失败

**错误信息示例：**
```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

**解决方案：**
- 检查 `package.json` 和 `package-lock.json` 是否同步
- 确保所有依赖版本兼容

### 问题 3：构建失败

**错误信息示例：**
```
Error: Build failed
```

**解决方案：**
- 检查 `vite.config.ts` 配置
- 检查是否有语法错误
- 查看完整的构建日志

### 问题 4：验证步骤失败

**错误信息示例：**
```
ERROR: dist directory not found!
```

**解决方案：**
- 说明构建没有成功生成 `dist` 目录
- 需要先修复构建问题

## 🔧 快速修复步骤

### 方案 1：简化工作流（临时）

如果验证步骤导致失败，可以暂时注释掉验证步骤：

```yaml
# - name: Verify build output
#   run: |
#     ...
```

### 方案 2：检查本地构建

在本地测试构建：

```bash
# 设置环境变量
$env:NODE_ENV = "production"
$env:VITE_BASE_PATH = "/prompt_web/"

# 构建
npm run build

# 检查输出
ls dist/
cat dist/index.html
```

### 方案 3：查看完整日志

1. 在 GitHub Actions 页面
2. 点击失败的工作流
3. 点击 "build" 作业
4. 展开所有步骤
5. 查看每个步骤的完整输出

## 📋 检查清单

在推送新代码前，确保：

- [ ] 本地可以成功运行 `npm run build`
- [ ] `dist/` 目录生成成功
- [ ] `dist/index.html` 存在且内容正确
- [ ] 没有 TypeScript 错误
- [ ] `package.json` 和 `package-lock.json` 已提交

## 🔄 重新触发工作流

### 方法 1：推送新提交

```bash
git add .
git commit -m "Fix workflow issues"
git push origin main
```

### 方法 2：手动触发

1. 访问：https://github.com/Masterzs/prompt_web/actions
2. 点击左侧 "Deploy to GitHub Pages"
3. 点击 "Run workflow"
4. 选择分支 `main`
5. 点击 "Run workflow"

## 💡 调试技巧

### 查看工作流文件

确认 `.github/workflows/deploy.yml` 文件：
- 已推送到 GitHub
- 语法正确（YAML 格式）
- 没有缩进错误

### 检查文件路径

确认工作流文件路径正确：
- `.github/workflows/deploy.yml`
- 不是 `.github/workflow/deploy.yml`（少了一个 s）

### 查看 Actions 权限

确认仓库设置中：
- Actions 已启用
- 有足够的权限运行工作流

## 🔗 相关链接

- **Actions 页面**：https://github.com/Masterzs/prompt_web/actions
- **工作流文件**：https://github.com/Masterzs/prompt_web/blob/main/.github/workflows/deploy.yml
- **Pages 设置**：https://github.com/Masterzs/prompt_web/settings/pages

## 📞 需要帮助？

如果按照以上步骤仍无法解决问题，请提供：
1. 失败工作流的完整日志
2. 失败的具体步骤名称
3. 错误信息的完整内容

