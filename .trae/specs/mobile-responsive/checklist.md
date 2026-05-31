# Checklist

## Hero 区域移动端适配
- [x] 移动端 `.hero` 高度为 `100vh`，非 `300vh`
- [x] 移动端直接显示 `.hero-content`（橙光队标题 + 标语），无三幕滚动叙事
- [x] `.hero-story`（第一幕/第二幕）在移动端隐藏
- [x] `.hero-scroll-hint` 在移动端隐藏
- [x] Hero 背景粒子在移动端正常显示且性能流畅

## 全局样式移动端适配
- [x] `.section` 在移动端 padding 为 `4rem 1.25rem`
- [x] `.section-title` 在移动端最小字号 `1.5rem`，可读性良好
- [x] `.section-label::before` 在移动端宽度缩小
- [x] `.about-intro` 在移动端字号和间距适中
- [x] 480px 断点下 `.about-grid` gap 缩小
- [x] 480px 断点下 `.stat-card` padding 缩小
- [x] 480px 断点下 `.nav-logo img` 高度 48px
- [x] 480px 断点下 `.footer-logo-row img` 尺寸缩小且不溢出

## Gallery 移动端适配
- [x] 移动端 Gallery 取消水平滚动
- [x] 移动端 Gallery 图片垂直堆叠，每张占满宽度
- [x] 移动端 Gallery 图片标题 overlay 正常显示
- [x] 移动端禁用 Gallery 的 ScrollTrigger pin 动画

## 触摸交互与性能
- [x] 移动端不显示自定义光标（`.cursor-dot`, `.cursor-ring`）
- [x] 移动端不启用鼠标拖尾效果
- [x] 移动端不启用 3D tilt 卡片效果
- [x] 移动端星座网络粒子数量减少（约 30 个）
- [x] 移动端星座连线关闭
- [x] 活动卡片在移动端触摸可显示 overlay
- [x] 导航菜单按钮触摸区域至少 44x44px

## 导航与菜单
- [x] 移动端汉堡菜单按钮触摸区域足够大
- [x] 移动端菜单展开后链接可正常点击跳转
- [x] 移动端菜单链接字号和间距适中

## 时间线与成就
- [x] 时间线在移动端左侧时间轴布局正常
- [x] 时间线卡片在 480px 下 padding 适中
- [x] 成就卡片在移动端单列显示，padding 适中

## 跨设备一致性
- [x] 电脑端（1920px）所有效果与修改前完全一致
- [x] iPhone SE (375px) 无水平滚动条
- [x] iPhone 14 Pro (393px) 各 section 正常显示
- [x] iPad Mini (768px) 布局合理
