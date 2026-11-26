---
name: research-literature-synthesis
description: Biến bài báo, working paper, báo cáo và văn bản chính sách thành một ghi chú bằng chứng có nguồn, tách riêng kết quả, diễn giải của tác giả và suy luận của chính mình. Dùng khi nhiệm vụ cần đọc nhiều nguồn, lập bản đồ bằng chứng cho một câu hỏi nghiên cứu, hoặc soạn ghi chú tổng quan tài liệu hay ghi chú bằng chứng. Không dùng để tra một sự kiện đơn lẻ, để bịa hay độn trích dẫn, hoặc cho meta-analysis có gộp thống kê.
version: 1.1
updated: 2026-11-26
---

# Tổng hợp tài liệu nghiên cứu

## Khi nào dùng

- Người dùng yêu cầu tổng quan tài liệu, tóm tắt bằng chứng, hoặc "ta biết gì về X".
- Cần so sánh nhiều nguồn cho cùng một câu hỏi nghiên cứu.
- Dự án cần một nền bằng chứng đứng vững được trước khi thiết kế hoặc viết.

**Không dùng khi:** câu trả lời là một sự kiện đã biết; không thể có được nguồn; người dùng muốn bịa hoặc độn trích dẫn; cần một quy trình meta-analysis hoặc đánh giá nguy cơ sai lệch (risk of bias) chính thức.

## Đầu vào

- Một câu hỏi có giới hạn: một câu, nêu đối tượng, bối cảnh và thời kỳ khi cần. Nếu câu hỏi quá rộng, thu hẹp lại, ghi phiên bản đã thu hẹp và xác nhận với người dùng.
- Một tập nguồn: tệp, đường link hoặc tài liệu tham khảo. Bắt đầu từ `SOURCES.md` của dự án.
- Thư mục dự án và tệp `INDEX.md` của nó.

**Tìm nguồn mới.** Chỉ tìm thêm nguồn khi người dùng cho phép. Ghi lại việc tìm kiếm (tìm ở đâu, từ khóa, ngày tìm, giữ lại bao nhiêu kết quả) trong phần phạm vi của ghi chú. Nguồn tìm được qua tìm kiếm cũng phải đăng ký và đọc như mọi nguồn khác; một kết quả tìm kiếm chưa phải là bằng chứng.

## Quy trình

1. **Chốt câu hỏi và tiêu chí chọn nguồn.** Ghi câu hỏi, loại bằng chứng được tính là liên quan, và những gì bị loại. Phần này đặt ở đầu ghi chú.

2. **Đăng ký nguồn gốc trước khi đọc.** Đặt mỗi bản gốc vào `raw/` với tên có ngày và không bao giờ sửa nó. Đăng ký vào `SOURCES.md` theo đúng các cột của mẫu: ID, title, author/publisher, date, type, file/locator, accessed, reliability, status. Cột status chỉ dùng bộ giá trị của sổ đăng ký: `acquired`, `partial`, `unavailable`, `superseded`.
   - Với bài báo, ghi rõ phiên bản đang có (loạt working paper và số hiệu, hoặc tạp chí và năm). Các phiên bản của cùng một bài có thể báo cáo ước lượng khác nhau; coi chúng là các mục riêng và đánh dấu bản cũ là `superseded`.
   - Nguồn không lấy được thì đăng ký là `unavailable`. Có thể liệt kê nó là nguồn còn thiếu, nhưng không bao giờ dùng nó làm căn cứ.

3. **Mỗi dòng trích một nhận định.** Với mỗi nguồn đã đọc, ghi: ID nguồn, vị trí (trang, mục hoặc bảng), nhận định, loại bằng chứng (thực nghiệm, bán thực nghiệm, mô tả, mô hình, ý kiến), chiều tác động, và diễn giải của chính tác giả. Trích nguyên văn ít và chính xác; còn lại thì diễn đạt lại. Ghi cả mức đã đọc nguồn: `full` (toàn bộ) hay `partial` (những mục nào).

4. **Tách các tầng.** Gắn nhãn cho mỗi phát biểu là một trong:
   - **Kết quả (finding):** điều đã quan sát được, kèm độ lớn, đơn vị và độ bất định nếu có báo cáo.
   - **Diễn giải (interpretation):** điều tác giả nói kết quả đó có nghĩa là gì.
   - **Suy luận (inference):** điều bạn kết luận khi xét nhiều nguồn. Đó là của bạn, và được ghi nhãn là của bạn.
   - **Phỏng đoán (speculation):** có vẻ hợp lý nhưng chưa được kiểm định.

5. **Đánh giá bằng chứng bằng lời thường.** Với mỗi nguồn, ghi thiết kế, mẫu và bối cảnh, chiến lược nhận dạng, và mối đe dọa chính đối với nó. Nêu tên giả định mà thiết kế dựa vào, ví dụ xu hướng song song (difference-in-differences), điều kiện loại trừ (biến công cụ), không có thao túng quanh ngưỡng (hồi quy gián đoạn). Cho biết tác giả có kiểm định giả định đó không. Không bịa điểm chất lượng.

6. **Lập bản đồ đồng thuận và mâu thuẫn.** Liệt kê chỗ các nguồn cùng chiều, chỗ chúng bất đồng, và lý do khả dĩ: đối tượng, định nghĩa, thời kỳ hoặc phương pháp. Không bao giờ lấy trung bình để xóa mâu thuẫn.

7. **Trả lời câu hỏi.** Viết câu trả lời 3 đến 6 câu, kèm mức độ tin cậy và lý do, rồi nêu bằng chứng nào sẽ làm thay đổi câu trả lời. Nếu bằng chứng chưa đủ, nói thẳng ra như vậy.

8. **Kiểm lại trước khi ghi bất cứ thứ gì.** Mở lại từng nguồn và đối chiếu mọi trích dẫn, con số và vị trí trong ghi chú. Xóa hoặc sửa những gì không khớp, và nói rõ đã sửa gì.

9. **Ghi vào vault.** Theo thứ tự trong [WIKI_WORKFLOW.md](../../../agent/WIKI_WORKFLOW.md):
   - nguồn gốc vào `SOURCES.md`, kể cả bảng "Missing sources";
   - kết luận chính, chỗ đồng thuận, chỗ mâu thuẫn và mức tin cậy vào `CURRENT_STATE.md` của dự án, thành một mục có ngày với tiêu đề `Evidence: <câu hỏi>`;
   - mâu thuẫn ghi theo định dạng cảnh báo của WIKI_WORKFLOW;
   - toàn bộ ghi chú (cả hai bảng) vào `wiki/evidence-<slug-ngắn>.md` chỉ khi nó đạt tiêu chí nâng cấp của workflow, và phải được link từ `INDEX.md`. Nếu không đạt, đưa toàn bộ ghi chú cho người dùng xem và hỏi có muốn giữ thành trang wiki không.
   - Thêm một mục vào `LOG.md`. Quyết định dựa trên ghi chú này ghi vào `DECISIONS.md`, không ghi vào ghi chú.

## Định dạng đầu ra

```markdown
## Ghi chú bằng chứng: <câu hỏi> (<YYYY-MM-DD>)

**Câu hỏi:** một câu.
**Phạm vi:** tiêu chí chọn và loại, thời kỳ, bối cảnh, việc tìm kiếm đã làm (nếu có).

### Kết luận chính
3 đến 6 câu. Mức tin cậy: cao / trung bình / thấp, vì ...

### Bằng chứng theo nguồn
| Nguồn | Phiên bản | Thiết kế / loại | Kết quả (vị trí) | Diễn giải của tác giả | Đe dọa chính |
|---|---|---|---|---|---|

### Các nhận định đã trích
| Nguồn | Vị trí | Nhận định | Loại bằng chứng | Chiều | Đã đọc |
|---|---|---|---|---|---|

### Chỗ bằng chứng đồng thuận
- Nhận định, được S-xxx (vị trí), S-yyy (vị trí) ủng hộ.

### Chỗ mâu thuẫn hoặc còn mỏng
- Mâu thuẫn hoặc khoảng trống, các nguồn, điều gì sẽ giải quyết được.

### Suy luận (của tôi, không phải của nguồn)
- ...

### Điều gì sẽ làm thay đổi câu trả lời
- ...

### Nguồn
- S-xxx: tài liệu như đã ghi trong SOURCES.md. Status: acquired | partial | unavailable | superseded. Đã đọc: full | partial (các mục).
```

## Chuẩn chất lượng

- Mỗi câu nêu sự kiện đều truy được về một ID nguồn và một vị trí, hoặc được ghi nhãn là suy luận.
- Chỉ nguồn đã có và đã đọc mới được làm căn cứ cho một kết quả; nguồn mới đọc một phần chỉ làm căn cứ cho nhận định từ phần đã đọc.
- Kết quả và diễn giải không bao giờ nằm chung một gạch đầu dòng mà không có nhãn.
- Con số có đơn vị, thời kỳ và bối cảnh; không con số nào bị bịa hoặc âm thầm quy đổi.
- Mâu thuẫn được hiện rõ, có ngày, và để mở cho đến khi bằng chứng giải quyết được.
- Khi đúng là "chưa đủ bằng chứng" thì viết như vậy, thay vì một bản tổng hợp tự tin.
- Người chưa đọc các nguồn vẫn theo dõi được ghi chú.

## Lỗi cần tránh

- **Trích dẫn trình diễn:** tài liệu tham khảo trông hợp lý nhưng chưa từng được mở.
- **Tẩy trắng đồng thuận:** trình bày một nghiên cứu như thể là cả tài liệu.
- **Trôi diễn giải:** báo cáo sự hào hứng của tác giả như thể là kết quả.
- **Trộn phiên bản:** trích ước lượng của working paper kèm thông tin xuất bản của bài tạp chí.
- **Lan phạm vi:** trả lời một câu hỏi rộng hơn câu được hỏi.
- **Chính xác giả:** ước lượng nhiều chữ số thập phân từ bằng chứng mô tả.
- **Viết wiki trước:** tạo một trang công phu trước khi cập nhật các tệp lõi của dự án.

## Bàn giao

Dùng [mẫu SOURCES](../../../templates/project-slug-SOURCES.md) của dự án khi dự án chưa có sổ đăng ký nguồn. Ghi các quyết định đã kiểm chứng vào `DECISIONS.md` của dự án.
