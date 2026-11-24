# «Giá trị thặng dư» – 6 phong cách còn lại

Cùng nội dung, giọng đọc, phụ đề với video vẽ tay `../gia-tri-thang-du/` (53 giây, 8 cảnh), vẽ lại theo 6 phong cách còn lại của skill `dashi-animationstyle`. Cùng với bản vẽ tay là đủ 7 phong cách.

| Thư mục | Phong cách | Cách vẽ hình | Video |
|---|---|---|---|
| `so-do-phang/` | Sơ đồ phẳng | khối phẳng màu, viền đậm, bóng mềm; dải tiêu đề hổ phách | `gttd_so-do-phang.mp4` |
| `bao-co/` | Báo cũ | trang báo với nét mảnh và gạch bóng kiểu khắc, đặt trên vùng biển xanh của trang báo | `gttd_bao-co.mp4` |
| `cat-giay/` | Cắt giấy cổ điển | mảnh giấy cắt có bóng đổ, chuyển động giật 12 hình/giây | `gttd_cat-giay.mp4` |
| `cat-dan-sieu-thuc/` | Cắt dán siêu thực | thẻ giấy dán băng dính, chữ chú thích viết tay, trên nền poster cắt dán | `gttd_cat-dan-sieu-thuc.mp4` |
| `hoat-hinh-3d/` | Hoạt hình 3D | khối bóng có chuyển sắc trên nền tối, khung tạp chí | `gttd_hoat-hinh-3d.mp4` |
| `cong-nghe-nen-den/` | Công nghệ nền đen | nét vàng phát sáng trên nền đen | `gttd_cong-nghe-nen-den.mp4` |

## Cách làm

- `gt-scenes.js`: 6 cảnh dùng chung (T – H – T'; sức lao động; c và v; ngày lao động 8 giờ; G = c + v + m; m' = 100%), vẽ trong khung 1640×710 và co giãn vào vùng trống của từng mẫu. Thời điểm lấy từ từ khóa trong `timeline.js`, nên hình khớp với lời đọc.
- Mỗi thư mục: `index.html` là mẫu (`mau.html`) của phong cách đó, giữ nguyên nền, tiêu đề, khung phụ đề, chuyển cảnh mặc định; chỉ thay phần cảnh bằng `GT.draw(...)` và một `GT_THEME` (màu, font, kiểu nét).
- Phụ đề ngắt ngắn hơn bản vẽ tay (`--max 25`) để vừa khung phụ đề của các phong cách chữ to.

Render lại một phong cách (từ thư mục gốc repo):

```bash
node .claude/skills/dashi-animationstyle/pipeline/render.mjs video-hoat-hinh/gia-tri-thang-du-7-phong-cach/<phong-cách>/index.html
```

Giọng đọc: giọng máy Piper `vi_VN-vais1000-medium` (CC BY 4.0), như bản vẽ tay.
