# 移动端适配方案 Spec

## Why
当前橙光队网站在电脑端演示效果出色，但移动端（手机）浏览存在布局拥挤、交互元素过小、Hero 区域滚动体验差等问题。需要一套精准的移动端适配方案，在不影响电脑端演示的前提下，让手机用户获得流畅、美观的浏览体验。

## What Changes
- **Hero 区域**：移动端改为单屏展示（取消 300vh 滚动叙事），直接显示最终内容，避免小屏幕上的滚动疲劳
- **导航栏**：移动端汉堡菜单已存在，需优化菜单样式和交互
- **Gallery 区域**：水平滚动改为垂直堆叠卡片，适配窄屏
- **字体与间距**：全局缩小标题字号、减少 section padding、优化行高
- **触摸交互**：移除鼠标专属效果（自定义光标、鼠标拖尾、3D tilt），保留触屏友好的交互
- **性能优化**：移动端减少粒子数量、关闭星座连线、简化动画
- **时间线**：保持左侧时间轴布局，优化卡片内边距和字号
- **活动卡片网格**：从 3 列 → 2 列 → 1 列的响应式已存在，需微调移动端间距
- **成就卡片**：2 列 → 1 列，调整 padding
- **页脚 Logo**：缩小尺寸避免溢出
- **Bilibili 卡片**：已适配，检查间距

## Impact
- 受影响文件：`index.html`（CSS 媒体查询 + JS 设备检测逻辑）
- 电脑端：零影响，所有现有效果保持不变
- 移动端：布局重构、交互简化、性能提升

## ADDED Requirements

### Requirement: 移动端 Hero 简化展示
The system SHALL detect touch devices and simplify the Hero section display.

#### Scenario: 手机用户访问
- **WHEN** 用户使用手机（`max-width: 768px` 或 `ontouchstart` 检测）访问网站
- **THEN** Hero 区域高度从 `300vh` 变为 `100vh`
- **AND** 直接显示最终内容（橙光队标题 + 标语），跳过三幕滚动叙事
- **AND** 隐藏 `.hero-scroll-hint` 滚动提示
- **AND** 保留背景粒子效果但减少数量

### Requirement: 移动端性能优化
The system SHALL reduce visual effects on mobile to ensure 60fps scrolling.

#### Scenario: 性能降级
- **WHEN** 设备为移动端
- **THEN** 星座网络粒子数量从 80 降至 30
- **AND** 关闭粒子间连线（connections）
- **AND** 禁用鼠标拖尾效果（mouse trail）
- **AND** 禁用 3D tilt 卡片效果
- **AND** 禁用自定义光标

### Requirement: 移动端触摸交互优化
The system SHALL provide touch-friendly interactions.

#### Scenario: 触摸设备交互
- **WHEN** 用户触摸屏幕
- **THEN** 活动卡片点击显示 overlay（替代 hover）
- **AND** 导航菜单按钮放大至 44x44px 触摸区域
- **AND** 所有链接和按钮有足够的触摸目标（最小 44px）

## MODIFIED Requirements

### Requirement: 响应式断点增强
现有 `@media (max-width: 768px)` 断点保持不变，新增 `@media (max-width: 480px)` 精细化规则：

- `.section` padding 从 `clamp(7rem, 12vw, 12rem) clamp(1.5rem, 5vw, 5rem)` 调整为移动端 `4rem 1.25rem`
- `.section-title` 最小字号确保手机可读（不小于 1.5rem）
- `.about-grid` 从 4 列 → 2 列（已存在），480px 下保持 2 列但缩小 gap
- `.gallery-item` 宽度从 500px 变为 100% 宽度，高度自适应
- `.nav-logo img` 高度从 88px 缩小至 48px
- `.footer-logo-row img:first-child` 高度从 140px 缩小至 80px

### Requirement: Gallery 移动端重构
The system SHALL change gallery layout on mobile.

#### Scenario: 窄屏浏览荣誉见证
- **WHEN** 屏幕宽度小于 768px
- **THEN** 取消水平滚动（ScrollTrigger pin）
- **AND** 图片垂直堆叠显示，每张占满宽度
- **AND** 保留图片标题 overlay

## REMOVED Requirements
无移除需求，所有修改均为渐进增强。
