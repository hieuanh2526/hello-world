#!/usr/bin/env node
// tao-timeline.mjs：phu-de.json + phan-canh.json → timeline.js（页面用 <script src="timeline.js"></script> 引入，得到 window.TL）。
// 出处：我们做风格测试时的tao-timeline.mjs（写死了 Token 那段的文件名）；skill 版改成从参数或du-an.json 读，
// Token 专用字段（例句、数据样例）变成可选，加了 标题 / 高亮 / 字幕强调 / 素材 几个通用字段。
//
// Cách dùng:
//   node tao-timeline.mjs <thư-mục-dự-án>     đọc subtitles, storyboard, timeline trong du-an.json (không có thì dùng
//                                              phu-de.json, phan-canh.json, timeline.js), ghi ra <thư-mục-dự-án>/timeline.js
//   node tao-timeline.mjs --subs phu-de.json --storyboard phan-canh.json -o timeline.js
// phan-canh.json 字段见 SKILL.md「phan-canh.json 怎么写」；examples/token/phan-canh.json 是完整例子。
import fs from 'node:fs';
import path from 'node:path';

const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const args = process.argv.slice(2);
let subsPath, sbPath, outPath, dir, lang;
for (let i = 0; i < args.length; i++) {
  const a = args[i], v = () => args[++i] ?? die(`Thiếu giá trị sau tham số ${a}`);
  if (a === '--subs') subsPath = v();
  else if (a === '--storyboard') sbPath = v();
  else if (a === '-o' || a === '--out') outPath = v();
  else if (a === '-h' || a === '--help') { console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(4, 9).join('\n')); process.exit(0); }
  else if (a.startsWith('-')) die(`Không hiểu tham số: ${a}`);
  else dir = a;
}
if (dir) {
  dir = path.resolve(dir);
  const cfgPath = path.join(dir, 'du-an.json');
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : {};
  subsPath ??= path.join(dir, cfg.subtitles || 'phu-de.json');
  sbPath ??= path.join(dir, cfg.storyboard || 'phan-canh.json');
  outPath ??= path.join(dir, cfg.timeline || 'timeline.js');
  lang = cfg.lang;   // vi / en：模板里画面上的固定小字按这个写
}
if (!subsPath || !sbPath || !outPath) die('Cách dùng: node tao-timeline.mjs <thư-mục-dự-án>, hoặc --subs phu-de.json --storyboard phan-canh.json -o timeline.js');
for (const f of [subsPath, sbPath]) if (!fs.existsSync(f)) die(`Không tìm thấy ${f}`);
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { die(`${f} không phải JSON hợp lệ: ${e.message}`); } };
const subs = read(subsPath), sb = read(sbPath);

// ---------- 字幕 ----------
if (!Array.isArray(subs.cues) || !subs.cues.length) die(`${subsPath} không có cues (các dòng phụ đề)`);
if (!Array.isArray(subs.chars) || !subs.chars.length) die(`${subsPath} không có chars (thời gian từng từ)`);
const duration = +(sb.duration ?? subs.duration);
if (!(duration > 0)) die('Không biết thời lượng: phan-canh.json hoặc phu-de.json phải có duration (giây)');
const cues = subs.cues.map((c, i, a) => {
  const show = c.show ?? Math.max(0, c.start - 0.05);
  const next = a[i + 1];
  let hide = c.hide ?? (next ? (next.show ?? Math.max(0, next.start - 0.05)) : duration);
  if (!next && hide < duration) hide = duration;   // v1.3：phan-canh.json 的 duration 比口播长（片尾多停一会儿）时，最后一条字幕留到片尾
  return { id: c.id ?? i + 1, text: c.text, start: c.start, end: c.end, show: +show.toFixed(3), hide: +hide.toFixed(3) };
});
cues.forEach((c, i) => { if (i && c.show < cues[i - 1].show) die(`Dòng phụ đề ${c.id} có thời gian sớm hơn dòng trước, kiểm tra phu-de.json`); });

// ---------- 镜头（没写 shots 时按句子自动分：每个句子一个镜头，给快速试渲用） ----------
let shots = sb.shots;
if (!Array.isArray(shots) || !shots.length) {
  const groups = Array.isArray(subs.sentences) && subs.sentences.length ? subs.sentences.map((s) => s.cues) : cues.map((c) => [c.id]);
  shots = groups.map((ids, k) => ({ id: k + 1, cues: ids, title: ids.map((id) => cues.find((c) => c.id === id)?.text || '').join(' ') }));
  console.log(`  phan-canh.json chưa có shots, đã tự chia ${shots.length} cảnh theo câu (chỉ để render thử; làm thật thì viết phân cảnh riêng)`);
}
shots = shots.map((s, k) => {
  const cs = (s.cues || []).map((id) => cues.find((c) => c.id === id)).filter(Boolean);
  const start = s.start ?? (k === 0 ? 0 : cs[0]?.show);
  const end = s.end ?? (k === shots.length - 1 ? duration : undefined);
  return { id: s.id ?? k + 1, start, end, title: s.title || '', cues: s.cues || [], keywords: s['关键字'] || s.keywords || [],
    ...(s['要讲清'] ? { 要讲清: s['要讲清'] } : {}), ...(s['运动设想'] ? { 运动设想: s['运动设想'] } : {}) };
});
shots.forEach((s, k) => { if (s.end === undefined) s.end = shots[k + 1]?.start ?? duration; });
shots.forEach((s, k) => {
  if (!(s.start >= 0) || !(s.end > s.start)) die(`Cảnh ${s.id} có thời điểm bắt đầu/kết thúc sai: ${s.start}–${s.end}`);
  if (k && Math.abs(s.start - shots[k - 1].end) > 0.02) console.log(`  Lưu ý: cảnh ${shots[k - 1].id} kết thúc lúc ${shots[k - 1].end}, cảnh ${s.id} bắt đầu lúc ${s.start}, hai cảnh không liền nhau`);
});
if (Math.abs(shots[shots.length - 1].end - duration) > 0.05) console.log(`  Lưu ý: cảnh cuối kết thúc ở giây ${shots[shots.length - 1].end}, video dài ${duration} giây`);

// ---------- 关键词时间：在指定字幕条（不写 cue 就在全文）里按字找短语，取第一个字的起点、最后一个字的终点 ----------
// 越南语 / 英语：比较时去掉空格、统一成 NFC、不分大小写（「large language model」= 三个词连起来）
const norm = (x) => String(x).normalize('NFC').replace(/\s+/g, '').toLowerCase();
function findPhrase(phrase, cueId, nth = 1) {
  phrase = norm(phrase);
  const cs = cueId ? subs.chars.filter((c) => c.cue === cueId) : subs.chars;
  let hit = 0;
  for (let i = 0; i < cs.length; i++) {
    let s = '';
    for (let j = i; j < cs.length; j++) {
      s += norm(cs[j].text);
      if (s === phrase) { if (++hit === nth) return { start: cs[i].start, end: cs[j].end }; break; }
      if (!phrase.startsWith(s)) break;
    }
  }
  return null;
}
const marks = {};
for (const m of sb.marks || []) {
  const phrase = m.phrase || m.name;
  const found = findPhrase(phrase, m.cue, m.nth || 1);
  if (!found) {
    const where = m.cue ? `dòng phụ đề ${m.cue} «${cues.find((c) => c.id === m.cue)?.text ?? '(không có dòng này)'}»` : 'toàn bài';
    die(`Từ khóa «${m.name}»: không tìm thấy «${phrase}»${m.nth > 1 ? ` lần thứ ${m.nth}` : ''} trong ${where} (so theo từng từ, không phân biệt hoa thường và khoảng trắng)`);
  }
  marks[m.name] = found;
}
// 各镜头的「时间点」（这个镜头要卡点的关键词）只给人看、不进 TL；名字要在 marks 里，不在就提醒（v1.1）
for (const s of Array.isArray(sb.shots) ? sb.shots : []) for (const k of s['时间点'] || [])
  if (!Object.prototype.hasOwnProperty.call(marks, k)) console.log(`  Lưu ý: điểm khớp «${k}» của cảnh ${s.id ?? '?'} không có trong marks (thiếu trong marks, hoặc viết tên khác)`);

// ---------- 全片固定上色的词（强调色 A/B）和字幕里要强调的词 ----------
const hl = (sb['高亮'] || []).map((h, i) => (typeof h === 'string' ? { text: h, role: i === 0 ? 'A' : 'B' } : { text: h.text, role: h.role || (i === 0 ? 'A' : 'B') }));
const TL = {
  lang: lang || sb.lang || 'vi',
  duration, fps: sb.fps || 30, size: sb.size || [1920, 1080],
  title: sb['标题'] || '',
  text: subs.text || cues.map((c) => c.text).join(' '),
  cues, chars: subs.chars, shots, marks,
  highlights: hl,
  emphasis: sb['字幕强调'] || [],
  assets: sb['素材'] ?? null,
  // Token 例子专用的老字段（新内容里是 null）
  example: sb['例句'] ? { text: sb['例句'], tokens: sb['例句切分'] || [] } : null,
  data: sb['数据样例'] ? sb['数据样例']['句子'] : null,
};

const js = `// Tự động tạo, đừng sửa tay: sửa phu-de.json hoặc phan-canh.json rồi chạy lại node tao-timeline.mjs <thư-mục-dự-án>
// 页面里用 <script src="timeline.js"></script> 引入（和页面放在同一个文件夹），得到 window.TL。时间单位秒。
window.TL = ${JSON.stringify(TL, null, 1)};
(function (TL) {
  // 当前该显示的字幕（按 show/hide），没有返回 null
  TL.cueAt = function (t) { for (const c of TL.cues) if (t >= c.show && t < c.hide) return c; return null; };
  // 当前镜头
  TL.shotAt = function (t) { for (const s of TL.shots) if (t >= s.start && t < s.end) return s; return TL.shots[TL.shots.length - 1]; };
  // 关键词开始说的时间，例如 TL.mark('Token')；TL.markEnd('Token') 是说完的时间；没有这个词会抛错，不确定时先 TL.has('词')
  TL.has = function (name) { return Object.prototype.hasOwnProperty.call(TL.marks, name); };
  TL.mark = function (name) { const m = TL.marks[name]; if (!m) throw new Error('TL.marks không có ' + name); return m.start; };
  TL.markEnd = function (name) { const m = TL.marks[name]; if (!m) throw new Error('TL.marks không có ' + name); return m.end; };
})(window.TL);
`;
fs.writeFileSync(outPath, js);
console.log(`Đã ghi ${outPath}`);
console.log(`  Dài ${duration} giây, ${cues.length} dòng phụ đề, ${shots.length} cảnh, ${Object.keys(marks).length} từ khóa${hl.length ? ', tô màu cố định ' + hl.map((h) => h.text + '=' + h.role).join(', ') : ''}`);
for (const [k, v] of Object.entries(marks)) console.log(`  ${k.padEnd(10)} ${v.start.toFixed(2)}–${v.end.toFixed(2)}`);
