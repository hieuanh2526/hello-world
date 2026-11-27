---
name: whiteboard-stickman-explainer
description: Produce 2D stick-figure, open-whiteboard, and chalkboard educational explainer videos (1-minute demos to full 5–12 minute lectures) in Vietnamese or English. Distills lecture scripts into visual hooks, chalkboard definitions, expressive stick-figure scenes, split metaphors, and causal diagrams on `ExplainerStage`, with Vietnamese TTS synthesis, energy-guided word alignment, and automated 10/10 QA via `video-explainer`.
---

# whiteboard-stickman-explainer

Biến một bài giảng (dàn ý, slide, giáo trình, đoạn văn) thành video giải thích 2D. Video dùng nhân vật que trên nền bảng trắng hoặc bảng đen, dài từ bản demo 1 phút tới bài giảng 5–12 phút, bằng tiếng Việt hoặc tiếng Anh.

Skill này **không có engine render riêng**. Mọi bước build, nhạc nền, SFX, render, QA và trang duyệt đều đi qua skill `video-explainer` (`~/.gemini/config/skills/video-explainer/SKILL.md`). Skill này chỉ bổ sung ba thứ:

1. Quy chuẩn sư phạm và bố cục cho phong cách bảng trắng / nhân vật que (`references/design-system.md`).
2. Template cảnh dựng sẵn (`references/world-starter.html`).
3. CLI `scripts/vi_narration.py` lo giọng đọc tiếng Việt (`synth`) và căn mốc từ tiếng Việt (`align`). Bước `align` thay cho Parakeet, vốn trả về 0 từ với tiếng Việt.

> **Đọc `video-explainer/SKILL.md` trước khi chạy bước 4–5.** Tên file, cấu trúc thư mục `work/`, định dạng `words.json` và API `ExplainerStage` lấy theo skill đó. Nếu nó khác với giả định ghi ở đây thì **làm theo `video-explainer`** và sửa template cho khớp.

## Đầu vào cần hỏi (nếu người dùng chưa nói)

- Chủ đề, đối tượng người học, và **một** mục tiêu học tập đo được ("sau video, người xem phân biệt được cổ phiếu thường và cổ phiếu ưu đãi").
- Độ dài: `demo` (≈1 phút, 4–6 cảnh), `bài ngắn` (3–5 phút), hoặc `bài giảng` (5–12 phút, chia chương).
- Ngôn ngữ và giọng đọc: `vi-VN-HoaiMyNeural` (nữ) hoặc `vi-VN-NamMinhNeural` (nam). Với tiếng Anh, chọn giọng `en-US-*` và dùng aligner của `video-explainer`.
- Nền: `whiteboard` (mặc định) hoặc `chalkboard`.

Nếu người dùng chỉ đưa tài liệu thì tự đề xuất các mục trên, ghi rõ giả định, rồi làm tiếp. Không hỏi lại từng mục một.

## Quy trình 5 bước

### Bước 1 — Chưng cất kịch bản → `script.md`

Tạo `<project>/script.md` theo đúng khung sau. Parser báo lỗi và thoát mã 1 nếu thiếu `## Scenes` hoặc `## Narration`, hoặc nếu có cảnh không có lời đọc.

```markdown
# <Tiêu đề video>

## Scenes
### s01 — hook
Loại: hook · Nền: whiteboard
Hình: nhân vật A gãi đầu trước dấu "?" lớn; mũi tên chỉ sang 3 logo icon trung tính.
### s02 — định nghĩa
Loại: chalkboard-definition
Hình: khung bảng đen, dòng chữ "Cổ phiếu = một phần quyền sở hữu công ty".

## Narration
### s01
Bạn có bao giờ tự hỏi, cổ phiếu thật ra là gì?
### s02
Cổ phiếu là một phần quyền sở hữu công ty. Mua cổ phiếu, bạn trở thành cổ đông.
```

Quy tắc chưng cất:

- **Mỗi cảnh chỉ một ý.** Lời đọc dài 1–3 câu, khoảng 8–20 giây, tức 25–60 âm tiết tiếng Việt.
- **Mở bằng hook trong 5 giây đầu.** Hook là một câu hỏi, một nghịch lý, hoặc một tình huống có nhân vật và con số.
- Mỗi khái niệm đi qua ba nhịp: **định nghĩa** (bảng đen) → **ví dụ có nhân vật và con số** → **sơ đồ nhân quả hoặc so sánh**.
- **Dấu câu là tín hiệu căn từ.** Dùng dấu phẩy và dấu chấm ở chỗ thật sự muốn ngừng. `align` neo các khoảng nghỉ trong audio vào đúng những dấu câu này.
- Viết số sao cho TTS đọc đúng: "50 nghìn đô" thay vì "$50,000", "mười phần trăm" khi cần chắc chắn.
- Ghi chú đạo diễn trong `## Narration` phải đặt trong `<!-- ... -->`. Phần này bị bỏ qua khi đọc.
- **Đơn giản hoá nhưng không được sai.** Mỗi phát biểu tuyệt đối ("đảm bảo", "luôn luôn", "không bao giờ") phải được kiểm lại với tài liệu gốc. Ví dụ: cổ tức cổ phiếu ưu đãi được *ưu tiên* trả trước, không phải được *bảo đảm*.

Các loại cảnh (`Loại:`): `hook`, `chalkboard-definition`, `stick-scene`, `split-metaphor`, `causal-diagram`, `compare`, `recap`. Bố cục chi tiết của từng loại nằm trong `references/design-system.md`.

### Bước 2 — Tổng hợp giọng → `voice_src.wav`

```bash
uv run --with edge-tts --with numpy python ~/.gemini/config/skills/whiteboard-stickman-explainer/scripts/vi_narration.py synth --script <project>/script.md --out-dir <project>/work --voice vi-VN-HoaiMyNeural --rate +3% --pad-inter 0.35 --pad-end 0.50 --output <project>/work/synth.json
```

- Mỗi cảnh được chuẩn hoá về WAV 48 kHz mono, cắt khoảng lặng ở hai đầu, rồi lưu thành `work/tts_cache/<sid>.wav`.
- Mỗi cảnh được đệm thêm `--pad-inter` (riêng cảnh cuối là `--pad-end`), rồi **làm tròn lên bội số khung hình 30 fps** (1600 mẫu).
- Sau đó ghép tất cả thành `work/voice_src.wav` và ghi mốc vào tiêu đề cảnh trong script: `### s01 {start=0.000 end=4.967}`. Cảnh visual phải dùng đúng các mốc này.
- **Rate limit:** tối đa 1 request mỗi 1,2 giây trên toàn máy, nhờ khoá `fcntl` ở `/tmp/whiteboard_stickman_edge_tts.lock`, nên chạy song song nhiều subagent vẫn an toàn. Gặp lỗi mạng, 429, 5xx hay `NoAudioReceived` thì thử lại tối đa 6 lần, giãn cách `1,2 s × lần thử`, và ghi log ra stderr.
- Tham số `--reuse-cache` bỏ qua các cảnh có văn bản và giọng không đổi. Tham số này cũng dùng được **file ghi âm thật** đặt sẵn ở `tts_cache/<sid>.wav`.
- Khi Edge TTS hỏng hẳn (mất mạng, host `speech.platform.bing.com` bị chặn), có hai cách:
  - (a) Ghi âm từng cảnh, đặt vào `tts_cache/`, rồi chạy lại với `--reuse-cache`.
  - (b) Tạo giọng bằng `gemini-api-cli`. Design doc ghi model `gemini-3.8-flash-tts`; kiểm lại tên model trong skill đó. Lưu kết quả thành `tts_cache/<sid>.wav` rồi chạy (a).
- Edge TTS là endpoint không chính thức của trình duyệt Edge, có thể đổi hoặc ngừng bất cứ lúc nào. Với sản phẩm phát hành thương mại, nên dùng giọng có giấy phép rõ ràng.

### Bước 3 — Căn mốc từ → `words.json`, `transcript.md`

```bash
uv run --with numpy python ~/.gemini/config/skills/whiteboard-stickman-explainer/scripts/vi_narration.py align --script <project>/script.md --cache-dir <project>/work/tts_cache --min-silence-s 0.14 --out-words <project>/work/words.json --out-transcript <project>/work/transcript.md --output <project>/work/align.json
```

- **Cách hoạt động:** tính RMS theo khung 10 ms, tìm các khoảng nghỉ ≥ `--min-silence-s`, rồi neo từng khoảng nghỉ vào dấu câu có vị trí tương ứng gần nhất. Bên trong mỗi đoạn, các từ được chia theo trọng số độ dài âm tiết. Không có từ nào kéo dài qua một khoảng nghỉ.
- **Điều được bảo đảm:** văn bản giữ nguyên 100%, kể cả dấu. Script tự kiểm tra và báo lỗi nếu ghép các từ lại không ra đúng văn bản gốc.
- **Điều *không* được bảo đảm:** mốc từng từ chỉ là **ước lượng**, không phải nhận dạng giọng nói. Mốc ở đầu và cuối mỗi cụm (cạnh khoảng nghỉ) chính xác nhất. Hãy dùng mốc theo cụm để kích hoạt hình, đừng dùng mốc từng âm tiết.
- Khi không phát hiện được khoảng nghỉ, script chuyển sang chia theo tỷ lệ trên toàn vùng có tiếng. Khi không thấy tiếng nào, script chia đều trong `[0.05, dur − 0.05]`. Cả hai trường hợp đều in cảnh báo ra stderr và ghi `method` vào `align.json`.
- Định dạng `words.json`: `[{"word","start","end","scene"}]`, tính bằng giây trên trục `voice_src.wav`. Nếu `video-explainer` cần định dạng khác thì chuyển đổi ở bước 4, không sửa tay file.
- Tiếng Anh: dùng aligner của `video-explainer` thay cho bước này.

### Bước 4 — Dựng cảnh trên `ExplainerStage`

1. Copy `references/world-starter.html` vào dự án. Template này đã có hai theme `whiteboard`/`chalkboard`, các symbol SVG nhân vật que, và một khung `<section class="scene">` mẫu cho từng loại cảnh.
2. Với mỗi cảnh trong `## Scenes`, lấy `data-start`/`data-end` từ mốc `{start end}` trong `script.md`. Các hiệu ứng xuất hiện bám theo mốc cụm trong `words.json`.
3. Tuân thủ `references/design-system.md`: bảng màu theo vai trò, độ dày nét, vùng an toàn, giới hạn chữ, và các **quy tắc chống "slide"**.
4. Nối template vào `ExplainerStage` theo đúng API của `video-explainer`. Template chỉ đánh dấu các điểm cần nối bằng `<!-- ExplainerStage: ... -->`; không tự đặt ra API mới.
5. Nhạc nền `synth:warm` và SFX (phấn viết, "pop" khi xuất hiện, "whoosh" khi chuyển cảnh) lấy từ `video-explainer`. Nhạc nền đặt khoảng −22 đến −26 dB dưới giọng đọc.

### Bước 5 — Render & QA

Theo thứ tự, không bỏ bước nào:

1. `render.py --preview` → mở `contact.jpg`. Kiểm khung đầu không trống, chữ không chồng nhau, không có gì nằm ngoài vùng an toàn.
2. `render.py --draft` → `qa.py` phải đạt **10/10 và `errors=0`**.
3. **Fresh-eyes check:** xem lại bản draft như người xem lần đầu, đối chiếu checklist bên dưới.
4. Render 1080p, rồi mở `review.py` để người dùng duyệt.

Nếu `hyperframes` báo `ERR_ACCESS_DENIED` vì sandbox chặn cổng loopback `127.0.0.1`: **dừng lại và hỏi người dùng** trước khi chạy `render.py`/`qa.py` bên ngoài sandbox. Không tự tắt sandbox.

## Checklist QA (fresh eyes)

- [ ] Trong 5 giây đầu có hook (câu hỏi hoặc tình huống), không phải tiêu đề tĩnh.
- [ ] Mỗi cảnh một ý. Không cảnh nào có quá 12 từ chữ trên màn hình, ngoại trừ bảng định nghĩa (tối đa 20 từ).
- [ ] Mọi chữ trên màn hình đều được lời đọc nhắc tới, hoặc khớp với lời đọc.
- [ ] Hình xuất hiện đúng lúc lời đọc nhắc tới, lệch ≤ 0,3 s theo mốc cụm.
- [ ] Màu giữ nhất quán theo vai trò suốt video (một nhân vật một màu; xanh = tăng/mua, đỏ = giảm/bán).
- [ ] Mỗi khái niệm có ít nhất một ví dụ cụ thể với nhân vật và con số.
- [ ] Không có phát biểu sai do đơn giản hoá. Mọi khẳng định tuyệt đối đã được kiểm.
- [ ] Không có slide gạch đầu dòng, không có khối chữ lớn đứng yên quá 4 giây.
- [ ] Cảnh cuối là recap 3 ý và một câu hỏi tự kiểm tra.
- [ ] Có phụ đề tiếng Việt đúng dấu (lấy từ `words.json`/`transcript.md`).
- [ ] `qa.py` đạt 10/10, `errors=0`; `contact.jpg` không có khung trống.

## Tính nguyên bản

Hãy dùng thể loại này (nhân vật que, bảng trắng) với hệ nhân vật và bảng màu **của riêng dự án** như mô tả trong `design-system.md`. Không sao chép nhân vật, cách tạo hình đặc trưng hay bộ nhận diện của một kênh cụ thể. Logo thương hiệu thật chỉ dùng khi thật sự cần cho nội dung. Ưu tiên icon trung tính hoặc ô chữ viết tắt (ví dụ "Cty A").
