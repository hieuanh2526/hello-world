#!/usr/bin/env node
// xuat-doc.mjs: xuất bản dọc 9:16 (1080×1920) cho YouTube Shorts / TikTok từ một dự án đã làm xong bản ngang.
//   node xuat-doc.mjs <thư-mục-dự-án> [--tieu-de "Giá trị thặng dư"] [--nhan "Kinh tế chính trị Mác – Lênin"]
//        [--dong-phu "Bí mật của T – H – T' trong 50 giây"] [--chan "c + v + m · m' = m / v"] [--khong-chu-to] [-o ra.mp4]
//        [--nen "#f6f6ef"] [--chu "#15192d"] [--mau-a "#f8711c"] [--cat 1680]
// Các bước: render phần hình không phụ đề, chữ trong hình to hơn (render.mjs --doc; mẫu ve-tay có sẵn), chụp nền tiêu đề bằng
// Chrome, tạo phụ đề chữ to (từ «高亮» A tô màu, B gạch chân) đặt ngay dưới hình — tránh vùng nút bên phải và vùng chú thích
// phía dưới của TikTok/Shorts — rồi ghép. Kết quả: <thư-mục-dự-án>/<tên>_doc-9x16.mp4; file trung gian ở <thư-mục-dự-án>/doc-9x16/.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findChrome } from './render.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), SKILL = path.dirname(HERE);
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const A = process.argv.slice(2), o = { _: [], nen: '#f6f6ef', chu: '#15192d', mauA: '#f8711c', cat: 1680 };
for (let i = 0; i < A.length; i++) {
  const a = A[i], v = () => A[++i] ?? die(`Thiếu giá trị sau tham số ${a}`);
  if (a === '--tieu-de') o.tieuDe = v(); else if (a === '--nhan') o.nhan = v(); else if (a === '--dong-phu') o.dongPhu = v(); else if (a === '--chan') o.chan = v();
  else if (a === '--khong-chu-to') o.khongChuTo = true; else if (a === '-o') o.ra = v();
  else if (a === '--nen') o.nen = v(); else if (a === '--chu') o.chu = v(); else if (a === '--mau-a') o.mauA = v(); else if (a === '--cat') o.cat = +v();
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 9).join('\n')); process.exit(0); }
  else if (a.startsWith('-')) die(`Không hiểu tham số: ${a}`); else o._.push(a);
}
const dir = path.resolve(o._[0] || die('Cách dùng: node xuat-doc.mjs <thư-mục-dự-án> [--tieu-de …]'));
const read = (f) => (fs.existsSync(path.join(dir, f)) ? JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) : {});
const cfg = read('du-an.json'), pc = read('phan-canh.json'), pd = read(cfg.subtitles || 'phu-de.json');
if (!pd.cues) die('chưa có phu-de.json (chạy phu-de.mjs trước)');
const work = path.join(dir, 'doc-9x16'); fs.mkdirSync(work, { recursive: true });
const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString();
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

// 1) phần hình: không phụ đề, chữ to
const page = path.join(dir, cfg.page || 'index.html'), hinh = path.join(work, 'hinh.mp4');
console.log('1/4 Render phần hình (không phụ đề' + (o.khongChuTo ? '' : ', chữ to') + ')…');
execFileSync(process.execPath, [path.join(HERE, 'render.mjs'), page, '--no-subtitle', ...(o.khongChuTo ? [] : ['--doc']), '-o', hinh], { stdio: 'inherit' });
const hinhRa = path.join(work, 'hinh_khong-phu-de.mp4');

// 2) nền tiêu đề 1080×1920
console.log('2/4 Nền tiêu đề…');
const title = o.tieuDe ?? pc['标题'] ?? '';
fs.writeFileSync(path.join(work, 'nen.html'), `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:1080px;height:1920px;background:${o.nen};overflow:hidden}
.k{position:absolute;left:60px;right:60px;text-align:center;font-family:"Nunito","Be Vietnam Pro",sans-serif;color:${o.chu}}
.nhan{top:178px;font-weight:700;font-size:40px;letter-spacing:2px;color:${o.mauA};filter:brightness(.7)}
.t{top:232px;font-weight:900;font-size:118px;line-height:1.05;white-space:nowrap}
.sub{top:400px;font-family:"Patrick Hand","Nunito",sans-serif;font-size:46px}
.dash{position:absolute;left:120px;right:120px;border-top:4px dashed ${o.chu}}
.chan{top:1500px;font-family:"Patrick Hand","Nunito",sans-serif;font-size:40px;opacity:.45}
svg{position:absolute;left:300px;top:372px}
</style>
<div class="dash" style="top:150px"></div>
<div class="k nhan">${esc((o.nhan || '').toUpperCase())}</div>
<div class="k t" id="t">${esc(title)}</div>
<svg width="480" height="24"><path d="M4 14 Q 40 2 80 12 T 160 12 T 240 12 T 320 12 T 400 12 T 476 12" fill="none" stroke="${o.mauA}" stroke-width="9" stroke-linecap="round"/></svg>
<div class="k sub">${esc(o.dongPhu || '')}</div>
<div class="dash" style="top:490px"></div>
<div class="k chan">${esc(o.chan || '')}</div>
<script>const t=document.getElementById('t');let s=118;while(t.scrollWidth>t.clientWidth&&s>60){s-=4;t.style.fontSize=s+'px';}</script>`);
const chrome = findChrome() || die('không tìm thấy Chrome');
const root = process.platform === 'linux' && process.getuid?.() === 0;
const nen = path.join(work, 'nen.png');
try { fs.rmSync(nen, { force: true }); execFileSync(chrome, ['--headless=new', ...(root ? ['--no-sandbox'] : []), '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
  '--window-size=1080,1920', '--virtual-time-budget=3000', `--screenshot=${nen}`, 'file://' + path.join(work, 'nen.html')], { stdio: 'ignore', timeout: 60000 }); } catch {}
if (!fs.existsSync(nen)) die('Chrome không chụp được nền tiêu đề');

// 3) phụ đề ASS cho khung dọc
console.log('3/4 Phụ đề khung dọc…');
const bgr = (hex) => { const h = hex.replace('#', ''); return `&H${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}&`.toUpperCase(); };
const ink = bgr(o.chu), acc = bgr(o.mauA);
const hl = (pc['高亮'] || []).map((h, i) => (typeof h === 'string' ? { text: h, role: i ? 'B' : 'A' } : h));
const deco = (s) => { for (const h of hl) s = s.split(h.text).join(h.role === 'A' ? `{\\c${acc}}${h.text}{\\c${ink}}` : `{\\u1}${h.text}{\\u0}`); return s; };
const tA = (x) => { x = Math.max(0, x); return `${Math.floor(x / 3600)}:${String(Math.floor(x / 60) % 60).padStart(2, '0')}:${String(Math.floor(x) % 60).padStart(2, '0')}.${String(Math.round((x % 1) * 100) % 100).padStart(2, '0')}`; };
const assCol = (hex) => `&H00${bgr(hex).slice(2, -1)}`;
fs.writeFileSync(path.join(work, 'phu-de.ass'), `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Nunito,70,${assCol(o.chu)},${assCol(o.chu)},${assCol(o.nen)},${assCol(o.nen)},1,0,0,0,100,100,0,0,1,0,0,8,90,150,1250,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${pd.cues.map((c) => `Dialogue: 0,${tA(c.show ?? c.start)},${tA(c.hide ?? c.end)},Sub,,0,0,0,,${deco(c.text)}`).join('\n')}
`);

// 4) ghép
console.log('4/4 Ghép…');
const out = path.resolve(o.ra || path.join(dir, path.basename(cfg.output || path.basename(dir) + '.mp4', '.mp4') + '_doc-9x16.mp4'));
const cx = Math.round((1920 - o.cat) / 2), ch = Math.round(o.cat * 9 / 16);
const fdir = path.join(SKILL, 'fonts').replace(/:/g, '\\:');
execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-i', nen, '-i', hinhRa, '-filter_complex',
  `[1:v]crop=${o.cat}:${ch}:${cx}:0,scale=1080:-2[v];[0:v][v]overlay=0:590:shortest=1,ass=doc-9x16/phu-de.ass:fontsdir=${fdir},format=yuv420p[o]`,
  '-map', '[o]', '-map', '1:a?', '-c:v', 'libx264', '-crf', '20', '-preset', 'slow', '-r', '30', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out], { stdio: 'inherit', cwd: dir });
const d = +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]).trim();
console.log(`✓ ${out} (1080×1920, ${d.toFixed(1)} giây${d > 60 ? ' — dài hơn 60 giây: YouTube Shorts nhận tối đa 3 phút, nhưng nên dưới 60 giây' : ''})`);
