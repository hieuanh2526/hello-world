# Giá trị thặng dư – bản khoảng 3 phút 20 giây (giọng của giảng viên)

4 phần, phong cách vẽ tay (`ve-tay`), làm bằng skill `dashi-animationstyle` trong repo này, ghép thành một video.

| File | Nội dung |
|---|---|
| `gia-tri-thang-du-3-phut.mp4` | Video hoàn chỉnh, có phụ đề |
| `gia-tri-thang-du-3-phut_khong-phu-de.mp4` | Bản không phụ đề |
| `gia-tri-thang-du-3-phut.srt` | Phụ đề rời của cả video (để dựng trong CapCut…) |
| `loi-thoai/phan-N.txt` | Lời thoại từng phần |
| `phan-N/` | Dự án từng phần: `giong-doc.wav`, `phu-de.*`, `phan-canh.json`, `index.html` (trang vẽ), video từng phần |

| Phần | Nội dung | Dài |
|---|---|---|
| 1 | Mâu thuẫn của công thức chung T – H – T'; hàng hóa sức lao động: 2 điều kiện, 2 thuộc tính | 59,7 giây |
| 2 | Bản chất giá trị thặng dư: c, v, ngày lao động, G = c + v + m, m' = 100% | 48,8 giây |
| 3 | Giá trị thặng dư tuyệt đối (150%), tương đối (300%), siêu ngạch | 49,0 giây |
| 4 | Ý nghĩa: «hòn đá tảng», quy luật tuyệt đối, lợi nhuận – lợi tức – địa tô, bản chất; câu hỏi thảo luận | 41,4 giây |

## Giọng đọc – đoạn nào là giọng thật, đoạn nào tạo bằng máy

- **Phần 1 và phần 2: giọng thật** của giảng viên (bản ghi âm gốc), chỉ cắt hai chữ đọc thừa («Giá trị» trước «giả sử»).
- **Một câu trong phần 2 tạo bằng máy**: «Vì vậy giá trị hàng hóa bằng c cộng v cộng m» (bản ghi gốc đọc nhầm thành «giá trị thặng dư hàng hóa…»).
- **Phần 3 và phần 4: giọng tạo bằng máy, bắt chước giọng giảng viên** (theo yêu cầu của giảng viên), dùng mô hình VieNeu-TTS (giấy phép Apache-2.0), mẫu giọng 13,5 giây cắt từ bản ghi gốc; sau đó hạ cao độ khoảng 4% và tăng tốc 7% cho khớp giọng thật. Mô hình có gắn thủy vân âm thanh (không nghe thấy) vào giọng tạo ra.
- Âm lượng 4 phần đã chuẩn hóa về −16 LUFS.

Giọng nhân bản chỉ dùng cho video của chính giảng viên. Muốn thay bằng giọng thật cho phần 3, 4: ghi âm theo `loi-thoai/phan-3.txt`, `phan-4.txt` rồi làm như dưới.

## Sửa và render lại một phần

Từ thư mục gốc repo (ví dụ phần 3):

```bash
S=.claude/skills/dashi-animationstyle/pipeline; P=video-hoat-hinh/gia-tri-thang-du-3-phut/phan-3
ffmpeg -y -i giong-moi.m4a -ar 44100 -ac 2 $P/giong-doc.wav   # nếu thay giọng
node $S/phu-de.mjs $P --max 30
node $S/tao-timeline.mjs $P      # sửa "duration" trong phan-canh.json nếu độ dài giọng đổi
node $S/render.mjs $P/index.html
node $S/render.mjs $P/index.html --no-subtitle
```

Ghép lại 4 phần:

```bash
cd video-hoat-hinh/gia-tri-thang-du-3-phut
for s in "" _khong-phu-de; do
  ffmpeg -y -i phan-1/phan-1$s.mp4 -i phan-2/phan-2$s.mp4 -i phan-3/phan-3$s.mp4 -i phan-4/phan-4$s.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a][3:v][3:a]concat=n=4:v=1:a=1[v][a]" -map "[v]" -map "[a]" \
    -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k gia-tri-thang-du-3-phut$s.mp4
done
```
