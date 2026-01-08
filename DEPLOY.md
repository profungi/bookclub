# 🚀 部署指南 (Deployment Guide)

## 快速部署到 Vercel

这是**最简单**的部署方式，完全免费！

### 步骤：

1. **将代码推送到 GitHub**
   ```bash
   # 如果还没有 Git 仓库
   git init
   git add .
   git commit -m "Initial commit: Book Club Event Finder"

   # 创建 GitHub 仓库并推送
   # 在 GitHub 上创建新仓库，然后：
   git remote add origin https://github.com/你的用户名/bookclub-finder.git
   git branch -M main
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 账号登录
   - 点击 "New Project"
   - 选择你的 `bookclub-finder` 仓库
   - 点击 "Import"

3. **配置设置**
   Vercel 会自动检测到 `vercel.json`，使用以下设置：
   - ✅ Framework Preset: Other
   - ✅ Root Directory: `.` (默认)
   - ✅ Build Command: (留空)
   - ✅ Output Directory: `public`

4. **部署！**
   - 点击 "Deploy"
   - 等待 30-60 秒
   - 完成！你会得到一个类似 `https://bookclub-finder.vercel.app` 的网址

### 自动更新

部署后，GitHub Actions 会：
- ✅ 每天凌晨 3 点（UTC）自动运行
- ✅ 抓取最新的图书馆活动数据
- ✅ 更新 `public/events.json`
- ✅ 提交到 GitHub
- ✅ Vercel 自动检测更新并重新部署（约 30 秒）

你不需要做任何事情，数据会每天自动更新！

---

## 本地测试

在部署前，可以先在本地测试：

### 方法 1: Python 服务器
```bash
cd public
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 方法 2: Node.js
```bash
cd public
npx serve
```

### 方法 3: VS Code
安装 "Live Server" 扩展，右键点击 `public/index.html` → "Open with Live Server"

---

## 手动更新数据

如果你想手动更新活动数据：

```bash
# 运行抓取脚本（需要 2-3 分钟）
python3 scripts/fetch_rss_events.py

# 查看结果
cat public/events.json | head
```

---

## 其他部署选项

### Netlify

1. 访问 [netlify.com](https://netlify.com)
2. "New site from Git"
3. 选择你的仓库
4. 设置：
   - Base directory: `public`
   - Build command: (留空)
   - Publish directory: `.`
5. Deploy!

### GitHub Pages

1. 进入仓库设置 → Pages
2. Source: Deploy from a branch
3. Branch: `main`，Folder: `/public`
4. 保存
5. 访问 `https://你的用户名.github.io/bookclub-finder/`

---

## 故障排查

### 问题：GitHub Actions 无法运行

**解决方案：**
1. 进入仓库 Settings → Actions → General
2. 确保 "Allow all actions and reusable workflows" 已选中
3. 在 "Workflow permissions" 选择 "Read and write permissions"
4. 保存

### 问题：数据没有更新

**检查：**
1. 进入仓库的 "Actions" 标签页
2. 查看最近的 workflow 运行记录
3. 如果失败，点击查看错误日志

**手动触发：**
1. 进入 Actions → "Fetch Book Club Events"
2. 点击 "Run workflow"
3. 选择 branch → "Run workflow"

### 问题：Vercel 部署失败

**检查：**
1. 确保 `vercel.json` 存在
2. 确保 `public/` 目录包含 `index.html` 和 `events.json`
3. 查看 Vercel 部署日志

---

## 自定义

### 更改配色

编辑 `public/css/styles.css`：

```css
:root {
  --primary-color: #1e3a5f;      /* 主色调 */
  --online-color: #2563eb;       /* 在线活动标签 */
  --in-person-color: #16a34a;    /* 线下活动标签 */
}
```

### 添加更多图书馆

编辑 `bookclub_gateway_rss_verified.csv`：

```csv
library_name,slug,bookclub_rss_url
New Library,newlib,https://gateway.bibliocommons.com/v2/libraries/newlib/rss/events?q=book%20club
```

然后重新运行抓取脚本。

### 更改更新频率

编辑 `.github/workflows/fetch-events.yml`：

```yaml
schedule:
  - cron: '0 3 * * *'  # 每天 3:00 AM UTC
  # 改为每 6 小时：'0 */6 * * *'
  # 改为每周一：'0 3 * * 1'
```

---

## 需要帮助？

- 📖 查看 [README.md](README.md) 了解项目详情
- 🐛 遇到问题？提交 GitHub Issue
- 💡 有建议？提交 Pull Request

---

祝你部署顺利！🎉
