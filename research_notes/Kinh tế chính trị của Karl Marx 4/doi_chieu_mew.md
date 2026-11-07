# Đối chiếu văn bản tiếng Đức gốc của Das Kapital (MEW 23, 24, 25) trên mlwerke.de

Kết luận chung: **lượt này không đọc được văn bản MEW nào.** Mọi mục dưới đây vẫn ở trạng thái "chưa kiểm trong văn bản Đức". Báo cáo hiện tại (bản 3) không nên đổi nhãn sang "Đã đối chiếu văn bản Đức" cho bất kỳ mục nào dựa trên ghi chú này.

## Truy cập mlwerke.de và các nguồn văn bản Đức thay thế

### Takeaway
Ghi chú giao việc nói https://www.mlwerke.de/me/me23/me23_000.htm "trả 200". Mã 200 là đúng, nhưng nội dung trả về chỉ là trang giữ chỗ của nhà cung cấp hosting, không phải mục lục MEW. Các nguồn thay thế (web.archive.org, mlwerke.de không có www, dearchiv.de) đều bị proxy của phiên chặn.

### Cited Findings
- Tôi tải `me23_000.htm`, `me24_000.htm`, `me25_000.htm` và `index.shtml` qua curl https. Cả bốn trả HTTP 200, `text/html`, đúng 935 byte. Ba trang mục lục có cùng md5 `d72b0ddbf7cfb0e1799a81f1e0e4c6e1`. Nội dung: `<title>Hier entsteht eine neue Homepage</title>` và "Diese Homepage wird zur Zeit überarbeitet. Schauen Sie doch mal wieder vorbei!", với favicon của geschaeftskunden.telekom.de và ảnh nền từ homepage.t-online.de. Đây là trang giữ chỗ của T-Online/Telekom, **không có văn bản Marx**. Bản tải về lưu ở `/tmp/claude-0/-home-user-hello-world/393f0766-99bb-5877-ab00-f81777d8334c/scratchpad/mew_pages/` — [mlwerke me23_000](https://www.mlwerke.de/me/me23/me23_000.htm); [me24_000](https://www.mlwerke.de/me/me24/me24_000.htm); [me25_000](https://www.mlwerke.de/me/me25/me25_000.htm)
- WebFetch tới www.mlwerke.de báo `getaddrinfo ENOTFOUND`, tức host này nằm ngoài các tên miền được phép của phiên. Curl tới `https://mlwerke.de/...` (không có www), `web.archive.org` và `www.dearchiv.de` đều bị từ chối ở bước CONNECT (403). Lịch sử của proxy cũng ghi `de.wikisource.org`, `www.gutenberg.org` và `archive.org` bị từ chối. Ngoài ra `www.zeno.org` không phân giải được và projekt-gutenberg.org bị chặn (403) — [trạng thái proxy cục bộ, không có URL công khai]
- Trang chỉ mục tiếng Đức của marxists.org không lưu *Das Kapital* mà dẫn tới bản lưu web.archive của mlwerke: "Das Kapital – Band I" → `web.archive.org/web/20160304205417/http://www.mlwerke.de/me/me23/me23_000.htm`; Band II → `.../20160304171446/http://mlwerke.de/me/me24/me24_000.htm`; Band III → `.../20160304204126/http://www.mlwerke.de/me/me25/me25_000.htm`. Các bản lưu này bị chặn như trên. Các URL `marxists.org/deutsch/archiv/marx-engels/1867/kapital/` trả 404 — [marxists.org/deutsch Marx-Engels index](https://www.marxists.org/deutsch/archiv/marx-engels/index.htm)

### Inferences
- Rất có thể mlwerke.de hiện không còn phục vụ nội dung (tên miền đang treo trang giữ chỗ). Vì vậy dòng "mlwerke.de bị proxy chặn" trong mục "chưa kiểm được" của báo cáo nên sửa thành: "mlwerke.de hiện chỉ trả trang giữ chỗ của T-Online; bản lưu web.archive (2016) bị proxy chặn". Cách khắc phục khả thi nhất là cho phép `web.archive.org` trong cài đặt mạng của phiên, rồi đọc ba snapshot 2016 nêu trên.

### Gaps
- Chưa thử Deutsches Textarchiv (bản in lần đầu 1867, không phải MEW) hay MEGA-digital (BBAW), vì bộ phân loại an toàn của phiên đã chặn một lượt dò nhiều host. Muốn thử phải được người dùng cho phép.

## Bảng quy đổi chương MEW 23 (25 Kap., 7 Abschnitte) ↔ Moore-Aveling (33 ch., 8 Part)

### Takeaway
Không xác nhận được trực tiếp từ mục lục MEW 23. Bảng trong báo cáo vẫn là bảng dựng gián tiếp qua bản Catalan. Lượt này không tìm thấy chỗ nào sai, nhưng cũng không có tên chương tiếng Đức nguyên văn để bổ sung.

### Cited Findings
- Nguồn thứ cấp: Balibar viết rằng nguyên văn là "Die Expropriateurs werden expropriiert" và đặt câu này ở chương 24 bản Đức, tương ứng Chương 32 bản Anh (theo tóm tắt kết quả tìm kiếm). Điều này khớp với quy tắc của báo cáo: Đức Kap. 24 §7 = Anh Ch.32 — [Balibar, Columbia Cooperism](https://cooperism.law.columbia.edu/etienne-balibar-the-expropriators-are-expropriated-2); [Balibar PDF Toronto](https://blogs.law.columbia.edu/praxis1313/files/2018/11/EB_Expropriators-expropriated-TORONTO.pdf)
- Một bài tiếng Bồ Đào Nha ghi rằng mục "Der Fetischcharakter der Ware und sein Geheimnis" nằm ở tr. 85–98 của **bản in 1867** (theo tóm tắt kết quả tìm kiếm, tôi chưa mở bài) — [Problemata, UFPB](https://periodicos.ufpb.br/index.php/problemata/article/download/46146/27471/120467)

### Inferences
- Bằng chứng thứ cấp không mâu thuẫn với bảng hiện tại. Không có cơ sở nào để nói bảng sai.
- Lưu ý: bản in 1867 chia khác bản in lần 2 (1872/73), là bản mà MEW dựa vào (theo lần 4, 1890). Vì vậy số trang của bản 1867 không dùng để kiểm MEW được. Đây là kiến thức nền, chưa kiểm trong lượt này.

### Gaps
- Tên các Abschnitt và Kapitel tiếng Đức nguyên văn của MEW 23, số trang bắt đầu mỗi chương, và việc không có "Abschnitt VIII" vẫn chưa thấy trực tiếp.

## Thuật ngữ Đức và câu then chốt (Fetischcharakter, abstrakt menschliche Arbeit, organische Zusammensetzung, industrielle Reservearmee, tendenzieller Fall der Profitrate, Forschungsweise/Darstellungsweise, Doppelcharakter, doppelten Sinn frei, gesellschaftlich notwendige Arbeitszeit, Produktionspreis, Durchschnittsprofit; "Expropriateurs", câu "phantasmagorische Form")

### Takeaway
Không thuật ngữ nào được kiểm trong văn bản MEW ở lượt này. Chỉ có hai xác nhận thứ cấp: tiêu đề "Der Fetischcharakter der Ware und sein Geheimnis" và câu "Die Expropriateurs werden expropriiert". Cả hai vẫn phải gắn nhãn [Có nguồn thứ cấp].

### Cited Findings
- Tiêu đề "Der Fetischcharakter der Ware und sein Geheimnis" được nhiều nguồn thứ cấp trích như tên một mục thuộc chương 1 của Bd. 1 (theo tóm tắt kết quả tìm kiếm) — [Problemata, UFPB](https://periodicos.ufpb.br/index.php/problemata/article/download/46146/27471/120467); [Universitas, Uni Fribourg](https://unifr.ch/universitas/de/ausgaben/2017-2018/marx/wir-sind-fetischisten!.html)
- "Die Expropriateurs werden expropriiert": Balibar ghi đây là nguyên văn Đức và lưu ý "Expropriateurs" là từ mượn tiếng Pháp — [Balibar, Columbia Cooperism](https://cooperism.law.columbia.edu/etienne-balibar-the-expropriators-are-expropriated-2). Từ điển triết học Spektrum/Metzler cũng có mục từ "Expropriation" — [Spektrum Lexikon der Philosophie](https://www.spektrum.de/lexikon/philosophie/expropriation/682)

### Inferences
- Không có.

### Gaps
- Chưa thấy trong văn bản Đức: "abstrakt menschliche Arbeit", "Doppelcharakter der in den Waren dargestellten Arbeit", định nghĩa "gesellschaftlich notwendige Arbeitszeit" trong Kap. 1, câu "das bestimmte gesellschaftliche Verhältnis der Menschen selbst, welches hier für sie die phantasmagorische Form eines Verhältnisses von Dingen annimmt", "in dem doppelten Sinn frei" (Kap. 4), "organische Zusammensetzung des Kapitals" và "industrielle Reservearmee" (Kap. 23), cặp "Forschungsweise/Darstellungsweise" (Nachwort 1873), "Das Gesetz des tendenziellen Falls der Profitrate" (MEW 25, Abschnitt 3), "Produktionspreis", "Durchschnittsprofit". Lý do: không truy cập được nguồn văn bản Đức nào (xem mục đầu).
- Câu Đức của Balibar và tiêu đề Fetischcharakter chỉ đến từ tóm tắt kết quả tìm kiếm. Tôi chưa mở các trang/PDF đó để đọc nguyên văn.

## Mục lục MEW 24 và MEW 25 (số chương, Abschnitte)

### Takeaway
Không đọc được. Hai trang me24_000.htm và me25_000.htm trả về đúng trang giữ chỗ giống me23_000.htm (cùng md5). Cách đánh số Quyển II, III trong báo cáo (theo bản Anh trên marxists.org, ví dụ Q.II Ch.20–21, Q.III Ch.8–9, 13–15) chưa được xác nhận theo MEW.

### Cited Findings
- me24_000.htm và me25_000.htm trả 935 byte, nội dung "Hier entsteht eine neue Homepage" — [me24_000](https://www.mlwerke.de/me/me24/me24_000.htm); [me25_000](https://www.mlwerke.de/me/me25/me25_000.htm)

### Inferences
- Theo kiến thức nền (chưa kiểm ở lượt này), Quyển II và III được biết là có cùng số chương giữa bản Đức và bản Anh (Q.II: 3 Abschnitte, 21 Kap.; Q.III: 7 Abschnitte, 52 Kap.). Nếu đúng, số chương mà báo cáo dùng cho Q.II và Q.III áp dụng được cho MEW 24 và 25. Báo cáo phải nêu rõ đây là kiến thức nền, chưa kiểm.

### Gaps
- Cần đọc mục lục MEW 24/25 qua bản lưu web.archive 2016, khi web.archive.org được phép truy cập.
