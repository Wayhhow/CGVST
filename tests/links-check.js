// tests/links-check.js
// 网络抓取验证所有外链
import { writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');

// 抓取所有微信/B站链接
const wechatLinks = [...new Set([...HTML.matchAll(/https:\/\/mp\.weixin\.qq\.com\/s\/[A-Za-z0-9_-]+(\?[^"'\s]*)?/g)].map(m => m[0]))];
const biliSpace = [...new Set([...HTML.matchAll(/https:\/\/space\.bilibili\.com\/\d+/g)].map(m => m[0]))];
const biliVideo = [...new Set([...HTML.matchAll(/https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+/g)].map(m => m[0]))];

const allLinks = [
  ...wechatLinks.map(url => ({ type: 'wechat', url })),
  ...biliSpace.map(url => ({ type: 'bili-space', url })),
  ...biliVideo.map(url => ({ type: 'bili-video', url })),
];

console.log(`[开始] 验证 ${allLinks.length} 个外链`);

// 微信通过 r.jina.ai 中转；B站直连
async function fetchUrl(url, type) {
  const fetchUrl = type === 'wechat' ? `https://r.jina.ai/${url}` : url;
  try {
    const r = await fetch(fetchUrl, {
      headers: type === 'wechat' ? { 'X-Return-Format': 'markdown' } : {},
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    return {
      status: r.status,
      finalUrl: r.url,
      contentType: r.headers.get('content-type') || '',
      text: (await r.text()).slice(0, 800),
    };
  } catch (e) {
    return { status: 0, error: e.message };
  }
}

const results = [];
for (const { type, url } of allLinks) {
  process.stdout.write(`  → ${type} ${url.slice(0, 60)}...  `);
  const r = await fetchUrl(url, type);
  // 抓取首段文字判断可达性
  const hasContent = r.text && r.text.length > 500 && !/页面不存在|该内容已被发布者删除|access denied|环境异常|CAPTCHA|requiring CAPTCHA|404/i.test(r.text);
  const titleMatch = r.text && r.text.match(/^#\s+(.+?)$/m);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const isBlocked = r.text && /CAPTCHA|环境异常|requiring CAPTCHA/.test(r.text);
  console.log(`${r.status} ${hasContent ? '✅' : (isBlocked ? '🚫CAPTCHA' : '❌')}${title ? ' | ' + title.slice(0, 30) : ''}`);
  results.push({ type, url, status: r.status, hasContent, title, blocked: isBlocked, textLen: r.text ? r.text.length : 0, error: r.error });
}

// 写报告
const report = [
  '# 外链验证报告',
  '',
  `生成时间: ${new Date().toISOString()}`,
  `验证数量: ${allLinks.length}`,
  `✅ 内容抓取成功: ${results.filter(r => r.hasContent).length}`,
  `🚫 被 CAPTCHA/反爬拦截: ${results.filter(r => r.blocked).length}`,
  `❌ 失败/可疑: ${results.filter(r => !r.hasContent && !r.blocked).length}`,
  '',
  '## ⚠️ 重要说明',
  '',
  '微信公众号对未登录请求强制 CAPTCHA 验证，所有 mp.weixin.qq.com 链接通过 jina.ai 代理后只能拿到平台拦截页，**实际文章内容无法程序化抓取**。需要用户在浏览器中手动核对每个链接是否对应正确的事件。',
  '',
  '微信链接清单（按 timeline 顺序）:',
  '',
  '| # | 对应 timeline 事件 | URL |',
  '|---|------|-----|',
  '| 1 | 2024.09 第二届橙光队成立 | https://mp.weixin.qq.com/s/j0z1VKl5UNbU7hg3gMG78g |',
  '| 2 | 2025.01 无碍之约情暖校园 | https://mp.weixin.qq.com/s/HUaeedMFEUJE1gqHwXXMTg?scene=1 |',
  '| 3 | 2025.06-07 粤港澳四城无障碍调研 | https://mp.weixin.qq.com/s/Jwf0Es8yikNzaQpoQ4dldQ |',
  '| 4 | 2025.10 与深圳市盲人协会共建 | https://mp.weixin.qq.com/s/yZu1QWNt7bgY4as2EzsxyA |',
  '| 5 | 2025.12 无障碍督导与公益集市 | https://mp.weixin.qq.com/s/4xGzhC1uV2sL_HSpLipv3A |',
  '| 6 | 2026.01 扎根社区互联共生 | https://mp.weixin.qq.com/s/ZiB2M2tPJAxjL0YOBPcRMA |',
  '| 7 | 2026.03 学雷锋日 | https://mp.weixin.qq.com/s/E5xg4lPmoKqOvRQGj1WyQA |',
  '| 8 | 2026.03 换届大会 | https://mp.weixin.qq.com/s/VAGjEfylu4GqX14sh3QCaQ |',
  '',
  '## 详情',
  '',
  ...results.map(r => {
    const ok = r.hasContent;
    const blocked = r.blocked;
    const sym = ok ? '✅' : (blocked ? '🚫' : '❌');
    return `### ${sym} [${r.type}] ${r.url}\n- HTTP 状态: ${r.status}\n- 内容长度: ${r.textLen}\n- 标题: ${r.title || '(无)'}\n- 状态: ${blocked ? 'CAPTCHA 拦截' : (ok ? '可访问' : '不可访问')}${r.error ? `\n- 错误: ${r.error}` : ''}`;
  }),
  '',
  '## 摘要表',
  '',
  '| # | 类型 | URL | HTTP | 状态 |',
  '|---|------|-----|------|------|',
  ...results.map((r, i) => `| ${i+1} | ${r.type} | ${r.url.slice(0, 55)}... | ${r.status} | ${r.blocked ? '🚫CAPTCHA' : (r.hasContent ? '✅OK' : '❌Fail')} |`),
].join('\n');

writeFileSync(join(ROOT, 'verification', 'external-links-report.md'), report, 'utf8');
console.log('\n报告已写入 verification/external-links-report.md');
