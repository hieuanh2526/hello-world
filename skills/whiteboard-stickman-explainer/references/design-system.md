# Design system — whiteboard-stickman-explainer

Khung hình chuẩn 1920×1080, 30 fps. Mọi kích thước trong file này tính theo px ở khung đó.

## 1. Theme

| Token | whiteboard | chalkboard |
|---|---|---|
| `--bg` | `#FBFAF7` (trắng ngà, không trắng tinh) | `#1F3A33` (xanh bảng) |
| `--ink` | `#1B1B1F` | `#F3F1E7` (phấn trắng) |
| `--ink-soft` | `#6B6B73` | `#B9C2BC` |
| `--grid` (tùy chọn) | `#EEEAE2` | `#25443C` |

Hai cách chuyển theme:

- **Bảng đen như một đồ vật** đặt giữa nền trắng, có khung gỗ `#8A6A45` dày 18px. Dùng cho cảnh `chalkboard-definition` khi video chủ yếu là bảng trắng.
- **Toàn khung là bảng đen.** Dùng cho video "lớp học" và chỉ đổi theme ở ranh giới chương.

## 2. Bảng màu theo vai trò (dùng nhất quán cả video)

| Vai trò | Màu | Ghi chú |
|---|---|---|
| Nhân vật A (người học) | `#2F6FDE` | màu khăn quàng hoặc mũ, không tô cả thân |
| Nhân vật B (người hướng dẫn) | `#E08A1E` | |
| Nhân vật C (bên thứ ba: công ty, thị trường) | `#7A4FD0` | |
| Tăng / mua / đúng | `#1E9E5A` | |
| Giảm / bán / sai | `#D64545` | |
| Nhấn mạnh (gạch chân, khoanh tròn) | `#F2C230` | chỉ dùng cho **một** đối tượng mỗi lúc |

Quy tắc: một màu gắn với một nghĩa. Màu đã gán thì không đổi vai trò giữa chừng. Mỗi khung có tối đa 3 màu nhấn, không tính `--ink`.

## 3. Nhân vật que (phong cách riêng của skill)

Đây là **nhân vật que thực thụ**: thân là một nét, không phải thân hình khối. Mỗi nhân vật được nhận diện bằng một phụ kiện màu.

- Đầu: hình tròn `r=46`, tô `--bg`, viền `--ink` dày 7px.
- Thân, tay, chân: `stroke-width: 9`, `stroke-linecap: round`. Thân dài 150, tay 95, chân 120.
- Mặt: hai mắt hình elip nhỏ (`rx=5 ry=7`), một nét miệng. Chỉ thay mắt, mày và miệng để đổi cảm xúc.
- Phụ kiện nhận diện (chọn một cho mỗi nhân vật): khăn quàng, mũ lưỡi trai, kính tròn, hoặc cà vạt, tô bằng màu vai trò.
- Có 6 biểu cảm dựng sẵn (symbol trong `world-starter.html`): `neutral`, `curious` (một mày nhướng, mắt nhìn lên), `happy`, `worried`, `surprised`, `explain` (miệng mở, một tay chỉ ra).
- Có 5 tư thế: `stand`, `point-right`, `think` (tay chống cằm), `shrug`, `cheer` (hai tay giơ lên).
- Chuyển động "sống":
  - Nhún nhẹ (`translateY` ±4px, chu kỳ 1,6 s) khi nhân vật đang nói.
  - Chớp mắt mỗi 3–5 giây.
  - Không xoay cả thân.

Nhân vật cao khoảng 420px khi đứng một mình, khoảng 300px khi có 2–3 người cùng cảnh. Chân phải đặt trên một đường sàn ảo cố định ở `y=900`.

## 4. Chữ

- Font viết tay có đủ dấu tiếng Việt: **"Patrick Hand"** hoặc **"Itim"** (Google Fonts, cả hai đều hỗ trợ tiếng Việt). Font dự phòng là `"Comic Neue", sans-serif`. Luôn kiểm lại với "ỗ ữ ặ ợ ẫ".
- Cỡ chữ: tiêu đề cảnh 84px, nhãn 44px, chú thích nhỏ ≥ 34px. Không chữ nào nhỏ hơn 34px.
- Giới hạn chữ: mỗi cảnh ≤ 12 từ; bảng định nghĩa ≤ 20 từ.
- Hiệu ứng "viết tay": chữ xuất hiện theo `clip-path` từ trái sang phải, 0,6–1,2 s mỗi dòng, kèm SFX phấn hoặc bút.

## 5. Vùng an toàn và lưới

- Lề an toàn 96px mỗi bên. Phụ đề nằm trong dải `y ∈ [960, 1040]`, nên không đặt đồ hoạ quan trọng ở dưới `y=930`.
- Lưới 3 cột: trái `x≈380`, giữa `x≈960`, phải `x≈1540`.

## 6. Mẫu bố cục theo loại cảnh

| Loại | Bố cục | Nhịp xuất hiện |
|---|---|---|
| `hook` | Nhân vật bên trái (`think`/`curious`), dấu "?" lớn hoặc vật thể bí ẩn bên phải, mũi tên cong nối hai bên | nhân vật → "?" → mũi tên, mỗi bước cách 0,4 s |
| `chalkboard-definition` | Bảng đen giữa khung 1300×560; từ khoá màu nhấn, nửa sau định nghĩa màu `--ink`; nhân vật B `explain` đứng cạnh bảng | khung → từ khoá viết tay → định nghĩa theo cụm lời đọc |
| `stick-scene` | 2 nhân vật hai bên, vật thể hoặc con số ở giữa, có nhãn tên trên đầu | theo mốc cụm trong `words.json` |
| `split-metaphor` | Đường chia dọc nét đứt ở `x=960`; trái là "khái niệm", phải là "ẩn dụ đời thường"; mũi tên "≈" ở giữa | trái → phải → "≈" |
| `causal-diagram` | 3–5 nút tròn hoặc chữ nhật bo góc nối bằng mũi tên vẽ dần (`stroke-dashoffset`); dấu "+/−" trên mũi tên | từng nút và mũi tên theo câu "vì… nên…" |
| `compare` | Hai cột có tiêu đề màu vai trò, mỗi dòng có ✓/✗ đối xứng | từng dòng cùng lúc ở cả hai cột |
| `recap` | 3 ô số ①②③ xếp ngang, nhân vật A `cheer`, câu hỏi tự kiểm tra ở dưới | ô 1 → 2 → 3 → câu hỏi |

## 7. Quy tắc chống "slide"

1. Không dùng gạch đầu dòng. Nếu có từ 3 ý trở lên thì đổi thành sơ đồ, ô số hoặc so sánh.
2. Không có khung nào đứng yên quá 4 giây. Phải có ít nhất một chuyển động nhỏ: nhân vật nhún, mũi tên vẽ thêm, hoặc gạch chân.
3. Hình đi trước hoặc đi cùng lời, không đi sau. Đối tượng xuất hiện tối đa 0,2 s trước từ khoá tương ứng.
4. Mỗi khung chỉ có một điểm nhìn. Phần không còn được nhắc tới thì làm mờ xuống 35% opacity.
5. Con số trong ví dụ phải tròn và tính nhẩm được (10%, 50 nghìn, gấp đôi).
6. Chuyển cảnh: dùng "lau bảng" (wipe 0,35 s) hoặc pan camera sang vùng bảng kế bên. Không dùng hiệu ứng 3D, xoay hay lật trang.
7. Ảnh hoặc logo thật chỉ dùng khi bắt buộc cho nội dung, và phải đặt trong khung tròn hoặc bo góc có viền `--ink` 6px để hoà với nét vẽ.
