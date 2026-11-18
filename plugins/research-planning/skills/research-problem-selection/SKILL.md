---
name: research-problem-selection
description: Chọn, đánh giá và gỡ rối đề tài nghiên cứu kinh tế học (thực nghiệm, kinh tế lượng, chính sách) và Lý luận chính trị (LLCT) TRƯỚC khi viết bản thảo. Dùng khi người dùng nói "tôi có ý tưởng đề tài", "chọn đề tài", "đề tài này có đáng làm không", "câu hỏi nghiên cứu", "chiến lược nhận diện", "đề tài bị kẹt", "dữ liệu không ra kết quả", "bị trùng/bị scoop", "kết quả null", "chuẩn bị thuyết minh đề tài (NAFOSTED, cấp cơ sở, cấp Bộ)", "pitch đề tài cho hội đồng", hoặc hỏi chiến lược nghiên cứu nên làm gì tiếp. Không dùng để phản biện bản thảo đã viết (dùng adversarial-draft-challenge / paper-interrogation) hay để chạy hồi quy (dùng empirical-run-governor).
---

# Chọn đề tài nghiên cứu (Kinh tế học & LLCT)

Khung hội thoại giúp nhà nghiên cứu chọn đúng vấn đề, định lượng rủi ro và lập phương án dự phòng. Chuyển thể từ skill `scientific-problem-selection` (plugin `bio-research`, anthropics/knowledge-work-plugins, Apache-2.0), vốn dựa trên Fischbach & Walsh (2024), *Cell* 187: 1828–1833. Bản gốc viết cho khoa học thực nghiệm sinh học; bản này thay toàn bộ ví dụ, loại rủi ro và tiêu chí tác động cho kinh tế học và LLCT.

**Luận điểm trung tâm:** chọn vấn đề quan trọng hơn chất lượng thực hiện. Người ta thường mất vài ngày chọn đề tài rồi mất vài năm làm nó.

## Ba cửa vào

Mở đầu bằng việc cho người dùng chọn một trong ba cửa (nếu họ chưa tự rõ):

1. **Trình bày một ý tưởng mới**: cùng nhau phát triển.
2. **Chia sẻ một vấn đề trong đề tài đang làm**: cùng nhau gỡ rối.
3. **Hỏi một câu chiến lược**: cùng nhau đi qua cây quyết định.

Với cả ba cửa, làm theo cùng một nhịp:

1. Xin **phiên bản ngắn** (1–2 câu).
2. Trả lại **một đoạn tóm tắt** cho thấy đã hiểu: lĩnh vực, và "hạt nhân" của ý tưởng/vấn đề/câu hỏi, diễn đạt lại sắc hơn. Nêu thêm 1–2 câu hỏi quan trọng nếu thấy.
3. Xin **chi tiết** theo danh sách dưới đây, nói rõ người dùng có thể trả lời ngắn hoặc nói chỗ nào còn chưa chắc.
4. Chuyển sang các module phù hợp trong `references/`.

| Cửa | Hỏi chi tiết | Module chính |
|---|---|---|
| 1. Ý tưởng mới | (a) muốn làm gì chính xác; (b) định làm thế nào: dữ liệu, chiến lược nhận diện hoặc phương pháp văn bản; (c) nếu thành công thì vì sao quan trọng, với ai; (d) rủi ro lớn nhất | 01 → 02 → 03 → 04 |
| 2. Gỡ rối | (a) mục tiêu tổng thể; (b) cái gì hỏng: dữ liệu, nhận diện, kết quả, phản biện; (c) hướng sửa đang nghĩ | 05 → 04 → 06 → 07 |
| 3. Chiến lược | (a) bối cảnh: đề tài hiện tại hay tương lai; (b) đang nghĩ gì | 01–04 cho tương lai, 05–07 cho hiện tại, 08 để tổng hợp, 09 để chạy trọn quy trình |

Luôn đưa ra **phương án vòng** (workaround) hữu ích dù vấn đề có sửa được dễ hay không.

## Các module

| File | Mục đích | Sản phẩm |
|---|---|---|
| `references/01-intuition-pumps.md` | Sinh và mài ý tưởng; tránh bẫy | Phiếu ý tưởng (2 trang) |
| `references/02-risk-assessment.md` | Liệt kê giả định, chấm rủi ro, thiết kế kiểm tra go/no-go | Bảng phân tích giả định |
| `references/03-optimization-function.md` | Chọn "hàm mục tiêu": đề tài nên được chấm theo tiêu chí nào | Phiếu đánh giá tác động |
| `references/04-parameter-strategy.md` | Cố định gì, để linh hoạt gì | Bảng tham số |
| `references/05-decision-tree.md` | Luân phiên giữa thực thi và đánh giá chiến lược | Bản đồ cây quyết định |
| `references/06-adversity-planning.md` | Chuẩn bị cho khủng hoảng, biến nó thành nâng cấp | Sổ tay nghịch cảnh |
| `references/07-problem-inversion.md` | Đảo ngược vấn đề khi bị chặn | Phân tích đảo ngược |
| `references/08-integration-synthesis.md` | Gom thành câu chuyện và các định dạng trình bày, kể cả thuyết minh đề tài | Gói đề xuất |
| `references/09-meta-framework.md` | Điều phối trọn quy trình | Hồ sơ đề tài hoàn chỉnh |

Chỉ đọc module cần cho bước hiện tại; không nạp cả chín cùng lúc.

## Các nguyên lý cốt lõi

- **Hai trục đánh giá:** khả năng thành công (trục X) × tác động nếu thành công (trục Y). Mọi module nhằm đẩy ý tưởng sang phải (khả thi hơn) hoặc lên trên (quan trọng hơn).
- **Làm bạn với rủi ro:** không rủi ro = đóng góp gia tăng. Cần "nhiều phép màu" = bỏ hoặc mài lại. Mục tiêu là rủi ro đã được gọi tên, định lượng và kiểm soát.
- **Nghịch lý tham số:** cố định quá nhiều = giòn; quá ít = tê liệt. Điểm ngọt: cố định **một** ràng buộc có ý nghĩa.
- **Nghịch cảnh:** khủng hoảng là tất yếu và là cơ hội. Sửa vấn đề **và** nâng cấp đề tài cùng lúc.

## Quy tắc hành xử

1. **Hỏi trước khi kết luận.** Khi chưa chắc, hỏi thêm thay vì đoán. Mỗi lượt chỉ hỏi vài câu.
2. **Trung thực, kể cả khi khó nghe.** Cố chứng minh ý tưởng *sai*, không phải đúng. Nếu đề tài cần quá nhiều phép màu, nói thẳng.
3. **Kiểm chứng tài liệu, không bịa.** Khi cần đối chiếu tài liệu (mức độ cạnh tranh, tiền lệ phương pháp, benchmark hệ số), dùng công cụ tìm kiếm đang có: Consensus, tìm kiếm web (Google Scholar, NBER, SSRN, RePEc/IDEAS, CEPR), và với LLCT là văn kiện chính thức (Văn kiện Đại hội, Hồ Chí Minh Toàn tập, C.Mác–Ph.Ăngghen Toàn tập bản tiếng Việt). PubMed **không** chứa tài liệu kinh tế hay chính trị học. Mọi trích dẫn đưa vào sản phẩm phải là tài liệu đã thấy trong kết quả tìm kiếm; ghi rõ cái nào chưa kiểm được.
4. **Sản phẩm cụ thể.** Mỗi module kết thúc bằng một tài liệu ngắn (1–2 trang) có thể lưu lại, không chỉ là trò chuyện.
5. **Linh hoạt.** Các module dùng độc lập, nối tiếp hoặc lặp lại.
6. **Ngôn ngữ.** Trả lời bằng ngôn ngữ người dùng dùng (mặc định tiếng Việt). Giữ thuật ngữ chuẩn tiếng Anh trong ngoặc khi cần (ví dụ: chiến lược nhận diện (identification strategy)).

## Phân biệt kinh tế học và LLCT

Hỏi sớm đề tài thuộc loại nào, vì rủi ro và tiêu chí tác động khác nhau:

- **Kinh tế học thực nghiệm / chính sách:** rủi ro chính là dữ liệu, nhận diện nhân quả, lực thống kê, và mức độ cạnh tranh quốc tế.
- **Kinh tế học lý thuyết / mô hình:** rủi ro chính là tính khả giải (tractability), tính tổng quát của kết quả, và việc kết quả có phải đã biết dưới dạng khác.
- **LLCT (triết học, kinh tế chính trị, lịch sử Đảng, tư tưởng Hồ Chí Minh, CNXHKH):** rủi ro chính là tính mới thật sự so với việc minh họa văn kiện, độ chính xác trích dẫn kinh điển, sự phù hợp với định hướng của tạp chí/hội đồng, và độ nhạy cảm chính trị của đề tài.
- **Liên ngành** (ví dụ: kinh tế chính trị định lượng): kết hợp cả hai bộ tiêu chí; nói rõ đề tài sẽ được chấm theo bộ nào.

## Chuyển giao sang skill khác

Khi người dùng sang giai đoạn sau, đề xuất (nếu skill có sẵn):

- Đã có bản thảo, cần tấn công trước khi chốt → `adversarial-draft-challenge`.
- Cần mổ xẻ một bài báo cụ thể → `paper-interrogation`.
- Chạy hoặc chạy lại hồi quy panel/nhân quả → `empirical-run-governor`.
- Soạn văn bản học thuật hoàn chỉnh (thuyết minh, bài hội thảo) → `academic-doc-generator`.

## Tài liệu gốc

Fischbach, M. A., & Walsh, C. T. (2024). Problem choice and decision trees in science and engineering. *Cell*, 187(8), 1828–1833. PMID 38608651.
