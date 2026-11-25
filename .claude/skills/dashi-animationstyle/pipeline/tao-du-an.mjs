#!/usr/bin/env node
// tao-du-an.mjs：建一个作品目录（一段口播 + 一套风格 = 一个作品），后面的转写、分镜、页面、渲染都在这个目录里做。
//
// Cách dùng:
//   node tao-du-an.mjs <thư-mục-dự-án> --example token-vi              ví dụ tiếng Việt có sẵn (lần đầu: kiểm tra máy render được)
//   node tao-du-an.mjs <thư-mục-dự-án> [--style ve-tay] --audio giong-cua-toi.m4a [--script loi-thoai.txt] --lang vi|en   lời thoại của bạn (chỉ tiếng Việt, tiếng Anh)
//   node tao-du-an.mjs --list                                              liệt kê các phong cách
// Thư mục dự án sẽ có: du-an.json (cấu hình), giong-doc.wav, index.html (trang chép từ thư mục phong cách), hieu-ung.js (chuyển cảnh, chuyển động phụ).
// Nếu thư mục đã có thì chỉ thêm file còn thiếu, không ghi đè (muốn ghi đè trang thì thêm --force).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL = path.dirname(HERE);
const STYLES = path.join(SKILL, 'styles');
const die = (m) => { console.error(`✗ ${m}`); process.exit(1); };
const styleNames = () => fs.readdirSync(STYLES).filter((n) => fs.existsSync(path.join(STYLES, n, 'vi-du_Token.html')));

const args = process.argv.slice(2);
const o = { _: [] };
for (let i = 0; i < args.length; i++) {
  const a = args[i], v = () => args[++i] ?? die(`Thiếu giá trị sau tham số ${a}`);
  if (a === '--style') o.style = v();
  else if (a === '--example') o.example = v();
  else if (a === '--audio') o.audio = v();
  else if (a === '--script') o.script = v();
  else if (a === '--lang') o.lang = v();
  else if (a === '--force') o.force = true;
  else if (a === '--list') o.list = true;
  else if (a === '-h' || a === '--help') o.help = true;
  else if (a.startsWith('-')) die(`Không hiểu tham số: ${a}`);
  else o._.push(a);
}
// Mô tả tiếng Việt cho --list: [trông thế nào, hợp để nói về gì]
const VI_DESC = {
  'so-do-phang': ['Sơ đồ phẳng: nền kem, dải tiêu đề màu hổ phách, quy trình đánh số theo hàng ngang.', 'Hợp với: các bước, nguyên lý, chuỗi nguyên nhân – kết quả.'],
  've-tay': ['Vẽ tay: giấy trắng ngà, nét bút mực xanh đen + một màu cam, vẽ từng nét, viết từng chữ.', 'Hợp với: giải thích khái niệm, ghi chép quan sát.'],
  'bao-co': ['Báo cũ: cả trang báo, ống kính lặn xuống vùng minh họa xanh đậm.', 'Hợp với: phổ biến kiến thức, bài chuyên đề.'],
  'cat-giay': ['Cắt giấy cổ điển: các lớp giấy cắt trên nền giấy nhàu, chuyển động giật kiểu stop-motion.', 'Hợp với: quan điểm, góc nhìn có thái độ.'],
  'cat-dan-sieu-thuc': ['Cắt dán siêu thực: áp phích nền xám be, tiêu đề chữ có chân siêu đậm, một hình ảnh so sánh lớn.', 'Hợp với: cách tư duy, nhận thức, tâm lý.'],
  'hoat-hinh-3d': ['Hoạt hình 3D: nền than chì, vật thể khối bóng bẩy, bố cục chia cột kiểu tạp chí.', 'Hợp với: nguyên lý khoa học, quá trình thí nghiệm.'],
  'cong-nghe-nen-den': ['Công nghệ nền đen: nền gần đen, đường mảnh vàng ấm, chữ có chân hiện dần từ mờ sang rõ.', 'Hợp với: khái niệm công nghệ cao, xu hướng, lịch sử.'],
  'neon-cyber': ['Neon cyber: phong cách thử nghiệm, chưa có mẫu chung.', 'Chỉ dùng khi muốn tự phát triển thêm.'],
};
if (o.list) {
  // 每套两行：看起来什么样（风格卡第一段的第一句）、适合讲什么（「适合」那句，到分号为止）；整句打印，不截半句
  for (const n of styleNames()) {
    const card = path.join(STYLES, n, 'the-phong-cach.md');
    const md = fs.existsSync(card) ? fs.readFileSync(card, 'utf8') : '';
    const para = md.split('\n').find((l) => l.trim() && !l.startsWith('#')) || '';
    const sents = para.split('。').map((x) => x.trim()).filter(Boolean);
    const look = sents[0] ? sents[0] + '。' : '';
    const fit = (sents.find((x) => x.startsWith('适合')) || '').split('；')[0];
    const grade = (md.match(/\*\*分级：([AB])\*\*/) || [])[1];
    const tpl = fs.existsSync(path.join(STYLES, n, 'mau.html')) ? '' : ' (chưa có mau.html)';
    const vi = VI_DESC[n];
    console.log(`  ${n.padEnd(18)} ${grade ? 'hạng ' + grade : ''}${tpl}  ${vi ? vi[0] : look}`);
    if (vi || fit) console.log(`  ${''.padEnd(18)}         ${vi ? vi[1] : fit + '。'}`);
  }
  console.log('\nHạng A: dùng nền có sẵn, đổi nội dung chỉ cần vẽ lại cảnh. Hạng B: bố cục gắn với ví dụ Token, phải xếp lại bố cục hoặc nghĩ hình ảnh so sánh mới (thêm 15–20 phút). Xem 3 ảnh mẫu của mỗi phong cách trong styles/<phong-cách>/anh-tinh/.');
  process.exit(0);
}
// Ví dụ có vi-du.json (vd token-vi) chỉ làm cho một phong cách: tự chọn phong cách đó
let EXCFG = null;
if (o.example) { const f = path.join(SKILL, 'examples', o.example, 'vi-du.json'); if (fs.existsSync(f)) EXCFG = JSON.parse(fs.readFileSync(f, 'utf8')); }
if (EXCFG && EXCFG.style) {
  if (o.style && o.style !== EXCFG.style) console.log(`  Ví dụ ${o.example} chỉ có cho phong cách ${EXCFG.style}, dùng ${EXCFG.style} thay cho ${o.style}`);
  o.style = EXCFG.style;
}
if (!o.style && !o.help && o._.length) { o.style = 've-tay'; console.log('  Không ghi --style: dùng phong cách mặc định ve-tay (vẽ tay)'); }
if (o.help || !o._.length || !o.style) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(3, 9).join('\n'));
  process.exit(o.help ? 0 : 1);
}

// 风格：接受「ve-tay」「S22」「手绘」这种写法
const names = styleNames();
// 文件夹改成了越南语（不带声调）：老的中文名、带声调 / 空格的写法都还认，例如 手绘笔记、「vẽ tay」、Ve Tay
const ALIAS = { 扁平流程图: 'so-do-phang', 手绘笔记: 've-tay', 复古报刊: 'bao-co', 复古剪纸: 'cat-giay', 超现实拼贴: 'cat-dan-sieu-thuc', 立体卡通: 'hoat-hinh-3d', 黑底科技: 'cong-nghe-nen-den', 霓虹赛博: 'neon-cyber' };
if (o.style) { const zh = Object.keys(ALIAS).find((k) => k === o.style || k.includes(o.style)); o.style = zh ? ALIAS[zh]
  : o.style.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').trim().toLowerCase().replace(/[\s_]+/g, '-'); }
const style = names.find((n) => n === o.style) || names.find((n) => n.includes(o.style)) ||
  names.find((n) => (fs.readFileSync(path.join(STYLES, n, 'vi-du_Token.html'), 'utf8').slice(0, 600)).includes(o.style));
if (!style) die(`Không có phong cách «${o.style}». Hiện có: ${names.join(', ')}`);
const sdir = path.join(STYLES, style);

const dir = path.resolve(o._[0]);
if (dir.startsWith(SKILL + path.sep)) die('Đừng đặt thư mục dự án bên trong thư mục skill; hãy đặt trong dự án của bạn hoặc trên Desktop');
fs.mkdirSync(dir, { recursive: true });
const put = (src, name, force = false) => {
  const dst = path.join(dir, name);
  if (fs.existsSync(dst) && !force) { console.log(`  Đã có ${name}, không ghi đè`); return; }
  fs.copyFileSync(src, dst); fs.chmodSync(dst, 0o644); console.log(`  ✓ ${name}`);   // v1.3：skill 文件夹是只读的时候，复制出来的页面也会是只读，改成可写
};

const cfg = { style, audio: 'giong-doc.wav', subtitles: 'phu-de.json', storyboard: 'phan-canh.json', timeline: 'timeline.js', page: 'index.html', output: `${path.basename(dir)}.mp4` };
const fast = /hoat-hinh-3d|cat-dan-sieu-thuc|cat-giay|cong-nghe-nen-den/.test(style);   // 满屏颗粒的几套，PNG 截图慢，默认用 jpeg 截图
if (fast) cfg.format = 'jpeg';
// 口播语言：这一版只做越南语（vi）和英语（en）；自带的 Token 例子是中文，只用来确认电脑能出片
if (o.lang && !['vi', 'en'].includes(o.lang)) die(`--lang chỉ nhận vi hoặc en, đang là ${o.lang}`);
if (!o.example) { if (!o.lang) die('Với lời thoại của bạn, cần ghi --lang vi (tiếng Việt) hoặc --lang en (tiếng Anh)'); cfg.lang = o.lang; }

if (o.example) {
  const ex = path.join(SKILL, 'examples', o.example);
  if (!fs.existsSync(ex)) die(`Không có ví dụ: ${o.example} (hiện có: ${fs.readdirSync(path.join(SKILL, 'examples')).join(', ')})`);
  for (const f of ['giong-doc.wav', 'phu-de.json', 'phu-de.srt', 'phan-canh.json', 'phan-canh.md', 'loi-thoai.txt']) if (fs.existsSync(path.join(ex, f))) put(path.join(ex, f), f);
  put(fs.existsSync(path.join(ex, 'index.html')) ? path.join(ex, 'index.html') : path.join(sdir, 'vi-du_Token.html'), 'index.html', o.force);
  if (EXCFG && EXCFG.lang) cfg.lang = EXCFG.lang;
} else {
  if (o.audio) {
    const src = path.resolve(o.audio);
    if (!fs.existsSync(src)) die(`Không tìm thấy file giọng đọc: ${src}`);
    const dst = path.join(dir, 'giong-doc.wav');
    if (fs.existsSync(dst) && !o.force) console.log('  Đã có giong-doc.wav, không ghi đè');
    else {
      // 统一转成 44.1 kHz 立体声 16 位 wav（wav、m4a、mp3、mov 都行）
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', src, '-vn', '-ar', '44100', '-ac', '2', '-c:a', 'pcm_s16le', dst]);
      const d = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst], { encoding: 'utf8' }).trim();
      console.log(`  ✓ giong-doc.wav (${d.toFixed(2)} giây)${d > 65 ? '  Lưu ý: dài hơn 60 giây, nên chia thành nhiều đoạn' : ''}`);
    }
  }
  if (o.script) put(path.resolve(o.script), 'loi-thoai.txt');
  const tpl = fs.existsSync(path.join(sdir, 'mau.html')) ? 'mau.html' : 'vi-du_Token.html';
  put(path.join(sdir, tpl), 'index.html', o.force);
  if (tpl === 'vi-du_Token.html') console.log('  Phong cách này chưa có mẫu chung: index.html là trang của ví dụ Token; giữ phần nền và vẽ lại cảnh theo the-phong-cach.md');
}
put(path.join(HERE, 'hieu-ung.js'), 'hieu-ung.js');   // v1.2：转场和次要动作的共用部件，模板里的 fxBefore / fxAfter 调它
const cfgPath = path.join(dir, 'du-an.json');
if (!fs.existsSync(cfgPath) || o.force) fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`  ✓ du-an.json (phong cách ${style}${fast ? ', chụp ảnh bằng jpeg' : ''})`);

if (fs.existsSync(path.join(dir, 'phu-de.json')) && fs.existsSync(path.join(dir, 'phan-canh.json'))) {
  execFileSync(process.execPath, [path.join(HERE, 'tao-timeline.mjs'), dir], { stdio: 'inherit' });
}
console.log(`\nThư mục dự án: ${dir}\nThẻ phong cách: ${path.join(sdir, 'the-phong-cach.md')}`);
console.log(o.example
  ? `Bước tiếp: node "${path.join(HERE, 'render.mjs')}" "${path.join(dir, 'index.html')}"`
  : 'Bước tiếp: tạo phu-de.json → viết phan-canh.json → node tao-timeline.mjs <thư-mục-dự-án> → sửa index.html theo thẻ phong cách (xem SKILL.md)');
