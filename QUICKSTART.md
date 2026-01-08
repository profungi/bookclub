# 🚀 快速开始指南

## 本地测试（1 分钟）

```bash
# 1. 进入网站目录
cd public

# 2. 启动服务器（选择一个）
python3 -m http.server 8000

# 3. 打开浏览器
# 访问 http://localhost:8000
```

就这么简单！网站已经可以运行了。

---

## 部署到 Vercel（5 分钟）

### 第一次部署

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "Book Club Event Finder"

   # 在 GitHub 上创建新仓库，然后：
   git remote add origin https://github.com/你的用户名/bookclub-finder.git
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 用 GitHub 登录
   - "New Project" → 选择你的仓库 → "Import"
   - 点击 "Deploy"
   - 等待 30 秒
   - 完成！🎉

### 自动更新

部署后，GitHub Actions 会每天自动：
- 抓取最新活动数据
- 更新 events.json
- 触发 Vercel 重新部署

你不需要做任何事情！

---

## 更新数据（手动）

如果你想立即更新数据：

```bash
# 运行抓取脚本（2-3 分钟）
python3 scripts/fetch_rss_events.py

# 查看结果
head public/events.json
```

---

## 自定义

### 更改颜色

编辑 `public/css/styles.css`，找到 `:root` 部分：

```css
:root {
  --primary-color: #1e3a5f;      /* 改成你喜欢的颜色 */
  --online-color: #2563eb;
  --in-person-color: #16a34a;
}
```

### 添加图书馆

编辑 `bookclub_gateway_rss_verified.csv`：

```csv
library_name,slug,bookclub_rss_url
New Library,newlib,https://gateway.bibliocommons.com/v2/libraries/newlib/rss/events?q=book%20club
```

然后运行 `python3 scripts/fetch_rss_events.py`

---

## 故障排查

### GitHub Actions 没有运行？

1. 仓库 Settings → Actions → General
2. 选择 "Allow all actions"
3. Workflow permissions → "Read and write permissions"
4. 保存

### 手动触发更新

1. 进入仓库的 Actions 标签
2. 点击 "Fetch Book Club Events"
3. "Run workflow" → 选择分支 → "Run workflow"

---

## 需要更多帮助？

- 📖 详细说明：[README.md](README.md)
- 🚀 部署指南：[DEPLOY.md](DEPLOY.md)
- 📊 项目总结：[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

就是这样！享受你的图书俱乐部活动查找器吧！📚
