# research-planning

Plugin hỗ trợ **chọn, đánh giá và gỡ rối đề tài nghiên cứu** kinh tế học (thực nghiệm, kinh tế lượng, chính sách) và Lý luận chính trị, ở giai đoạn trước khi viết bản thảo.

## Cài đặt

```
/plugin install research-planning --marketplace hieuanh2526/hello-world
```

## Thành phần

Một skill: `research-problem-selection`. Skill tự kích hoạt khi bạn nói kiểu "tôi có ý tưởng đề tài", "đề tài này có đáng làm không", "đề tài bị kẹt", "kết quả null", "chuẩn bị thuyết minh đề tài"…

Skill mở bằng ba cửa vào (ý tưởng mới / gỡ rối / câu hỏi chiến lược) rồi dẫn qua 9 module trong `references/`:

| # | Module | Sản phẩm |
|---|---|---|
| 1 | Máy bơm trực giác và các bẫy | Phiếu ý tưởng |
| 2 | Đánh giá rủi ro, phép thử go/no-go | Bảng phân tích giả định |
| 3 | Hàm mục tiêu (tiêu chí đánh giá tác động) | Phiếu đánh giá tác động |
| 4 | Chiến lược tham số | Phiếu tham số, họ đề tài |
| 5 | Cây quyết định | Bản đồ quyết định |
| 6 | Chuẩn bị nghịch cảnh | Sổ tay nghịch cảnh |
| 7 | Đảo ngược vấn đề | Phân tích đảo ngược |
| 8 | Tích hợp và trình bày (kể cả thuyết minh đề tài) | Gói đề xuất |
| 9 | Điều phối trọn quy trình | Hồ sơ đề tài |

## Khác gì so với bản gốc

Chuyển thể từ `scientific-problem-selection` (plugin `bio-research`, [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins), Apache-2.0), dựa trên Fischbach & Walsh (2024), *Cell* 187: 1828–1833.

- Thay toàn bộ ví dụ sinh học bằng ví dụ kinh tế học và LLCT, bối cảnh Việt Nam.
- Thêm **rủi ro loại C** (công bố, cạnh tranh working paper, độ nhạy cảm, đạo đức) bên cạnh rủi ro về thực tại (A) và kỹ thuật/nhận diện (B).
- Thêm máy bơm "săn thí nghiệm tự nhiên" và "đối thoại lý luận–thực tiễn"; thêm bẫy "câu hỏi không có nhận diện" và "minh họa thay vì nghiên cứu".
- Thêm khung đánh giá tác động cho LLCT và lệch chuẩn tạp chí (Scopus/ISI vs. HĐGSNN).
- Thêm ranh giới với HARKing và câu cá đặc tả ở module 7.
- Thêm ánh xạ sang thuyết minh đề tài Việt Nam ở module 8.
- Bỏ PubMed (không chứa tài liệu kinh tế, chính trị học); yêu cầu chỉ trích dẫn tài liệu đã kiểm chứng qua công cụ tìm kiếm.

Chi tiết thay đổi: xem `NOTICE`.

## Hạn chế

- Chưa có bộ eval; chất lượng mới được kiểm bằng cách đọc, chưa thử trên đề tài thật.
- Ví dụ minh họa trong các module là ví dụ dạng mẫu, không phải trích dẫn nghiên cứu cụ thể.
- Ngưỡng thời gian (ví dụ "rủi ro cao đọc muộn > 12 tháng") là điều chỉnh ước lượng cho đề tài kinh tế/LLCT, cần hiệu chỉnh theo kinh nghiệm thực tế.

## Giấy phép

Apache License 2.0. Xem `LICENSE` và `NOTICE`.
