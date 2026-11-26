# Agentic AI for Economic Research: demo files

Bản sao thư mục `demos/` của repo
[MarcoLeMoglie/Agentic_Economic_Research](https://github.com/MarcoLeMoglie/Agentic_Economic_Research)
(Marco Le Moglie, Catholic University of the Sacred Heart), lấy từ nhánh
`main`, commit `ab6e224`, ngày 2026-11-26. Slide và syllabus không được chép;
xem chúng ở repo gốc.

## Khác với bản gốc

| Tệp | Thay đổi |
|---|---|
| `demos/lesson1/.agents/skills/regression-table/SKILL.md` | Thay bằng bản viết lại (tiếng Anh) trong [`../skills/en/`](../skills/en/regression-table/SKILL.md) |
| `demos/lesson2/general/capabilities/skills/research-literature-synthesis/SKILL.md` | Thay bằng bản viết lại 1.1 (tiếng Anh) trong [`../skills/en/`](../skills/en/research-literature-synthesis/SKILL.md) |
| `demos/lesson1/.claude/skills/regression-table` | Mới: symlink tới `.agents/skills/regression-table`, để Claude Code tìm thấy skill |
| `demos/lesson2/.claude/skills/research-literature-synthesis` | Mới: symlink tới skill gốc trong `general/capabilities/skills/` |

Mọi tệp khác giữ nguyên như bản gốc. `code/analysis.do` vẫn còn lỗi cố ý
`ln(prise)` dùng cho demo Bài 1; đừng sửa trước buổi học.

Danh sách lỗi đã sửa trong từng skill: xem [`../skills/README.md`](../skills/README.md).

## Dùng bản tiếng Việt

Chép tệp tương ứng trong `../skills/vi/` đè lên hai `SKILL.md` ở bảng trên.
Symlink trong `.claude/skills/` vẫn trỏ đúng.

## Cách mở

Mở riêng từng thư mục demo làm thư mục làm việc của agent:

- `demos/lesson1/`: cần Stata 17 trở lên và `estout` (`ssc install estout`).
- `demos/lesson2/`: kiểm tra vault bằng `bash .infra/scripts/validate.sh`
  (kết quả hiện tại: 41 mục kiểm tra, 0 lỗi).

Symlink cần `core.symlinks=true` khi clone trên Windows; nếu không, chúng
thành tệp văn bản và `validate.sh` báo lỗi.

## Bản quyền

Repo gốc không có giấy phép mã nguồn mở. Bản sao này dùng cho học tập và
ghi rõ nguồn; nên xin phép tác giả trước khi công khai hoặc phân phối lại.
