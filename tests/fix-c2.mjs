import { readFileSync, writeFileSync } from 'node:fs';
const PATH = 'index.html';
let html = readFileSync(PATH, 'utf8');
const before = html;
html = html.replace(
  /<span class="achievement-icon">&#8226;&#8226;&#8226;<\/span>\s*<div class="achievement-title">更多荣誉<\/div>/,
  '<span class="achievement-icon">✨</span>\n        <div class="achievement-title">更多荣誉</div>'
);
if (html === before) { console.log('NO CHANGE'); process.exit(1); }
writeFileSync(PATH, html, 'utf8');
console.log('Updated. Diff size:', html.length - before.length, 'bytes');
