#!/usr/bin/env node
// phu-de.mjs: giọng đọc → phu-de.json (câu, dòng phụ đề, thời gian từng từ) + phu-de.srt. Hai cách:
//   có whisper:   node phu-de.mjs <thư-mục-dự-án> [--lang vi|en]   whisper-cli nhận dạng + thời gian từng từ; có loi-thoai.txt thì sửa lỗi và ngắt câu theo lời thoại
//   không whisper: node phu-de.mjs <thư-mục-dự-án> --no-whisper    chỉ dùng loi-thoai.txt + dò khoảng lặng bằng ffmpeg (cần soát lại chỗ ngắt câu)
// Tùy chọn: --audio file (mặc định: audio trong du-an.json hoặc giong-doc.wav)  --script loi-thoai.txt  --model ggml-xxx.bin  -o phu-de.json  --max 20 (độ rộng tối đa một dòng, ≈ 36 chữ cái)
//       --trim auto      tự cắt ở hai đầu giọng đọc những câu không có trong lời thoại (lẫn vào khi cắt file), file gốc giữ thành giong-doc_truoc-cat.wav, cắt xong tự chạy lại
//       --trim đầu,cuối  cắt tay: chỉ giữ từ giây đầu đến giây cuối (tính theo file gốc giong-doc_truoc-cat.wav)
// Văn bản whisper nghe được (kèm số giây) lưu ở whisper-goc.txt / .json; mỗi mục «Sửa theo lời thoại» đều kèm số giây.
// 出处：我们做交付方案时的试验 1（静音检测 -30dB/0.04 秒找句界）、试验 2（按字数摊时间，平均差 0.08 秒、最差 0.28 秒）。
// v1.1（10-08 晚，按观众实测改）：识别改正带秒数和原因、存 whisper 原文、--trim。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const A = process.argv.slice(2), o = { _: [], max: 20 };   // max：每条字幕最多多宽，单位是「一个汉字宽」；拉丁字母按 0.55 个算（64 像素字号单行约 20 个汉字 ≈ 36 个越南/英文字母）
for (let i = 0; i < A.length; i++) {
  const a = A[i], v = () => A[++i] ?? die(`Thiếu giá trị sau tham số ${a}`);
  if (a === '--audio') o.audio = v(); else if (a === '--script') o.script = v(); else if (a === '--model') o.model = v();
  else if (a === '-o' || a === '--out') o.out = v(); else if (a === '--max') o.max = +v(); else if (a === '--no-whisper') o.noWhisper = true;
  else if (a === '--trim') o.trim = v(); else if (a === '--lang') o.lang = v();
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 8).join('\n')); process.exit(0); }
  else if (a.startsWith('-')) die(`Không hiểu tham số: ${a}`); else o._.push(a);
}
const dir = path.resolve(o._[0] || '.');
const cfg = fs.existsSync(path.join(dir, 'du-an.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'du-an.json'), 'utf8')) : {};
const audio = path.resolve(dir, o.audio || cfg.audio || 'giong-doc.wav');
if (!fs.existsSync(audio)) die(`Không tìm thấy file giọng đọc: ${audio}`);
// ---------- 裁口播两头：原文件留成 <名>_truoc-cat.wav（只在第一次裁时留），giong-doc.wav 换成裁好的 ----------
const backup = audio.replace(/(\.[^.\/]+)?$/, '') + '_truoc-cat.wav';
function trimAudio(src, t0, t1) {
  if (!fs.existsSync(backup)) fs.copyFileSync(audio, backup);
  const len = t1 - t0, tmpOut = audio.replace(/(\.[^.\/]+)?$/, '') + '.trimming.wav';
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src,
    '-af', `atrim=start=${t0.toFixed(3)}:end=${t1.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.015,afade=t=out:st=${Math.max(0, len - 0.015).toFixed(3)}:d=0.015`,
    '-c:a', 'pcm_s16le', tmpOut]);
  fs.renameSync(tmpOut, audio);
  console.log(`  Đã cắt giọng đọc: giữ ${t0.toFixed(2)}–${t1.toFixed(2)} giây, dài ${len.toFixed(2)} giây → ${path.basename(audio)} (file gốc trước khi cắt: ${path.basename(backup)})`);
  console.log('  Giọng đọc đã thay đổi: chạy lại tao-timeline.mjs (không cần sửa phan-canh.json, từ khóa tìm theo chữ); ảnh tĩnh và video đã render phải làm lại.');
}
const trimSecs = o.trim && o.trim !== 'auto' ? o.trim.split(',').map(Number) : null;
if (o.trim && o.trim !== 'auto' && !(trimSecs.length === 2 && trimSecs.every(Number.isFinite) && trimSecs[1] > trimSecs[0] && trimSecs[0] >= 0)) die('--trim ghi auto, hoặc hai số giây «đầu,cuối», ví dụ --trim 0.80,22.88');
if (trimSecs) trimAudio(fs.existsSync(backup) ? backup : audio, trimSecs[0], trimSecs[1]);
// 语言：--lang，或 du-an.json 的 lang；没写就 auto（whisper 自己判断）。这一版只做越南语（vi）和英语（en）
const LANG = o.lang || cfg.lang || 'auto';
if (!['vi', 'en', 'auto'].includes(LANG)) die(`--lang chỉ nhận vi hoặc en (bản này chỉ làm giọng đọc tiếng Việt và tiếng Anh), đang là ${LANG}`);
const scriptPath = o.script ? path.resolve(o.script) : (fs.existsSync(path.join(dir, 'loi-thoai.txt')) ? path.join(dir, 'loi-thoai.txt') : null);
if (o.trim === 'auto' && (o.noWhisper || !scriptPath)) die('--trim auto cần có whisper và lời thoại (để tìm phần thừa ở hai đầu); nếu không, dùng --trim đầu,cuối để cắt tay');
const outJson = path.resolve(dir, o.out || cfg.subtitles || 'phu-de.json');
const run = (cmd, args, opt = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28, ...opt });
const duration = +run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).trim();
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- 文字切成「字」：一个汉字一个；英文词、数字（Token、AI、5.5）整个算一个；标点单独记下来 ----------
const PUNCT = /[，。！？；：、,.!?;:…—“”"'‘’（）()《》「」『』【】〈〉\[\]\s]/;   // v1.3：加了「」『』【】，稿子里的引号不再算成字、不再误报「没识别出」
function units(text) {
  text = text.normalize('NFC');   // 越南语：统一成预组合字符（ệ 不拆成 e + 两个附加符）
  const out = []; const re = /[\p{Script=Latin}\p{M}\p{N}]+(?:[.'’\-][\p{Script=Latin}\p{M}\p{N}]+)*|[\s\S]/gu; let m;
  while ((m = re.exec(text))) { const s = m[0]; if (s.length === 1 && PUNCT.test(s)) { if (out.length) out[out.length - 1].after = (out[out.length - 1].after || '') + s; } else out.push({ text: s }); }
  return out;
}
const isWord = (t) => /^[\p{Script=Latin}\p{M}\p{N}]/u.test(t);
// 字宽（按汉字宽算）：汉字 1；越南语 / 英文词按字母数 × 0.55，最少 1（试验 2 里英文词按 2 个字算，越南语、英语全是词，改成按字母数）
const weight = (u) => (isWord(u.text) ? Math.max(1, [...u.text].length * 0.55) : 1);
const width = (us) => us.reduce((a, u) => a + weight(u), 0);
// 按稿子标点分句、分字幕条：。！？ 断句；，；：、 和换行断条；太长的条从中间再切
function splitCues(us, max) {
  const cues = []; let cur = [], sid = 1;
  const flush = (endSentence) => { if (cur.length) cues.push({ us: cur, sid }); cur = []; if (endSentence) sid++; };
  for (const u of us) { cur.push(u); const a = u.after || '';
    if (/[。！？!?…]/.test(a) || /\.(\s|$)/.test(a) || /^\.$/.test(a) || /\n/.test(a)) flush(true); else if (/[，,；;：:]/.test(a)) flush(false); }   // 顿号「、」不断条
  flush(true);
  const res = [];
  for (const c of cues) {
    let parts = [c.us];
    // 太长就切两半：有字级时间时切在中间一段里停顿最长的地方，没有就切正中间
    const cut = (p) => { let k = Math.ceil(p.length / 2);
      if (p[0].start !== undefined) {
        const lo = Math.ceil(p.length * 0.3), hi = Math.floor(p.length * 0.7);
        // 先找这段话中间 30%–70% 里最长的一处静音（比 DTW 字间空隙可靠），切在静音后面的第一个字；没有静音再用字间空隙
        const t0 = p[lo].start, t1 = p[hi].start, sil = (typeof PAUSES !== 'undefined' ? PAUSES : []).filter((q) => q.e > t0 && q.s < t1).sort((a, b) => (b.e - b.s) - (a.e - a.s))[0];
        if (sil) { let best = 1e9; for (let i = lo; i <= hi; i++) { const d = Math.abs(p[i].start - sil.e); if (d < best) { best = d; k = i; } } }   // 静音结束后说的第一个字开新的一条
        else { let best = -1; for (let i = lo; i <= hi; i++) { const g = p[i].start - p[i - 1].end; if (g > best) { best = g; k = i; } } }
      }
      return [p.slice(0, k), p.slice(k)]; };
    const tooWide = (p) => p.length > 1 && width(p) > max;
    while (parts.some(tooWide)) parts = parts.flatMap((p) => (tooWide(p) ? cut(p) : [p]));
    for (const p of parts) res.push({ us: p, sid: c.sid });
  }
  return res;
}
// 静音检测：-30 dB、最短 0.04 秒（试验 1 里这组最好）。返回 [{s, e}]
function silenceList() {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', audio, '-af', 'silencedetect=noise=-30dB:d=0.04', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 });
  const S = []; let s = null;
  for (const line of String(r.stderr || '').split('\n')) {
    const a = line.match(/silence_start: (-?[\d.]+)/), b = line.match(/silence_end: ([\d.]+)/);
    if (a) s = Math.max(0, +a[1]); if (b && s !== null) { S.push({ s, e: +b[1] }); s = null; }
  }
  if (s !== null) S.push({ s, e: duration });
  return S;
}
// 把每条字幕里的字按字宽在 [start, end] 里摊开
function spread(cue) {
  const tot = cue.us.reduce((a, u) => a + weight(u), 0); let acc = 0;
  return cue.us.map((u) => { const st = cue.start + (cue.end - cue.start) * acc / tot; acc += weight(u); return { text: u.text, start: r2(st), end: r2(cue.start + (cue.end - cue.start) * acc / tot) }; });
}

// ---------- 静音合并：间隔不到 0.035 秒的两段静音算一段；去掉片头片尾 ----------
const SIL = []; for (const x of silenceList()) { const l = SIL[SIL.length - 1]; if (l && x.s - l.e < 0.035) l.e = x.e; else SIL.push({ ...x }); }
let sp0 = 0, sp1 = duration;
if (SIL.length && SIL[0].s <= 0.05) sp0 = SIL[0].e;
if (SIL.length && SIL[SIL.length - 1].e >= duration - 0.05) sp1 = SIL[SIL.length - 1].s;
const PAUSES = SIL.filter((x) => x.s > sp0 + 0.05 && x.e < sp1 - 0.05);
const notes = [];   // 要人核对的地方
let cues = [], method = '', fixes = [];
const extra = [];   // 识别出来、稿子里没有的话：{where: 'head'|'tail'|'mid', text, start, end}

if (o.noWhisper) {
  // ---------- 后备：稿子 + 静音检测 ----------
  if (!scriptPath) die('Không có whisper thì phải có lời thoại: đặt loi-thoai.txt trong thư mục dự án, hoặc --script loi-thoai.txt');
  method = 'lời thoại + dò khoảng lặng bằng ffmpeg (-30 dB, 0,04 giây) để ngắt câu, trong câu chia thời gian theo độ dài chữ; không nhận dạng giọng nói';
  cues = splitCues(units(fs.readFileSync(scriptPath, 'utf8')), o.max);
  const L = cues.map((c) => c.us.reduce((a, u) => a + weight(u), 0)), tot = L.reduce((a, b) => a + b, 0), rate = (sp1 - sp0) / tot;
  // 动态规划：第 k 个句界选一处停顿（或者「没找到停顿」，按字数估的位置），让每条字幕的时长最接近 字数×语速；停顿越长越像句界
  const N = cues.length; let cum = 0;
  const cands = []; for (let k = 1; k < N; k++) { cum += L[k - 1]; const est = sp0 + (sp1 - sp0) * cum / tot;
    const endS = /[。！？!?]/.test(cues[k - 1].us[cues[k - 1].us.length - 1].after || '');
    cands.push([{ t: est, s: est, e: est, virt: true, pen: 0.35 }, ...PAUSES.map((p) => ({ t: (p.s + p.e) / 2, s: p.s, e: p.e, pen: -Math.min(p.e - p.s, 0.3) * (endS ? 1.5 : 1) }))]); }
  let prev = [{ t: sp0, cost: 0, path: [] }];
  for (let k = 0; k < N - 1; k++) {
    prev = cands[k].map((c) => { let best = null;
      for (const p of prev) { if (c.t <= p.t + 0.15) continue; const v = p.cost + Math.abs((c.t - p.t) - L[k] * rate) + c.pen; if (!best || v < best.cost) best = { t: c.t, cost: v, path: [...p.path, c] }; }
      return best; }).filter(Boolean);
    if (!prev.length) die('Không căn được thời gian: lời thoại có nhiều câu hơn hẳn số khoảng lặng trong âm thanh? Kiểm tra lời thoại và giọng đọc có cùng một đoạn không');
  }
  const fin = prev.map((p) => ({ ...p, cost: p.cost + Math.abs((sp1 - p.t) - L[N - 1] * rate) })).sort((a, b) => a.cost - b.cost)[0];
  const B = fin.path;
  cues.forEach((c, k) => { c.start = k === 0 ? sp0 : B[k - 1].e; c.end = k === N - 1 ? sp1 : B[k].s; if (c.end - c.start < 0.2) c.end = c.start + 0.2; });
  B.forEach((b, k) => { if (b.virt) notes.push(`Giữa dòng ${k + 1} và ${k + 2} (khoảng giây ${b.t.toFixed(2)}) không thấy khoảng lặng, đã ước lượng theo số chữ, nên nghe lại`); });
  const used = new Set(B.filter((b) => !b.virt).map((b) => b.s));
  for (const p of PAUSES) if (!used.has(p.s) && p.e - p.s >= 0.08) notes.push(`${p.s.toFixed(2)}–${p.e.toFixed(2)} giây có khoảng lặng nhưng không coi là chỗ ngắt câu (lấy hơi giữa câu, hoặc bỏ sót chỗ ngắt)`);
  cues.forEach((c) => { c.chars = spread(c); });
} else {
  // ---------- 主路：whisper-cli + DTW 字级时间 ----------
  // install.sh 在 Linux 上把 whisper-cli 装到 ~/.local/bin（不一定在 PATH 里），先看那里
  const localCli = path.join(os.homedir(), '.local/bin/whisper-cli');
  const wcli = fs.existsSync(localCli) ? localCli : ['whisper-cli', 'whisper-cpp'].find((c) => { try { execFileSync('which', [c], { stdio: 'ignore' }); return true; } catch { return false; } });
  if (!wcli) die('Không có whisper-cli. Cài: bash "$SKILL/install.sh" (hoặc brew install whisper-cpp); hoặc dùng cách dự phòng: đưa loi-thoai.txt và thêm --no-whisper');
  const mdirs = [path.join(os.homedir(), '.cache/whisper-cpp'), '/opt/homebrew/share/whisper-cpp', '/usr/local/share/whisper-cpp'];
  const model = o.model || process.env.WHISPER_MODEL || mdirs.flatMap((d) => { try { return fs.readdirSync(d).filter((f) => /^ggml-.*\.bin$/.test(f) && !/silero|for-tests/.test(f)).map((f) => path.join(d, f)); } catch { return []; } }).sort((a, b) => (/large-v3-turbo/.test(b) ? 1 : 0) - (/large-v3-turbo/.test(a) ? 1 : 0))[0];
  if (!model || !fs.existsSync(model)) die('Không có model whisper. Chạy bash "$SKILL/install.sh" để tải ggml-large-v3-turbo-q5_0.bin vào ~/.cache/whisper-cpp/, hoặc chỉ định bằng --model; hoặc dùng --no-whisper');
  const preset = path.basename(model).replace(/^ggml-/, '').replace(/\.bin$/, '').replace(/-q\d.*$/, '').replace(/-/g, '.');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zimu-'));
  try {
    run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', audio, '-ar', '16000', '-ac', '1', '-c:a', 'pcm_s16le', path.join(tmp, 'a.wav')]);
    const t0 = Date.now();
    run(wcli, ['-m', model, '-l', LANG, '-f', path.join(tmp, 'a.wav'), '-ojf', '-of', path.join(tmp, 'w'), '-dtw', preset, '-np'], { stdio: ['ignore', 'ignore', 'pipe'] });
    console.log(`  whisper nhận dạng mất ${((Date.now() - t0) / 1000).toFixed(1)} giây (model ${path.basename(model)})`);
    const W = JSON.parse(fs.readFileSync(path.join(tmp, 'w.json'), 'utf8'));
    method = `whisper-cli (${path.basename(model)}, thời gian từng từ bằng DTW) + chỉnh chỗ ngắt câu theo khoảng lặng`;
    // whisper 原文存进作品目录（临时目录会删）：.json 是原样输出，.txt 是一段一行带秒数，查「稿子里没有」的话在哪时看
    fs.copyFileSync(path.join(tmp, 'w.json'), path.join(dir, 'whisper-goc.json'));
    fs.writeFileSync(path.join(dir, 'whisper-goc.txt'), `Văn bản whisper nghe được (${path.basename(audio)}, ${duration.toFixed(2)} giây, model ${path.basename(model)}). Thời gian tính bằng giây; mỗi lần chạy phu-de.mjs sẽ ghi đè file này.\n\n` +
      (W.transcription || []).map((s) => `${(s.offsets.from / 1000).toFixed(2)}–${(s.offsets.to / 1000).toFixed(2)}  ${s.text.trim()}`).join('\n') + '\n');
    // 识别出的字：每个 token 取 DTW 时间（没有就取 token 起点），多字 token 往下一个 token 的时间摊开
    const rec = []; let carry = null, spaceCarry = false;   // spaceCarry：被丢掉的半个字节 token 前面有空格 → 下一个 token 是新词
    for (const seg of W.transcription || []) {
      const toks = (seg.tokens || []).filter((k) => !/^\[_/.test(k.text));
      toks.forEach((k, i) => {
        let tt = k.t_dtw >= 0 ? k.t_dtw / 100 : k.offsets.from / 1000; if (carry !== null) { tt = Math.min(tt, carry); carry = null; }
        const clean = k.text.replace(/�/g, ''); if (!clean.trim()) { if (/^\s/.test(k.text)) spaceCarry = true; if (/�/.test(k.text)) carry = tt; return; }   // 单独一个空格的 token（越南语常见）也算新词开头
        const nx = toks[i + 1], tn = nx ? (nx.t_dtw >= 0 ? nx.t_dtw / 100 : nx.offsets.from / 1000) : seg.offsets.to / 1000;
        const us = units(clean);
        // 越南语 / 英语：whisper 常把一个词切成几个 token（" Vi" + "ệt"）。token 不以空格开头、上一个也是词、中间没标点，就接到上一个词后面
        const prev = rec[rec.length - 1];
        if (us.length && prev && !/^\s/.test(clean) && !spaceCarry && !prev.after && isWord(prev.text) && isWord(us[0].text) && prev.segEnd === seg.offsets.to / 1000) { prev.text = (prev.text + us[0].text).normalize('NFC'); prev.after = us[0].after; us.shift(); }
        spaceCarry = false;
        us.forEach((u, j) => rec.push({ text: u.text, start: tt + (tn - tt) * j / Math.max(1, us.length), segEnd: seg.offsets.to / 1000, after: u.after }));
      });
    }
    rec.forEach((u, i) => { const n = rec[i + 1]; u.end = Math.min(n ? n.start : u.segEnd, u.start + 0.5, u.segEnd); if (u.end <= u.start) u.end = u.start + 0.05; });
    if (!rec.length) die('whisper không nhận ra chữ nào (âm thanh có bị im lặng không?)');
    if (scriptPath) {
      // 稿子和识别结果按字对齐：对上的字用识别的时间；稿子里有、识别里没有的字按前后插值；不一样的地方记进「识别改正」
      const S = units(fs.readFileSync(scriptPath, 'utf8')); const n = S.length, m = rec.length, eq = (a, b) => a.text.toLowerCase() === b.text.toLowerCase();
      const D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
      for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) D[i][j] = eq(S[i - 1], rec[j - 1]) ? D[i - 1][j - 1] + 1 : Math.max(D[i - 1][j], D[i][j - 1]);
      const pair = new Array(n).fill(-1); for (let i = n, j = m; i > 0 && j > 0;) { if (eq(S[i - 1], rec[j - 1])) { pair[i - 1] = j - 1; i--; j--; } else if (D[i - 1][j] >= D[i][j - 1]) i--; else j--; }
      for (let i = 0; i < n; i++) if (pair[i] >= 0) { S[i].start = rec[pair[i]].start; S[i].end = rec[pair[i]].end; }
      for (let i = 0; i < n; i++) if (S[i].start === undefined) {
        let a = i - 1; while (a >= 0 && pair[a] < 0) a--; let b = i + 1; while (b < n && pair[b] < 0) b++;
        const ta = a >= 0 ? S[a].end : sp0, tb = b < n ? S[b].start : sp1, k = b - a;
        S[i].start = ta + (tb - ta) * (i - a - 1) / Math.max(1, k - 1 + 1e-9) * ((k - 1) / k); S[i].end = S[i].start + (tb - ta) / k;
      }
      // 记录改了哪些字（识别 → 稿子），带秒数；识别出来、稿子里没有的话记进 extra（开头 / 结尾 / 中间）
      const span = (us) => (us.length ? `${us[0].start.toFixed(2)}–${us[us.length - 1].end.toFixed(2)} giây` : '');
      let i = 0, j = 0; while (i < n || j < m) {
        if (i < n && pair[i] >= 0 && pair[i] === j) { i++; j++; continue; }
        let i2 = i; while (i2 < n && pair[i2] < 0) i2++; const j2 = i2 < n ? pair[i2] : m;
        const ra = rec.slice(j, j2), sb = S.slice(i, i2), a = joinUs(ra), b = joinUs(sb);
        if (a !== b) {
          fixes.push(`${span(ra.length ? ra : sb)}  ${a || '(không nghe ra)'} → ${b || '(không có trong lời thoại)'}`);
          if (!b) extra.push({ where: i === 0 ? 'head' : i >= n ? 'tail' : 'mid', text: a, start: ra[0].start, end: ra[ra.length - 1].end });
          if (!a) notes.push(`${span(sb)} «${b}» có trong lời thoại nhưng không nghe ra: có thể nói nhanh hoặc không rõ, hoặc giọng đọc không có câu này; thời gian các chữ này là ước lượng, nên nghe lại`);
        }
        i = i2; j = j2; if (i >= n && j >= m) break;
      }
      for (const x of extra) {
        const at = `${x.start.toFixed(2)}–${x.end.toFixed(2)} giây nghe ra «${x.text}», không có trong lời thoại`;
        if (x.where === 'head') notes.push(`${at}: ở đầu giọng đọc, trước câu đầu tiên của lời thoại, thường là đuôi câu trước lẫn vào khi cắt file. Phụ đề đã bỏ theo lời thoại nhưng âm thanh vẫn còn; muốn bỏ thì chạy lại với --trim auto (tự cắt hai đầu, file gốc giữ thành ${path.basename(backup)})`);
        else if (x.where === 'tail') notes.push(`${at}: ở cuối giọng đọc, sau câu cuối của lời thoại, thường là đầu câu sau lẫn vào khi cắt file. Phụ đề đã bỏ theo lời thoại nhưng âm thanh vẫn còn; muốn bỏ thì chạy lại với --trim auto`);
        else if (/^((ừ|ờ|ừm|à|ạ|thì|là|mà|kiểu|nói chung|um|uh|uhm|er|so|well|like|you know)\s*)+$/i.test(x.text)) notes.push(`${at}: là từ đệm khi nói, phụ đề viết theo lời thoại nên không thêm vào, thường không cần xử lý (muốn hiện trong phụ đề thì thêm vào loi-thoai.txt rồi chạy lại)`);   // v1.3
        else notes.push(`${at}: ở giữa giọng đọc, có thể là nói nhầm, nói lặp, hoặc lời thoại thiếu câu này; nghe lại, nếu lời thoại thiếu thì thêm vào loi-thoai.txt rồi chạy lại`);
      }
      // --trim auto：口播两头有稿子外的话就裁掉，再用裁好的口播重跑一遍（时间全部重新算）
      if (o.trim === 'auto') {
        const head = extra.find((x) => x.where === 'head'), tail = extra.find((x) => x.where === 'tail');
        // 切点放在稿外话和正文之间的那段静音中间；没有静音就紧挨着正文切
        const gap = (a, b) => SIL.filter((q) => q.e > a && q.s < b).sort((x, y) => (y.e - y.s) - (x.e - x.s))[0];
        let t0 = 0, t1 = duration;
        if (head) { const first = S[0].start, q = gap(head.end - 0.15, first + 0.15); t0 = q ? (Math.max(q.s, head.end - 0.15) + Math.min(q.e, first + 0.15)) / 2 : Math.max(0, first - 0.05); }
        if (tail) { const last = S[n - 1].end, q = gap(last - 0.15, tail.start + 0.15); t1 = q ? (Math.max(q.s, last - 0.15) + Math.min(q.e, tail.start + 0.15)) / 2 : Math.min(duration, tail.start); }
        if (!head && !tail) console.log('  --trim auto: hai đầu giọng đọc không có phần thừa, không cần cắt');
        else if (!(t1 - t0 > 1)) console.log('  --trim auto: điểm cắt tính ra không hợp lý, chưa cắt; dùng --trim đầu,cuối để cắt tay');
        else {
          fs.rmSync(tmp, { recursive: true, force: true });
          trimAudio(audio, t0, t1);
          const rest = []; for (let k = 0; k < A.length; k++) { if (A[k] === '--trim') { k++; continue; } rest.push(A[k]); }
          console.log('  Chạy lại phụ đề với giọng đọc đã cắt:');
          const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...rest], { stdio: 'inherit' });
          process.exit(r.status ?? 1);
        }
      }
      cues = splitCues(S, o.max);
    } else {
      cues = []; let cur = [];
      let segNo = 0;
      rec.forEach((u, i) => { cur.push(u); if (!rec[i + 1] || rec[i + 1].segEnd !== u.segEnd) { segNo++; const tmpc = splitCues(cur.map((x, k) => ({ ...x, after: k === cur.length - 1 ? '.' : (x.after || '') })), o.max); tmpc.forEach((c) => { c.sid = segNo; }); cues.push(...tmpc); cur = []; } });
      notes.push('Không có lời thoại: phụ đề là văn bản whisper nghe được, không có dấu câu và có thể sai chính tả (tên riêng, từ tiếng Anh hay sai nhất); soát lại trước khi làm tiếp');
    }
    cues.forEach((c) => { c.start = c.us[0].start; c.end = c.us[c.us.length - 1].end; c.chars = c.us.map((u) => ({ text: u.text, start: r2(u.start), end: r2(u.end) })); });
    // 句界对到最近的静音上（±0.2 秒）
    for (let k = 1; k < cues.length; k++) { const a = cues[k - 1], b = cues[k];
      const mid = (a.end + b.start) / 2, near = PAUSES.filter((p) => p.e > a.end - 0.15 && p.s < b.start + 0.15);
      const sil = near.sort((x, y) => (Math.abs((x.s + x.e) / 2 - mid) - (x.e - x.s)) - (Math.abs((y.s + y.e) / 2 - mid) - (y.e - y.s)))[0];
      if (sil) { if (sil.s > a.start + 0.1) a.end = sil.s; if (sil.e < b.end - 0.1) b.start = Math.max(sil.e, a.end); } }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}

// v1.3-vi: dòng phụ đề quá ngắn (< 0,8 giây — whisper hay dồn mấy từ đầu câu vào một thời điểm): dời ranh giới với dòng kề bên
// trong cùng câu theo tỉ lệ độ dài chữ, để người xem kịp đọc
for (let k = 0; k < cues.length; k++) {
  const c = cues[k]; if (!(c.end - c.start < 0.8)) continue;
  const nx = cues[k + 1] && cues[k + 1].sid === c.sid ? cues[k + 1] : null, pv = !nx && cues[k - 1] && cues[k - 1].sid === c.sid ? cues[k - 1] : null;
  const a = nx ? c : pv, b = nx ? nx : c; if (!a) continue;
  const wa = width(a.us), wb = width(b.us), cut = a.start + (b.end - a.start) * wa / (wa + wb);
  if (Math.abs(cut - a.end) < 0.05) continue;
  notes.push(`Dòng «${joinUs(c.us)}» chỉ hiện ${(c.end - c.start).toFixed(2)} giây: đã dời ranh giới với dòng bên cạnh tới giây ${cut.toFixed(2)} (theo số chữ)`);
  a.end = cut; b.start = cut;
}
// ---------- 整理输出：字级时间收进所在字幕条；显示时间比语音早 0.05 秒出现，显示到下一条出现 ----------
// 条内文字：英文/数字中间的点保留（5.5），其余标点不进字幕
// 越南语 / 英语：词和词之间留一个空格（v1.3-vi）
function joinUs(us) { return us.map((u, i) => { const n = us[i + 1]; if (!n) return u.text;
  if (/^\.$/.test((u.after || '').trim()) && /^[0-9]/.test(n.text) && /[0-9]$/.test(u.text)) return u.text + '.';
  return u.text + (isWord(u.text) || isWord(n.text) || /\s/.test(u.after || '') ? ' ' : ''); }).join('').replace(/\s+/g, ' ').trim(); }
const outCues = cues.map((c, k) => ({ id: k + 1, text: joinUs(c.us), start: r2(c.start), end: r2(c.end), sid: c.sid }));
const chars = [];
cues.forEach((c, k) => { let last = outCues[k].start;
  for (const ch of c.chars) { const st = Math.min(Math.max(ch.start, last, outCues[k].start), outCues[k].end), en = Math.min(Math.max(ch.end, st + 0.02), outCues[k].end); chars.push({ text: ch.text, start: r2(st), end: r2(en), cue: k + 1 }); last = st; } });
outCues.forEach((c, k) => { c.show = r2(Math.max(0, k ? Math.max(c.start - 0.05, outCues[k - 1].end) : c.start - 0.05)); });
outCues.forEach((c, k) => { c.hide = k + 1 < outCues.length ? outCues[k + 1].show : r2(duration); });
{ // v1.3：口播最后一个字离文件结尾太近（不到 0.5 秒），画面来不及收尾，最后一个镜头的内容会一闪而过
  const lastEnd = outCues[outCues.length - 1].end, tail = duration - lastEnd;
  if (tail < 0.5) notes.push(`Chữ cuối được nói xong ở giây ${lastEnd.toFixed(2)}, chỉ cách cuối file ${tail.toFixed(2)} giây: không có khoảng nghỉ cuối, cảnh cuối sẽ lướt qua quá nhanh. Ghi "duration": ${(Math.ceil((lastEnd + 1.2) * 10) / 10).toFixed(1)} trong phan-canh.json (dài hơn giọng đọc khoảng 1 giây) để giữ cảnh cuối lâu hơn; dòng phụ đề cuối sẽ kéo tới hết video, render.mjs sẽ thêm khoảng lặng sau giọng đọc`);
}
const sentences = []; for (const c of outCues) { const s = sentences.find((x) => x.sid === c.sid); if (s) { s.cues.push(c.id); s.end = c.end; s.text += ' ' + c.text; } else sentences.push({ sid: c.sid, text: c.text, start: c.start, end: c.end, cues: [c.id] }); }
const punct = (k) => (cues[k].us[cues[k].us.length - 1].after || '').replace(/\s/g, '');
const text = outCues.map((c, k) => c.text + (punct(k) || (k === outCues.length - 1 ? '.' : ','))).join(' ');
const J = {
  ghi_chu: 'Thời gian tính bằng giây, theo file giọng đọc. start/end là lúc bắt đầu/kết thúc lời nói; show/hide là lúc phụ đề hiện/ẩn trên hình (hiện sớm hơn lời 0,05 giây, giữ đến khi dòng sau hiện). chars là thời gian từng từ.',
  phuong_phap: method, nguon: { am_thanh: path.basename(audio), loi_thoai: scriptPath ? path.basename(scriptPath) : null },
  ...(fixes.length ? { sua_theo_loi_thoai: fixes } : {}), ...(notes.length ? { can_kiem_tra: notes } : {}),
  duration: r2(duration), speech: { start: outCues[0].start, end: outCues[outCues.length - 1].end }, text,
  sentences: sentences.map((s, i) => ({ id: i + 1, text: s.text, start: s.start, end: s.end, cues: s.cues })),
  cues: outCues.map(({ sid, ...c }) => c), chars,
};
fs.writeFileSync(outJson, JSON.stringify(J, null, 1));
const ts = (x) => { const ms = Math.round(x * 1000); return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
fs.writeFileSync(outJson.replace(/\.json$/i, '') + '.srt', J.cues.map((c) => `${c.id}\n${ts(c.show)} --> ${ts(c.hide)}\n${c.text}\n`).join('\n'));
console.log(`Đã ghi ${outJson} (kèm file .srt): ${J.cues.length} dòng phụ đề, ${sentences.length} câu, ${chars.length} từ; cách làm: ${method}`);
for (const c of J.cues) console.log(`  ${String(c.id).padStart(2)}  ${c.show.toFixed(2)}–${c.hide.toFixed(2)}  ${c.text}`);
if (fixes.length) console.log(`Sửa theo lời thoại (nghe được → lời thoại):\n  ${fixes.join('\n  ')}`);
if (notes.length) console.log(`Cần kiểm tra:\n  ${notes.join('\n  ')}`);
