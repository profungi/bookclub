# 更新日志

## 2026-01-08 - 表格视图更新

### 更改内容

1. **移除所有图片**
   - 删除了卡片上的活动图片（RSS 图片链接不可用）
   - 删除了详情页的大图显示
   - 网站现在完全基于文本

2. **从卡片改为表格视图**
   - 主页现在使用表格形式显示所有活动
   - 表格列：
     - **Event Name** - 活动名称（可点击查看详情）
     - **Type** - 在线/线下标签（ONLINE / IN PERSON）
     - **Library** - 图书馆名称
     - **Date & Time** - 日期和时间
     - **Book** - 讨论的书籍（标题和作者）
     - **Details** - 查看详情链接

3. **保留的功能**
   - ✅ 搜索功能正常
   - ✅ 快速筛选（Today, Tomorrow, This Week, This Month, Next Month）
   - ✅ 高级筛选（在线/线下、按州筛选）
   - ✅ 移动端响应式（表格可横向滚动）
   - ✅ 详情页完整信息
   - ✅ 自动数据更新

### 技术改动

- 更新 `public/index.html` - 改为表格结构
- 更新 `public/css/styles.css` - 添加表格样式，移除图片样式
- 更新 `public/js/search.js` - 渲染表格行而不是卡片
- 更新 `public/event.html` - 移除图片显示

### 如何使用

本地运行：
```bash
cd public
python3 -m http.server 8000
# 访问 http://localhost:8000
```

部署方式不变，请参考 DEPLOY.md
