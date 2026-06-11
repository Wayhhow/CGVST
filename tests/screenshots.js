// tests/screenshots.js
// 多断点截图脚本 - 验证响应式适配
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT = join(ROOT, 'verification', 'screenshots');

const HTML_URL = 'file:///' + join(ROOT, 'index.html').replace(/\\/g, '/');

const viewports = [
  { name: '375-iPhoneSE', w: 375, h: 667, device: 'mobile' },
  { name: '393-iPhone14Pro', w: 393, h: 852, device: 'mobile' },
  { name: '768-iPadMini', w: 768, h: 1024, device: 'tablet' },
  { name: '1440-Desktop', w: 1440, h: 900, device: 'desktop' },
  { name: '1920-Large', w: 1920, h: 1080, device: 'desktop' },
];

const sections = ['hero', 'about', 'timeline', 'achievements', 'gallery', 'activities', 'culture', 'ending', 'footer'];

async function run() {
  console.log(`[开始] 截图 -> ${OUT}`);
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const log = [];

  for (const vp of viewports) {
    console.log(`\n[断点] ${vp.name} (${vp.w}x${vp.h})`);
    const ctx = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 1,
      hasTouch: vp.device !== 'desktop',
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => log.push({ vp: vp.name, type: 'pageerror', msg: e.message }));
    page.on('console', m => { if (m.type() === 'error') log.push({ vp: vp.name, type: 'console', msg: m.text() }); });

    try {
      await page.goto(HTML_URL, { waitUntil: 'networkidle', timeout: 30000 });
      // 等预加载器结束
      await page.waitForTimeout(4500);
    } catch (e) {
      log.push({ vp: vp.name, type: 'load', msg: e.message });
    }

    // 截每个 section
    for (const sec of sections) {
      try {
        const el = await page.$(`#${sec}`);
        if (!el) { log.push({ vp: vp.name, type: 'missing', section: sec }); continue; }
        const file = join(OUT, `${vp.name}-${sec}.png`);
        await el.screenshot({ path: file, animations: 'disabled' });
        console.log(`  📸 ${vp.name}-${sec}.png`);
      } catch (e) {
        log.push({ vp: vp.name, type: 'screenshot', section: sec, msg: e.message });
      }
    }

    // 完整页面截图（1920 桌面端）
    if (vp.w === 1920) {
      try {
        const file = join(OUT, `${vp.name}-fullpage.png`);
        await page.screenshot({ path: file, fullPage: true, animations: 'disabled' });
        console.log(`  📸 ${vp.name}-fullpage.png`);
      } catch (e) {
        log.push({ vp: vp.name, type: 'fullpage', msg: e.message });
      }
    }

    await ctx.close();
  }

  await browser.close();

  // 写日志
  writeFileSync(join(ROOT, 'verification', 'screenshots-log.json'), JSON.stringify(log, null, 2), 'utf8');
  if (log.length === 0) {
    console.log('\n✅ 全部截图完成，无错误');
  } else {
    console.log(`\n⚠️ 完成但有 ${log.length} 个错误/警告，详见 screenshots-log.json`);
  }
}

run().catch(e => { console.error(e); process.exit(1); });
