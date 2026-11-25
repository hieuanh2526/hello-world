#!/usr/bin/env python3
"""tao-giong.py — tạo giọng đọc tiếng Việt cho một dự án bằng VieNeu-TTS (Apache-2.0).

  python3 tao-giong.py <thư-mục-dự-án> --xu-ly ghi-am-that.m4a                            chỉ chỉnh bản ghi âm thật (không cần vieneu)
  python3 tao-giong.py <thư-mục-dự-án> --mau mau-giong.m4a [--mau-tu 18.5 --mau-den 32]   nhân bản giọng từ mẫu ghi âm
  python3 tao-giong.py <thư-mục-dự-án> --giong "Thiện Minh"                                giọng có sẵn
  python3 tao-giong.py --danh-sach                                                         liệt kê giọng có sẵn
  python3 tao-giong.py <thư-mục-dự-án> --mau mau.wav --chi-cau "Vì vậy, giá trị hàng hóa bằng c cộng v cộng m." -o cau-sua.wav
                                                                                           chỉ tạo một câu (để vá bản ghi thật)
Kiểu giọng: --kieu giang-duong (MẶC ĐỊNH) = nam trung niên, truyền cảm, dõng dạc, đúng phong cách giảng đường đại học:
          trầm hơn ~4% (giữ âm sắc), thân giọng ấm hơn, bớt ù, rõ và vang hơn ở dải 2–4 kHz, nén nhẹ cho đều tiếng, chút vang phòng
          giảng rất nhẹ, nghỉ 0,6 giây giữa câu. --kieu goc: không chỉnh màu giọng (chỉ cắt lặng, chuẩn hóa âm lượng).
Tùy chọn: --cao-do 0.958 (nhân cao độ; <1 là trầm hơn)  --toc-do 1.07 (nhân tốc độ)  --nghi 0.5 (giây nghỉ giữa câu)
          --cach-doc <json> (mặc định knowledge/llct-cach-doc.json)  --khong-kiem (bỏ bước whisper nghe lại)  -o <file>

Đọc loi-thoai.txt của dự án, đổi ký hiệu sang cách đọc (c → «xê»…), tạo TỪNG CÂU; nếu có whisper-cli thì nghe lại từng câu,
câu nào lệch lời thoại thì tạo lại (tối đa 3 lần, đổi temperature). Ghép, chuẩn hóa âm lượng −16 LUFS, ghi giong-doc.wav
(44,1 kHz stereo) — sau đó chạy phu-de.mjs như bình thường. File gốc nếu có được giữ thành giong-doc_truoc.wav.

Chỉ nhân bản giọng của chính người yêu cầu (hoặc người đã đồng ý); ghi rõ trong README là giọng tạo bằng máy.
Cài: bash install.sh --voice (tạo môi trường Python riêng có vieneu). Script tự chạy lại bằng Python của môi trường đó.
"""
import argparse, difflib, json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILL = HERE.parent
VENV_PY = Path.home() / '.local/share/dashi-tts/venv/bin/python'
os.environ.setdefault('HF_HUB_DISABLE_XET', '1')   # một số mạng chặn máy chủ xet của Hugging Face; tải thường vẫn được

def load_vieneu():
    try:
        from vieneu import Vieneu
        return Vieneu
    except ImportError:
        if VENV_PY.exists() and Path(sys.prefix).resolve() != VENV_PY.parent.parent.resolve():
            os.execv(str(VENV_PY), [str(VENV_PY), *sys.argv])
        sys.exit('✗ Chưa có vieneu. Cài: bash "' + str(SKILL / 'install.sh') + '" --voice')

# Kiểu giọng. cao_do/toc_do là mặc định khi người dùng không ghi --cao-do/--toc-do; toc_do_that dùng cho bản ghi thật (--xu-ly).
KIEU = {
    'giang-duong': dict(cao_do=0.958, toc_do=1.07, toc_do_that=1.0, nghi=0.6, mau=[
        'highpass=f=70',
        'equalizer=f=130:t=q:w=0.9:g=2.5',      # thân giọng, ngực: ấm, chắc
        'equalizer=f=320:t=q:w=1.2:g=-2',       # bớt ù, bớt «trong hộp»
        'equalizer=f=2800:t=q:w=1.0:g=2.5',     # rõ chữ, vang, dõng dạc
        'equalizer=f=7500:t=q:w=1.0:g=-1.5',    # dịu tiếng xì
        'acompressor=threshold=-21dB:ratio=2.5:attack=12:release=180:makeup=1.5',   # đều tiếng, chắc
        'aecho=0.9:0.9:28|47:0.07|0.04',        # chút vang phòng giảng, rất nhẹ
    ]),
    'goc': dict(cao_do=1.0, toc_do=1.0, toc_do_that=1.0, nghi=0.5, mau=[]),
}

def die(m): sys.exit('✗ ' + m)
def run(*a, **k): return subprocess.run(a, check=True, capture_output=True, text=True, **k)

ap = argparse.ArgumentParser(add_help=True)
ap.add_argument('du_an', nargs='?')
ap.add_argument('--mau'); ap.add_argument('--mau-tu', type=float); ap.add_argument('--mau-den', type=float)
ap.add_argument('--giong'); ap.add_argument('--danh-sach', action='store_true')
ap.add_argument('--chi-cau'); ap.add_argument('-o', '--ra')
ap.add_argument('--xu-ly', help='bản ghi âm thật: chỉ chỉnh theo --kieu, không tạo giọng')
ap.add_argument('--kieu', choices=list(KIEU), default='giang-duong')
ap.add_argument('--cao-do', type=float); ap.add_argument('--toc-do', type=float)
ap.add_argument('--nghi', type=float)
ap.add_argument('--cach-doc', default=str(SKILL / 'knowledge/llct-cach-doc.json'))
ap.add_argument('--khong-kiem', action='store_true')
o = ap.parse_args()
K = KIEU[o.kieu]
if o.nghi is None: o.nghi = K['nghi']
if o.cao_do is None: o.cao_do = K['cao_do']
if o.toc_do is None: o.toc_do = K['toc_do_that'] if o.xu_ly else K['toc_do']

def mau_giong():   # chuỗi lọc: cao độ/tốc độ + màu giọng theo kiểu
    filters = run('ffmpeg', '-hide_banner', '-filters').stdout
    fx = []
    if abs(o.cao_do - 1) > 1e-3 or abs(o.toc_do - 1) > 1e-3:
        if ' rubberband ' in filters: fx.append(f'rubberband=pitch={o.cao_do}:tempo={o.toc_do}:formant=preserved')
        else: fx.append(f'asetrate=48000*{o.cao_do},aresample=48000,atempo={o.toc_do / o.cao_do:.4f}')
    return fx + K['mau']

# ---------- chỉ chỉnh bản ghi âm thật ----------
if o.xu_ly:
    if not Path(o.xu_ly).exists(): die(f'không thấy file ghi âm: {o.xu_ly}')
    out = Path(o.ra) if o.ra else Path(o.du_an or '.') / 'giong-doc.wav'
    if out.exists() and not o.ra: shutil.copy(out, out.with_name('giong-doc_truoc.wav'))
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.6,areverse'
    run('ffmpeg', '-v', 'error', '-y', '-i', o.xu_ly, '-af', ','.join(['aresample=48000', trim] + mau_giong() + ['adelay=300|300', 'apad=pad_dur=0.6', 'loudnorm=I=-16:TP=-1.5:LRA=11']),
        '-ar', '44100', '-ac', '2', str(out))
    dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)).stdout)
    print(f'Đã ghi {out} ({dur:.1f} giây, kiểu giọng {o.kieu}, cao độ ×{o.cao_do}, tốc độ ×{o.toc_do}). Bước tiếp: node phu-de.mjs <thư-mục-dự-án>')
    sys.exit(0)

tts = load_vieneu()()
if o.danh_sach:
    for desc, name in tts.list_preset_voices(): print(f'  {name:16s} {desc}')
    tts.close(); sys.exit(0)
if not o.du_an and not o.chi_cau: die('cần <thư-mục-dự-án> (hoặc --chi-cau "câu" -o file.wav)')
if not o.mau and not o.giong: die('cần --mau <ghi-âm-mẫu> (nhân bản giọng) hoặc --giong <tên giọng có sẵn> (xem --danh-sach)')

tmp = Path(tempfile.mkdtemp(prefix='tao-giong-'))
# ---------- giọng: mẫu ghi âm hoặc giọng có sẵn ----------
kw = {}
if o.mau:
    if not Path(o.mau).exists(): die(f'không thấy mẫu giọng: {o.mau}')
    cut = []
    if o.mau_tu is not None: cut += ['-ss', str(o.mau_tu)]
    if o.mau_den is not None: cut += ['-to', str(o.mau_den)]
    ref = tmp / 'mau.wav'; run('ffmpeg', '-v', 'error', '-y', *cut, '-i', o.mau, '-ac', '1', '-ar', '24000', str(ref))
    d = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(ref)).stdout)
    if d < 3: die(f'mẫu giọng chỉ {d:.1f} giây; cần 10–20 giây đọc liền mạch')
    if d > 30: print(f'  ! mẫu giọng {d:.0f} giây: nên cắt còn 10–20 giây (--mau-tu/--mau-den)')
    kw = dict(ref_audio=str(ref), denoise=False)
else:
    v = [x for x in tts.list_preset_voices() if o.giong.lower() in (x[1] + ' ' + x[0]).lower()]
    if not v: die(f'không có giọng «{o.giong}». Xem --danh-sach')
    kw = dict(voice=tts.get_preset_voice(v[0][1])); print(f'  giọng: {v[0][0]}')

# ---------- lời thoại → câu; cách đọc ----------
MAP = {k: v for k, v in json.load(open(o.cach_doc, encoding='utf8')).items() if not k.startswith('_')}
L = r'A-Za-zÀ-ỹĐđ0-9'
def spoken(s):
    for k in sorted(MAP, key=len, reverse=True):
        if len(k) <= 2 and re.fullmatch(r"[A-Za-z]'?", k): s = re.sub(rf"(?<![{L}]){re.escape(k)}(?![{L}'])", MAP[k], s)
        else: s = s.replace(k, MAP[k])
    return re.sub(r'\s+', ' ', s).strip()
def split_sentences(txt):   # tách câu ở . ? ! …, nhưng không tách sau chữ viết tắt tên người (V.I., C., Ph., Th.)
    out, cur = [], []
    for w in txt.split():
        cur.append(w)
        if re.search(r'[.?!…]["»”)]?$', w) and not re.fullmatch(r'(?:[A-ZĐ][a-zđ]?\.)+', w): out.append(' '.join(cur)); cur = []
    if cur: out.append(' '.join(cur))
    return out
if o.chi_cau: sentences = [o.chi_cau.strip()]
else:
    lt = Path(o.du_an) / 'loi-thoai.txt'
    if not lt.exists(): die(f'không thấy {lt}')
    sentences = split_sentences(lt.read_text(encoding='utf8'))

# ---------- kiểm bằng whisper ----------
WCLI = next((p for p in [Path.home() / '.local/bin/whisper-cli', shutil.which('whisper-cli'), shutil.which('whisper-cpp')] if p and Path(p).exists()), None)
MODEL = next(iter(sorted((Path.home() / '.cache/whisper-cpp').glob('ggml-*.bin'))), None) if (Path.home() / '.cache/whisper-cpp').exists() else None
check = WCLI and MODEL and not o.khong_kiem
if not check and not o.khong_kiem: print('  ! không có whisper: bỏ bước nghe lại từng câu (cài: bash install.sh)')
NUM = {'0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn', '5': 'năm', '6': 'sáu', '7': 'bảy', '8': 'tám', '9': 'chín', '10': 'mười', '100': 'một trăm'}
ALIAS = {'xê': 'c', 'sê': 'c', 'xệ': 'c', 'sệ': 'c', 'vê': 'v', 'vệ': 'v', 'về': 'v', 'em': 'm', 'thẳng': 'thặng', 'mark': 'mác', 'marx': 'mác', 'mạc': 'mác', 'mắc': 'mác', 'lenin': 'lê', 'nin': 'nin', 'phải': 'phẩy'}
def norm(s):
    s = s.lower().replace('%', ' phần trăm ').replace('-', ' ')
    w = re.sub(r'[^\w\s]', ' ', s).split()
    out = []
    for x in w: out += NUM.get(x, x).split()
    return [ALIAS.get(x, x) for x in out]
def hear(f):
    h = tmp / 'h.wav'; run('ffmpeg', '-v', 'error', '-y', '-i', str(f), '-ar', '16000', '-ac', '1', str(h))
    return ' '.join(run(str(WCLI), '-m', str(MODEL), '-l', 'vi', '-f', str(h), '-np', '-nt').stdout.split())

# ---------- tạo từng câu ----------
parts = []
for i, s in enumerate(sentences):
    say = spoken(s); best = None
    for temp in ((0.7, 0.6, 0.5) if o.kieu == 'giang-duong' else (0.6, 0.7, 0.5)):   # 0.7: ngữ điệu có lên xuống, truyền cảm hơn
        f = tmp / f'c{i}_{temp}.wav'; tts.save(tts.infer(text=say, temperature=temp, **kw), str(f))
        if not check: best = (1, f, ''); break
        heard = hear(f); r = difflib.SequenceMatcher(None, norm(say), norm(heard)).ratio()
        if not best or r > best[0]: best = (r, f, heard)
        if r >= 0.9: break
    mark = '✓' if best[0] >= 0.9 else ('!' if best[0] >= 0.8 else '✗')
    print(f'  {mark} câu {i + 1}/{len(sentences)}' + (f' ({best[0]:.2f})' if check else '') + f': {s[:70]}')
    if check and best[0] < 0.9: print(f'      whisper nghe: {best[2][:90]}')
    parts.append(best[1])
tts.close()

# ---------- hậu kỳ: cao độ, tốc độ, cắt lặng, nghỉ, ghép, âm lượng ----------
fx = mau_giong()
trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse'
done = []
for i, f in enumerate(parts):
    g = tmp / f'q{i}.wav'; run('ffmpeg', '-v', 'error', '-y', '-i', str(f), '-af', ','.join(fx + [trim, 'aresample=48000', f'apad=pad_dur={o.nghi}']), '-ac', '1', str(g)); done.append(g)
out = Path(o.ra) if o.ra else Path(o.du_an) / 'giong-doc.wav'
if out.exists() and not o.ra and not o.chi_cau: shutil.copy(out, out.with_name('giong-doc_truoc.wav'))
ins = sum((['-i', str(g)] for g in done), [])
lead = '' if o.chi_cau else 'adelay=400,apad=pad_dur=0.8,'
run('ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', f'concat=n={len(done)}:v=0:a=1,{lead}loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '2', str(out))
dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)).stdout)
shutil.rmtree(tmp, ignore_errors=True)
print(f'Đã ghi {out} ({dur:.1f} giây, {len(sentences)} câu, kiểu giọng {o.kieu}). Bước tiếp: node phu-de.mjs <thư-mục-dự-án>')
