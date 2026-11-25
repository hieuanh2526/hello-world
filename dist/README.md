# Gói chia sẻ: dựng video hoạt hình / video giảng dạy LLCT (v1.5-vi)

| File | Dùng với | Làm được |
|---|---|---|
| `dashi-animationstyle.skill` | **Claude Code** (máy tính) | Đầy đủ: lời thoại → phân cảnh → ảnh tĩnh → **video mp4** (16:9; bản dọc 9:16 khi yêu cầu), giọng, phụ đề. Cài: `CAI-DAT.md` |
| `dashi-animationstyle_codex-gemini-cli.zip` | **OpenAI Codex CLI**, **Google Gemini CLI** (máy tính) | Đầy đủ như trên (cùng bộ công cụ, kèm `AGENTS.md` / `GEMINI.md`). Cài: `CAI-DAT.md` trong file zip |
| `llct-video-giang-day_chatgpt-gemini.zip` | **ChatGPT** (GPT riêng / Project), **Gemini** (Gem) — web, điện thoại | Chỉ phần **soạn**: lời thoại đúng giáo trình, tự kiểm, bảng phân cảnh vẽ tay, xuất `loi-thoai.txt`, `phan-canh.json`. **Không dựng ra mp4** (web không chạy Chrome, ffmpeg) — đem file sang một trong hai gói trên để dựng |

Mặc định cho video LLCT: phong cách vẽ tay, khung ngang 16:9, giọng kiểu «giảng đường» (nam trung niên, truyền cảm, dõng dạc).
Gói không chứa giọng hay bản ghi âm của giảng viên nào; giọng ví dụ là giọng máy Piper (CC BY 4.0). Nguồn gốc, giấy phép: `NOTICE.md` trong gói.

Mã kiểm tra (SHA-256): `SHA256SUMS`.
