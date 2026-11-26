---
name: regression-table
description: Xuất các hồi quy ước lượng trong do-file Stata của dự án thành bảng LaTeX dùng được cho bài báo, bằng esttab. Dùng khi người dùng yêu cầu bảng hồi quy, bảng kết quả, hoặc xuất ước lượng sang LaTeX. Không dùng cho bảng thống kê mô tả, bảng cân bằng (balance table), xuất ra Word/Excel, hoặc ước lượng không do một do-file trong dự án này tạo ra.
---

# Bảng hồi quy

Bảng do do-file tạo ra, không bao giờ tạo trong một phiên Stata tương
tác: các ước lượng đã lưu chỉ tồn tại trong phiên Stata đã tạo ra chúng,
nên `esttab` chạy trong một phiên khác sẽ không tìm thấy gì.

## Các bước

1. **Kiểm tra `esttab` đã được cài, ngay trong Stata.** `esttab` là lệnh
   của Stata, không phải chương trình của shell, nên `which esttab` gõ
   trong terminal luôn báo không có. Đặt đoạn sau ở đầu do-file, sau
   dòng `version`:

   ```stata
   capture which esttab
   if _rc {
       display as error "esttab not installed (ssc install estout)"
       exit 199
   }
   ```

   Nếu log hiện thông báo này, dừng lại và hỏi người dùng. Không tự cài
   package.

2. **Lưu mọi mô hình.** Ngay sau mỗi lệnh hồi quy, thêm
   `estimates store mN`, đánh số theo thứ tự cột mong muốn (`m1`, `m2`,
   ...). Giữ nguyên tùy chọn `vce()` đang có của các hồi quy.

3. **Gán nhãn cho các biến xuất hiện trong bảng.** Biến tạo bằng `gen`
   không có nhãn, nên tùy chọn `label` sẽ hiện tên biến thô:

   ```stata
   label variable lprice "Log price"
   ```

   Biến dạng nhân tố (`i.x`) dùng nhãn giá trị; kiểm tra rằng nhãn đó có.

4. **Sửa dòng `esttab` trong do-file.** Thay lệnh `esttab` đang có cho
   bảng này; không thêm lệnh thứ hai.

   ```stata
   esttab m1 m2 using "output/table1.tex", replace ///
       se label booktabs nobaselevels ///
       star(* 0.10 ** 0.05 *** 0.01) ///
       stats(N r2, fmt(%9.0fc %9.3f) labels("Observations" "R-squared")) ///
       addnotes("Standard errors are heteroskedasticity-robust.")
   ```

   - Liệt kê mọi mô hình đã lưu, đúng thứ tự.
   - Tên tệp là `output/table1.tex` trừ khi người dùng chỉ định tên
     khác. Nếu tệp đó đang chứa một bảng khác, dùng số kế tiếp còn trống
     và báo cho người dùng.
   - Ghi chú phải khớp với `vce()` mà các hồi quy thực sự dùng (robust,
     cluster theo biến nào, hay sai số chuẩn thông thường).

5. **Chạy do-file và đọc log.** Dùng lệnh ghi trong `AGENTS.md`. Mã
   thoát là 0 ngay cả khi Stata lỗi, nên hãy tìm mã lỗi (`r(` theo sau
   là một con số) trong `analysis.log` và hiện 20 dòng cuối của log.

6. **Đối chiếu bảng với log.** Mở tệp `.tex` và xác nhận:
   - mỗi mô hình đã lưu là một cột, đúng thứ tự;
   - sai số chuẩn nằm trong ngoặc đơn, không có dòng nhóm gốc toàn số 0;
   - số quan sát ở mỗi cột bằng `Number of obs` của hồi quy đó trong log;
   - ở mỗi cột, ít nhất một hệ số và sai số chuẩn của nó khớp với log.

   Nếu một bước kiểm tra không đạt, sửa do-file và chạy lại. Không sửa
   tay tệp `.tex`.

7. **Báo cáo** tệp đã ghi, số cột, loại sai số chuẩn, và bước kiểm tra
   nào chưa làm được.

## Lỗi thường gặp

- Chạy `esttab` trong một phiên Stata mới sau khi do-file đã chạy xong.
- Coi mã thoát 0 là thành công mà không đọc log.
- Ghi chú bảng nói "robust" trong khi mô hình không dùng robust.
- Sửa tay tệp `.tex`, và lần chạy sau sẽ ghi đè lên.
