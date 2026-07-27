# 移动端访问建议弹窗 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在移动端（≤768px）访问橙光队首页时，preloader 结束后弹出居中遮罩弹窗，提示用户前往电脑端获得最佳体验，点击「继续浏览」关闭并恢复滚动，每会话仅弹一次。

**Architecture:** 单文件内联实现。HTML 结构插在 `<body>` 开头（与 `.preloader` 同级）；CSS 复用现有 CSS 变量与 `.ending-cta` 按钮语言，放在 preloader 样式块之后；JS 约 20 行，函数 `showMobileNoticeIfNeeded` 在 `hidePreloader` 的 GSAP `onComplete` 回调末尾调用。检测用 `window.innerWidth <= 768` + `sessionStorage` 记录；锁滚动用 `body.overflow=hidden` + `lenis.stop()` 双保险。

**Tech Stack:** 原生 HTML/CSS/JS、GSAP（已加载）、Lenis（已加载）、sessionStorage、现有 CSS 变量。

**Spec:** [.trae/documents/mobile-notice-dialog-design.md](./mobile-notice-dialog-design.md)

---

## File Structure

| 文件 | 责任 | 变更类型 |
|------|------|----------|
| `index.html` | 单文件 SPA，新增 HTML 结构 + CSS + JS | 修改 3 处 |

所有改动集中于 `index.html`，无新文件。

---

## Task 1: 新增 HTML 结构

**Files:**
- Modify: `index.html:2058-2061`（`<body>` 与 `<!-- Noise Overlay -->` 之间）

- [ ] **Step 1: 在 `<body>` 之后、`<!-- Noise Overlay -->` 之前插入弹窗 DOM**

将：
```html
<body>

<!-- Noise Overlay -->
```
改为：
```html
<body>

<!-- 移动端访问建议弹窗 -->
<div class="mobile-notice" id="mobileNotice" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="mobileNoticeTitle">
  <div class="mobile-notice-card">
    <div class="mobile-notice-icon" aria-hidden="true">✦</div>
    <h2 class="mobile-notice-title" id="mobileNoticeTitle">建议在电脑端访问</h2>
    <p class="mobile-notice-text">为获得最佳光影叙事体验，建议使用电脑浏览。移动端部分动画效果可能存在差异。</p>
    <button class="mobile-notice-btn" id="mobileNoticeBtn" type="button">继续浏览</button>
  </div>
</div>

<!-- Noise Overlay -->
```

- [ ] **Step 2: 验证插入位置正确**

Run: `grep -n "mobileNotice" index.html`
Expected: 输出 4 行（div、div card 内含 id、h2 id、button id），行号在 2060 附近且在 `<!-- Noise Overlay -->` 之前。

---

## Task 2: 新增 CSS 样式

**Files:**
- Modify: `index.html:2046-2050`（`.data-viz` 块之后、`/* B站卡片悬浮光晕脉冲 */` 注释之前）

- [ ] **Step 1: 在 `.data-viz { background: var(--bg-elevated); }` 之后插入弹窗 CSS**

将：
```css
.data-viz {
  background: var(--bg-elevated);
}

/* B站卡片悬浮光晕脉冲 */
```
改为：
```css
.data-viz {
  background: var(--bg-elevated);
}

/* ============================================
   移动端访问建议弹窗
   ============================================ */
.mobile-notice {
  position: fixed;
  inset: 0;
  z-index: 100001;
  display: none;
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
  font-weight: 500;
  margin-bottom: 1.75rem;
}

.mobile-notice-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
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
  transform: scale(0.96);
}

/* B站卡片悬浮光晕脉冲 */
```

- [ ] **Step 2: 验证 CSS 插入完整**

Run: `grep -c "mobile-notice" index.html`
Expected: `16`（HTML 4 处 + CSS 12 处选择器/类名）。

---

## Task 3: 新增 JS 逻辑并接入 preloader 完成回调

**Files:**
- Modify: `index.html:2816-2818`（`initHeroAnimations(); initScrollAnimations();` 之后）

- [ ] **Step 1: 在 `hidePreloader` 的 `onComplete` 回调内追加调用**

将：
```javascript
          preloaderCtx.clearRect(0, 0, preloaderCanvas.width, preloaderCanvas.height);
          initHeroAnimations();
          initScrollAnimations();
        }
```
改为：
```javascript
          preloaderCtx.clearRect(0, 0, preloaderCanvas.width, preloaderCanvas.height);
          initHeroAnimations();
          initScrollAnimations();
          showMobileNoticeIfNeeded();
        }
```

- [ ] **Step 2: 在 `hidePreloader` 函数闭合 `}` 之后插入 `showMobileNoticeIfNeeded` 函数定义**

定位 `hidePreloader` 函数闭合（约 [index.html:2821](file:///workspace/index.html#L2821) 的 `}`，在 `}, wait);` 后）。在该 `}` 之后插入：

```javascript
  // 移动端访问建议弹窗（每会话一次，≤768px 触发）
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

- [ ] **Step 3: 验证 JS 插入完整且调用点正确**

Run: `grep -n "showMobileNoticeIfNeeded" index.html`
Expected: 输出 2 行——函数定义（`function showMobileNoticeIfNeeded()`）与调用点（`showMobileNoticeIfNeeded();`），调用点行号在 `initScrollAnimations();` 之后。

---

## Task 4: 运行测试验证语法与实现

**Files:**
- Test: `npm run audit`（项目现有审计脚本，[package.json](file:///workspace/package.json)）

- [ ] **Step 1: 运行审计测试，确认无回归**

Run: `cd /workspace && npm run audit 2>&1 | tail -30`
Expected: 全部测试通过（基准 40/40），无语法错误、无内容一致性破坏。

- [ ] **Step 2: 验证弹窗 DOM 与脚本无 JS 语法错误**

Run: `node --check <(sed -n '/<script>/,/<\/script>/p' index.html | sed '1d;$d') 2>&1 || echo "inline script check skipped"`
Expected: 若 `node --check` 可解析内联脚本则无输出；若因多 `<script>` 块/模板字符串导致 sed 提取不完整，则以 Step 1 的 audit 结果为准（audit 包含 DOM 解析，能捕获语法错误）。

- [ ] **Step 3: 重新生成验证报告（audit 已自动更新）**

Run: `grep -E "通过|失败|统计" verification/test-report.md | head -5`
Expected: 显示通过数与失败数，失败应为 0。

---

## Self-Review

**1. Spec 覆盖**：
- HTML 结构 → Task 1 ✓
- CSS（含变量复用、z-index、锁滚动配合、按钮风格、reduced-motion 由全局覆盖）→ Task 2 ✓
- JS（检测、sessionStorage、锁滚动 lenis.stop、{ once:true }、调用点）→ Task 3 ✓
- 边界情况（无 JS display:none、reduced-motion、桌面端不触发）→ 由 CSS 默认 `display:none` + `if (innerWidth>768) return` 覆盖 ✓
- 验证步骤 → Task 4 ✓

**2. 占位符扫描**：无 TBD/TODO，所有代码块完整。

**3. 类型/命名一致**：`mobileNotice` / `mobileNoticeBtn` / `showMobileNoticeIfNeeded` / `mobileNoticeShown`（sessionStorage key）在 Task 1/3 中一致。CSS 类名 `.mobile-notice` / `.mobile-notice-card` / `.mobile-notice-icon` / `.mobile-notice-title` / `.mobile-notice-text` / `.mobile-notice-btn` / `.visible` 在 Task 1/2 中一致。

**4. 调用点确认**：`showMobileNoticeIfNeeded()` 在 `onComplete` 回调末尾、`initScrollAnimations()` 之后调用，此时 preloader 已 `display:none`，避免双层遮罩。✓
