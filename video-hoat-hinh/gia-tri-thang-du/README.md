# Video giảng dạy: Giá trị thặng dư (K. Marx)

53 giây, phong cách vẽ tay (`ve-tay`), làm bằng skill `dashi-animationstyle` trong repo này.

| File | Nội dung |
|---|---|
| `gia-tri-thang-du.mp4` | Video hoàn chỉnh, có phụ đề |
| `gia-tri-thang-du_khong-phu-de.mp4` | Bản không phụ đề, để tự dựng (CapCut…); phụ đề rời ở `phu-de.srt` |
| `loi-thoai.txt` | Lời thoại |
| `giong-doc.wav` | Giọng đọc (giọng máy, xem phần nguồn) |
| `phu-de.json` / `phu-de.srt` | Phụ đề và thời gian từng từ |
| `phan-canh.json` | Phân cảnh: 8 cảnh, 34 từ khóa khớp hình với lời |
| `index.html`, `timeline.js`, `hieu-ung.js` | Trang vẽ (HTML/Canvas) và thời gian; `index.html` là nơi sửa hình |
| `anh-tinh/` | 3 ảnh tĩnh đã duyệt |

## Sửa và render lại

Từ thư mục gốc repo:

```bash
# render lại video (khoảng 3–4 phút)
node .claude/skills/dashi-animationstyle/pipeline/render.mjs video-hoat-hinh/gia-tri-thang-du/index.html
# bản không phụ đề
node .claude/skills/dashi-animationstyle/pipeline/render.mjs video-hoat-hinh/gia-tri-thang-du/index.html --no-subtitle
```

**Thay bằng giọng của bạn:** ghi âm theo `loi-thoai.txt`, rồi

```bash
S=.claude/skills/dashi-animationstyle/pipeline; P=video-hoat-hinh/gia-tri-thang-du
ffmpeg -y -i giong-cua-toi.m4a -ar 44100 -ac 2 $P/giong-doc.wav
node $S/phu-de.mjs $P --max 30        # làm lại phụ đề theo giọng mới
node $S/tao-timeline.mjs $P           # cập nhật thời gian; hình tự khớp theo từ khóa
node $S/render.mjs $P/index.html
```

Nếu giọng mới dài hơn hoặc ngắn hơn, sửa `"duration"` trong `phan-canh.json` thành độ dài giọng đọc + khoảng 1 giây trước khi chạy `tao-timeline.mjs`.

## Nguồn giọng đọc

Giọng máy tạo bằng [Piper](https://github.com/rhasspy/piper), giọng `vi_VN-vais1000-medium` (rhasspy/piper-voices), huấn luyện trên bộ dữ liệu VAIS-1000, giấy phép CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Khi đọc, các ký hiệu c, v, m được đọc là «xê», «vê», «em». Tốc độ: `--length-scale 1.45 --sentence-silence 0.7` (chậm hơn mặc định để kịp đọc phụ đề).
