# Ví dụ tiếng Việt: «AI đọc hiểu một câu thế nào»

Bản tiếng Việt của ví dụ Token, phong cách `ve-tay` (vẽ tay), 26 giây, 8 cảnh, 11 dòng phụ đề.

```bash
node pipeline/tao-du-an.mjs ./video-hoat-hinh/vi-du --example token-vi
node pipeline/render.mjs ./video-hoat-hinh/vi-du/index.html
```

| File | Nội dung |
|---|---|
| `loi-thoai.txt` | Lời thoại |
| `giong-doc.wav` | Giọng đọc (giọng máy, xem phần nguồn bên dưới) |
| `phu-de.json` / `.srt` | Phụ đề và thời gian từng từ (do `phu-de.mjs` tạo bằng whisper) |
| `phan-canh.json` | Phân cảnh: 8 cảnh, 22 từ khóa để khớp hình với lời |
| `index.html` | Trang ví dụ của `ve-tay` đã Việt hóa: nhãn, câu ví dụ «Giúp tôi lên lịch trình du lịch Đà Lạt ba ngày», dữ liệu mẫu, từ tô màu Đà Lạt / du lịch |

Ví dụ này chỉ có cho phong cách `ve-tay`; `tao-du-an.mjs` tự chọn phong cách đó.

## Nguồn giọng đọc

`giong-doc.wav` được tạo bằng [Piper](https://github.com/rhasspy/piper) với giọng `vi_VN-vais1000-medium`
(rhasspy/piper-voices). Giọng này huấn luyện trên bộ dữ liệu VAIS-1000
(https://ieee-dataport.org/documents/vais-1000-vietnamese-speech-synthesis-corpus),
giấy phép CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Khi đọc, «AI» được đọc là «Ây Ai» và «Token» là «Tô-ken»; phụ đề vẫn viết theo `loi-thoai.txt`.
