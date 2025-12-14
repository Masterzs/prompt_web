# Git 上传步骤

## 如果 Git 命令无法识别

### 方法 1：重启终端
1. 关闭当前终端/命令行窗口
2. 重新打开 PowerShell 或 CMD
3. 再次尝试 git 命令

### 方法 2：手动添加到 PATH
1. 找到 Git 安装目录（通常在 `C:\Program Files\Git\cmd`）
2. 添加到系统环境变量 PATH 中

### 方法 3：使用完整路径
如果 Git 安装在 `C:\Program Files\Git\cmd\git.exe`，使用：
```powershell
& "C:\Program Files\Git\cmd\git.exe" --version
```

## 上传步骤

### 1. 初始化仓库
```bash
git init
```

### 2. 配置用户信息（首次使用）
```bash
git config --global user.name "Masterzs"
git config --global user.email "your.email@example.com"
```

### 3. 添加远程仓库
```bash
git remote add origin https://github.com/Masterzs/prompt_web.git
```

如果已存在，使用：
```bash
git remote set-url origin https://github.com/Masterzs/prompt_web.git
```

### 4. 添加所有文件
```bash
git add .
```

### 5. 提交
```bash
git commit -m "Initial commit: Prompt Hub with anti-crawl and robustness features"
```

### 6. 推送到 GitHub
```bash
git branch -M main
git push -u origin main
```

## 认证问题

如果推送时要求输入用户名和密码：
- **用户名**: Masterzs
- **密码**: 使用 Personal Access Token（不是 GitHub 密码）

### 生成 Token：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 勾选 `repo` 权限
4. 生成后复制 token，作为密码使用

## 使用 GitHub Desktop（推荐）

如果命令行有问题，可以使用 GitHub Desktop：
1. 下载：https://desktop.github.com/
2. 登录 GitHub 账号
3. File → Add Local Repository → 选择项目目录
4. 点击 Publish repository

