# Bản dọc 9:16 (YouTube Shorts, TikTok)

`../gia-tri-thang-du_doc-9x16.mp4`: 1080×1920, 50,9 giây, có giọng và phụ đề.

- `bg.html` → `bg.png`: nền giấy và tiêu đề (chụp bằng Chromium).
- `sub.ass`: phụ đề chữ to cho khung dọc (Nunito đậm 70, «giá trị thặng dư» màu cam, «sức lao động» gạch chân), đặt dưới hình, tránh vùng nút và chú thích của TikTok/Shorts.

Phần hình ở giữa dùng `../index-doc.html`: bản sao của trang vẽ tay với chữ trong hình to hơn (chữ dưới 45 px ×1,55, dưới 60 px ×1,4, dưới 90 px ×1,2) và vài nhãn dời chỗ cho khỏi chồng, để vẫn đọc rõ khi khung ngang thu về 1080 px.

Render phần hình rồi ghép (từ thư mục `gia-tri-thang-du/`):

```bash
node ../../.claude/skills/dashi-animationstyle/pipeline/render.mjs index-doc.html --no-subtitle -o hinh-chu-to.mp4
ffmpeg -y -loop 1 -i doc-9x16/bg.png -i hinh-chu-to_khong-phu-de.mp4 \
  -filter_complex "[1:v]crop=1680:945:120:0,scale=1080:-2[v];[0:v][v]overlay=0:590:shortest=1,ass=doc-9x16/sub.ass:fontsdir=$HOME/.local/share/fonts/dashi,format=yuv420p[o]" \
  -map "[o]" -map 1:a -c:v libx264 -crf 20 -preset slow -r 30 -c:a aac -b:a 160k -movflags +faststart gia-tri-thang-du_doc-9x16.mp4
```
(Trên Mac, font nằm ở `~/Library/Fonts`: đổi `fontsdir` cho phù hợp.)
