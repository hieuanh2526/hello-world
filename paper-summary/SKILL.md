---
name: paper-summary
description: Summarize an academic research paper in a fixed, structured format — research question, data, method, main findings with magnitudes, contribution, limitations, and relevance to the user's work. Use when the user shares a paper (PDF, link, or pasted text) and asks to summarize, digest, extract key points, or write reading notes on it, or asks for a comparison table across several papers. Also triggers on Vietnamese requests such as "tóm tắt bài báo", "tóm tắt bài nghiên cứu", "đọc giúp bài này", "ghi chú đọc", "tóm tắt tài liệu", "lập bảng so sánh các bài".
---

# Tóm tắt bài nghiên cứu

Tóm tắt một bài nghiên cứu học thuật theo khung cố định, để người dùng nắm được trong vài phút: bài hỏi gì, làm bằng cách nào, tìm ra gì, và có đáng tin không. Mọi nội dung phải lấy từ chính bài báo.

## Nguyên tắc cốt lõi

- **Chỉ dựa vào văn bản bài báo.** Không bịa con số, hệ số, tên dữ liệu, tác giả, năm xuất bản hay tạp chí. Nếu một mục không có trong bài, ghi "Bài không nêu".
- **Nếu không đọc được toàn văn** (chỉ có tiêu đề, tóm tắt, hoặc liên kết không mở được), nói rõ điều đó ở đầu bản tóm tắt và chỉ tóm tắt phần đã đọc được. Không suy diễn phần còn lại.
- **Ghi vị trí** (trang, mục, bảng, hình) cho mỗi con số và khẳng định quan trọng, để người dùng tự kiểm tra, ví dụ "(Bảng 3, cột 2)" hoặc "(tr. 14)".
- **Phân biệt rõ** điều tác giả khẳng định với nhận xét của Claude. Nhận xét chỉ đặt trong mục "Đánh giá".
- Giữ đúng mức độ khẳng định của tác giả: không biến kết quả tương quan thành nhân quả, không làm mạnh hay yếu đi kết luận.

## Khung tóm tắt

Trả bản tóm tắt bằng Markdown theo thứ tự sau:

### 0. Thông tin bài
Tác giả, năm, tiêu đề, nơi công bố (tạp chí, working paper, luận án), DOI hoặc liên kết nếu có trong bài. Một dòng.

### 1. Tóm tắt một câu
"Bài này dùng [dữ liệu/phương pháp] để chỉ ra rằng [phát hiện chính]."

### 2. Câu hỏi nghiên cứu
Bài muốn trả lời câu hỏi gì, và vì sao câu hỏi đó quan trọng theo lập luận của tác giả.

### 3. Dữ liệu và bối cảnh
Nguồn dữ liệu, phạm vi (quốc gia, giai đoạn, đối tượng), cỡ mẫu, đơn vị quan sát.

### 4. Phương pháp
- Loại nghiên cứu: thực nghiệm, mô hình cấu trúc, lý thuyết, thí nghiệm, định tính, tổng quan.
- Chiến lược nhận dạng hoặc giả định then chốt, nêu bằng lời dễ hiểu (ví dụ: sai phân kép dựa trên thời điểm áp dụng chính sách khác nhau giữa các tỉnh).
- Biến phụ thuộc, biến giải thích chính.

### 5. Kết quả chính
3–5 gạch đầu dòng, mỗi dòng có **độ lớn tác động** và ý nghĩa kinh tế, kèm vị trí trong bài. Ví dụ: "Tăng 10% lương tối thiểu làm giảm 1,5% việc làm của lao động trẻ (Bảng 2, cột 4)."

### 6. Đóng góp
Bài bổ sung gì so với các nghiên cứu trước, theo cách tác giả tự định vị.

### 7. Hạn chế
Hai phần, tách riêng:
- **Tác giả tự thừa nhận:** những hạn chế bài nêu ra.
- **Nhận thấy thêm:** những điểm yếu tiềm năng Claude nhận thấy (mối đe dọa với chiến lược nhận dạng, khả năng suy rộng, chất lượng dữ liệu). Ghi rõ đây là nhận xét, không phải kết luận của bài.

### 8. Đánh giá và liên hệ
- Mức độ đáng tin của kết quả chính (cao / trung bình / thấp) và lý do ngắn gọn.
- Nếu người dùng đã nói về đề tài của họ: bài này hữu ích thế nào cho đề tài đó (phương pháp có thể học theo, dữ liệu có thể dùng, kết quả để so sánh hoặc trích dẫn).

### 9. Thuật ngữ và trích dẫn đáng chú ý (tùy chọn)
Thuật ngữ chuyên môn quan trọng kèm nghĩa; tối đa 2–3 câu trích nguyên văn đáng ghi nhớ, có số trang.

## Độ dài

- Mặc định: khoảng 400–700 từ.
- Nếu người dùng xin "bản ngắn": chỉ mục 0, 1, 5 và 7.
- Nếu người dùng xin "ghi chú đọc chi tiết": mở rộng mục 4 và 5, thêm tóm tắt từng phần của bài.

## Nhiều bài cùng lúc

Khi người dùng đưa từ hai bài trở lên:
1. Tóm tắt từng bài theo khung ngắn (mục 0, 1, 3, 4, 5, 7).
2. Sau đó lập **bảng so sánh**, mỗi bài một hàng, các cột: tác giả (năm), câu hỏi, dữ liệu, phương pháp, kết quả chính, hạn chế.
3. Kết thúc bằng 3–5 câu tổng hợp: các bài đồng thuận ở đâu, mâu thuẫn ở đâu, và khoảng trống nào còn bỏ ngỏ.

## Ngôn ngữ

Viết bằng ngôn ngữ người dùng chỉ định; nếu không nói gì, dùng ngôn ngữ của yêu cầu, kể cả khi bài báo viết bằng ngôn ngữ khác. Khi tóm tắt bài tiếng Anh bằng tiếng Việt, ghi kèm thuật ngữ gốc trong ngoặc ở lần xuất hiện đầu (ví dụ: "sai phân kép (difference-in-differences)"), và giữ nguyên tiêu đề bài, tên dữ liệu, tên biến như trong bài.

## Bước tiếp theo

Cuối bản tóm tắt, đề nghị một bước tiếp theo phù hợp: xuất ra trích dẫn theo chuẩn người dùng cần (APA, Chicago…), thêm bài vào bảng so sánh, hoặc viết đoạn tổng quan tài liệu dựa trên bài này.
