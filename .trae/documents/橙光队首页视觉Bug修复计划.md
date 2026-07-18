# 橙光队首页视觉 Bug 修复计划

## Summary

对橙光队首页 `index.html`（4131 行，单文件 SPA：GSAP + Lenis + 多层 Canvas）进行**视觉 Bug 系统化排查与修复**。聚焦用户重点关注的：移动端错位、动画时机冲突、Hero 向下滚动提示与渐变渐显效果。**不改任何内容**（文字/数字/链接/图片），只修显示效果。

调研依据：CSS 滚动驱动动画最佳实践（2026）、移动端汉堡菜单动画规范（Material Design / WCAG 2.2）、Awwwards 级 Hero 过渡模式。

---

## Current State Analysis（排查结果）

### 排查方法
- **Systematic Debugging Phase 0-1**：提取关键词（hero-scroll-hint / hero-story / @media / isTouchDevice），代码审查 + git history
- **网络调研**：CSS scroll-driven animations、mobile hamburger menu animation、aria-expanded accessibility
- **代码审查**：13 个 `@media (max-width)` 断点、3 个 Canvas 层、4 个 resize 监听、`isTouchDevice` 7 处使用点

### 发现的 Bug 清单（按类别 + 严重性）

#### A. 移动端布局错位（用户重点关注）

| # | 位置 | Bug | 严重性 |
|---|------|-----|--------|
| A1 | [index.html:2046](file:///workspace/index.html#L2046) | nav-logo `<img>` inline `style="height:80px;width:auto;"` 覆盖了 768px 媒体查询的 `.nav-logo img { height: 48px; }`（[line 1829](file:///workspace/index.html#L1829)）。**移动端 logo 实际仍为 80px，48px 规则失效** | 🔴 高 |
| A2 | [index.html:1817-1821](file:///workspace/index.html#L1817-L1821) | data-viz 移动端 `margin: 2rem 1rem 0`，但 timeline-item 移动端 `padding-left: 3rem`（[line 930](file:///workspace/index.html#L930)）。**data-viz 比 timeline 卡片左移 2rem，视觉错位** | 🔴 高 |
| A3 | [index.html:901,1355,1406,335](file:///workspace/index.html#L901) | `.tl-link / .ending-cta / .bilibili-card / .nav-menu-btn` 的 `cursor: none` 未在 768px 媒体查询中重置。混合设备（触屏+鼠标，如 iPad+键盘）光标消失 | 🟡 中 |

#### B. Hero 滚动提示与渐变效果（用户重点关注："一般般"）

| # | 位置 | Bug | 严重性 |
|---|------|-----|--------|
| B1 | [index.html:3272-3283](file:///workspace/index.html#L3272-L3283) | `.hero-scroll-hint` 仅在 heroProgress ≥ 0.95（滚动 95%）时才随 hero 一起淡出。**前 95% 始终固定在底部，遮挡感强** | 🔴 高 |
| B2 | [index.html:3398-3404, 3436-3442](file:///workspace/index.html#L3398-L3442) | `.hero-scroll-hint` 的 GSAP opacity 动画**重复定义两次**（一次在 `!isTouchDevice` 块内，一次在外），冗余且可能冲突 | 🟢 低 |
| B3 | [index.html:438](file:///workspace/index.html#L438) | `.hero-content { transition: opacity 1s ease, transform 1s ease; }` 但 JS 在滚动中直接 `style.opacity/transform`。**1s 过渡造成滚动"拖影"延迟**（用户滚动了，内容 1s 后才追上） | 🔴 高 |
| B4 | [index.html:390](file:///workspace/index.html#L390) | `.hero-story { transition: opacity 0.8s ease, transform 0.8s ease; }` 同 B3，滚动驱动与 CSS 过渡冲突 | 🔴 高 |
| B5 | [index.html:598-603](file:///workspace/index.html#L598-L603) | `@keyframes scroll-line-anim` 在 50.1% 切换 `transform-origin`，CSS 不平滑插值该属性，可能产生视觉跳变 | 🟡 中 |
| B6 | [index.html:571-603](file:///workspace/index.html#L571-L603) | 滚动提示设计单薄（"Scroll" + 1px 细线），**用户评价"一般般"**。缺少箭头/鼠标图标/弹动反馈 | 🔴 高 |
| B7 | [index.html:3316](file:///workspace/index.html#L3316) | `storyFire.style.opacity = 1 - phase2Progress * 0.5` 第二幕只淡到 0.5 不归零，第三幕靠 class hidden 切换，**过渡不连续** | 🟡 中 |
| B8 | [index.html:3300-3328](file:///workspace/index.html#L3300-L3328) | 三幕之间仅 opacity 切换，**无 blur/scale/slide 组合**，渐变渐显效果"一般般" | 🔴 高 |

#### C. 移动端菜单问题

| # | 位置 | Bug | 严重性 |
|---|------|-----|--------|
| C1 | [index.html:1610](file:///workspace/index.html#L1610) | `.mobile-menu { transition: opacity 0.5s; }` **仅淡入**。2026 最佳实践为 200-300ms 滑入。当前 500ms 偏慢且无位移 | 🟡 中 |
| C2 | [index.html:2917-2919](file:///workspace/index.html#L2917-L2919) | 汉堡→X 转换 `rotate(45deg) translate(4px, 4px)`，24px 宽/5px 间距下应约为 5px 才对齐成完美 X | 🟢 低 |
| C3 | [index.html:2056](file:///workspace/index.html#L2056) | 菜单按钮无 `aria-expanded` 状态切换，屏幕阅读器不知开关 | 🟡 中 |
| C4 | - | 无 Escape 键关闭菜单、无点击遮罩关闭 | 🟡 中 |
| C5 | - | 菜单打开时未锁定 body 滚动，背后页面仍可滚 | 🟡 中 |
| C6 | [index.html:1618-1624](file:///workspace/index.html#L1618-L1624) | 移动菜单链接仅有 `:hover` 状态，触屏无 `:active` 反馈 | 🟢 低 |

#### D. 移动端性能

| # | 位置 | Bug | 严重性 |
|---|------|-----|--------|
| D1 | [index.html:3936-3995](file:///workspace/index.html#L3936-L3995) | **星座网络粒子未检测 isTouchDevice！** checklist（[specs/mobile-responsive/checklist.md:30-31](file:///workspace/.trae/specs/mobile-responsive/checklist.md#L30-L31)）声称已关闭，实际代码在移动端仍跑 80 粒子 O(n²) 连线 | 🔴 高 |
| D2 | [index.html:1902-1915](file:///workspace/index.html#L1902-L1915) | `.ending::before` 800px 圆 + 4s 无限 scale 动画，移动端 GPU 负担 | 🟡 中 |
| D3 | [index.html:1531-1549](file:///workspace/index.html#L1531-L1549) | `.deco-circle-1/2/3`（400/300/200px）用负偏移定位，移动端不可见但仍占 DOM + 触发 paint | 🟢 低 |

#### E. 其他视觉细节

| # | 位置 | Bug | 严重性 |
|---|------|-----|--------|
| E1 | [index.html:1852-1868](file:///workspace/index.html#L1852-L1868) | `.section::before` 1px 橙光扫线在移动端过细，几乎不可见 | 🟢 低 |
| E2 | [index.html:571-582](file:///workspace/index.html#L571-L582) | `.hero-scroll-hint` `position: fixed; bottom: 3rem` 在矮屏（如横屏 375x320）可能与 story 文本重叠 | 🟢 低 |

---

## Proposed Changes（修复方案）

### 阶段 1：移动端布局对齐修复

#### Fix A1: Nav logo 移动端尺寸生效
- **文件**: [index.html:2046](file:///workspace/index.html#L2046)
- **改动**: 移除 inline `style="height:80px;width:auto;"`，让 CSS 规则自然生效
- **HTML 改为**:
  ```html
  <img src="assets/images/队徽_致诚橙光.png" alt="橙光队队徽" width="80" height="80">
  ```
- **CSS 保留** [line 273-278](file:///workspace/index.html#L273-L278): `.nav-logo img { height: 80px; }` + [line 1829](file:///workspace/index.html#L1829): `@media (max-width:768px) { .nav-logo img { height: 48px; } }`

#### Fix A2: Data-viz 与 timeline 卡片对齐
- **文件**: [index.html:1817-1821](file:///workspace/index.html#L1817-L1821)
- **改动**: 移动端 data-viz margin 改为与 tl-content 对齐
- **CSS 改为**:
  ```css
  @media (max-width: 768px) {
    .data-viz {
      padding: 1.5rem;
      margin: 2rem 0 2rem 3rem;  /* 与 .timeline-item padding-left: 3rem 对齐 */
      max-width: calc(100% - 3rem);
    }
  }
  ```

#### Fix A3: cursor:none 移动端重置
- **文件**: [index.html:167](file:///workspace/index.html#L167)（已有 768px 媒体查询块）
- **改动**: 在 `@media (max-width: 768px)` 中追加：
  ```css
  .tl-link, .bilibili-card, .ending-cta, .nav-menu-btn, .activity-card, .nav-links a {
    cursor: pointer;
  }
  ```

### 阶段 2：Hero 滚动提示与渐变效果增强（用户重点关注）

#### Fix B1+B6: 重设计滚动提示 + 滚动时渐隐
- **文件**: [index.html:571-603](file:///workspace/index.html#L571-L603)（CSS）+ [index.html:3263-3283](file:///workspace/index.html#L3263-L3283)（JS）
- **CSS 改动**:
  - 将 `.scroll-line` 从 1px 宽 60px 高 → 增强为带圆点 + 渐变线 + 下箭头组合
  - 改为：
    ```css
    .hero-scroll-hint {
      position: fixed; bottom: 2.5rem; left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .scroll-arrow {
      width: 22px; height: 22px;
      border-right: 1.5px solid var(--orange-primary);
      border-bottom: 1.5px solid var(--orange-primary);
      transform: rotate(45deg);
      animation: hint-bounce 2s ease-in-out infinite;
    }
    @keyframes hint-bounce {
      0%, 100% { transform: rotate(45deg) translate(0, 0); opacity: 0.6; }
      50% { transform: rotate(45deg) translate(4px, 4px); opacity: 1; }
    }
    .scroll-line {
      width: 1px; height: 40px;
      background: linear-gradient(to bottom, var(--orange-primary), transparent);
      transform-origin: top;
      animation: scroll-line-anim 2s ease-in-out infinite;
    }
    /* 改进的 scroll-line-anim，单 transform-origin 平滑 */
    @keyframes scroll-line-anim {
      0% { transform: scaleY(0); opacity: 0; }
      40% { transform: scaleY(1); opacity: 1; }
      60% { transform: scaleY(1); opacity: 1; }
      100% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
    }
    ```
- **HTML 改动** [line 2093-2096](file:///workspace/index.html#L2093-L2096):
  ```html
  <div class="hero-scroll-hint">
    <span>向下滚动</span>
    <div class="scroll-arrow"></div>
    <div class="scroll-line"></div>
  </div>
  ```
- **JS 改动** [line 3263-3283](file:///workspace/index.html#L3263-L3283): 在 scroll handler 中根据 heroProgress 渐隐：
  ```js
  // 滚动 5% 后开始淡出，15% 完全消失
  if (!isTouchDevice && heroScrollHint) {
    const hintOpacity = Math.max(0, 1 - heroProgress / 0.15);
    heroScrollHint.style.opacity = hintOpacity;
  }
  ```

#### Fix B2: 移除重复 GSAP 动画
- **文件**: [index.html:3436-3442](file:///workspace/index.html#L3436-L3442)
- **改动**: 删除外层重复的 `gsap.to('.hero-scroll-hint', { opacity: 1, ... })`，仅保留 [line 3398-3404](file:///workspace/index.html#L3398-L3404) 在 `!isTouchDevice` 块内的一次

#### Fix B3+B4: 移除 hero-story / hero-content 滚动冲突过渡
- **文件**: [index.html:390, 438](file:///workspace/index.html#L390)
- **改动**:
  - `.hero-story { transition: opacity 0.4s ease, transform 0.4s ease; }` （从 0.8s 缩短到 0.4s，减少拖影）
  - `.hero-content { transition: opacity 0.4s ease, transform 0.4s ease; }` （从 1s 缩短到 0.4s）
  - **原因**: 滚动驱动时 JS 直接 setProperty，长过渡造成"追不上"的拖影感。0.4s 既保留 class 切换平滑，又减少滚动时拖影

#### Fix B5: scroll-line-anim 平滑化
- 已在 Fix B1 中重写，单 transform-origin 渐变，避免 50.1% 跳变

#### Fix B7+B8: 三幕渐变效果增强（添加 blur + scale）
- **文件**: [index.html:3300-3328](file:///workspace/index.html#L3300-L3328)
- **JS 改动**:
  ```js
  // 第一幕 -> 第二幕 (0% - 33%)：淡出 + 上移 + 微模糊 + 微缩小
  if (heroProgress < 0.33) {
    const phase1Progress = heroProgress / 0.33;
    storyDust.style.opacity = 1 - phase1Progress;
    storyDust.style.transform = `translateY(${-phase1Progress * 50}px) scale(${1 - phase1Progress * 0.05})`;
    storyDust.style.filter = `blur(${phase1Progress * 4}px)`;
    storyFire.classList.add('hidden');
    heroReveal.classList.add('hidden');
  }
  // 第二幕 (33% - 66%)：淡入再淡出 + 模糊呼吸
  else if (heroProgress < 0.66) {
    storyDust.classList.add('hidden');
    storyFire.classList.remove('hidden');
    heroReveal.classList.add('hidden');
    
    const phase2Progress = (heroProgress - 0.33) / 0.33;
    // 前 50% 淡入到 1，后 50% 淡出到 0
    const fireOpacity = phase2Progress < 0.5 ? phase2Progress * 2 : 1 - (phase2Progress - 0.5) * 2;
    storyFire.style.opacity = fireOpacity;
    storyFire.style.filter = `blur(${Math.abs(phase2Progress - 0.5) * 3}px)`;
    storyFire.style.transform = `scale(${0.95 + (1 - Math.abs(phase2Progress - 0.5) * 2) * 0.05})`;
  }
  // 第三幕 (66% - 100%)：淡入 + scale + blur→清晰
  else {
    storyDust.classList.add('hidden');
    storyFire.classList.add('hidden');
    heroReveal.classList.remove('hidden');
    
    const phase3Progress = (heroProgress - 0.66) / 0.34;
    const revealOpacity = Math.min(phase3Progress * 2, 1);
    heroReveal.style.opacity = revealOpacity;
    heroReveal.style.transform = `scale(${0.9 + phase3Progress * 0.1})`;
    heroReveal.style.filter = `blur(${(1 - revealOpacity) * 4}px)`;
  }
  ```

### 阶段 3：移动端菜单优化

#### Fix C1: 菜单改为滑入动画
- **文件**: [index.html:1598-1616](file:///workspace/index.html#L1598-L1616)
- **CSS 改动**:
  ```css
  .mobile-menu {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.98);
    backdrop-filter: blur(20px);
    z-index: 8999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    opacity: 0;
    pointer-events: none;
    transform: translateX(100%);  /* 从右滑入 */
    transition: opacity 0.3s var(--ease-out-expo), transform 0.3s var(--ease-out-expo);
  }
  .mobile-menu.open {
    opacity: 1;
    pointer-events: all;
    transform: translateX(0);
  }
  ```

#### Fix C2: 汉堡→X 对齐
- **文件**: [index.html:2917-2919](file:///workspace/index.html#L2917-L2919)
- **JS 改动**:
  ```js
  spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
  spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  ```

#### Fix C3+C4+C5: 无障碍 + 交互完善
- **文件**: [index.html:2912-2936](file:///workspace/index.html#L2912-L2936)
- **JS 改动**:
  ```js
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.setAttribute('aria-controls', 'mobileMenu');
  
  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    const spans = menuBtn.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '1';
    spans[2].style.transform = '';
  }
  
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    menuBtn.setAttribute('aria-expanded', menuOpen ? 'true' : 'false');
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const spans = menuBtn.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '1';
      spans[2].style.transform = '';
    }
  });
  
  // Escape 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) closeMenu();
  });
  
  // 点击遮罩关闭
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });
  
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
  ```

#### Fix C6: 移动菜单链接触屏反馈
- **文件**: [index.html:1618-1628](file:///workspace/index.html#L1618-L1628)
- **CSS 追加**:
  ```css
  .mobile-menu a:active {
    color: var(--orange-primary);
    transform: scale(0.96);
    transition: transform 0.1s;
  }
  ```

### 阶段 4：移动端性能修复

#### Fix D1: 星座网络移动端完全禁用
- **文件**: [index.html:3838](file:///workspace/index.html#L3838)
- **JS 改动** (IIFE 开头):
  ```js
  (function initConstellation() {
    const canvas = document.getElementById('constellationCanvas');
    if (!canvas) return;
    if (isTouchDevice) {
      canvas.style.display = 'none';
      return;  // 移动端完全跳过，避免 80 粒子 O(n²) 连线计算
    }
    // ... 原逻辑保持不变
  })();
  ```

#### Fix D2: ending::before 移动端缩小 + 禁用动画
- **文件**: [index.html:1817](file:///workspace/index.html#L1817)（768px 媒体查询块）
- **CSS 追加**:
  ```css
  @media (max-width: 768px) {
    .ending::before {
      width: 400px;
      height: 400px;
      animation: none;
    }
  }
  ```

#### Fix D3: deco-circle 移动端隐藏
- **文件**: [index.html:1817](file:///workspace/index.html#L1817)（768px 媒体查询块）
- **CSS 追加**:
  ```css
  @media (max-width: 768px) {
    .deco-circle { display: none; }
  }
  ```

### 阶段 5：其他视觉细节

#### Fix E1: section::before 移动端加粗
- **文件**: [index.html:1817](file:///workspace/index.html#L1817)（768px 媒体查询块）
- **CSS 追加**:
  ```css
  @media (max-width: 768px) {
    .section::before { height: 2px; }
  }
  ```

#### Fix E2: hero-scroll-hint 矮屏位置
- **文件**: [index.html:571-582](file:///workspace/index.html#L571-L582)
- **CSS 改动**: `bottom: 3rem` → `bottom: 2rem`（更靠下，避免与 story 文本重叠）

---

## Assumptions & Decisions

### 假设
1. 部署地址为 `https://wayhhow.github.io/CGVST/`（来自 [og:url line 12](file:///workspace/index.html#L12)）
2. **不改任何文本内容、数字、链接、图片**（用户明确要求）
3. 保持单文件部署（所有 CSS/JS 内联在 index.html）
4. 保持现有技术栈（GSAP + Lenis + 原生 Canvas）
5. 用户在 Plan Mode 接受后即可直接执行，无需再次确认

### 决策
1. **不引入 CSS scroll-driven animations**（`animation-timeline: scroll()`）— Safari 26 才支持，Firefox 仍需 flag。保持 GSAP + Lenis 滚动驱动方案，兼容性更好（调研来源：calmops.com、snipkit.dev 2026 文章）
2. **不重写 Hero 三幕叙事结构** — 仅优化过渡效果（添加 blur+scale 组合），保留 Dust→Fire→Reveal 三幕逻辑
3. **移动端菜单用滑入替代淡入** — 符合 2026 最佳实践（200-300ms 滑入，Material Design / NN/g 规范）
4. **星座网络在移动端完全禁用** — 而非减粒子，避免任何 O(n²) 计算。原 checklist 声称已关闭但代码未实际检测 isTouchDevice
5. **保留 `cursor: none` 在桌面** — 自定义光标体验的一部分，仅移动端重置
6. **缩短 hero-story/hero-content 过渡时间**（0.8s/1s → 0.4s）而非完全移除 — 保留 class 切换平滑，但消除滚动拖影
7. **汉堡→X translate 从 4px 改 5px** — 24px 宽/5px gap 下数学精确对齐

### 待用户确认
- 无。所有修复均为显示效果 Bug，不涉及内容变更。

---

## Verification Steps

### 阶段 A：实施中验证（使用 browser + ocr-local skill）

1. **browser skill 实地观察**（部署站点 + 本地 file://）：
   - 导航到 `https://wayhhow.github.io/CGVST/`
   - 桌面端 1920px：观察 Hero 滚动提示随滚动渐隐、三幕 blur+scale 过渡
   - DevTools 切换至 iPhone SE (375px) / iPhone 14 Pro (393px) / iPad Mini (768px)：
     - 观察 nav-logo 是否 48px（非 80px）
     - 观察 data-viz 是否与 timeline 卡片左对齐
     - 观察菜单是否 300ms 滑入
     - 观察星座 canvas 是否完全消失
   - 截图各断点

2. **ocr-local skill 文字校验**：
   - 对修复前后截图运行 OCR，对比文字内容是否完全一致（确认未改内容）

### 阶段 B：自动验证

```bash
# 1. 多断点截图（已有 tests/screenshots.js）
node tests/screenshots.js
# 产出：verification/screenshots/{375,393,768,1440,1920}/*.png

# 2. 单元测试（已有 tests/site-audit.test.js）
node tests/site-audit.test.js
# 期望：16/17 通过（与修复前一致，未引入回归）

# 3. 链接验证
node tests/links-check.js
```

### 阶段 C：手动验证清单

| # | 项 | 标准 |
|---|----|------|
| V1 | 桌面 Hero 滚动提示 | 滚动 5% 后 scroll-hint 开始淡出，15% 完全消失 |
| V2 | 桌面三幕过渡 | Dust→Fire→Reveal 有 blur+scale 渐变，无突变/拖影 |
| V3 | 移动端 logo | 768px 下 nav-logo 48px（非 80px） |
| V4 | 移动端 data-viz | 与 timeline 卡片左对齐，无 2rem 错位 |
| V5 | 移动端菜单 | 300ms 滑入，Escape/点遮罩可关闭，body 锁定 |
| V6 | 移动端星座 | 完全禁用，无 canvas 渲染 |
| V7 | 桌面端无回归 | 1920px 所有效果与修复前一致（除滚动提示渐隐 + 三幕 blur） |
| V8 | 滚动线动画 | 单 transform-origin 平滑，无 50.1% 跳变 |
| V9 | aria-expanded | 屏幕阅读器朗读菜单按钮状态 |
| V10 | 内容未变 | OCR 对比修复前后，文字完全一致 |

---

## File Plan

| 文件 | 变更类型 | 阶段 |
|------|----------|------|
| [index.html](file:///workspace/index.html) | CSS 媒体查询补充 + JS scroll handler 优化 + 菜单 JS 增强 + 星座移动端禁用 + HTML 微调（移除 inline style、增强 scroll-hint 结构） | 1-5 |

---

## Reference Skills 使用计划

| 技能 | 用法 | 阶段 |
|------|------|------|
| `Systematic Debugging` | 已完成 Phase 0-1 排查，修复时遵循 Phase 2-4（pattern 对比 → 单一假设 → 最小改动验证） | 实施全程 |
| `clean-code` | 修复时遵守 SRP/DRY/KISS，不引入冗余、不创建工具函数 | 实施全程 |
| `browser` | 实地验证部署站点视觉（桌面 + 移动 DevTools 模拟） | 阶段 A |
| `ocr-local` | 截图后文字校验，确认内容未变 | 阶段 A |
| `jina-reader` | 已用于抓取 best practices 页面 | 调研（已完成） |
| `web-content-fetcher` | 备用抓取通道（如 jina 失败） | 调研（已完成） |

---

## Risk & Mitigation

| 风险 | 影响 | 缓解 |
|------|------|------|
| B3/B4 缩短 transition 至 0.4s 可能影响 class 切换平滑度 | 三幕切换生硬 | 用 GSAP 在 class 切换时补间，或保留 0.4s 后实地观察 |
| B8 增加 blur 滤镜可能影响移动端性能 | 移动端帧率下降 | 移动端（isTouchDevice）跳过 blur，仅用 opacity+scale |
| C1 滑入动画在低端 Android 闪烁 | 菜单体验差 | 用 `will-change: transform` + `transform: translateZ(0)` 强制 GPU 合成 |
| D1 移动端禁用星座后背景过空 | 视觉空洞 | 保留 hero-canvas 粒子（已减少），背景层次仍在 |
| 部署站点 vs 本地 file:// 差异 | 验证失真 | 优先在部署站点验证，本地仅做快速迭代 |

---

## 实施顺序（推荐 TodoWrite 任务列表）

1. **阶段 1**（移动端布局对齐）：A1 → A2 → A3
2. **阶段 2**（Hero 滚动提示 + 渐变效果）：B1+B6 → B2 → B3+B4 → B5 → B7+B8
3. **阶段 3**（移动端菜单）：C1 → C2 → C3+C4+C5 → C6
4. **阶段 4**（移动端性能）：D1 → D2 → D3
5. **阶段 5**（其他视觉细节）：E1 → E2
6. **验证**：browser 实地观察 + ocr-local 文字校验 + 多断点截图 + 单元测试
