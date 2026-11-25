// Распознаёт скриншоты таблиц из namaz/inbox/ (jpg/png/webp) и кладёт каждую как
// namaz/months/<первая дата>.json. Распознанный скриншот удаляется из inbox.
// Нужен ANTHROPIC_API_KEY (в GitHub — секрет репозитория).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractSchedule } from './extract.js';

const namaz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const inbox = path.join(namaz, 'inbox');
const TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

const images = (await fs.readdir(inbox)).filter((f) => TYPES[path.extname(f).toLowerCase()]);
if (images.length === 0) {
  console.log('inbox пуст — распознавать нечего');
  process.exit(0);
}

let failed = 0;
for (const f of images) {
  try {
    const buf = await fs.readFile(path.join(inbox, f));
    const s = await extractSchedule(buf, TYPES[path.extname(f).toLowerCase()]);
    const target = path.join(namaz, 'months', `${s.periodFrom}.json`);
    await fs.writeFile(target, JSON.stringify(s, null, 2) + '\n');
    await fs.rm(path.join(inbox, f));
    console.log(`${f} → months/${s.periodFrom}.json (${s.periodFrom} — ${s.periodTo}, ${s.days.length} дн., ${s.city})`);
  } catch (e) {
    failed++;
    console.log(`::error file=namaz/inbox/${f}::${e.message}`);
  }
}
// Неудачный скриншот остаётся в inbox — можно заменить его и запустить снова.
process.exit(failed ? 1 : 0);
