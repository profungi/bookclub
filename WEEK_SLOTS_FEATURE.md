# 📅 星期槽功能说明

## 功能描述

在表格的 "Day of Week" 列，每个活动都会显示一个**可视化的星期槽**：

- 7 个方格，代表周一到周日（Mon-Sun）
- 默认所有槽都是灰色
- 活动当天对应的槽会**高亮显示为绿色**

## 视觉示例

### 周四的活动：
```
┌───┬───┬───┬───┬───┬───┬───┐
│ M │ T │ W │ T │ F │ S │ S │
│   │   │   │ ✓ │   │   │   │
└───┴───┴───┴───┴───┴───┴───┘
     灰  灰  灰  绿  灰  灰  灰
```

### 周日的活动：
```
┌───┬───┬───┬───┬───┬───┬───┐
│ M │ T │ W │ T │ F │ S │ S │
│   │   │   │   │   │   │ ✓ │
└───┴───┴───┴───┴───┴───┴───┘
     灰  灰  灰  灰  灰  灰  绿
```

## 标签说明

- **桌面模式**（宽屏）：单字母 `M T W T F S S`
- **移动模式**（窄屏）：槽会自动缩小，保持单字母显示

槽的顺序从左到右：
1. M = Monday（周一）
2. T = Tuesday（周二）
3. W = Wednesday（周三）
4. T = Thursday（周四）
5. F = Friday（周五）
6. S = Saturday（周六）
7. S = Sunday（周日）

## 为什么这样设计？

### 优势：
1. **快速识别** - 一眼就能看出活动在星期几
2. **视觉模式** - 可以快速发现某一天特别多活动
3. **紧凑高效** - 占用空间小，不影响表格整体布局
4. **直观清晰** - 比纯文本更容易理解

### 与其他选项对比：
- ❌ **纯文本**（"Thursday"）- 占空间，不够直观
- ❌ **书籍信息** - 很多活动没有书籍数据
- ✅ **星期槽** - 每个活动都有日期，视觉化更好

## 技术实现

### HTML 结构
```html
<div class="week-slots">
  <div class="week-slot">M</div>
  <div class="week-slot">T</div>
  <div class="week-slot">W</div>
  <div class="week-slot active">T</div>  <!-- 绿色 -->
  <div class="week-slot">F</div>
  <div class="week-slot">S</div>
  <div class="week-slot">S</div>
</div>
```

### CSS 样式
- 灰色槽：`#e5e7eb` 背景
- 绿色槽：`#16a34a` 背景（活动当天）
- 响应式：在小屏幕上自动缩小尺寸

### JavaScript 逻辑
```javascript
generateWeekSlots(event.start_date)
```
函数会：
1. 解析 ISO 日期
2. 确定是星期几
3. 生成 7 个槽的 HTML
4. 高亮对应的槽

## 响应式设计

| 屏幕宽度 | 槽大小 | 字体大小 |
|---------|--------|---------|
| > 1200px | 28×28px | 11px |
| 768-1200px | 24×24px | 10px |
| < 768px | 20×20px | 9px |

## 测试

打开测试页面查看效果：
```bash
# 在浏览器中打开
test_week_slots.html
```

测试页面会显示：
- 周一活动的槽（第一个是绿色）
- 周四活动的槽（第四个是绿色）
- 周日活动的槽（第七个是绿色）

## 使用示例

当你运行网站时，表格看起来像：

| Event Name | Type | Library | Date & Time | Day of Week | Details |
|-----------|------|---------|-------------|-------------|---------|
| Mystery Club | ONLINE | Santa Clara | Tue·Jan 23·7PM | [M][T✓][W][T][F][S][S] | View → |
| Fiction Group | IN PERSON | Chicago | Thu·Jan 25·6PM | [M][T][W][T✓][F][S][S] | View → |

（✓ 表示绿色高亮的槽）

---

这个设计既美观又实用，让用户能快速找到特定星期的活动！
