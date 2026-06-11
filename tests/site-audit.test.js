// tests/site-audit.test.js
// 橙光队首页全维度系统审查 - 自动化审计脚本
// 使用 node --test 运行

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HTML_PATH = join(ROOT, 'index.html');
const html = readFileSync(HTML_PATH, 'utf8');

let pass = 0, fail = 0;
const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (ok) pass++; else fail++;
  // 输出用 test() 形式由 node:test 自己处理
}

// ============================================================
// A. 内容一致性
// ============================================================
test('A. 内容一致性', async (t) => {
  await t.test('A1+A2: 隐患排查数字应在 stats 和 data-viz 间一致', () => {
    // 抓出 .counter 的 data-target 值
    const counters = [...html.matchAll(/data-target="(\d+(?:\.\d+)?)"/g)].map(m => parseFloat(m[1]));
    assert.ok(counters.length > 0, '应至少有一个 counter');
    // 隐患排查数：about stats 257 vs data-viz 265
    const has257 = counters.includes(257);
    const has265 = counters.includes(265);
    const inconsistent = has257 && has265;
    record('A1+A2: 隐患排查数一致', !inconsistent, inconsistent ? '同时存在 257 和 265，需统一' : 'OK');
  });

  await t.test('A3+A4: 寒假实践奖项等级应一致', () => {
    const hasFirstPrize = /校寒假社会实践优秀团队[一]等奖/.test(html);
    const hasSecondPrize = /校寒假社会实践优秀团队[二]等奖/.test(html) || /寒假社会实践优秀团队[二]等奖/.test(html);
    const inconsistent = hasFirstPrize && hasSecondPrize;
    record('A3+A4: 奖项等级一致', !inconsistent, inconsistent ? '成就卡一等奖 vs Gallery 二等奖' : 'OK');
  });

  await t.test('A5: 2025寒假活动描述是否需要核实', () => {
    // 仅记录需要用户确认，不强制断言
    const hasIssue = /2025寒假社会实践[\s\S]{0,40}广州无障碍环境调研/.test(html);
    record('A5: 2025寒假活动描述', true, hasIssue ? '需用户确认 (timeline 2024.07 才是广州)' : 'OK');
  });

  await t.test('A6: Preloader 副标题中文化待确认', () => {
    const hasEnglish = /<div class="preloader-sub">SUSTech Zhicheng College<\/div>/.test(html);
    record('A6: Preloader 副标题', true, hasEnglish ? '当前为英文，建议改中英对照' : 'OK');
  });

  await t.test('A8: 抓取所有外链以备验证', () => {
    const wechatLinks = [...html.matchAll(/https?:\/\/mp\.weixin\.qq\.com\/s\/[A-Za-z0-9_-]+(\?[^"'\s]*)?/g)].map(m => m[0]);
    const biliSpace = [...html.matchAll(/https?:\/\/space\.bilibili\.com\/\d+/g)].map(m => m[0]);
    const biliVideo = [...html.matchAll(/https?:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+/g)].map(m => m[0]);
    const dedupWechat = [...new Set(wechatLinks)];
    const dedupBili = [...new Set([...biliSpace, ...biliVideo])];
    assert.ok(dedupWechat.length >= 4, `微信推送至少 4 条，实际 ${dedupWechat.length}`);
    record('A8: 外链数量', true, `微信 ${dedupWechat.length} 条, B 站 ${dedupBili.length} 条`);
  });
});

// ============================================================
// B. 代码质量 - CSS 变量 / 死代码
// ============================================================
test('B. CSS 变量与死代码', async (t) => {
  await t.test('B1: --text-primary 变量应被定义', () => {
    const isReferenced = /var\(--text-primary\)/.test(html);
    if (isReferenced) {
      const isDefined = /--text-primary\s*:/.test(html);
      assert.ok(isDefined, '--text-primary 被引用但未在 :root 中定义！');
      record('B1: --text-primary 已定义', true);
    } else {
      record('B1: --text-primary 未引用', true, 'OK (可跳过)');
    }
  });

  await t.test('B2: --orange-soft 变量应被定义', () => {
    const isReferenced = /var\(--orange-soft\)/.test(html);
    if (isReferenced) {
      const isDefined = /--orange-soft\s*:/.test(html);
      assert.ok(isDefined, '--orange-soft 被引用但未在 :root 中定义！');
      record('B2: --orange-soft 已定义', true);
    } else {
      record('B2: --orange-soft 未引用', true, 'OK');
    }
  });

  await t.test('B3: 死代码 .achievement-counter 应被清理', () => {
    const hasCSS = /\.achievement-counter\s*\{/.test(html);
    const hasHTML = /class="achievement-counter"/.test(html);
    if (hasCSS && !hasHTML) {
      // CSS 存在但 HTML 已移除 —— 死代码
      record('B3: .achievement-counter CSS 死代码', false, 'CSS 仍存在但 DOM 已无引用');
    } else {
      record('B3: 死代码检查', true, hasCSS ? 'CSS+HTML 都存在' : '都已清理');
    }
  });

  await t.test('B7: .nav-logo img 高度应统一为 80px', () => {
    const cssMatch = html.match(/\.nav-logo img\s*\{[^}]*height:\s*(\d+)px/);
    const inlineMatch = html.match(/<img[^>]*class="[^"]*nav-logo[^"]*"[^>]*style="[^"]*height:\s*(\d+)px/);
    if (cssMatch) {
      assert.equal(cssMatch[1], '80', `.nav-logo img CSS height 应为 80px，实际 ${cssMatch[1]}px`);
    }
    if (inlineMatch) {
      assert.equal(inlineMatch[1], '80', `inline style height 应为 80px，实际 ${inlineMatch[1]}px`);
    }
    record('B7: nav-logo 高度', true, 'OK');
  });
});

// ============================================================
// C. 视觉 - 卡片数量
// ============================================================
test('C. 卡片数量与结构', async (t) => {
  await t.test('C-卡片: 6 张成就卡', () => {
    const cards = [...html.matchAll(/<div class="achievement-card"[^>]*>/g)];
    assert.equal(cards.length, 6, `期望 6 张成就卡，实际 ${cards.length}`);
  });

  await t.test('C-卡片: 9 张活动卡', () => {
    const cards = [...html.matchAll(/<div class="activity-card"[^>]*>/g)];
    assert.equal(cards.length, 9, `期望 9 张活动卡，实际 ${cards.length}`);
  });

  await t.test('C-卡片: 4 张荣誉图', () => {
    const items = [...html.matchAll(/<div class="gallery-item"[^>]*>/g)];
    assert.equal(items.length, 4, `期望 4 张荣誉图，实际 ${items.length}`);
  });

  await t.test('C-时间线: 至少 15 个事件', () => {
    const items = [...html.matchAll(/<div class="timeline-item">/g)];
    assert.ok(items.length >= 15, `时间线事件应至少 15 个，实际 ${items.length}`);
  });

  await t.test('C2: "更多荣誉" 卡片图标风格', () => {
    // 直接定位"更多荣誉"前的 icon span（贪婪匹配更精确）
    const cardMatch = html.match(/<span class="achievement-icon">([^<]+)<\/span>\s*<div class="achievement-title">更多荣誉<\/div>/);
    if (cardMatch) {
      const icon = cardMatch[1].trim();
      const isDots = /\.\.\.|•••|&#8226;/.test(icon);
      record('C2: 更多荣誉图标', !isDots, isDots ? `当前为 ${icon} 字符，建议改 emoji` : `当前为 ${icon}`);
    } else {
      record('C2: 更多荣誉图标', false, '未找到更多荣誉卡片');
    }
  });
});

// ============================================================
// D. 性能与无障碍
// ============================================================
test('D. 性能与无障碍', async (t) => {
  await t.test('D1: 检测 prefers-reduced-motion 支持', () => {
    const hasReducedMotion = /prefers-reduced-motion/.test(html);
    record('D1: prefers-reduced-motion', hasReducedMotion, hasReducedMotion ? '已实现' : '⚠ 未实现 - 关键无障碍缺陷');
  });

  await t.test('D2: canvas 元素应有 aria-hidden', () => {
    const canvases = [...html.matchAll(/<canvas[^>]*>/g)];
    const missingAria = canvases.filter(c => !/aria-hidden/.test(c[0]));
    record('D2: canvas aria-hidden', missingAria.length === 0, missingAria.length > 0 ? `${missingAria.length} 个 canvas 缺失` : 'OK');
  });

  await t.test('D3: og:image 应为绝对 URL', () => {
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) {
      const isAbsolute = /^https?:\/\//.test(match[1]);
      record('D3: og:image 绝对 URL', isAbsolute, isAbsolute ? 'OK' : `当前为相对路径: ${match[1]}`);
    }
  });

  await t.test('D4: meta description 应含关键词', () => {
    const match = html.match(/<meta name="description" content="([^"]+)"/);
    if (match) {
      const hasKeywords = /无障碍|志愿|深圳/.test(match[1]);
      record('D4: description 关键词', hasKeywords, hasKeywords ? 'OK' : `当前: ${match[1]}`);
    }
  });

  await t.test('D5: CDN 资源应使用 SRI 或 crossorigin', () => {
    const scripts = [...html.matchAll(/<script src="(https?:\/\/[^"]+)"[^>]*>/g)];
    const external = scripts.filter(s => /^https?:\/\//.test(s[1]));
    const noSRI = external.filter(s => !/integrity=/.test(s[0]) && !/crossorigin=/.test(s[0]));
    record('D5: CDN SRI/crossorigin', noSRI.length === 0, noSRI.length > 0 ? `${noSRI.length} 个外链脚本无 SRI 也无 crossorigin` : 'OK');
  });

  await t.test('D8: 所有 img 应有 width/height 属性', () => {
    const imgs = [...html.matchAll(/<img[^>]+>/g)];
    const noSize = imgs.filter(img => !/width=/.test(img[0]) || !/height=/.test(img[0]));
    record('D8: img width/height', noSize.length === 0, noSize.length > 0 ? `${noSize.length}/${imgs.length} 张图缺失尺寸` : 'OK');
  });

  await t.test('D9: Hero canvas 应 pointer-events: none', () => {
    const heroCanvas = html.match(/<canvas class="hero-canvas"[^>]*>/);
    if (heroCanvas) {
      const hasNone = /pointer-events:\s*none/.test(heroCanvas[0]);
      record('D9: Hero canvas pointer-events', hasNone, hasNone ? 'OK' : '未设置');
    }
  });

  await t.test('D11: 手机端强制 opacity 仍受 inline style 覆盖风险', () => {
    // 检查第三幕的 inline style 设置是否在 mobile media query 后执行
    const hasForceOpacity = /@media \(max-width: 768px\)[\s\S]{0,500}\.hero-content\s*\{[^}]*opacity:\s*1\s*!important/.test(html);
    const setsInlineOpacity = /heroReveal\.style\.opacity/.test(html);
    // 这两个并不冲突，但需要引起注意
    record('D11: mobile opacity 处理', true, hasForceOpacity && setsInlineOpacity ? '⚠ 注意：mobile 下会被 inline style 覆盖' : 'OK');
  });
});

// ============================================================
// 资源可达性
// ============================================================
test('E. 资源文件', async (t) => {
  await t.test('E1: 所有图片引用本地存在', () => {
    const imgs = [...html.matchAll(/<img[^>]+src="(assets\/[^"]+)"/g)].map(m => m[1]);
    const missing = imgs.filter(p => !existsSync(join(ROOT, p)));
    assert.equal(missing.length, 0, `缺失图片: ${missing.join(', ')}`);
  });

  await t.test('E2: logo 文件存在', () => {
    const logos = [
      'assets/images/校名_LOGO.png',
      'assets/images/致诚书院logo.jpg',
      'assets/images/队徽_致诚橙光.png',
    ];
    const missing = logos.filter(p => !existsSync(join(ROOT, p)));
    assert.equal(missing.length, 0, `缺失 logo: ${missing.join(', ')}`);
  });
});

// ============================================================
// 总结
// ============================================================
test('F. 总结报告', async (t) => {
  await t.test('生成 verification/test-report.md', () => {
    const report = [
      '# 自动化审计报告',
      '',
      `生成时间: ${new Date().toISOString()}`,
      `测试源文件: index.html (${html.length} 字节)`,
      '',
      '## 内容一致性',
      ...results.filter(r => r.name.startsWith('A')).map(r => `- ${r.ok ? '✅' : '❌'} ${r.name}: ${r.detail}`),
      '',
      '## 代码质量',
      ...results.filter(r => r.name.startsWith('B')).map(r => `- ${r.ok ? '✅' : '❌'} ${r.name}: ${r.detail}`),
      '',
      '## 视觉/卡片数量',
      ...results.filter(r => r.name.startsWith('C')).map(r => `- ${r.ok ? '✅' : '❌'} ${r.name}: ${r.detail}`),
      '',
      '## 性能与无障碍',
      ...results.filter(r => r.name.startsWith('D')).map(r => `- ${r.ok ? '✅' : '❌'} ${r.name}: ${r.detail}`),
      '',
      `## 统计: ${pass} 通过 / ${fail} 失败`,
    ].join('\n');

    writeFileSync(join(ROOT, 'verification', 'test-report.md'), report, 'utf8');
    console.log('\n' + report);
  });
});
