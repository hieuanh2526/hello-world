#!/usr/bin/env node
// ghep-phan.mjs: ghép nhiều phần (mỗi phần là một dự án đã render) thành một bài giảng dài, kèm một file phụ đề .srt chung.
//   node ghep-phan.mjs <thư-mục-phần-1> <thư-mục-phần-2> … -o bai-giang.mp4 [--nghi 0.4]
//   node ghep-phan.mjs <thư-mục-chứa-phan-1..phan-N> -o bai-giang.mp4
// Mỗi phần cần <tên>.mp4 (có phụ đề) và, nếu có, <tên>_khong-phu-de.mp4 (theo "output" trong du-an.json). Ra 3 file:
//   bai-giang.mp4, bai-giang_khong-phu-de.mp4 (nếu đủ bản không phụ đề), bai-giang.srt (mốc thời gian cộng theo độ dài THẬT
//   của từng video, không theo độ dài giọng, nên khớp kể cả khi phần cuối mỗi video có khoảng lặng). --nghi: chèn giây đen giữa các phần.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const A = process.argv.slice(2), dirs = []; let out, gap = 0;
for (let i = 0; i < A.length; i++) {
  if (A[i] === '-o') out = A[++i]; else if (A[i] === '--nghi') gap = +A[++i];
  else if (A[i] === '-h' || A[i] === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 7).join('\n')); process.exit(0); }
  else dirs.push(path.resolve(A[i]));
}
if (!dirs.length) die('Cách dùng: node ghep-phan.mjs <phần-1> <phần-2> … -o bai-giang.mp4');
let parts = dirs;
if (dirs.length === 1 && !fs.existsSync(path.join(dirs[0], 'du-an.json')))
  parts = fs.readdirSync(dirs[0]).filter((d) => fs.existsSync(path.join(dirs[0], d, 'du-an.json')))
    .sort((a, b) => a.localeCompare(b, 'vi', { numeric: true })).map((d) => path.join(dirs[0], d));
if (!parts.length) die('không thấy phần nào (mỗi phần là một thư mục có du-an.json)');
out = path.resolve(out || path.join(path.dirname(parts[0]), path.basename(path.dirname(parts[0])) + '.mp4'));
const base = out.replace(/\.mp4$/i, '');
fs.mkdirSync(path.dirname(out), { recursive: true });
const probe = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

const info = parts.map((d) => {
  const cfg = JSON.parse(fs.readFileSync(path.join(d, 'du-an.json'), 'utf8'));
  const name = (cfg.output || path.basename(d) + '.mp4').replace(/\.mp4$/i, '');
  const sub = path.join(d, name + '.mp4'), nosub = path.join(d, name + '_khong-phu-de.mp4');
  if (!fs.existsSync(sub)) die(`chưa render ${sub}`);
  const pd = JSON.parse(fs.readFileSync(path.join(d, cfg.subtitles || 'phu-de.json'), 'utf8'));
  return { d, sub, nosub: fs.existsSync(nosub) ? nosub : null, cues: pd.cues || [], dur: probe(sub) };
});

function concat(files, dst) {
  const ins = files.flatMap((f) => ['-i', f]), n = files.length;
  const pre = files.map((_, i) => `[${i}:v]fps=30,format=yuv420p,setsar=1${gap ? `,tpad=stop_duration=${gap}` : ''}[v${i}];[${i}:a]aresample=44100${gap ? `,apad=pad_dur=${gap}` : ''}[a${i}]`).join(';');
  const cat = files.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${n}:v=1:a=1[v][a]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', `${pre};${cat}`, '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', dst], { stdio: 'inherit' });
  console.log(`✓ ${dst} (${probe(dst).toFixed(1)} giây)`);
}
console.log(`Ghép ${info.length} phần: ${info.map((x) => `${path.basename(x.d)} ${x.dur.toFixed(1)}s`).join(', ')}`);
concat(info.map((x) => x.sub), base + '.mp4');
if (info.every((x) => x.nosub)) concat(info.map((x) => x.nosub), base + '_khong-phu-de.mp4');
else console.log('  (bỏ qua bản không phụ đề: có phần chưa render --no-subtitle)');

const ts = (x) => { const ms = Math.round(Math.max(0, x) * 1000); const p = (n, w = 2) => String(n).padStart(w, '0');
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };
let off = 0, k = 0; const srt = [];
for (const x of info) {
  for (const c of x.cues) srt.push(`${++k}\n${ts(off + (c.show ?? c.start))} --> ${ts(off + (c.hide ?? c.end))}\n${c.text}\n`);
  off += x.dur + gap;
}
fs.writeFileSync(base + '.srt', srt.join('\n'));
console.log(`✓ ${base}.srt (${k} dòng)`);
