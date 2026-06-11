import { readFileSync } from 'node:fs';
const html = readFileSync('index.html', 'utf8');
const re = /<span class="achievement-icon">([^<]+)<\/span>\s*<div class="achievement-title">更多荣誉<\/div>/;
const m = html.match(re);
console.log('More honors icon:', m ? JSON.stringify(m[1]) : 'not found');

// Also check all icons in order
const allIcons = [...html.matchAll(/<span class="achievement-icon">([^<]+)<\/span>/g)];
console.log('All icons:', allIcons.map(m => m[1].trim()).join(' | '));
