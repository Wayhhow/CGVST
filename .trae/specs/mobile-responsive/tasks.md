# Tasks

## Task 1: Hero 区域移动端简化
- [x] 在 CSS 中添加 `@media (max-width: 768px)` 规则：
  - `.hero` 高度从 `300vh` 改为 `100vh`
  - `.hero-story`（第一幕/第二幕叙事）隐藏
  - `.hero-content` 直接显示，移除 `.hidden` 状态
  - `.hero-scroll-hint` 隐藏
  - `.hero-canvas` 粒子数量减少（通过 JS 检测 `isTouchDevice`）
- [x] 在 JS 中添加 `const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;`
- [x] 当 `isTouchDevice` 为 true 时，跳过三幕滚动叙事逻辑，直接显示最终内容

## Task 2: 全局移动端样式优化
- [x] 在现有 `@media (max-width: 768px)` 中补充：
  - `.section` padding 改为 `4rem 1.25rem`
  - `.section-title` 确保最小字号 `1.5rem`
  - `.section-label::before` 宽度从 40px 改为 24px
  - `.about-intro` 字号缩小，margin-bottom 减少
- [x] 新增 `@media (max-width: 480px)` 规则：
  - `.about-grid` gap 缩小为 `0.75rem`
  - `.stat-card` padding 缩小
  - `.nav-logo img` 高度改为 48px
  - `.footer-logo-row img:first-child` 高度改为 80px
  - `.footer-logo-row img:last-child` 高度改为 28px

## Task 3: Gallery 移动端重构
- [x] 在 `@media (max-width: 768px)` 中添加：
  - `.gallery-section` 取消 `overflow: hidden`
  - `.gallery-track` 改为 `flex-direction: column`，取消 `will-change: transform`
  - `.gallery-item` 宽度改为 `100%`，高度改为 `auto`（或 `240px`）
  - `.gallery-item img` 保持 `object-fit: cover`
- [x] 在 JS 中检测移动端，禁用 Gallery 的 ScrollTrigger pin 和水平滚动动画

## Task 4: 触摸交互与性能优化
- [x] 在 JS 顶部添加 `isTouchDevice` 检测
- [x] 当 `isTouchDevice` 时：
  - 禁用自定义光标（已在 CSS 中 `display: none`，确认生效）
  - 禁用鼠标拖尾效果（`initMouseTrail` 直接 return）
  - 禁用 3D tilt 效果（不绑定 `mousemove` 事件）
  - 星座网络粒子数量从 `Math.min(80, ...)` 改为 `Math.min(30, ...)`
  - 关闭星座连线（connections loop 跳过）
- [x] 活动卡片触摸交互：
  - 为 `.activity-card` 添加 `touchstart` 事件，点击切换 overlay 显示
  - 或改为始终显示 overlay（`transform: translateY(0)`）

## Task 5: 导航与菜单优化
- [x] 检查 `.nav-menu-btn` 触摸区域：
  - 确保按钮尺寸至少 44x44px
  - 增加 `padding` 或 `min-width/min-height`
- [x] `.mobile-menu` 样式优化：
  - 链接字号在 480px 下适当缩小
  - 增加链接间距，便于触摸

## Task 6: 时间线与成就卡片微调
- [x] 时间线 `@media (max-width: 768px)` 已存在，检查并优化：
  - `.tl-content` padding 在 480px 下缩小为 `1.25rem`
  - `.tl-title` 字号确保可读
- [x] 成就卡片 `@media (max-width: 768px)` 已存在（1 列），检查：
  - `.achievement-card` padding 在 480px 下缩小

## Task 7: 测试与验证
- [x] 使用 Chrome DevTools 设备模拟器测试：
  - iPhone SE (375px)
  - iPhone 14 Pro (393px)
  - iPad Mini (768px)
- [x] 检查各 section 是否正常显示，无水平滚动条
- [x] 检查触摸交互是否流畅
- [x] 确认电脑端（1920px）无任何变化

# Task Dependencies
- Task 2 依赖 Task 1（Hero 简化后 section 间距需要重新协调）
- Task 4 依赖 Task 1（性能优化与 Hero 简化同步进行）
- Task 7 依赖所有其他 Task 完成
