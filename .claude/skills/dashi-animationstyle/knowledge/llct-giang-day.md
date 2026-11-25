# Video giảng dạy Lý luận chính trị (LLCT)

Dùng khi giảng viên muốn làm video giảng dạy cho 5 môn LLCT bậc đại học: **Triết học Mác – Lênin, Kinh tế chính trị Mác – Lênin, Chủ nghĩa xã hội khoa học, Lịch sử Đảng Cộng sản Việt Nam, Tư tưởng Hồ Chí Minh**. Rút ra từ lần làm bài «Giá trị thặng dư» (`examples/llct-gia-tri-thang-du/`): bản 53 giây, bản 3 phút 4 phần, 7 phong cách, bản dọc 9:16.

## 1. Quy trình (theo thứ tự, có 2 lần dừng chờ giảng viên duyệt)

1. **Hỏi nhanh** (một lần): môn, bài/chương, khái niệm cần dạy; đối tượng (sinh viên năm mấy, chuyên hay không chuyên); độ dài (một đoạn 45–60 giây, hay 3–5 phút chia phần); giọng (giảng viên tự ghi âm / nhân bản giọng giảng viên / giọng có sẵn); phong cách (mặc định `ve-tay`); có cần bản dọc Shorts/TikTok không.
2. **Viết lời thoại + phân cảnh** theo khung ở mục 2 → **dừng, giảng viên duyệt** (nội dung LLCT phải để giảng viên kiểm, xem mục 4). Đọc lại bằng danh sách kiểm ở mục 4 trước khi đưa.
3. **Giọng đọc** (mục 5) → `phu-de.mjs` → xem bảng phụ đề (mục 6).
4. **Vẽ cảnh** từ `mau.html` của phong cách (hoặc chép `examples/llct-gia-tri-thang-du/index.html` khi cùng phong cách `ve-tay`) → **3 ảnh tĩnh, dừng, giảng viên duyệt**.
5. **Render**, kiểm độ phong phú (`kiem-tra-do-phong-phu.mjs`, cần ≥ 10), bản không phụ đề, bản dọc nếu cần (`xuat-doc.mjs`), ghép phần nếu nhiều phần (`ghep-phan.mjs`).

Một đoạn 45–60 giây mất khoảng 45–90 phút (phần lớn là vẽ cảnh). Bài 3–5 phút: chia 3–5 phần, mỗi phần một thư mục dự án, cùng phong cách, ghép lại ở cuối.

## 2. Khung lời thoại một đoạn (45–60 giây, 120–180 từ)

| Nhịp | Nội dung | Ví dụ («Giá trị thặng dư») |
|---|---|---|
| Câu hỏi mở | Một câu hỏi/nghịch lý làm người học muốn nghe tiếp | «Vì sao nhà tư bản bỏ tiền ra rồi thu về nhiều tiền hơn?» |
| Khái niệm | Định nghĩa đúng giáo trình, gọn | hàng hóa sức lao động; c, v |
| Ví dụ có số | Một ví dụ cụ thể, số dễ nhẩm | ngày 8 giờ = 4 giờ tất yếu + 4 giờ thặng dư |
| Công thức / sơ đồ | Tóm bằng ký hiệu hoặc sơ đồ | G = c + v + m; m' = m/v × 100% |
| Kết | Ý nghĩa, hoặc câu hỏi thảo luận | «m' ở đây là 100%» / câu hỏi liên hệ Việt Nam |

Bài 3–5 phút: phần 1 = vấn đề + khái niệm nền; phần 2 = bản chất; phần 3 = phương pháp/hình thức/biểu hiện (có ví dụ số so sánh); phần 4 = ý nghĩa + vận dụng ở Việt Nam + câu hỏi thảo luận. Phần sau mở bằng một câu nối («Vậy … như thế nào?») thay cho câu hỏi mở.

Câu ngắn (≤ 25 từ), một ý một câu: phụ đề ngắt theo dấu câu, và giọng máy đọc câu dài dễ sai. Dấu phẩy trong `loi-thoai.txt` vừa là chỗ nghỉ khi đọc vừa là chỗ ngắt dòng phụ đề: bỏ bớt dấu phẩy để gộp những dòng quá ngắn (dưới 1 giây), thêm dấu phẩy để ngắt đúng cụm từ (đừng để «giá trị | thặng dư» rơi vào hai dòng).

## 3. Hình minh họa gợi ý theo môn

Mọi hình đều vẽ bằng code (`Sk` trong `ve-tay`, hoặc bộ cảnh dùng chung `examples/llct-gia-tri-thang-du/gt-scenes.js` cho 6 phong cách còn lại). Ưu tiên: một hình ẩn dụ + một ví dụ số + một công thức/sơ đồ mỗi đoạn.

| Môn | Khái niệm hay dạy | Cách vẽ đã thử / gợi ý |
|---|---|---|
| Kinh tế chính trị | hàng hóa (2 thuộc tính), lượng giá trị, tiền tệ, T – H – T', hàng hóa sức lao động, giá trị thặng dư (c, v, m, m'), tuyệt đối/tương đối/siêu ngạch, tích lũy, lợi nhuận – lợi tức – địa tô, độc quyền | túi tiền T → hộp H → túi to T'; thanh ngày lao động 8 ô (tất yếu xanh đen / thặng dư cam), kéo dài 8 → 10 ô (tuyệt đối), thu phần tất yếu 4 → 2 ô (tương đối); cột giá trị cá biệt thấp hơn đường giá trị xã hội (siêu ngạch); túi «m» chia ba mũi tên (lợi nhuận, lợi tức, địa tô); bánh răng (c), tiền công → công nhân (v) |
| Triết học | vật chất – ý thức, mâu thuẫn (thống nhất và đấu tranh của các mặt đối lập), lượng – chất (điểm nút, bước nhảy), phủ định của phủ định, nguyên nhân – kết quả, thực tiễn – nhận thức, tồn tại xã hội – ý thức xã hội, LLSX – QHSX | hai mũi tên ngược chiều trong một vòng tròn (mâu thuẫn); thanh nhiệt độ nước 0 → 100 °C, đến điểm nút thì đổi trạng thái (lượng – chất); đường xoắn ốc đi lên (phủ định của phủ định); vòng tròn thực tiễn → nhận thức → thực tiễn; hai tầng nhà: cơ sở hạ tầng – kiến trúc thượng tầng |
| CNXH khoa học | sứ mệnh lịch sử của giai cấp công nhân, thời kỳ quá độ, dân chủ XHCN, nhà nước XHCN, liên minh công – nông – trí thức, dân tộc, tôn giáo, gia đình | ba nhóm người nắm tay quanh một vòng (liên minh); con đường có cột mốc «quá độ»; cán cân quyền và nghĩa vụ |
| Lịch sử Đảng | thành lập Đảng (3/2/1930), Cách mạng Tháng Tám 1945 và Tuyên ngôn Độc lập (2/9/1945), kháng chiến chống Pháp (Điện Biên Phủ 7/5/1954), chống Mỹ (30/4/1975), Đổi mới (Đại hội VI, 12/1986), các kỳ Đại hội | dòng thời gian ngang, mỗi mốc một thẻ ghi ngày và một hình nhỏ (lá cờ, bản đồ, văn kiện); phong cách `bao-co` (trang báo) hợp với mốc lịch sử |
| Tư tưởng Hồ Chí Minh | độc lập dân tộc gắn liền với CNXH, đại đoàn kết dân tộc, Nhà nước của dân – do dân – vì dân, đạo đức cách mạng (cần, kiệm, liêm, chính, chí công vô tư), văn hóa | vòng tròn đồng tâm đại đoàn kết; bốn viên gạch «cần – kiệm – liêm – chính» xây nền; ba mũi tên «của dân, do dân, vì dân» cùng hướng vào một khối |

Ẩn dụ giúp hiểu, nhưng không thay định nghĩa: câu thoại vẫn nói đúng định nghĩa, hình chỉ minh họa. Tránh ẩn dụ có thể làm sai nghĩa hoặc gây phản cảm (ví dụ đừng biếm họa lãnh tụ; không vẽ chân dung người thật: dùng thẻ tên «K. Marx – «Tư bản», quyển I (1867)», «V.I. Lênin», «Hồ Chí Minh Toàn tập»).

## 4. Độ chính xác (kiểm trước khi đưa giảng viên duyệt)

- **Định nghĩa, thuật ngữ** theo giáo trình hiện hành của Bộ GD&ĐT cho từng môn; thống nhất cách viết: «C. Mác», «Ph. Ăngghen», «V.I. Lênin», «Hồ Chí Minh»; trong lời đọc viết «Các Mác», «Ăng-ghen», «Lê-nin» cho giọng máy đọc đúng.
- **Trích dẫn**: chỉ dẫn câu có nguồn (tác phẩm, tập, trang) và nói rõ trong phân cảnh là trích nguyên văn hay diễn ý. Câu nào không chắc nguồn thì diễn ý, đừng đóng ngoặc kép. Nhắc giảng viên đối chiếu với giáo trình đang dùng.
- **Số liệu và ví dụ số**: tự tính lại (6 giờ / 4 giờ = 150%; 6 / 2 = 300%). Ví dụ minh họa phải nói rõ là «giả sử».
- **Mốc lịch sử**: ngày, tháng, năm, kỳ Đại hội, tên văn kiện; không đoán. Văn kiện Đại hội mới nhất: dùng cái giảng viên chỉ định.
- **Liên hệ thực tiễn Việt Nam** theo đường lối, văn kiện của Đảng; câu hỏi thảo luận để mở, không đưa kết luận thay người học.
- Khi nghe lại bản ghi âm thật của giảng viên (whisper), chỉ ra chỗ **đọc nhầm nội dung** (ví dụ «giá trị thặng dư hàng hóa» thay cho «giá trị hàng hóa») và đề nghị sửa riêng câu đó.

## 5. Giọng đọc

Ba lựa chọn, theo thứ tự ưu tiên:
1. **Giảng viên tự ghi âm** theo `loi-thoai.txt` (mỗi phần một file, phòng yên tĩnh, mic cách 20–30 cm, đầu cuối im 1 giây). Tự nhiên nhất. Lỗi đọc nhầm một câu: cắt bỏ hoặc thay riêng câu đó bằng giọng nhân bản (`tao-giong.py --chi-cau`).
2. **Nhân bản giọng giảng viên** (`pipeline/tao-giong.py --mau <ghi-âm-mẫu.wav>`): chỉ khi **chính giảng viên** yêu cầu và cho mẫu giọng của mình; chỉ dùng cho video của giảng viên đó; ghi rõ trong README rằng giọng tạo bằng máy. Mẫu tốt: 10–20 giây, liền mạch, đọc giọng giảng bài.
3. **Giọng có sẵn** của VieNeu-TTS (`--giong "Thiện Minh"` – nam Bắc kể chuyện, `"Thanh Bình"`, `"Ngọc Huyền"` – nữ Bắc…; xem `--danh-sach`).

`tao-giong.py` tạo **từng câu**, cho whisper nghe lại, câu nào lệch thì tạo lại (tối đa 3 lần) — mô hình thỉnh thoảng tự đọc thêm chữ không có trong lời thoại. Ký hiệu và chữ viết tắt được đổi sang cách đọc theo `knowledge/llct-cach-doc.json` (c → «xê», v → «vê», m → «em», T' → «T phẩy», CNXH → «chủ nghĩa xã hội»…); phụ đề vẫn viết theo `loi-thoai.txt`. Chỉnh giọng nhân bản theo nhận xét: `--cao-do 0.958` (trầm hơn ~4%), `--toc-do 1.07` (nhanh hơn 7%) là mức giảng viên đã duyệt ở bài mẫu.

## 6. Phụ đề, chữ trên hình, nhịp

- `phu-de.mjs` tự dời ranh giới khi một dòng phụ đề ngắn dưới 0,8 giây (whisper hay dồn mấy từ đầu câu vào một thời điểm). Vẫn đọc bảng phụ đề một lượt.
- Giọng máy mặc định đọc nhanh với người học: giọng Piper dùng `--length-scale 1.45 --sentence-silence 0.7`; giọng VieNeu thêm 0,5 giây nghỉ giữa các câu (mặc định của `tao-giong.py`).
- Chữ viết tay hiện từng ký tự: tối thiểu 0,075 giây/ký tự (khoảng 13 ký tự/giây) — mẫu `ve-tay` đã đặt sẵn (`WRITE_STEP`). Nhanh hơn thì người học không kịp đọc.
- Phong cách chữ phụ đề to (`cat-giay`, `hoat-hinh-3d`, `cong-nghe-nen-den`): chạy `phu-de.mjs --max 25` để dòng không tràn.

## 7. Bản dọc 9:16 (YouTube Shorts, TikTok)

`node pipeline/xuat-doc.mjs <thư-mục-dự-án> --tieu-de "Giá trị thặng dư" --nhan "Kinh tế chính trị Mác – Lênin" --dong-phu "Bí mật của T – H – T' trong 50 giây"`: render phần hình **chữ to** (`render.mjs --doc`, mẫu `ve-tay` phóng chữ nhỏ ×1,55, chữ vừa ×1,2–1,4), đặt tiêu đề phía trên, phụ đề chữ to ngay dưới hình, tránh vùng nút bên phải và chú thích phía dưới của TikTok/Shorts. Dưới 60 giây để vào Shorts. Ảnh bìa: tránh các thời điểm chuyển cảnh (trang đang lật/tẩy thì trống).

## 8. Nhiều phong cách cho cùng một bài

`examples/llct-gia-tri-thang-du/gt-scenes.js` + `GT_THEME`: vẽ cảnh một lần trong khung 1640×710, gắn vào `mau.html` của từng phong cách (thay dòng «← 场景入口»), mỗi phong cách một bộ màu/font/kiểu nét (`flat`, `engrave`, `paper`, `collage`, `gloss`, `neon`). Xem `examples/llct-gia-tri-thang-du/README.md` mục «Nhiều phong cách». Video có hạt nhiễu toàn màn hình (`cat-giay`, `hoat-hinh-3d`) rất nặng: nén lại `-crf 26` trước khi đưa lên GitHub (giới hạn 100 MB/file).
