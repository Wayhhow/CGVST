# 移动端访问建议弹窗 设计文档

## 概述

在移动端（`window.innerWidth <= 768`）访问橙光队首页时，弹出居中遮罩弹窗，提示用户前往电脑端获得最佳光影叙事体验，并说明移动端可能存在的动画差异。用户点击「继续浏览」按钮后关闭弹窗、恢复滚动，可继续在手机端浏览。

## 背景与根因

移动端 Hero 三幕叙事（起初→汇聚→橙光队）依赖 300vh 滚动驱动，但 heroReveal 为 `position:fixed; z-index:3` 钉在视口，在移动端窄屏上长时间遮挡后续内容；About 区块向上滚动时被钉住的橙光队完全遮蔽，直到滚动接近末尾才整体淡出，导致 01 About「突然闪现」。在移动端难以保证与桌面端一致的叙事体验，故改为**主动提示**而非强行修复动画。

## 用户决策

| 维度 | 决策 |
|------|------|
| 弹窗频率 | 每会话一次（`sessionStorage` 记录） |
| 检测范围 | `window.innerWidth <= 768`（与移动端菜单断点一致） |
| 关闭方式 | 仅确认键 + 锁滚动（必须点按钮，弹窗期间禁止背景滚动） |
| 文案风格 | 简洁诗意 |
| 出现时机 | preloader 结束后（避免双层遮罩） |

## 实现方案

**选定方案 A**：HTML 内联结构 + CSS（复用现有变量）+ 极简 JS，全部写入 `index.html`，与项目单文件架构一致。

落选方案：
- 方案 B（JS `createElement` 注入）：结构与样式分离、难预览，违背项目约定。
- 方案 C（复用 preloader 带 canvas 动画）：过度设计，与"提示去桌面端"目的相悖。

## 详细设计

### 1. HTML 结构

插入位置：`<body>` 开头，与现有 `.preloader` 同级。

```html
<div class="mobile-notice" id="mobileNotice" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="mobileNoticeTitle">
  <div class="mobile-notice-card">
    <div class="mobile-notice-icon" aria-hidden="true">✦</div>
    <h2 class="mobile-notice-title" id="mobileNoticeTitle">建议在电脑端访问</h2>
    <p class="mobile-notice-text">为获得最佳光影叙事体验，建议使用电脑浏览。移动端部分动画效果可能存在差异。</p>
    <button class="mobile-notice-btn" id="mobileNoticeBtn" type="button">继续浏览</button>
  </div>
</div>
```

### 2. CSS

复用现有 CSS 变量：`--bg-elevated`、`--border-glow`、`--orange-primary`、`--text-warm`、`--text-muted`、`--font-serif`、`--ease-out-expo`。

```css
.mobile-notice {
  position: fixed;
  inset: 0;
  z-index: 100001;             /* 高于 preloader 的 100000 */
  display: none;               /* JS 检测通过后才置 flex */
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(10, 10, 10, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s var(--ease-out-expo);
}

.mobile-notice.visible {
  opacity: 1;
  pointer-events: auto;
}

.mobile-notice-card {
  max-width: 86vw;
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border-glow);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 107, 53, 0.08);
  transform: translateY(10px);
  transition: transform 0.4s var(--ease-out-expo);
}

.mobile-notice.visible .mobile-notice-card {
  transform: translateY(0);
}

.mobile-notice-icon {
  font-size: 2rem;
  color: var(--orange-primary);
  margin-bottom: 1rem;
  line-height: 1;
}

.mobile-notice-title {
  font-family: var(--font-serif);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-warm);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

.mobile-notice-text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-muted);
  font-weight: 500;            /* 沿用 C7 描述文字加粗约定 */
  margin-bottom: 1.75rem;
}

.mobile-notice-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;            /* WCAG 2.2 触控尺寸 */
  padding: 0.75rem 2rem;
  border: 1px solid var(--orange-primary);
  border-radius: 100px;
  background: transparent;
  color: var(--orange-primary);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  cursor: pointer;
  transition: background 0.3s, color 0.3s, transform 0.2s;
}

.mobile-notice-btn:hover {
  background: var(--orange-primary);
  color: var(--bg-dark);
}

.mobile-notice-btn:active {
  transform: scale(0.96);       /* 触屏反馈 */
}
```

**无障碍与降级**：
- `prefers-reduced-motion`：被全局规则 `html.reduced-motion *` 覆盖（[index.html:60-68](file:///workspace/index.html#L60-L68)），动画时长归零，弹窗仍可见可关闭。
- 无 JS：CSS 默认 `display:none`，不阻断访问。

### 3. JS 逻辑

约 20 行，置于 preloader 完成回调附近（[index.html:2803-2805](file:///workspace/index.html#L2803-L2805) `onComplete` 内）。

```js
function showMobileNoticeIfNeeded() {
  if (window.innerWidth > 768) return;
  if (sessionStorage.getItem('mobileNoticeShown')) return;

  const notice = document.getElementById('mobileNotice');
  const btn = document.getElementById('mobileNoticeBtn');
  if (!notice || !btn) return;

  notice.style.display = 'flex';
  requestAnimationFrame(() => {
    notice.classList.add('visible');
    notice.setAttribute('aria-hidden', 'false');
  });

  // 锁滚动：body + Lenis 双保险
  document.body.style.overflow = 'hidden';
  if (window.lenis) lenis.stop();

  btn.addEventListener('click', () => {
    notice.classList.remove('visible');
    notice.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) lenis.start();
    sessionStorage.setItem('mobileNoticeShown', '1');
    setTimeout(() => { notice.style.display = 'none'; }, 400);
  }, { once: true });
}
```

**调用点**：在 `hidePreloader` 的 GSAP `onComplete` 回调末尾追加 `showMobileNoticeIfNeeded();`。

### 4. 边界情况

| 情况 | 处理 |
|------|------|
| `prefers-reduced-motion: reduce` | 全局规则压动画到 0.001ms，弹窗立即可见可关闭 |
| 关闭后横屏变宽 (>768) | 本会话已记录，不再弹（符合"每会话一次"） |
| 无 JS | CSS 默认 `display:none`，不阻断访问 |
| 与移动端菜单共存 | 弹窗 z-index 100001 高于 nav(9000)/mobile-menu，锁滚动期间菜单无法误开 |
| 重复点击按钮 | `{ once: true }` 防重复绑定 |
| 慢网 preloader 未结束 | 弹窗在 `onComplete` 内触发，preloader 期间不弹 |

## 验证步骤

1. **移动端触发**：DevTools 切到 iPhone/Android 视口（≤768px）→ 加载页 → preloader 结束后约 0.4s 弹出居中弹窗，背景模糊。
2. **锁滚动**：弹窗期间尝试滑动背景 → 无滚动响应。
3. **关闭**：点「继续浏览」→ 弹窗淡出（0.4s）→ 背景可滚动。
4. **每会话一次**：关闭后刷新页面 → 不再弹出；关闭浏览器标签重开 → 再次弹出。
5. **桌面端无弹窗**：≥769px 视口加载 → 无弹窗，DOM 中 `.mobile-notice` 保持 `display:none`。
6. **无障碍**：屏幕阅读器朗读 dialog 标题与正文；按钮可达、可激活。
7. **回归**：`npm run audit` 通过（不破坏现有 40 项测试）；移动端汉堡菜单、Escape/遮罩关闭仍正常。

## 文件清单

| 文件 | 变更类型 |
|------|----------|
| `index.html` | 新增 HTML 结构（body 开头）+ CSS（preloader 样式后）+ JS（preloader 完成回调附近） |

## 假设与决策

- 不引入新框架/文件，保持单文件架构。
- 不修改 Hero 三幕动画逻辑（移动端叙事遮挡问题通过"提示去桌面端"绕开，不再尝试在移动端强行修复）。
- 不执行 git 提交（用户未要求）。
- `sessionStorage` 而非 `localStorage`：避免长期记录导致老用户永不再见提示。
