# Ví dụ LLCT: «Giá trị thặng dư» (Kinh tế chính trị Mác – Lênin)

Video giảng dạy mẫu, phong cách `ve-tay` (vẽ tay), 53 giây, 8 cảnh, 23 dòng phụ đề, 34 từ khóa khớp hình với lời.
Dùng để xem thử, và làm mẫu khi dựng bài cho các môn LLCT khác (xem `knowledge/llct-giang-day.md`).

```bash
node pipeline/tao-du-an.mjs ./video-hoat-hinh/gttd --example llct-gia-tri-thang-du
node pipeline/render.mjs ./video-hoat-hinh/gttd/index.html                      # bản ngang 16:9
node pipeline/xuat-doc.mjs ./video-hoat-hinh/gttd --tieu-de "Giá trị thặng dư" \
  --nhan "Kinh tế chính trị Mác – Lênin" --dong-phu "Bí mật của T – H – T' trong 50 giây" --chan "c + v + m · m' = m / v"   # bản dọc 9:16
```

| File | Nội dung |
|---|---|
| `loi-thoai.txt` | Lời thoại: câu hỏi mở → khái niệm → ví dụ có số (ngày 8 giờ) → công thức → tỷ suất |
| `giong-doc.wav` | Giọng máy mẫu (Piper, xem dưới). Thay bằng giọng thật của bạn hoặc `tao-giong.py` |
| `phu-de.json` / `.srt` | Phụ đề và thời gian từng từ |
| `phan-canh.json` | 8 cảnh, 34 từ khóa; «高亮»: *giá trị thặng dư* (màu cam), *sức lao động* (khối mực) |
| `index.html` | Trang vẽ. Có sẵn `?doc=1`: chữ trong hình to hơn và vài nhãn dời chỗ (`DOC ? … : …`) cho bản dọc |
| `gt-scenes.js` | Cùng 8 cảnh, vẽ theo `GT_THEME` để dùng với 6 phong cách còn lại (xem dưới) |

## Đổi giọng

```bash
P=./video-hoat-hinh/gttd
# giọng thật: ghi âm theo loi-thoai.txt
ffmpeg -y -i ghi-am.m4a -ar 44100 -ac 2 $P/giong-doc.wav
# hoặc giọng máy có sẵn / nhân bản giọng của chính bạn (cài: bash install.sh --voice)
python3 pipeline/tao-giong.py $P --giong "Thiện Minh"
python3 pipeline/tao-giong.py $P --mau mau-giong.m4a --mau-tu 18 --mau-den 32 --cao-do 0.958 --toc-do 1.07
# sau đó
node pipeline/phu-de.mjs $P
node pipeline/tao-timeline.mjs $P   # sửa "duration" trong phan-canh.json theo độ dài giọng mới; nếu số dòng phụ đề đổi, sửa "cue" của từ khóa
```

## Dùng phong cách khác

`gt-scenes.js` vẽ 8 cảnh trong khung ảo 1640×710 với các kiểu `flat`, `engrave`, `paper`, `collage`, `gloss`, `neon`.
Tạo dự án với `--style <phong-cách>`, chép `gt-scenes.js` vào, khai báo `const GT_THEME = { mode: 'paper', ink: …, accent: …, font: … }`
ở **đầu** script của `index.html` (không đặt trong hàm), rồi gọi cảnh tương ứng trong vòng vẽ. Phong cách có hạt nhiễu: render xong nén
`ffmpeg -i in.mp4 -c:v libx264 -crf 26 -c:a copy out.mp4` cho file dưới 100 MB.

## Làm bài khác theo mẫu này

Giữ khung 5 bước của lời thoại và cách dựng: mỗi khái niệm một cảnh, chữ viết tay hiện theo lời, số liệu vẽ thành thanh / sơ đồ,
công thức viết từng ký hiệu đúng lúc đọc. Gợi ý hình ảnh cho Triết học, CNXHKH, Lịch sử Đảng, Tư tưởng Hồ Chí Minh:
`knowledge/llct-giang-day.md` mục 3.

## Nguồn giọng đọc

`giong-doc.wav` tạo bằng [Piper](https://github.com/rhasspy/piper), giọng `vi_VN-vais1000-medium` (dữ liệu VAIS-1000, giấy phép
CC BY 4.0, https://creativecommons.org/licenses/by/4.0/), `--length-scale 1.45 --sentence-silence 0.7`; ký hiệu đọc theo
`knowledge/llct-cach-doc.json` (c → «xê», v → «vê», m → «em», C. Mác → «Các Mác»), phụ đề vẫn viết theo `loi-thoai.txt`.
