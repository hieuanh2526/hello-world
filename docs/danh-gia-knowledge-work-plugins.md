# Đánh giá repo anthropics/knowledge-work-plugins

Ngày đánh giá: 18/11/2026. Dựa trên bản clone nông (1 commit, mới nhất ngày 13/11/2026). Đánh giá dựa trên việc đọc file; chưa chạy plugin, chưa gọi connector.

## 1. Tổng quan

Kho plugin mã nguồn mở (Apache-2.0) cho Claude Cowork và Claude Code, mỗi plugin ứng với một chức năng công việc. Mỗi plugin gồm `.claude-plugin/plugin.json`, `.mcp.json` (connector) và `skills/`. Chủ yếu là markdown và JSON.

- 18 thư mục plugin; 252 file `SKILL.md`; khoảng 30.000 dòng markdown không tính `partner-built`.
- CI kiểm tra URL MCP, quét plugin, cập nhật SHA plugin ngoài; workflow tự đóng PR từ bên ngoài.

**Điểm mạnh:** cấu trúc nhất quán; giấy phép mở; nhiều skill viết cụ thể (bảng quyết định, cảnh báo diễn giải).

**Điểm yếu:**
1. README lệch thực tế (nói 11 plugin và nhiều lệnh slash; thực tế 18 thư mục, gần như không còn `commands/`).
2. Chất lượng không đồng đều giữa các plugin (từ 44 skill đến vài skill ngắn).
3. Không có eval/test cho skill.
4. 14 file `.mcp.json` có URL trống, phải tự điền.
5. Không nhận đóng góp ngoài.
6. Hướng tới doanh nghiệp và công cụ thương mại Mỹ.

## 2. Plugin bio-research (v1.2.0)

- 11 connector: PubMed, bioRxiv, Consensus, Wiley, Synapse, ChEMBL, Open Targets, ClinicalTrials.gov, Owkin, BioRender, Benchling (URL trống).
- 6 skill: `scientific-problem-selection` (khung chọn đề tài theo Fischbach & Walsh 2024, 9 module, ~2.800 dòng), `start`, và 4 skill sinh tin học có script Python (scRNA-seq QC, scvi-tools, nf-core, Allotrope).

**Đánh giá `scientific-problem-selection`:** khung có giá trị chung cho mọi ngành (hai trục khả thi × tác động; liệt kê giả định và go/no-go; "cố định một tham số"; họ đề tài; đảo ngược vấn đề). Hạn chế: ví dụ và loại rủi ro hoàn toàn thuộc sinh học thực nghiệm; module 1–4 chi tiết, module 5–7 mỏng; module 9 lặp nội dung; tích hợp tài liệu chỉ qua PubMed; module 7 ("câu trả lời tìm câu hỏi") không cảnh báo về HARKing. → Đã chuyển thể thành plugin `research-planning` trong repo này.

Bốn skill sinh tin học không liên quan đến kinh tế học/LLCT.

## 3. Plugin data (v1.1.0)

10 skill: `analyze`, `build-dashboard` (924 dòng), `create-viz`, `data-context-extractor`, `data-visualization`, `explore-data`, `sql-queries`, `statistical-analysis`, `validate-data`, `write-query`. Connector: Snowflake, Databricks (URL trống), BigQuery, Hex, Amplitude, Atlassian, Definite.

**Đánh giá cho nghiên cứu kinh tế:**
- Hữu ích: `explore-data` (hồ sơ dữ liệu, tỷ lệ thiếu, trùng lặp) và `validate-data` (QA trước khi chia sẻ) dùng được cho làm sạch dữ liệu khảo sát; `create-viz`/`data-visualization` cho hình công bố.
- Hạn chế: thiết kế cho phân tích kinh doanh (KPI, dashboard, kho dữ liệu doanh nghiệp). `statistical-analysis` có nhắc gây nhiễu, so sánh bội, nghịch lý Simpson nhưng không có suy luận nhân quả, dữ liệu bảng, sai số chuẩn cụm hay nhận diện. Không thay được các skill kinh tế lượng chuyên biệt (ví dụ `empirical-run-governor`). Các connector chủ yếu là kho dữ liệu doanh nghiệp, ít liên quan.

## 4. Plugin enterprise-search (v1.3.0)

5 skill: `search`, `search-strategy`, `knowledge-synthesis`, `digest`, `source-management`. Tìm một lần qua email, chat, tài liệu, wiki, CRM đã kết nối.

**Đánh giá:** hữu ích nếu tài liệu nghiên cứu, thư từ với đồng tác giả, ghi chú nằm rải rác ở Gmail, Google Drive, Notion, Slack. `knowledge-synthesis` (khử trùng lặp, ghi nguồn, chấm độ tin cậy theo độ mới và thẩm quyền) là mẫu tốt. Hạn chế: không tìm tài liệu khoa học bên ngoài; giá trị phụ thuộc vào số connector đã kết nối.

## 5. Khuyến nghị

| Plugin | Khuyến nghị |
|---|---|
| bio-research | Không cài. Dùng bản chuyển thể `research-planning`. |
| data | Chỉ dùng `explore-data`, `validate-data`, `create-viz` nếu cần; không thay skill kinh tế lượng. |
| enterprise-search | Cài nếu đã kết nối ít nhất Gmail/Drive/Notion và thường phải tìm lại tài liệu, thảo luận cũ. |
| cowork-plugin-management | Dùng khi muốn đóng gói thêm skill thành plugin. |
| Các plugin kinh doanh (sales, marketing, legal, finance…) | Không liên quan. |

Connector **Consensus** (tìm bài báo khoa học đa ngành) dùng được độc lập, không cần cài bio-research.
