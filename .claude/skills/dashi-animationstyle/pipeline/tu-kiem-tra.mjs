#!/usr/bin/env node
// tu-kiem-tra.mjs：检查这台电脑能不能出片——Node、ffmpeg、Chrome、whisper（可选）、各套风格要用的字体。几秒钟跑完。
// 用法：node tu-kiem-tra.mjs                 全部检查（字体按 7 套风格逐套报）
//       node tu-kiem-tra.mjs --style ve-tay   只报这一套的字体
// 字体为什么要单独查：兰亭黑、圆体、手札体、翩翩体等是 macOS「按需下载」的字体，没下载时系统只带一部分字，
// Chrome 里一个词可能一半是这个字体、一半退回苹方。所以这里查的是完整字体文件在不在，不是只看字体名。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { findChrome, CHROME_HINT } from './render.mjs';

const args = process.argv.slice(2);
const onlyStyle = args.includes('--style') ? args[args.indexOf('--style') + 1] : null;
let bad = 0, warn = 0;
const ok = (m) => console.log(`  ✓ ${m}`);
const no = (m, hint) => { bad++; console.log(`  ✗ ${m}${hint ? '\n      ' + hint.replace(/\n/g, '\n      ') : ''}`); };
const may = (m, hint) => { warn++; console.log(`  ! ${m}${hint ? '\n      ' + hint.replace(/\n/g, '\n      ') : ''}`); };
const run = (cmd, a) => { try { return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); } catch { return null; } };

console.log(`Hệ thống: ${os.type()} ${os.release()} (${os.arch()})${process.platform !== 'darwin' ? '  — bản gốc chỉ thử trên macOS; bản tiếng Việt / Anh đã thử trên Linux (cloud)' : ''}`);
console.log('\n[Phần mềm]');
const major = +process.versions.node.split('.')[0];
if (major >= 22 && typeof WebSocket !== 'undefined') ok(`Node ${process.version}`);
else no(`Node ${process.version}: cần bản 22 trở lên (render dùng WebSocket có sẵn trong Node)`, 'brew install node, hoặc tải bộ cài ở https://nodejs.org');
const ffv = run('ffmpeg', ['-version']);
if (ffv && run('ffprobe', ['-version'])) ok(`ffmpeg ${ffv.split('\n')[0].split(' ')[2] || ''} (kèm ffprobe)`);
else no('Không có ffmpeg / ffprobe (cần để ghép mp4, cắt âm thanh, dò khoảng lặng)', 'brew install ffmpeg (chưa có Homebrew thì cài trước ở https://brew.sh)');
const chrome = findChrome();
if (chrome) ok(`Chrome: ${chrome}`); else no('Không tìm thấy Chrome', CHROME_HINT);

// whisper：可选。有它能自动转写出字级时间；没有就走「稿子 + 静音检测」的后备（phu-de.mjs --script）
const wcli = (fs.existsSync(path.join(os.homedir(), '.local/bin/whisper-cli')) && path.join(os.homedir(), '.local/bin/whisper-cli')) || run('which', ['whisper-cli']) || run('which', ['whisper-cpp']);
const modelDirs = [process.env.WHISPER_MODEL && path.dirname(process.env.WHISPER_MODEL), path.join(os.homedir(), '.cache/whisper-cpp'), path.join(os.homedir(), '.cache/whisper'), '/opt/homebrew/share/whisper-cpp', '/usr/local/share/whisper-cpp'].filter(Boolean);
const models = modelDirs.flatMap((d) => { try { return fs.readdirSync(d).filter((f) => /^ggml-.*\.bin$/.test(f) && !/silero|for-tests/.test(f)).map((f) => path.join(d, f)); } catch { return []; } });
if (wcli && models.length) ok(`whisper-cli: ${wcli}; model ${models.map((m) => path.basename(m)).join(', ')}`);
else may(`Chưa có ${wcli ? 'model whisper' : 'whisper-cli'} (không bắt buộc)`, 'Không có vẫn làm được: đưa file lời thoại, phu-de.mjs --no-whisper sẽ căn thời gian theo khoảng lặng (cần soát lại chỗ ngắt câu).\nMuốn cài: bash "$SKILL/install.sh" (build whisper-cli, tải model ggml-large-v3-turbo-q5_0.bin, khoảng 550 MB)');

// ---------------- 字体 ----------------
// 越南语 / 英语版（v1.3-vi）：7 套风格的字体栈最前面都换成了 $SKILL/fonts/ 里的开源字体（全部支持越南语声调），
// 原来的中文字体（苹方、兰亭黑……）只在渲自带的中文 Token 例子时用得到，没有也不算错。
const dirs = ['/System/Library/Fonts', '/System/Library/Fonts/Supplemental', '/Library/Fonts', path.join(os.homedir(), 'Library/Fonts'),
  '/usr/share/fonts', '/usr/local/share/fonts', path.join(os.homedir(), '.local/share/fonts'), path.join(os.homedir(), '.fonts')];
const files = new Set();
const walk = (d, depth = 0) => { let es = []; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of es) { if (e.isDirectory() && depth < 3) walk(path.join(d, e.name), depth + 1); else files.add(e.name.toLowerCase()); } };
for (const d of dirs) walk(d);
const has = (re) => [...files].some((f) => re.test(f));
const VI = { 'Be Vietnam Pro': /^bevietnampro/, 'Nunito': /^nunito/, 'Patrick Hand': /^patrickhand/, 'Baloo 2': /^baloo2/,
  'Playfair Display': /^playfairdisplay/, 'Lora': /^lora/, 'Oswald': /^oswald/, 'Montserrat': /^montserrat/, 'Cormorant Garamond': /^cormorantgaramond/ };
const STYLE_FONTS = {
  'so-do-phang': ['Be Vietnam Pro'], 've-tay': ['Patrick Hand', 'Nunito'], 'bao-co': ['Lora', 'Be Vietnam Pro'],
  'cat-giay': ['Be Vietnam Pro', 'Playfair Display', 'Oswald'], 'cat-dan-sieu-thuc': ['Playfair Display', 'Lora', 'Montserrat', 'Patrick Hand', 'Be Vietnam Pro'],
  'hoat-hinh-3d': ['Baloo 2', 'Nunito', 'Be Vietnam Pro'], 'cong-nghe-nen-den': ['Lora', 'Cormorant Garamond'],
};
console.log('\n[Font] Font tiếng Việt / Anh (✓ đã cài; ✗ chưa cài)');
let missing = false;
for (const [style, list] of Object.entries(STYLE_FONTS)) {
  if (onlyStyle && !style.includes(onlyStyle)) continue;
  const parts = list.map((n) => (has(VI[n]) ? `✓${n}` : (missing = true, `✗${n}`)));
  console.log(`  ${parts.some((x) => x.startsWith('✗')) ? '✗' : '✓'} ${style}：${parts.join('  ')}`);
}
if (missing) { bad++; console.log(`\n  Cài font trước: node "${path.join(path.dirname(new URL(import.meta.url).pathname), 'cai-font.mjs')}" (font nằm trong $SKILL/fonts/, giấy phép SIL OFL)`); }
console.log(`\n${bad ? `Có ${bad} chỗ cần xử lý (✗)` : 'Đã đủ mọi thứ bắt buộc'}${warn ? `, ${warn} chỗ không bắt buộc (!)` : ''}.${bad ? '' : ' Bước tiếp: render ví dụ Token có sẵn để thử máy.'}`);
process.exitCode = bad ? 1 : 0;
