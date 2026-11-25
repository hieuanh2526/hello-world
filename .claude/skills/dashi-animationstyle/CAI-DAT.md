# Cài đặt dashi-animationstyle (bản tiếng Việt / tiếng Anh)

Skill cho Claude Code: biến một đoạn lời thoại tiếng Việt hoặc tiếng Anh 15–60 giây thành video hoạt hình minh họa (1920×1080, có giọng đọc và phụ đề), hình vẽ bằng HTML/Canvas, 7 phong cách.

## Cần có

- **Claude Code** (CLI hoặc app). Skill chạy lệnh trên máy nên dùng tốt nhất trong Claude Code; Claude.ai trên web không có Chrome, ffmpeg nên không render được.
- **macOS** hoặc **Linux**: Node 22 trở lên, ffmpeg, Google Chrome (hoặc Chromium). Mac: `brew install node ffmpeg`.
- Tùy chọn: whisper (tự nghe giọng để làm phụ đề) — `install.sh` cài giúp.

## Cài

1. Giải nén file `dashi-animationstyle.skill` (là file zip) vào thư mục skill của Claude Code:

   ```bash
   mkdir -p ~/.claude/skills
   unzip dashi-animationstyle.skill -d ~/.claude/skills/
   ```

   (Chỉ muốn dùng trong một dự án: giải nén vào `<dự-án>/.claude/skills/` thay cho `~/.claude/skills/`.)

2. Cài font tiếng Việt, whisper và model (khoảng 550 MB), rồi tự kiểm tra:

   ```bash
   bash ~/.claude/skills/dashi-animationstyle/install.sh
   ```

   Chỉ cần font: thêm `--no-whisper`.
   Tạo giọng đọc tiếng Việt bằng máy (giọng có sẵn, hoặc nhân bản giọng của chính bạn): thêm `--voice` (cần Python 3.10+, tải thêm khoảng 1 GB).

3. Mở lại Claude Code. Thử: «render ví dụ để xem thử» — ra video 26 giây «AI đọc hiểu một câu thế nào».

## Dùng

Nói với Claude, ví dụ:

> Làm video hoạt hình từ file `giong-doc.m4a`, lời thoại trong `loi-thoai.txt`, phong cách vẽ tay, có phụ đề.

Claude làm phụ đề, đưa bạn duyệt kịch bản phân cảnh và 3 ảnh tĩnh, rồi render mp4. Hỏi «có những phong cách nào?» để xem 7 phong cách. Chi tiết: `SKILL.md`, `README.md`.

Chỉ làm lời thoại tiếng Việt và tiếng Anh; mỗi lần một đoạn 15–60 giây (video dài thì chia phần rồi ghép).

### Video giảng dạy Lý luận chính trị

> Làm video giảng dạy 1 phút về «quy luật lượng – chất» (Triết học Mác – Lênin), phong cách vẽ tay, giọng của tôi trong file `ghi-am.m4a`.

Claude theo quy trình trong `knowledge/llct-giang-day.md`: soạn lời thoại đúng giáo trình → bạn duyệt → ảnh tĩnh → bạn duyệt → render.
Thêm: «làm bản dọc cho TikTok», «làm bài 3 phút, chia 4 phần rồi ghép», «tạo giọng đọc từ mẫu giọng của tôi».
Xem thử: `node pipeline/tao-du-an.mjs ./video-hoat-hinh/gttd --example llct-gia-tri-thang-du`.

