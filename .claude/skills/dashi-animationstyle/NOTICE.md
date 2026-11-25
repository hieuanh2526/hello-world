# Nguồn gốc và giấy phép

**Bản gốc:** dashi-animationstyle của 《大师的AI小灶》 — https://github.com/chuspeeism/dashi-animationstyle (giấy phép MIT, xem `LICENSE`).

**Bản này (v1.5-vi)** đã sửa so với bản gốc:
- Chỉ làm lời thoại tiếng Việt và tiếng Anh: phụ đề theo từ (giữ dấu, khoảng trắng), whisper `--lang vi|en`, tìm từ khóa theo cụm từ.
- Font tiếng Việt kèm theo (`fonts/`), đặt đầu font stack của 7 mẫu; nhãn cố định trên hình theo ngôn ngữ.
- `install.sh` cài một lệnh (macOS, Linux/cloud); `render.mjs` tự tìm Chromium và chạy được khi là root trên Linux.
- Đổi tên thư mục, tên file và thông báo trên Terminal sang tiếng Việt.
- Thêm ví dụ tiếng Việt `examples/token-vi/`.
- Thêm phần video giảng dạy Lý luận chính trị: `knowledge/llct-giang-day.md`, `knowledge/llct-cach-doc.json`, ví dụ `examples/llct-gia-tri-thang-du/`, công cụ `pipeline/tao-giong.py` (giọng đọc), `pipeline/xuat-doc.mjs` (bản dọc 9:16), `pipeline/ghep-phan.mjs` (ghép nhiều phần); `render.mjs --doc`, `phu-de.mjs` tự sửa dòng phụ đề quá ngắn.

| Thành phần | Giấy phép |
|---|---|
| Mã, tài liệu, mẫu (`pipeline/`, `styles/`, `knowledge/`, `SKILL.md`…) | MIT (`LICENSE`) |
| Font trong `fonts/` (Be Vietnam Pro, Patrick Hand, Nunito, Baloo 2, Playfair Display, Lora, Oswald, Montserrat, Cormorant Garamond) | SIL Open Font License 1.1 (`fonts/OFL.txt`, `fonts/README.md`) |
| `examples/token-vi/giong-doc.wav` | giọng máy Piper `vi_VN-vais1000-medium`, dữ liệu VAIS-1000, CC BY 4.0 (`examples/token-vi/README.md`) |
| `examples/llct-gia-tri-thang-du/giong-doc.wav` | giọng máy Piper `vi_VN-vais1000-medium`, dữ liệu VAIS-1000, CC BY 4.0 (`examples/llct-gia-tri-thang-du/README.md`) |
| `examples/token/giong-doc.wav` | giọng của tác giả bản gốc, chỉ để thử skill, không dùng cho tác phẩm khác (theo `README.md` bản gốc) |

Whisper (whisper.cpp, MIT) và model whisper không đóng gói kèm; `install.sh` tải về khi cài.

VieNeu-TTS (`pip install vieneu`, Apache-2.0) không đóng gói kèm; `install.sh --voice` cài vào môi trường Python riêng (`~/.local/share/dashi-tts/venv`), model tải từ Hugging Face khi chạy lần đầu. Giọng tạo bằng VieNeu có gắn thủy vân âm thanh. Chỉ nhân bản giọng của chính người yêu cầu (hoặc người đã đồng ý) và ghi rõ là giọng máy.
