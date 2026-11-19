#!/usr/bin/env node
// render.mjs：把一个定义了 window.seek(t)、舞台 1920×1080 的 HTML 逐帧截图，编成 H.264 + 口播音频的 mp4。
// 无头 Chrome + Chrome DevTools Protocol（Node 自带 WebSocket），不依赖任何 npm 包。
// 每次运行：调试端口由系统随机分配（--remote-debugging-port=0），Chrome 配置和临时文件放在自己的临时目录，
// 所以多个渲染可以同时跑，互不干扰。用法见 SKILL.md，或 `node render.mjs --help`。
// 出处：我们做风格测试时的共用 render.mjs（10-07）；skill 版（10-08）改了：口播和输出默认从作品目录的
// du-an.json 读、没有就找页面旁边的 giong-doc.wav；Chrome 自动找；--no-subtitle；开头检查 Node 版本和 ffmpeg。
// v1.1（10-08 晚，按观众实测改）：--no-subtitle 的输出一律带「_khong-phu-de」（给了 -o 也加）；--scan 扫片拼图、--check-marks 关键词前后帧拼图；
// --stills 出图前把同一前缀的旧静帧挪进 anh-tinh-cu/。

import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const W = 1920, H = 1080;

const HELP = `Cách dùng:
  node render.mjs <thư-mục-dự-án/index.html> [tùy chọn]                 video hoàn chỉnh: render từng khung 30 fps, ghép giọng đọc, ra mp4
  node render.mjs <thư-mục-dự-án/index.html> --preview              xem trước: 10 fps, 960×540, nhanh
  node render.mjs <thư-mục-dự-án/index.html> --stills 2.1,7.5,12.6  ảnh tĩnh: xuất PNG 1920×1080 tại các giây đã cho, kèm một ảnh kiểm tra rộng 480
  node render.mjs <thư-mục-dự-án/index.html> --scan --check-marks   ảnh kiểm tra (không ra video, vài chục giây): ảnh ghép quét toàn bài + ảnh trước/sau từng từ khóa

Giá trị mặc định đọc từ du-an.json cạnh trang (tao-du-an.mjs đã ghi sẵn): giọng đọc lấy từ audio, file ra lấy từ output;
không có du-an.json thì dùng giong-doc.wav cạnh trang, file ra là «tên-thư-mục.mp4» đặt cạnh trang.

Tùy chọn:
  -o, --out <file>        file mp4 ra (xem trước thì mặc định thêm «_xem-truoc» vào tên)
  --audio <file>          âm thanh (mặc định như trên); --no-audio: không có tiếng
  --config <du-an.json>   chỉ định file cấu hình dự án (mặc định du-an.json cạnh trang)
  --no-subtitle           không vẽ phụ đề (thêm ?nosub=1 vào địa chỉ trang, công tắc NOSUB trong trang có tác dụng; dùng khi tự thêm phụ đề lúc dựng).
                          Tên file ra tự thêm «_khong-phu-de» (kể cả khi có -o; tên đã có thì không thêm nữa),
                          nên không ghi đè bản có phụ đề; ảnh tĩnh và ảnh kiểm tra cũng thêm «_khong-phu-de»
  --check-determinism auto|giây,giây  kiểm tra tính ổn định (không ra video): ở mỗi thời điểm, chụp một ảnh trong trang mới mở, rồi nhảy
                          gần cuối video và quay lại chụp lần nữa, so hai ảnh có giống từng điểm ảnh không. Khác nhau = hình phụ thuộc thứ tự
                          seek (thường do trạng thái canvas như lineCap, lineJoin, setLineDash, globalAlpha chưa được đặt lại).
                          auto = lấy 25%, 50%, 75% độ dài video
  --scan                  ảnh ghép quét: 3 khung mỗi giây, mỗi ô 480×270, một ảnh 4×8 ô (khoảng 10,7 giây), độ dài video quyết định số ảnh
                          (kiem-tra/quet_1.png …, ảnh cũ cùng tên bị xóa trước) — để tìm chữ bị cắt, chữ chồng, khoảng trống, chỗ đổi cảnh
  --check-marks           ảnh trước/sau từ khóa: mỗi từ khóa chụp 0,1 giây trước và 0,35 giây sau khi bắt đầu nói, mỗi hàng hai từ (trước, sau, trước, sau),
                          ra kiem-tra/diem-khop.png và diem-khop_ghi-chu.txt (hàng nào là từ nào); kiểu viết tay thì ô «sau» có thể mới viết vài nét, bắt đầu hiện là được
                          Hai tùy chọn này chỉ chụp ảnh nhỏ để kiểm tra, không ra video; dùng được cùng --no-subtitle, --outdir
  --fps <n>               số khung/giây (video mặc định 30, xem trước 10)
  --scale <x>             tỉ lệ chụp (video 1, xem trước 0.5)
  --duration <giây>       thời lượng (mặc định lần lượt: window.DURATION, window.TL.duration, độ dài âm thanh)
  --from <giây> --to <giây>   chỉ render một đoạn (cắt âm thanh theo), để kiểm tra cục bộ
  --format png|jpeg       định dạng ảnh chụp (mặc định png, không mất chất lượng); --quality <n> chất lượng jpeg (mặc định 92). Dùng cùng --stills thì ra ảnh tĩnh jpg (mặc định 90)
  --crf <n>               chất lượng x264 (video mặc định 18, xem trước 26)
  --outdir <thư-mục>      nơi lưu --stills (mặc định cạnh trang); nơi lưu --scan / --check-marks (mặc định kiem-tra/ cạnh trang)
  --prefix <tên>          tiền tố tên ảnh tĩnh (mặc định là tên thư mục của trang). Trước khi xuất, ảnh tĩnh và ảnh kiểm tra 480 cũ cùng tiền tố
                          được chuyển vào anh-tinh-cu/<tiền-tố_giờphútgiây>/, thư mục chỉ còn đợt mới; ảnh thử nghiệm thì đổi tiền tố (vd --prefix thu) để không lẫn
  --gpu                   cho Chrome dùng GPU (mặc định tắt, render phần mềm ổn định hơn và không tranh card đồ họa khi chạy song song)
  --keep                  giữ thư mục tạm (để gỡ lỗi); --tmp <thư-mục> nơi đặt thư mục tạm (mặc định thư mục tạm của hệ thống)
  --chrome <đường-dẫn>    file chạy Chrome (mặc định tự tìm: biến môi trường CHROME_PATH → Google Chrome → Chromium → Edge → Brave)
`;

// ---------------- 参数 ----------------
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const val = () => { if (i + 1 >= argv.length) die(`Thiếu giá trị sau tham số ${a}`); return argv[++i]; };
    switch (a) {
      case '-h': case '--help': o.help = true; break;
      case '-o': case '--out': o.out = val(); break;
      case '--audio': o.audio = val(); break;
      case '--no-audio': o.noAudio = true; break;
      case '--config': o.config = val(); break;
      case '--no-subtitle': case '--nosub': o.noSub = true; break;
      case '--fps': o.fps = +val(); break;
      case '--scale': o.scale = +val(); break;
      case '--duration': o.duration = +val(); break;
      case '--from': o.from = +val(); break;
      case '--to': o.to = +val(); break;
      case '--format': o.format = val(); break;
      case '--quality': o.quality = +val(); break;
      case '--crf': o.crf = +val(); break;
      case '--preview': o.preview = true; break;
      case '--stills': o.stills = val().split(',').map((s) => +s.trim()).filter((x) => Number.isFinite(x)); break;
      case '--scan': o.scan = true; break;
      case '--check-marks': o.checkMarks = true; break;
      case '--check-determinism': o.determinism = val(); break;
      case '--outdir': o.outdir = val(); break;
      case '--prefix': o.prefix = val(); break;
      case '--gpu': o.gpu = true; break;
      case '--keep': o.keep = true; break;
      case '--chrome': o.chrome = val(); break;
      case '--tmp': o.tmp = val(); break;
      default:
        if (a.startsWith('-')) die(`Không hiểu tham số: ${a}\n\n${HELP}`);
        o._.push(a);
    }
  }
  return o;
}
function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
function fail(msg) { throw new Error(msg); }   // Chrome 起来之后出错用 fail：抛出去，由 finally 关掉 Chrome、删临时目录
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fmtS = (ms) => (ms / 1000).toFixed(1) + ' giây';
const bjTime = () => new Date().toLocaleTimeString('vi-VN', { hour12: false });   // 本机时间（v1.3 起不再固定北京时间）

// ---------------- 极简 CDP 客户端 ----------------
class CDP {
  constructor(url) {
    this.url = url; this.seq = 0; this.pending = new Map(); this.listeners = [];
  }
  open() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);
      this.ws = ws;
      ws.onopen = () => resolve();
      ws.onerror = (e) => reject(new Error(`Không kết nối được cổng gỡ lỗi của Chrome: ${e.message || this.url}`));
      ws.onclose = () => { for (const p of this.pending.values()) p.reject(new Error('Mất kết nối với Chrome')); this.pending.clear(); };
      ws.onmessage = (ev) => {
        const m = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString('utf8'));
        if (m.id !== undefined) {
          const p = this.pending.get(m.id);
          if (!p) return;
          this.pending.delete(m.id);
          if (m.error) p.reject(new Error(`${p.method} thất bại: ${m.error.message}${m.error.data ? ' (' + m.error.data + ')' : ''}`));
          else p.resolve(m.result);
        } else if (m.method) {
          for (const l of this.listeners) if (l.method === m.method && (!l.session || l.session === m.sessionId)) l.fn(m.params);
        }
      };
    });
  }
  send(method, params = {}, sessionId, timeoutMs = 60000) {
    const id = ++this.seq;
    const msg = { id, method, params };
    if (sessionId) msg.sessionId = sessionId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Chờ ${method} quá ${timeoutMs / 1000} giây`)); }, timeoutMs);
      this.pending.set(id, {
        method,
        resolve: (v) => { clearTimeout(timer); resolve(v); },
        reject: (e) => { clearTimeout(timer); reject(e); },
      });
      this.ws.send(JSON.stringify(msg));
    });
  }
  on(method, fn, session) { this.listeners.push({ method, fn, session }); }
  once(method, session, timeoutMs = 60000) {
    return new Promise((resolve, reject) => {
      const l = { method, session, fn: (p) => { clearTimeout(timer); this.listeners.splice(this.listeners.indexOf(l), 1); resolve(p); } };
      const timer = setTimeout(() => { this.listeners.splice(this.listeners.indexOf(l), 1); reject(new Error(`Chờ ${method} quá ${timeoutMs / 1000} giây`)); }, timeoutMs);
      this.listeners.push(l);
    });
  }
  close() { try { this.ws.close(); } catch {} }
}

// ---------------- Chrome ----------------
// 自动找 Chrome：--chrome → 环境变量 CHROME_PATH → 常见安装位置 → PATH 里的命令。找不到返回 null。
// 只有 Google Chrome 实测过；Chromium、Edge、Brave 是同一个内核，理论上能用，没实测。
export function findChrome(explicit) {
  if (explicit) return fs.existsSync(explicit) ? explicit : null;
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const home = os.homedir();
  const mac = [
    'Google Chrome.app/Contents/MacOS/Google Chrome',
    'Chromium.app/Contents/MacOS/Chromium',
    'Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    'Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    'Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  for (const rel of mac) for (const root of ['/Applications', path.join(home, 'Applications')]) {
    const p = path.join(root, rel);
    if (fs.existsSync(p)) return p;
  }
  if (fs.existsSync('/opt/pw-browsers/chromium')) return '/opt/pw-browsers/chromium';   // Claude Code 云端容器自带的 Chromium
  for (const cmd of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try { const p = execFileSync('which', [cmd], { encoding: 'utf8' }).trim(); if (p) return p; } catch {}
  }
  return null;
}
export const CHROME_HINT = `Không tìm thấy Chrome.
  · Cài Google Chrome (https://www.google.com/chrome/, cài vào thư mục Applications), rồi chạy lại;
  · hoặc dùng --chrome <đường-dẫn> để chỉ định trình duyệt nhân Chromium khác (Edge, Brave, Chromium; chưa thử),
    hoặc đặt biến môi trường CHROME_PATH=<đường-dẫn>.`;

async function launchChrome(opts, tmp) {
  const exe = findChrome(opts.chrome);
  if (!exe) die(opts.chrome ? `Đường dẫn trong --chrome không tồn tại: ${opts.chrome}` : CHROME_HINT);
  const userDir = path.join(tmp, 'chrome-profile');
  const args = [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${userDir}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-sync',
    '--disable-background-networking', '--disable-component-update', '--disable-default-apps',
    '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows',
    '--disable-features=Translate,MediaRouter,OptimizationHints',
    '--hide-scrollbars', '--mute-audio', '--force-color-profile=srgb', '--force-device-scale-factor=1',
    `--window-size=${W},${H}`,
    ...(opts.gpu ? [] : ['--disable-gpu']),
    // Linux 上用 root 跑（云端容器）时 Chrome 不肯开沙箱，必须加 --no-sandbox；页面只是本地生成的 HTML
    ...(process.platform === 'linux' && process.getuid?.() === 0 ? ['--no-sandbox'] : []),
    'about:blank',
  ];
  const proc = spawn(exe, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let errText = '';
  proc.stderr.on('data', (d) => { if (errText.length < 20000) errText += d; });
  proc.stderr.on('error', () => {});
  const portFile = path.join(userDir, 'DevToolsActivePort');
  const t0 = Date.now();
  while (true) {
    const m = errText.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) return { proc, ws: m[1], userDir };
    if (fs.existsSync(portFile)) {
      const [port, p] = fs.readFileSync(portFile, 'utf8').trim().split('\n');
      if (port && p) return { proc, ws: `ws://127.0.0.1:${port}${p}`, userDir };
    }
    if (proc.exitCode !== null || proc.signalCode !== null) fail(`Chrome thoát ngay sau khi khởi động:\n${errText.slice(0, 2000)}`);
    if (Date.now() - t0 > 30000) { proc.kill('SIGKILL'); fail(`Sau 30 giây Chrome vẫn chưa đưa ra địa chỉ gỡ lỗi:\n${errText.slice(0, 2000)}`); }
    await sleep(25);
  }
}

// 关 Chrome：先 SIGTERM，2 秒没退再 SIGKILL；最后把命令行里带着本次临时目录的残留子进程（GPU、渲染进程等）清掉
// ——临时目录名是唯一的，不会误伤别的渲染任务或日常用的 Chrome。
// （试过先发 CDP 的 Browser.close，Chrome 反而会卡在退出流程里好几秒，所以不用。）
async function killChrome(proc, userDir) {
  if (proc && proc.exitCode === null && proc.signalCode === null) {
    proc.kill('SIGTERM');
    for (let i = 0; i < 40 && proc.exitCode === null && proc.signalCode === null; i++) await sleep(50);
    if (proc.exitCode === null && proc.signalCode === null) proc.kill('SIGKILL');
  }
  if (userDir) {
    try {
      const ps = execFileSync('ps', ['-axo', 'pid=,command='], { encoding: 'utf8', maxBuffer: 1 << 24 });
      for (const line of ps.split('\n')) {
        if (!line.includes(userDir)) continue;
        const pid = parseInt(line, 10);
        if (pid && pid !== process.pid) { try { process.kill(pid, 'SIGKILL'); } catch {} }
      }
    } catch {}
  }
  // 子进程可能还握着 stderr 管道，主动断开，免得 Node 等它们几秒才退出
  if (proc) { try { proc.stderr && proc.stderr.destroy(); } catch {} proc.unref(); }
}

// ---------------- 页面 ----------------
async function openPage(cdp, htmlPath, query = '') {
  // v1.2：页面引了 hieu-ung.js、旁边没有（老作品目录、手动 cp 模板时），就从 pipeline 复制一份过去
  // v1.3：页面在 skill 自己的文件夹里时不复制（不往 skill 里写东西）
  const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const inSkill = path.resolve(htmlPath).startsWith(SKILL_DIR + path.sep);
  if (!inSkill) try {
    const fx = path.join(path.dirname(path.resolve(htmlPath)), 'hieu-ung.js');
    if (!fs.existsSync(fx) && fs.readFileSync(htmlPath, 'utf8').includes('src="hieu-ung.js"')) {
      fs.copyFileSync(fileURLToPath(new URL('./hieu-ung.js', import.meta.url)), fx);
      console.log(`  Đã chép hieu-ung.js vào cạnh trang: ${fx}`);
    }
  } catch { /* 复制不了也照常打开：页面里没调用 动效 就不影响 */ }
  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p, t) => cdp.send(m, p, sessionId, t);
  const errors = [];
  cdp.on('Runtime.exceptionThrown', (p) => {
    const d = p.exceptionDetails || {};
    errors.push(`${d.exception?.description || d.text || 'lỗi không rõ'} (${d.url ? path.basename(decodeURIComponent(d.url)) : ''}:${d.lineNumber ?? '?'})`);
  }, sessionId);
  cdp.on('Runtime.consoleAPICalled', (p) => {
    if (p.type === 'error' || p.type === 'warning') console.log(`  Trang console.${p.type}: ${p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 300)}`);
  }, sessionId);
  cdp.on('Log.entryAdded', (p) => {
    const e = p.entry;
    if (e.level === 'error' && e.source !== 'violation') console.log(`  Trang báo lỗi: ${e.text.slice(0, 300)}${e.url ? ' (' + decodeURIComponent(e.url) + ')' : ''}`);
  }, sessionId);
  await S('Page.enable');
  await S('Runtime.enable');
  await S('Log.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  const loaded = cdp.once('Page.loadEventFired', sessionId, 60000);
  const nav = await S('Page.navigate', { url: pathToFileURL(path.resolve(htmlPath)).href + query });
  if (nav.errorText) fail(`Không mở được trang: ${nav.errorText}`);
  await loaded;
  // 等页面准备好：window.seek 是函数，且 window.ready 不是 false；页面一报错就停
  const t0 = Date.now();
  while (true) {
    if (errors.length) fail(`Trang bị lỗi khi tải:\n  ${errors.join('\n  ')}`);
    const ok = await evaluate(S, `typeof window.seek === 'function' && window.ready !== false`);
    if (ok) break;
    if (Date.now() - t0 > 20000) fail('Sau 20 giây trang vẫn chưa định nghĩa window.seek(t) (hoặc window.ready vẫn là false)');
    await sleep(100);
  }
  const info = await evaluate(S, `(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const tl = window.TL || {};
    return {
      duration: (typeof window.DURATION === 'number' ? window.DURATION : (typeof tl.duration === 'number' ? tl.duration : null)),
      sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight,
    };
  })()`, 30000);
  if (errors.length) fail(`Trang bị lỗi khi tải:\n  ${errors.join('\n  ')}`);
  if (info.sw > W || info.sh > H) console.log(`  Lưu ý: nội dung trang ${info.sw}×${info.sh} vượt quá ${W}×${H}, phần vượt sẽ không được chụp`);
  return { S, errors, info };
}

async function evaluate(S, expression, timeoutMs = 30000) {
  const r = await S('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, timeoutMs);
  if (r.exceptionDetails) {
    const d = r.exceptionDetails;
    throw new Error(`Mã trong trang bị lỗi: ${d.exception?.description || d.text}`);
  }
  return r.result.value;
}

async function seekAndShoot(S, errors, t, shot) {
  await evaluate(S, `Promise.resolve(window.seek(${t.toFixed(6)})).then(() => 1)`);
  if (errors.length) throw new Error(`Trang bị lỗi khi seek(${t.toFixed(3)}):\n  ${errors.join('\n  ')}`);
  const params = { format: shot.format, clip: { x: 0, y: 0, width: W, height: H, scale: shot.scale }, captureBeyondViewport: false, optimizeForSpeed: true };
  if (shot.format === 'jpeg') params.quality = shot.quality;
  const { data } = await S('Page.captureScreenshot', params, 60000);
  return Buffer.from(data, 'base64');
}

// ---------------- 工具 ----------------
function probeDuration(file) {
  try {
    return +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).trim();
  } catch { return null; }
}
function writeAsync(stream, buf) {
  return new Promise((resolve, reject) => {
    if (stream.destroyed || stream.writableEnded) return reject(new Error('ffmpeg đã thoát'));
    if (stream.write(buf)) return resolve();
    const onDrain = () => { stream.off('close', onClose); resolve(); };
    const onClose = () => { stream.off('drain', onDrain); reject(new Error('ffmpeg thoát giữa chừng')); };
    stream.once('drain', onDrain);
    stream.once('close', onClose);
  });
}

// ---------------- 主流程 ----------------
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts._.length) { console.log(HELP); process.exit(opts.help ? 0 : 1); }
  if (opts.stills && !opts.stills.length) die('Sau --stills cần ghi các số giây, cách nhau bằng dấu phẩy, ví dụ --stills 2.1,7.5,12.6');
  // 环境：Node 22 以上才有自带的 WebSocket；ffmpeg / ffprobe 要在 PATH 里
  if (typeof WebSocket === 'undefined') die(`Node quá cũ (đang là ${process.version}, cần bản 22 trở lên, có sẵn WebSocket). Trên Mac: brew install node, hoặc tải bộ cài ở https://nodejs.org.`);
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { die('Không tìm thấy ffmpeg. Trên Mac: brew install ffmpeg (chưa có Homebrew thì cài trước ở https://brew.sh).'); }
  const html = path.resolve(opts._[0]);
  if (!fs.existsSync(html)) die(`Không tìm thấy trang: ${html}`);
  const pageDir = path.dirname(html);
  const baseName = path.basename(pageDir);
  // 作品配置：--config 指定，或页面旁边的 du-an.json；里面的相对路径都相对于配置文件所在目录
  const cfgPath = opts.config ? path.resolve(opts.config) : path.join(pageDir, 'du-an.json');
  let cfg = {};
  if (fs.existsSync(cfgPath)) {
    try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch (e) { die(`Không đọc được cấu hình dự án (${cfgPath}): ${e.message}`); }
  } else if (opts.config) die(`Không tìm thấy cấu hình dự án: ${cfgPath}`);
  const cfgDir = path.dirname(cfgPath);
  const fromCfg = (k) => (cfg[k] ? path.resolve(cfgDir, cfg[k]) : null);
  if (opts.stills && (opts.scan || opts.checkMarks)) die('--stills và --scan / --check-marks phải chạy riêng hai lần');
  if (opts.determinism && (opts.stills || opts.scan || opts.checkMarks)) die('--check-determinism phải chạy riêng');
  const mode = opts.determinism ? 'determinism' : opts.stills ? 'stills' : (opts.scan || opts.checkMarks) ? 'check' : opts.preview ? 'preview' : 'final';
  const nsTag = opts.noSub ? '_khong-phu-de' : '';   // 不画字幕时，所有输出文件名都带「_khong-phu-de」，不覆盖带字幕的版本
  const fps = opts.fps || (mode === 'preview' ? 10 : 30);
  const scale = opts.scale || (mode === 'preview' ? 0.5 : 1);
  const format = opts.format || cfg.format || 'png';
  const quality = opts.quality || 92;
  const crf = opts.crf ?? (mode === 'preview' ? 26 : 18);
  const defAudio = fromCfg('audio') || path.join(pageDir, 'giong-doc.wav');
  let audio = opts.noAudio ? null : (opts.audio ? path.resolve(opts.audio) : defAudio);
  if (audio && !fs.existsSync(audio)) {
    if (opts.audio || cfg.audio) die(`Không tìm thấy âm thanh: ${audio}`);
    if (mode === 'final' || mode === 'preview') console.log(`  Cạnh trang không có du-an.json cũng không có giong-doc.wav, video ra sẽ không có tiếng (muốn có tiếng dùng --audio <file>)`);
    audio = null;
  }
  const query = opts.noSub ? '?nosub=1' : '';

  const tmp = fs.mkdtempSync(path.join(opts.tmp || os.tmpdir(), 'render-'));
  let chrome = null, cdp = null, ff = null, part = null, userDir = path.join(tmp, 'chrome-profile');
  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return; cleaned = true;
    try { cdp && cdp.close(); } catch {}
    await killChrome(chrome, userDir);
    if (ff && ff.exitCode === null) ff.kill('SIGKILL');
    if (part && fs.existsSync(part)) fs.rmSync(part, { force: true });   // 没渲完的半成品不留
    if (!opts.keep) fs.rmSync(tmp, { recursive: true, force: true });
  };
  let interrupted = false;
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, async () => { if (interrupted) return; interrupted = true; console.error(`\nNhận ${sig}, dọn dẹp rồi thoát`); await cleanup(); process.exit(130); });

  const T0 = Date.now();
  try {
    const launched = await launchChrome(opts, tmp);
    chrome = launched.proc;
    cdp = new CDP(launched.ws);
    await cdp.open();
    const port = new URL(launched.ws).port;
    console.log(`[${bjTime()}] Đã mở Chrome (cổng gỡ lỗi ${port}, thư mục tạm ${tmp})`);
    const { S, errors, info } = await openPage(cdp, html, query);
    if (opts.noSub) {
      const hasSwitch = await evaluate(S, `typeof NOSUB !== 'undefined' ? NOSUB : null`);
      if (hasSwitch !== true) console.log('  Lưu ý: trang không có công tắc NOSUB nên --no-subtitle không có tác dụng (trang cần có const NOSUB = /[?&]nosub=1/.test(location.search))');
    }
    const tLoad = Date.now() - T0;

    // ---------- 确定性检查（v1.3）：同一个 t，单独 seek 和「先跳到别处再回来」画出来要一模一样 ----------
    if (mode === 'determinism') {
      const dur = opts.duration || info.duration || (audio ? probeDuration(audio) : null);
      if (!dur) fail('Không biết thời lượng: hãy chỉ định bằng --duration, hoặc đặt window.DURATION trong trang');
      const times = opts.determinism === 'auto' ? [0.25, 0.5, 0.75].map((k) => +(dur * k).toFixed(2))
        : opts.determinism.split(',').map((x) => +x.trim()).filter((x) => Number.isFinite(x));
      if (!times.length) fail('Sau --check-determinism ghi auto, hoặc các số giây cách nhau bằng dấu phẩy');
      const far = +(dur * 0.95).toFixed(2);
      let bad = 0;
      for (const t of times) {
        const p = await openPage(cdp, html, query);           // 每个时刻都用新打开的页面，先单独截
        const a = await seekAndShoot(p.S, p.errors, t, { format: 'png', scale: 0.5 });
        await seekAndShoot(p.S, p.errors, far, { format: 'png', scale: 0.25 });
        await seekAndShoot(p.S, p.errors, Math.max(0, t / 2), { format: 'png', scale: 0.25 });
        const b = await seekAndShoot(p.S, p.errors, t, { format: 'png', scale: 0.5 });
        const same = Buffer.compare(a, b) === 0;
        if (!same) bad++;
        console.log(`  ${same ? '✓' : '✗'} giây ${t.toFixed(2)}: seek trực tiếp và «nhảy tới giây ${far}, giây ${(t / 2).toFixed(2)} rồi quay lại» ${same ? 'giống nhau' : 'khác nhau'}`);
      }
      console.log(bad ? `✗ ${bad} / ${times.length} thời điểm không khớp: hình phụ thuộc thứ tự seek. Đầu mỗi khung hãy đặt lại toàn bộ trạng thái canvas (ctx.reset() rồi đặt giá trị mặc định; cả canvas ngoài màn hình), chỗ nào dùng số ngẫu nhiên thì tạo lại seed trong seek(t), rồi chạy lại.`
        : `✓ cả ${times.length} thời điểm đều khớp`);
      console.log(`[${bjTime()}] Xong, mất ${fmtS(Date.now() - T0)}`);
      if (bad) process.exitCode = 2;
      return;
    }

    // ---------- 静帧 ----------
    if (mode === 'stills') {
      const outdir = path.resolve(opts.outdir || pageDir);
      fs.mkdirSync(outdir, { recursive: true });
      const prefix0 = opts.prefix || baseName;
      const prefix = nsTag && !prefix0.includes('khong-phu-de') ? prefix0 + nsTag : prefix0;
      // 同一前缀的旧静帧、旧检查图先挪走（不删），文件夹里只留这一批，免得新旧混在一起
      const esc = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const oldRe = new RegExp(`^${esc}_(anh-tinh_-?\\d+(\\.\\d+)?s\\.(png|jpg)|kiem-tra-480\\.png)$`);
      const isOld = (f) => oldRe.test(f);
      const olds = fs.readdirSync(outdir).filter(isOld);
      if (olds.length) {
        const hms = new Date().toLocaleTimeString('vi-VN', { hour12: false }).replace(/:/g, '');
        const bak = path.join(outdir, 'anh-tinh-cu', `${prefix}_${hms}`);
        fs.mkdirSync(bak, { recursive: true });
        for (const f of olds) fs.renameSync(path.join(outdir, f), path.join(bak, f));
        console.log(`  Đã chuyển ${olds.length} file của đợt trước (cùng tiền tố) vào ${bak}`);
      }
      const files = [];
      for (const t of opts.stills) {
        const jpg = opts.format === 'jpeg';   // v1.3：命令行写了 --format jpeg 就出 jpg（风格文件夹的 anh-tinh/ 用 jpg）
        const buf = await seekAndShoot(S, errors, t, jpg ? { format: 'jpeg', quality: opts.quality || 90, scale: 1 } : { format: 'png', scale: 1 });
        const f = path.join(outdir, `${prefix}_anh-tinh_${t.toFixed(2)}s.${jpg ? 'jpg' : 'png'}`);
        fs.writeFileSync(f, buf);
        files.push(f);
        console.log(`  ✓ ${f}`);
      }
      // 480 宽检查图：把静帧缩到 480 像素宽竖排（手机竖屏看横屏视频的宽度），看字幕和关键字是否还读得清
      const sheet = path.join(outdir, `${prefix}_kiem-tra-480.png`);
      const inputs = files.flatMap((f) => ['-i', f]);
      const filter = files.map((_, i) => `[${i}:v]scale=480:-1:flags=area[s${i}]`).join(';') + ';' + files.map((_, i) => `[s${i}]`).join('') + (files.length > 1 ? `vstack=inputs=${files.length}` : 'null');
      execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...inputs, '-filter_complex', filter, '-frames:v', '1', '-update', '1', sheet]);
      console.log(`  ✓ ${sheet}`);
      console.log(`[${bjTime()}] Xong, mất ${fmtS(Date.now() - T0)}`);
      return;
    }

    // ---------- 检查图（不出片）：扫片拼图、关键词前后帧拼图；每格 480×270，从页面直接截，和成片同一时刻的画面一样 ----------
    if (mode === 'check') {
      const dur = opts.duration || info.duration || (audio ? probeDuration(audio) : null);
      if (!dur) fail('Không biết thời lượng: hãy chỉ định bằng --duration, hoặc đặt window.DURATION trong trang');
      const outdir = path.resolve(opts.outdir || path.join(pageDir, 'kiem-tra'));
      fs.mkdirSync(outdir, { recursive: true });
      const lastT = Math.max(0, (Math.ceil(dur * 30 - 1e-6) - 1) / 30);   // 成片最后一帧的时间
      const frameT = (t) => Math.min(Math.max(0, Math.round(t * 30) / 30), lastT);   // 对到成片的帧上
      let nSheet = 0;
      const sheetOf = async (times, cols, file) => {   // 截一组小图，按 cols 列拼成一张（最后一行不满时空着）
        const sub = fs.mkdtempSync(path.join(tmp, 'sheet-'));
        for (let k = 0; k < times.length; k++) {
          const buf = await seekAndShoot(S, errors, frameT(times[k]), { format: 'png', scale: 0.25 });
          fs.writeFileSync(path.join(sub, `f_${String(k + 1).padStart(4, '0')}.png`), buf);
        }
        const rows = Math.ceil(times.length / cols);
        execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '1', '-i', path.join(sub, 'f_%04d.png'),
          '-vf', `tile=${cols}x${rows}:padding=6:color=white`, '-frames:v', '1', '-update', '1', file]);
        nSheet++;
        console.log(`  ✓ ${file}`);
      };
      if (opts.scan) {
        const base = `quet${nsTag}`;
        for (const f of fs.readdirSync(outdir)) if (new RegExp(`^${base}_\\d+\\.png$`).test(f)) fs.rmSync(path.join(outdir, f));   // 旧扫片先删（片子变短时张数会变少）
        const times = []; for (let k = 0; k / 3 <= lastT + 1e-6; k++) times.push(k / 3);
        const per = 32;   // 4 列 × 8 行，约 10.7 秒一张
        for (let s = 0; s * per < times.length; s++) {
          const ts = times.slice(s * per, (s + 1) * per);
          console.log(`  Ảnh quét ${s + 1}: ${ts[0].toFixed(2)}–${ts[ts.length - 1].toFixed(2)} giây (mỗi ô 1/3 giây, trái sang phải, trên xuống dưới)`);
          await sheetOf(ts, 4, path.join(outdir, `${base}_${s + 1}.png`));
        }
      }
      if (opts.checkMarks) {
        const marks = Object.entries(await evaluate(S, `(window.TL && window.TL.marks) || {}`)).map(([name, m]) => ({ name, start: m.start })).filter((m) => Number.isFinite(m.start)).sort((a, b) => a.start - b.start);
        if (!marks.length) console.log('  TL.marks không có từ khóa nên không xuất ảnh điểm khớp (marks trong phan-canh.json đang trống?)');
        else {
          const times = marks.flatMap((m) => [m.start - 0.1, m.start + 0.35]);
          const lines = [`Khung trước/sau từ khóa (diem-khop${nsTag}.png): mỗi ô 480×270; mỗi hàng hai từ, theo thứ tự «từ 1 trước, từ 1 sau, từ 2 trước, từ 2 sau»; trước = 0,1 giây trước khi nói, sau = 0,35 giây sau khi bắt đầu nói.`,
            'Cần thấy: ô «trước» chưa có chuyển động ứng với từ đó, ô «sau» đã bắt đầu hiện (kiểu viết tay, hiện từng chữ có thể mới được vài chữ, bắt đầu hiện là đạt).', ''];
          for (let r = 0; r * 2 < marks.length; r++) {
            const a = marks[r * 2], b = marks[r * 2 + 1];
            lines.push(`Hàng ${String(r + 1).padStart(2)}: trái ${a.name} (giây ${a.start.toFixed(2)})` + (b ? `   phải ${b.name} (giây ${b.start.toFixed(2)})` : ''));
          }
          await sheetOf(times, 4, path.join(outdir, `diem-khop${nsTag}.png`));
          fs.writeFileSync(path.join(outdir, `diem-khop${nsTag}_ghi-chu.txt`), lines.join('\n') + '\n');
          console.log(`  ✓ ${path.join(outdir, `diem-khop${nsTag}_ghi-chu.txt`)}\n  ${lines.slice(3).join('\n  ')}`);
        }
      }
      console.log(`[${bjTime()}] Xong, xuất ${nSheet} ảnh ghép, mất ${fmtS(Date.now() - T0)}`);
      return;
    }

    // ---------- 视频 ----------
    let duration = opts.duration || info.duration || (audio ? probeDuration(audio) : null);
    if (!duration) fail('Không biết thời lượng: hãy chỉ định bằng --duration, hoặc đặt window.DURATION trong trang');
    const from = opts.from || 0;
    const to = Math.min(opts.to ?? duration, duration);
    if (!(to > from)) fail(`Khoảng thời gian không hợp lệ: --from ${from} --to ${to}`);
    const nFrames = Math.ceil((to - from) * fps - 1e-6);
    const outLen = nFrames / fps;
    const suffix = `${mode === 'preview' ? '_xem-truoc' : ''}${nsTag}${opts.from !== undefined || opts.to !== undefined ? `_${from}-${to}s` : ''}`;
    const cfgOut = fromCfg('output');
    const defOut = cfgOut ? cfgOut.replace(/\.mp4$/i, '') + suffix + '.mp4' : path.join(pageDir, `${baseName}${suffix}.mp4`);
    let out = path.resolve(opts.out || defOut);
    // --no-subtitle 时就算 -o 给的是带字幕成片的名字，也加「_khong-phu-de」，不覆盖带字幕的那版
    if (nsTag && !path.basename(out).includes('khong-phu-de')) { const ext = path.extname(out); out = out.slice(0, out.length - ext.length) + nsTag + (ext || '.mp4'); }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    part = out.replace(/\.mp4$/i, '') + '.rendering.mp4';
    const outW = Math.round(W * scale), outH = Math.round(H * scale);
    console.log(`  ${mode === 'preview' ? 'Xem trước' : 'Video'}: ${from}–${to} giây, ${fps} khung/giây, tổng ${nFrames} khung, ${outW}×${outH}, ảnh ${format}${audio ? ', âm thanh ' + path.basename(audio) : ', không có tiếng'}${opts.noSub ? ', không vẽ phụ đề' : ''}`);
    console.log(`  File ra: ${out}`);

    const ffArgs = ['-hide_banner', '-loglevel', 'error', '-y',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', format === 'jpeg' ? 'mjpeg' : 'png', '-i', 'pipe:0'];
    if (audio) ffArgs.push('-ss', String(from), '-t', String(outLen), '-i', audio);
    ffArgs.push('-map', '0:v');
    if (audio) ffArgs.push('-map', '1:a', '-af', 'apad', '-c:a', 'aac', '-b:a', '192k');
    ffArgs.push(
      '-vf', `scale=${outW}:${outH}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
      '-c:v', 'libx264', '-preset', mode === 'preview' ? 'veryfast' : 'medium', '-crf', String(crf), '-tune', 'animation',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
      '-r', String(fps), '-t', String(outLen), '-movflags', '+faststart', part);
    ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'ignore', 'pipe'] });
    let ffErr = '';
    ff.stderr.on('data', (d) => { if (ffErr.length < 20000) ffErr += d; });
    const ffDone = new Promise((resolve) => ff.on('close', (code) => resolve(code)));
    ff.stdin.on('error', () => {});

    const tStart = Date.now();
    let tSeekShot = 0;
    for (let i = 0; i < nFrames; i++) {
      const t = from + i / fps;
      const a = Date.now();
      const buf = await seekAndShoot(S, errors, t, { format, quality, scale });
      tSeekShot += Date.now() - a;
      await writeAsync(ff.stdin, buf);
      if ((i + 1) % 60 === 0 || i + 1 === nFrames) {
        const el = Date.now() - tStart, per = el / (i + 1);
        console.log(`  Khung ${String(i + 1).padStart(4)}/${nFrames}  trung bình ${per.toFixed(0)} ms/khung  đã chạy ${fmtS(el)}  còn khoảng ${fmtS(per * (nFrames - i - 1))}`);
      }
    }
    ff.stdin.end();
    const code = await ffDone;
    if (code !== 0) fail(`ffmpeg mã hóa thất bại (mã thoát ${code}):\n${ffErr.slice(-3000)}`);
    fs.renameSync(part, out); part = null;
    const tFrames = Date.now() - tStart;
    const per = tFrames / nFrames;
    console.log(`[${bjTime()}] ✓ ${out}`);
    console.log(`  Thống kê: khởi động + tải ${fmtS(tLoad)}; ${nFrames} khung mất ${fmtS(tFrames)} (trung bình ${per.toFixed(0)} ms/khung, trong đó seek + chụp ${(tSeekShot / nFrames).toFixed(0)} ms); tổng ${fmtS(Date.now() - T0)}`);
    const st = fs.statSync(out);
    console.log(`  File ${(st.size / 1048576).toFixed(1)} MB, dài ${probeDuration(out)?.toFixed(2)} giây`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

// 只有直接运行时才跑（tu-kiem-tra.mjs 会 import 这里的 findChrome）
const realp = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
if (process.argv[1] && realp(process.argv[1]) === realp(fileURLToPath(import.meta.url))) main();
