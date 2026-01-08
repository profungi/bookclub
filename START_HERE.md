# 🚀 快速开始

## 本地运行网站

```bash
cd public
python3 -m http.server 8000
```

然后在浏览器打开：`http://localhost:8000`

## 你会看到什么

### 主页表格
表格显示所有**未来的**读书俱乐部活动（自动隐藏已过期活动），列：

1. **Event Name** - 活动名称（点击查看详情）
2. **Type** - 蓝色 ONLINE 或 绿色 IN PERSON 标签
3. **Library** - 图书馆名称
4. **Date & Time** - 日期时间（如：Tue · Jan 23 · 7:00 PM）
5. **Day of Week** - 🆕 星期可视化槽：
   ```
   [M][T][W][T✓][F][S][S]  ← 周四活动（第4个槽是绿色）
   ```
6. **Details** - "View →" 链接

### 功能

✅ **搜索框** - 输入关键词搜索活动、图书馆
✅ **快速筛选** - Today, Tomorrow, This Week, This Month, Next Month
✅ **高级筛选** - 在线/线下、按州筛选
✅ **自动过滤** - 已过期的活动自动隐藏
✅ **响应式** - 手机、平板、桌面都完美显示

### 星期槽说明

7 个方格代表一周：
- **M** = Monday（周一）
- **T** = Tuesday（周二）
- **W** = Wednesday（周三）
- **T** = Thursday（周四）
- **F** = Friday（周五）
- **S** = Saturday（周六）
- **S** = Sunday（周日）

活动当天的槽会高亮显示为**绿色** ✅

## 测试星期槽

```bash
# 在浏览器中打开测试页面
open test_week_slots.html  # Mac
xdg-open test_week_slots.html  # Linux
```

## 查看文档

- **WEEK_SLOTS_FEATURE.md** - 星期槽功能详细说明
- **EXPIRED_EVENTS_FILTER.md** - 过期活动过滤说明
- **CHANGELOG.md** - 更新日志
- **TABLE_VIEW.md** - 表格视图说明
- **DEPLOY.md** - 部署指南（中文）
- **README.md** - 完整项目说明

## 更新数据

```bash
# 重新抓取最新活动（需要 2-3 分钟）
python3 scripts/fetch_rss_events.py
```

## 有问题？

检查这些常见问题：

1. **端口被占用？** 换个端口：`python3 -m http.server 9000`
2. **表格是空的？** 检查 `public/events.json` 是否存在
3. **星期槽不显示？** 打开浏览器控制台查看 JavaScript 错误

---

**现在就试试吧！** 🎉
