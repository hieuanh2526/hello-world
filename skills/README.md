# Skills viết lại từ khóa "Agentic AI for Economic Research"

Bản viết lại của hai skill trong repo
[MarcoLeMoglie/Agentic_Economic_Research](https://github.com/MarcoLeMoglie/Agentic_Economic_Research)
(Marco Le Moglie), mỗi skill có bản tiếng Anh (`en/`) và tiếng Việt (`vi/`).

| Skill | Bản gốc | Cài vào |
|---|---|---|
| `regression-table` | `demos/lesson1/.agents/skills/regression-table/` | `demos/lesson1/.agents/skills/regression-table/SKILL.md` |
| `research-literature-synthesis` | `demos/lesson2/general/capabilities/skills/research-literature-synthesis/` | `demos/lesson2/general/capabilities/skills/research-literature-synthesis/SKILL.md` |

Mỗi skill chỉ cài **một** ngôn ngữ: hai bản trùng `name`, nên cài cả hai sẽ
làm agent thấy hai skill giống nhau. Các link tương đối trong
`research-literature-synthesis` (tới `WIKI_WORKFLOW.md` và mẫu `SOURCES`)
chỉ đúng khi skill nằm trong vault của Bài 2; trong repo này chúng không
trỏ tới đâu.

Claude Code tìm skill trong `.claude/skills/`, không phải `.agents/skills/`.
Nếu dùng Claude Code, tạo thêm symlink hoặc bản sao ở `.claude/skills/<name>/`.

Bản tiếng Anh đã được cài sẵn vào bản sao các demo trong
[`../course/demos/`](../course/README.md), kèm symlink `.claude/skills/`.

## Đã sửa gì

### `regression-table`

1. Bước kiểm tra `esttab` chạy **trong Stata** (`capture which esttab` trong
   do-file), không phải `which esttab` trong shell, vốn luôn báo không có.
2. Bảng được tạo bằng cách **sửa do-file rồi chạy lại**, vì ước lượng đã lưu
   mất khi phiên Stata kết thúc; khớp với quy tắc "change the do-file" của
   `AGENTS.md`.
3. Thêm bước gán nhãn biến tự tạo, `nobaselevels` cho biến nhân tố, định
   dạng số cho `stats()`, và ghi chú loại sai số chuẩn khớp với `vce()`.
4. Không còn gán cứng hai mô hình; có quy tắc đặt tên tệp khi đã có bảng khác.
5. Bước kiểm tra đối chiếu số quan sát và hệ số với log, không chỉ hình thức;
   đọc log tìm mã lỗi vì mã thoát luôn là 0.
6. Thêm "khi nào không dùng" và mục lỗi thường gặp.

### `research-literature-synthesis` (1.0 → 1.1)

1. Thống nhất trạng thái nguồn với mẫu `SOURCES.md`
   (`acquired / partial / unavailable / superseded`), tách riêng mức đã đọc
   (`full / partial`).
2. Bảng trích nhận định của bước 3 nay có trong mẫu đầu ra.
3. Chỉ rõ ghi chú nằm ở đâu: kết luận vào `CURRENT_STATE.md`, toàn văn vào
   `wiki/` chỉ khi đạt tiêu chí của `WIKI_WORKFLOW.md`.
4. Thêm bước kiểm lại trích dẫn, con số và vị trí với nguồn trước khi ghi.
5. Thêm quy tắc tìm nguồn mới (chỉ khi được phép, có ghi lại cách tìm).
6. Thêm yếu tố riêng của kinh tế học: giả định nhận dạng (DiD, IV, RD) và
   phiên bản working paper so với bài tạp chí; thêm lỗi "trộn phiên bản".
7. Thêm cột `reliability` vào danh sách trường đăng ký cho khớp với mẫu.

## Chưa kiểm thử

Môi trường soạn các tệp này không có Stata, nên đoạn mã Stata trong
`regression-table` chưa được chạy thử. Hãy chạy demo Bài 1 một lần với
`estout` đã cài và một lần chưa cài trước khi dùng trên lớp.
