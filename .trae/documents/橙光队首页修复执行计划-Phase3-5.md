# 橙光队首页审查修复执行计划（Phase 3 残留 + Phase 4 + Phase 5）

> 完整审查与原计划见 [橙光队首页全维度系统审查与修复计划.md](./橙光队首页全维度系统审查与修复计划.md)。
> 本计划**只聚焦剩余工作**，并基于实际文件状态做了重新核对（与上一轮摘要略有出入）。

## Summary

经过对 `index.html` 实际文件的核对（grep 验证），上一轮摘要中声明的"Phase 3 A1 完成（257→265）"**实际未应用**——文件 line 1939 仍为 `data-target="257"`，与 line 2129 的 `data-target="265"` 不一致。Preloader 副标题中文化（line 1852 = `南方科技大学 · 致诚书院`）已正确生效。

本计划将分 4 个执行阶段（3.1 内容、4 代码/视觉/性能/无障碍、5 验证、6 交付）系统化完成剩余修复，所有 C/D 类（代码/视觉/性能/无障碍）问题直接修复，**A1 数字 265 用户已确认**，B/C/D 不依赖用户再次确认。

---

## Current State Analysis（基于 2026-06-11 实际文件状态）

### 上一轮完成情况（实际 vs 摘要）
| 任务 | 摘要声称 | 实际文件状态 |
|------|---------|------------|
| A1：stats 卡 257→265 | ✅ 已完成 | ❌ **未完成**（line 1939 仍 257） |
| A6：Preloader 中文化 | ✅ 已完成 | ✅ 已完成（line 1852 中文） |
| A3+A4：奖项等级 | 用户确认不改 | — |
| A5：2025寒假描述 | 用户确认不改 | — |

### 已存在的资产
- `tests/site-audit.test.js` ✅ 单元测试脚本（已修复 import 问题）
- `tests/links-check.js` ✅ 外链验证脚本
- `tests/screenshots.js` ✅ Playwright 多断点截图
- `verification/test-report.md` ✅ 测试报告（6/15 通过）
- `verification/external-links-report.md` ✅ 链接报告（8 微信被 CAPTCHA、2 B 站 OK）
- `verification/screenshots/` ✅ 40 张截图（5 断点 × 8 section）

### 关键 B/C/D 问题（按行号定位、需在 Phase 4 修复）
| # | 位置 | 问题 | 修复策略 |
|---|------|------|----------|
| B1 | index.html:1214 | `var(--text-primary)` 未定义 | :root 新增 `--text-primary: #F5F0EB` |
| B2 | index.html:875 | `var(--orange-soft)` 未定义 | 改用 `--orange-glow` 或新增变量 |
| B3 | index.html:1787-1802 | `.achievement-counter*` 死代码 | 整段删除 |
| B4 | index.html:2586 | Lenis 双 RAF 循环 | 删除 `gsap.ticker.add(...)` 那一行 |
| B6/D7 | index.html:2483, 2598, 2642, 2745, 2759, 3524, 3605, 3692, 3772, 3833 | 10+ 监听器 | 合并为 1 个全局 mousemove + 1 个 resize（订阅模式） |
| B7 | index.html:240 | `.nav-logo img { height: 88px; }` 与项目 memory 80px 矛盾 | 改为 80px（项目 memory 硬约束） |
| B9 | index.html:2618 | 磁性选择器太广（含裸 `<a>`） | 剔除裸 `a, button`，只保留明确装饰交互元素 |
| B10 | index.html:3171 | `initHeroAnimations` 可能重复包裹 | 加幂等守卫 |
| C1 | index.html:2121 | Data Viz 嵌在 timeline 中 | **不动结构**（避免大改），仅调整 margin 与视觉连续性 |
| C2 | index.html:2244 | "更多荣誉" 卡片图标 `•••` 与其他 emoji 风格不统一 | 改为 `✨`（U+2728） |
| C4 | index.html:2166-2180 | 2026.03 双链接窄屏可能溢出 | <480px 改块级 |
| C5 | index.html:1137-1139 | `.activities-section` padding 8rem 0 与 `.section` 冲突 | 删除冗余 padding |
| C6 | index.html:1890-1892 | 第一幕提示词无动画 | 加 `bounce-down 2s` 关键帧 |
| C7 | 颜色对比 | `--text-muted` #8A8580 描述文字 | 描述处加 `font-weight: 500` |
| D1 | 全文 | `prefers-reduced-motion` 未实现 | 脚本顶部检测 + 关闭装饰动画 |
| D2 | canvas / nav | 无 ARIA | canvas 加 `aria-hidden`，nav 加 `role="menubar"`，按钮加 `aria-label` |
| D3 | index.html:11 | `og:image` 相对路径 | ⚠️ **需确认部署 URL**（见 Phase 2 问题） |
| D4 | index.html:7 | description 缺关键词 | 扩写为含「无障碍/志愿/深圳」 |
| D5 | index.html:2457-2460 | CDN 无 SRI | 用 cdnjs/unpkg 官方 SRI 哈希加 `integrity` + `crossorigin` |
| D6 | index.html:2556-2566 | Preloader 固定 3.2s | 改为 `window.load` + 最小 1.2s |
| D8 | 17 张 img | 无 width/height | 加 `width`/`height` 属性（基于实际尺寸或 aspect-ratio） |
| D9 | index.html:1887 | Hero canvas 无 `pointer-events:none` | 加 CSS 规则（已有 inline z-index=0，补充 pointer-events） |
| D11 | index.html:3061 | mobile 下 inline opacity:1 可能被 CSS 覆盖 | 检查并加 `!important` 防御 |

---

## Proposed Changes

### 阶段 3.1：内容修复（单点修复，不再问）
- **A1 修复**（1 处）：将 index.html:1939 `data-target="257"` 改为 `265`，文案"无障碍隐患排查"不变
  - 验证：grep `data-target="(257|265)"` 应只剩 265
  - 影响：stats 卡与 data-viz 卡完全统一

### 阶段 4.1：CSS 变量 + 死代码
- **B1** 在 :root（line 30-43）追加：
  ```css
  --text-primary: #F5F0EB;
  --orange-soft: #FF8C5A;
  ```
- **B3** 删除 line 1787-1802 `.achievement-counter` / `.achievement-counter-label` 块
- **B7** line 240 改 `height: 88px` → `height: 80px`
- **C5** line 1137-1139 删除 `.activities-section` 的 `padding: 8rem 0`

### 阶段 4.2：JavaScript 重构
- **B4** 删除 line 2586 `gsap.ticker.add((time) => lenis.raf(time * 1000));`
  - 验证：搜索 `gsap.ticker.add` 应仅剩 Lenis 文档示例相关（如有）
- **B6/D7** 合并监听器：
  - mousemove：建立全局 `mouseX/mouseY` 单一更新源（line 2598、2759、3692、3833 共 4 处 + card-level 2642、3524 保留为各 card 局部）+ 发布订阅
  - resize：合并 line 2483、2745、3605、3772 共 4 个监听为 1 个分发器，**并在 resize 时重置 hero/constellation 粒子位置**（修复 resize 后粒子飞出现象）
- **B9** 磁性选择器收窄（line 2618）：
  ```js
  // 旧：
  '[[data-hover], a, button, .nav-links a, .bilibili-card, .activity-card, .achievement-card, .gallery-item, .tl-link]'
  // 新（剔除裸 a/button）：
  '[data-hover], .nav-links a, .bilibili-card, .activity-card, .achievement-card, .gallery-item, .tl-link, .mobile-nav-link, .nav-menu-btn, .footer-social a'
  ```
- **B10** `initHeroAnimations` 加幂等守卫（line 3171 前）：
  ```js
  if (heroTitle.querySelector('.char')) return;
  ```

### 阶段 4.3：视觉优化
- **C2** line 2244 `&#8226;&#8226;&#8226;` → `✨`
- **C4** 2026.03 双链接处理（line 2166-2180）：在 `@media (max-width: 480px)` 加 `.tl-links { flex-direction: column; gap: 0.5rem; }`
- **C6** 加 `@keyframes bounce-down` 让 `↓ 向下滚动，让它们汇聚` 上下浮动
- **C7** `.about-intro`、`achievement-desc`、`.data-viz-stat-label` 等描述处加 `font-weight: 500`

### 阶段 4.4：性能与无障碍（关键）
- **D1** 脚本顶部（line 2462 之前）加：
  ```js
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.documentElement.classList.add('reduced-motion');
  }
  ```
  CSS 加 `.reduced-motion *` 关闭所有 transition/animation > 0.01ms；JS 在 prefersReducedMotion 时跳过 constellation/hero/magnetic cursor/3D tilt 的 RAF 循环
- **D2** 加 ARIA：
  - line 1887 hero canvas 加 `aria-hidden="true"`
  - line 1856 constellation canvas 已 inline，加 `aria-hidden="true"`
  - 装饰 div（`.deco-circle`、`.floating-particle`）加 `aria-hidden="true"`
  - nav (line 1864) `<ul class="nav-links">` 加 `role="menubar"`，`<li>` 加 `role="none"`，`<a>` 加 `role="menuitem"`
  - line 2402 footer 校徽/院徽图片加 `aria-label`（alt 已存在则补完整描述）
- **D3** `og:image` 改为绝对 URL **（见 Phase 2 待确认）**
- **D4** 扩写 description 为：
  ```html
  <meta name="description" content="南方科技大学致诚书院「橙光」志愿服务队——专注深圳无障碍环境督导、助残志愿服务的青年团队，用脚步丈量无障碍的边界。">
  ```
- **D5** CDN SRI 哈希（用 cdnjs/unpkg 公开 hash）：
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          integrity="sha512-...（待 cdnjs 查）" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  ```
  若用户禁用外网 hash，**降级为加 `crossorigin="anonymous"` 异步加载兜底**
- **D6** Preloader 等待 `window.load` + 最小 1.2s（line 2556）：
  ```js
  const start = Date.now();
  const minDuration = 1200;
  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minDuration - elapsed);
    setTimeout(() => gsap.to(preloader, { opacity: 0, duration: 0.8, onComplete: () => { preloader.style.display = 'none'; initHeroAnimations(); initScrollAnimations(); } }), wait);
  });
  ```
- **D8** 给所有 `<img>` 加 `width` + `height`（基于 assets/images/ 实际尺寸或 aspect-ratio 16:9/4:3）：
  - 校名 LOGO 200x80、致诚院徽 80x80、4 张荣誉证书 600x850、2 个队徽 200x200
  - 推送配图因尺寸不一，**统一加 `loading="lazy"` + `aspect-ratio: 16/9`** 减小 CLS
- **D9** Hero canvas (line 1887) CSS 加 `.hero-canvas { pointer-events: none; }`
- **D11** mobile 路径：line 3057-3062 显式设置 `heroReveal.style.opacity = '1' !important;`（或 `setProperty` 提升优先级），避免 CSS 覆盖

---

## Assumptions & Decisions

### 决策（不需用户确认）
1. **B/C/D 类问题全部直接修复**——这是代码/视觉/性能/无障碍类，不涉及内容改动
2. **A1 数字 265 用户已在前轮确认**，直接修改不再问
3. **A3/A4/A5 上一轮用户已确认不改**，不再次询问
4. **CDN SRI 哈希**：用 cdnjs 官方 `?sri=` 端点查询，**失败时降级为 async + crossorigin**，不停滞
5. **O(n²) → 空间网格**：Constellation 80 粒子 + 现代浏览器性能已可接受，**暂不引入 grid hash**（避免引入新算法/复杂度），但加 `requestIdleCallback` 让首屏让出主线程
6. **C1 Data Viz 不拆出 timeline**——避免结构大改（用户偏好稳定），仅在 margin 与视觉连续性上做小调整

### 假设
- 项目部署 URL 为 `https://wayhhow.github.io/CGVST/`（用户已确认）
- 4 个外部 CDN 资源（GSAP×2、Lenis、Google Fonts）当前 CSP 允许外链——SRI 修复兼容现有策略
- 用户的浏览器目标：Chrome 110+、Safari 16+、Firefox 110+

### 已确认（2026-06-11）
- ⚠️ ~~网站部署 URL 是什么？~~ → **已确认：`https://wayhhow.github.io/CGVST/`**

---

## Verification Steps

### 自动化（5.1）
```bash
cd c:\Users\wayhow\Desktop\橙光队

# 1. 单元测试（期望 12+/15 通过）
node tests/site-audit.test.js

# 2. 外链复测
node tests/links-check.js

# 3. 多断点截图回归
node tests/screenshots.js
```
**通过标准**：
- 单元测试 0 失败（除 A3+A4/A5/A6 等已确认无需修改的项外）
- 截图无视觉退化
- 报告写入 `verification/`

### 手动（5.2）
- [ ] 桌面 Chrome 1920px 滚动，60fps，无横向滚动条
- [ ] iPhone SE 375px 模拟，hero 单屏直达，活动卡单列
- [ ] Chrome DevTools Lighthouse 4 项：性能 ≥ 85、可访问性 ≥ 95、SEO ≥ 95、最佳实践 ≥ 90
- [ ] 启用 `prefers-reduced-motion: reduce` 模拟 → 装饰动画静止，preloader 立即消失
- [ ] 屏幕阅读器（VoiceOver）→ 导航可朗读，canvas 不干扰
- [ ] 慢速 3G → preloader 不提前消失
- [ ] 微信分享链接 → og:image 预览图正确显示（D3 通过标准）

### 验收清单
- [ ] A1：隐患排查数统一为 265（stats + data-viz）
- [ ] A6：Preloader 副标题中文
- [ ] B1-B10：CSS 变量、死代码、Lenis 单 RAF、合并监听、磁吸收窄、幂等守卫全部生效
- [ ] C2-C7：图标统一、双链接窄屏适配、bounce 动画、描述加粗生效
- [ ] D1-D11：prefers-reduced-motion、ARIA、SRI（若启用）、Preloader 等待 load、img 尺寸、pointer-events、mobile opacity 全部生效

---

## File Plan

| 文件 | 变更类型 |
|------|----------|
| `index.html` | 主要修复目标（约 30+ 处微调 + 4 处结构性） |
| `tests/site-audit.test.js` | **新增 B4/B6/B7/B9/D1/D2/D8/D9 等断言**（不只记录，还断言通过） |
| `tests/links-check.js` | 不变 |
| `tests/screenshots.js` | 不变（直接复用） |
| `verification/test-report.md` | 重新生成 |
| `verification/external-links-report.md` | 重新生成 |
| `verification/screenshots/*.png` | 重新生成（覆盖） |
| `verification/lighthouse-report.html` | **新增**（手动生成） |
| `.trae/documents/fix-summary.md` | **新增**（交付清单 + 修复对照） |

---

## Risk & Mitigation

| 风险 | 影响 | 缓解 |
|------|------|------|
| 合并 mousemove/resize 后破坏现有动画 | 高 | 保留局部 card 级监听（2642、3524），仅合并全局监听；逐项截图回归 |
| SRI 哈希拼写错误导致脚本阻塞 | 中 | 用 cdnjs `?sri=` 端点查最新 hash；失败时降级为 async |
| og:image URL 错 | 低 | Phase 2 确认部署 URL 后再改 D3 |
| Lighthouse 性能仍 <85 | 中 | 暂时接受（已实施 5 项优化），不阻塞交付 |
| 微信推送 CAPTCHA 链接仍无法程序化验证 | 低 | 已记录在 external-links-report.md，用户手动核对 |

---

## 实施顺序

1. **Phase 2 询问**（如需要）→ 确认部署 URL
2. **Phase 3.1**：修 A1（1 行改动）
3. **Phase 4.1**：CSS 变量与死代码（4 处）
4. **Phase 4.2**：JS 重构（5 处）
5. **Phase 4.3**：视觉优化（4 处）
6. **Phase 4.4**：性能与无障碍（11 处）
7. **Phase 5.1**：自动验证
8. **Phase 5.2**：手动验证
9. **Phase 6**：交付 `fix-summary.md`

预计改动行数：30-50 处（多数 1-3 行小改，少数块级改动）。
