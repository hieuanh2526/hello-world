#!/usr/bin/env node
// kiem-tra-do-phong-phu.mjs（v1.2）：看成片的画面变化够不够。只读 mp4，不出片；底部字幕带不算。
// 用法：node kiem-tra-do-phong-phu.mjs <成片.mp4> [--every 2.5] [--outdir 目录] [--sub 170]
// 出：<outdir>/do-phong-phu_quet.png（每 2.5 秒一格，5 列，从左到右、从上到下）+ do-phong-phu.txt，终端打印：
//   相邻格变化：相邻两格画面差多少（每像素平均差，0–255）；低于 4 标「几乎没变」
//   在动的帧：和 0.1 秒前比有差别（> 0.3）的帧占比（定格一拍二也算动）；最长静止：连续多少秒画面没动
// 判定标准和依据见 knowledge/hieu-ung-va-chuyen-canh.md 第二节、第七节。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const a = process.argv.slice(2), o = { every: 2.5, sub: 170 };
for (let i = 0; i < a.length; i++) {
  if (a[i] === '--every') o.every = +a[++i];
  else if (a[i] === '--outdir') o.outdir = a[++i];
  else if (a[i] === '--sub') o.sub = +a[++i];
  else o.mp4 = a[i];
}
if (!o.mp4 || !fs.existsSync(o.mp4)) { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 7).join('\n')); process.exit(1); }
const outdir = path.resolve(o.outdir || path.join(path.dirname(o.mp4), 'kiem-tra'));
fs.mkdirSync(outdir, { recursive: true });
const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', o.mp4], { encoding: 'utf8' }).trim();
const [vw, vh] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', o.mp4], { encoding: 'utf8' }).trim().split(',').map(Number);
const keepH = Math.round(vh - o.sub * vh / 1080);
const GW = 192, GH = Math.round(GW * keepH / vw);
const MOVE = 0.3, FLAT = 4, RICH = 10;   // 和 0.1 秒前比差 > MOVE 算「在动」；相邻格差 < FLAT 算「几乎没变」；平均 ≥ RICH 算够（盲测 6 版校过，见知识文件第二节）

// 一、逐帧灰度小图，算相邻帧差
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', o.mp4, '-vf', `crop=${vw}:${keepH}:0:0,scale=${GW}:${GH},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 });
const FS = GW * GH, n = Math.floor(raw.length / FS), fps = n / dur;
const fr = (i) => raw.subarray(i * FS, (i + 1) * FS);
const diff = (p, q) => { let s = 0; for (let k = 0; k < FS; k++) s += Math.abs(p[k] - q[k]); return s / FS; };
let moving = 0, run = 0, longest = 0, longestAt = 0;
const lag = Math.max(1, Math.round(fps / 10));
for (let i = lag; i < n; i++) {
  if (diff(fr(i), fr(i - lag)) > MOVE) { moving++; run = 0; }
  else if (++run > longest) { longest = run; longestAt = (i - run) / fps; }
}
// 二、每 every 秒一格，算相邻格差
const cells = []; for (let t = 0; t < dur - 0.05; t += o.every) cells.push(t);
const lines = [], pr = (s) => { console.log(s); lines.push(s); };
pr(`Kiểm tra độ phong phú: ${path.basename(o.mp4)}, ${dur.toFixed(2)} giây, ${n} khung hình, mỗi ô ${o.every} giây; không tính dải phụ đề ${o.sub} px ở dưới`);
let flat = 0; const ds = [];
for (let k = 1; k < cells.length; k++) {
  const i = Math.min(n - 1, Math.round(cells[k] * fps)), j = Math.min(n - 1, Math.round(cells[k - 1] * fps));
  const d = diff(fr(i), fr(j)); ds.push(d); if (d < FLAT) flat++;
  pr(`  Ô ${k} → ${k + 1} (${cells[k - 1].toFixed(1)} → ${cells[k].toFixed(1)} giây): ${d.toFixed(1)}${d < FLAT ? '  ← gần như không đổi' : ''}`);
}
const avg = ds.reduce((s, x) => s + x, 0) / Math.max(1, ds.length);
pr(`Thay đổi giữa các ô liền nhau: trung bình ${avg.toFixed(1)}; gần như không đổi ${flat} / ${ds.length} cặp`);
if (ds.length > 2) {   // v1.3：开场常是整屏盖色、黑屏开机，第 1 对会特别大，把平均拉高；另报去掉第 1 对的平均，看后面是不是也够
  const rest = ds.slice(1).reduce((s, x) => s + x, 0) / (ds.length - 1);
  pr(`Trung bình khi bỏ cặp đầu (mở màn): ${rest.toFixed(1)}${rest < RICH && avg >= RICH ? '  ← đạt chủ yếu nhờ mở màn, phần sau ít thay đổi' : ''}`);
}
pr(`Khung hình có chuyển động: ${(moving / (n - lag) * 100).toFixed(0)}%; đứng yên lâu nhất: ${(longest / fps).toFixed(2)} giây (từ giây ${longestAt.toFixed(2)})`);
const ok = flat === 0 && avg >= RICH;
pr(ok ? `Kết luận: ĐẠT (ô nào cũng có thay đổi mới, trung bình ≥ ${RICH})` : `Kết luận: CHƯA ĐẠT — xem các ô ghi «gần như không đổi», thêm thay đổi theo mục 1–2 của knowledge/hieu-ung-va-chuyen-canh.md (trung bình phải ≥ ${RICH})`);
if (longest / fps > 2) pr('Lưu ý: có đoạn đứng yên quá 2 giây — thêm chuyển động phụ (trôi, nhấp nháy, hạt, zoom chậm), xem mục 1 của knowledge/hieu-ung-va-chuyen-canh.md');
// 三、拼图：每 every 秒一格
const cols = 5, rows = Math.ceil(cells.length / cols), png = path.join(outdir, 'do-phong-phu_quet.png');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', o.mp4, '-vf', `fps=1/${o.every}:round=near,scale=384:-1,tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', png]);
fs.writeFileSync(path.join(outdir, 'do-phong-phu.txt'), lines.join('\n') + '\n');
console.log(`Ảnh ghép: ${png} (${cols} cột, trái sang phải, trên xuống dưới; ô 1 là giây 0)`);
