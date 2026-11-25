// Собирает namaz/months/*.json в один namaz/schedules.json — его читает приложение.
// Запускается GitHub Action'ом после каждого изменения, можно и вручную: node namaz/tools/build.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeSchedule } from './extract.js';

const namaz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const monthsDir = path.join(namaz, 'months');

const files = (await fs.readdir(monthsDir)).filter((f) => f.endsWith('.json')).sort();
let schedules = [];
for (const f of files) {
  const s = normalizeSchedule(JSON.parse(await fs.readFile(path.join(monthsDir, f), 'utf8')));
  const overlapping = schedules.filter((x) => !(x.periodTo < s.periodFrom || x.periodFrom > s.periodTo));
  if (overlapping.length) {
    throw new Error(`${f}: даты пересекаются с ${overlapping.map((x) => x.periodFrom).join(', ')} — удалите лишний файл`);
  }
  schedules.push(s);
}
schedules.sort((a, b) => a.periodFrom.localeCompare(b.periodFrom));

// Пропущенный месяц — частая ошибка: предупреждаем, но файл всё равно собираем.
for (let i = 1; i < schedules.length; i++) {
  const d = new Date(`${schedules[i - 1].periodTo}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  const expected = d.toISOString().slice(0, 10);
  if (schedules[i].periodFrom !== expected) {
    console.warn(`::warning::Нет расписания с ${expected} до ${schedules[i].periodFrom}`);
  }
}

const out = path.join(namaz, 'schedules.json');
await fs.writeFile(out, JSON.stringify({ updatedAt: new Date().toISOString(), schedules }) + '\n');
console.log(`schedules.json: ${schedules.length} мес.`);
for (const s of schedules) console.log(`  ${s.periodFrom} — ${s.periodTo}  ${s.city}`);
