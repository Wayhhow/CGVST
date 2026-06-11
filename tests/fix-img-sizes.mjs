// tests/fix-img-sizes.js
// 一次性给所有 17 张 img 加 width/height
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PATH = join(ROOT, 'index.html');

let html = readFileSync(PATH, 'utf8');

// 替换规则（按 src 标识）
const rules = [
  // 导航/结尾 队徽
  { src: '队徽_致诚橙光.png', w: 80, h: 80, checkWidth: false },
  // 4 张荣誉证书
  { src: '荣誉_', w: 600, h: 850, checkWidth: false },
  // 9 张推送配图（粗略 16:9）
  { src: 'push_images/', w: 800, h: 450, checkWidth: false },
  // footer 校名
  { src: '校名_LOGO.png', w: 280, h: 140, checkWidth: false },
  // footer 院徽
  { src: '致诚书院logo.jpg', w: 40, h: 40, checkWidth: false },
];

function processImg(match) {
  const tag = match[0];
  if (/width=/.test(tag) && /height=/.test(tag)) return tag;
  // 找 src
  const srcMatch = tag.match(/src="([^"]+)"/);
  if (!srcMatch) return tag;
  const src = srcMatch[1];
  let dims = null;
  for (const r of rules) {
    if (src.includes(r.src)) { dims = [r.w, r.h]; break; }
  }
  if (!dims) return tag;
  // 在 alt="..." 之后插入 width height
  return tag.replace(/(\salt="[^"]*")/, `$1 width="${dims[0]}" height="${dims[1]}"`);
}

let count = 0;
html = html.replace(/<img[^>]+>/g, (m) => {
  if (!/width=/.test(m) || !/height=/.test(m)) count++;
  return processImg({ 0: m });
});

writeFileSync(PATH, html, 'utf8');
console.log(`处理 ${count} 张缺失尺寸的 img`);
console.log(`新文件大小: ${html.length} 字节`);
