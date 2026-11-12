import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const dir = 'pendientes', out = 'out';
fs.mkdirSync(out, { recursive: true });
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.html')) : [];
const todo = files.filter(f => !fs.existsSync(path.join(out, f.replace(/\.html$/, '.jpg'))));
if (!todo.length) { console.log('Nada para renderizar'); process.exit(0); }

const b = await chromium.launch();
for (const f of todo) {
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.resolve(dir, f), { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: path.join(out, f.replace(/\.html$/, '.jpg')), type: 'jpeg', quality: 92 });
  await p.close();
  console.log('Renderizado', f);
}
await b.close();
