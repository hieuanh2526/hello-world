// gt-scenes.js — 6 cảnh «Giá trị thặng dư» dùng chung cho nhiều phong cách.
// Vẽ trong khung ảo 1640×710 rồi co giãn vào vùng trống của từng mẫu (theme.box). Mọi thời điểm lấy từ window.TL
// (tên từ khóa giống video vẽ tay). Hình chỉ phụ thuộc t: không random, không Date.
(function () {
  'use strict';
  const TAU = Math.PI * 2, VW = 1640, VH = 710;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const P = (t, a, d) => clamp((t - a) / d);
  const outC = (p) => 1 - Math.pow(1 - p, 3);
  const outBack = (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
  const bump = (p) => Math.sin(Math.PI * clamp(p));
  const lerp = (a, b, p) => a + (b - a) * p;
  const hash = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  let X, T, TH;   // ctx, thời gian (đã lượng tử nếu theme.fps), theme
  const M = (k) => window.TL.mark(k);

  // ---------- nét và hình theo theme ----------
  function jit(pts, seed) {   // nét tay: rung nhẹ, cố định theo seed
    if (!TH.sketch) return pts;
    return pts.map(([x, y], i) => [x + (hash(seed + i * 3.1) - 0.5) * TH.sketch, y + (hash(seed + i * 7.7) - 0.5) * TH.sketch]);
  }
  function plen(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }
  function strokePts(pts, p, o = {}) {   // vẽ đường gấp khúc tới p (0–1)
    if (p <= 0 || pts.length < 2) return;
    const L = plen(pts) * clamp(p); let acc = 0;
    X.save(); X.lineCap = 'round'; X.lineJoin = 'round'; X.strokeStyle = o.col || TH.line || TH.ink; X.lineWidth = (o.w || TH.lw) * (o.wk || 1);
    if (TH.glow) { X.shadowColor = o.glow || TH.glow; X.shadowBlur = 14; }
    X.globalAlpha *= o.a ?? 1; X.beginPath(); X.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (acc + d >= L) { const k = (L - acc) / d; X.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)); break; }
      X.lineTo(pts[i][0], pts[i][1]); acc += d; }
    X.stroke(); X.restore();
  }
  function line(x0, y0, x1, y1, p, o = {}) { const n = 8, pts = []; for (let i = 0; i <= n; i++) pts.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); strokePts(jit(pts, x0 * 0.3 + y1), p, o); }
  function arrow(x0, y0, x1, y1, p, o = {}) {
    line(x0, y0, x1, y1, p, o); if (p < 0.85) return;
    const a = Math.atan2(y1 - y0, x1 - x0), L = o.head || 22, q = P(p, 0.85, 0.15);
    strokePts([[x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], [x1, y1], [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)]], q, o);
  }
  function rrPts(x, y, w, h, r) { const pts = [], s = 6; const arc = (cx, cy, a0) => { for (let i = 0; i <= s; i++) { const a = a0 + i / s * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(x + w - r, y + r, -Math.PI / 2); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, Math.PI / 2); arc(x + r, y + r, Math.PI); pts.push(pts[0]); return pts; }
  function circPts(cx, cy, rx, ry = rx, n = 40) { const pts = []; for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / n * TAU; pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return pts; }
  function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
  function path(pts) { X.beginPath(); pts.forEach(([x, y], i) => (i ? X.lineTo(x, y) : X.moveTo(x, y))); X.closePath(); }
  // Hình kín: cách hiện tùy theme.mode
  function shape(pts, p, o = {}) {
    if (p <= 0) return;
    const fill = o.fill === undefined ? TH.fill : o.fill, b = bbox(pts), seed = b.cx * 0.7 + b.cy;
    const mode = TH.mode;
    X.save();
    if (mode === 'flat' || mode === 'paper' || mode === 'gloss') {   // bật ra (scale), không vẽ dần
      const s = mode === 'paper' ? (p < 1 ? 0.9 : 1) : lerp(0.82, 1, outBack(clamp(p)));
      X.globalAlpha *= clamp(p * 2.5); X.translate(b.cx, b.cy); X.scale(s, s); X.rotate(mode === 'paper' ? (hash(seed) - 0.5) * 0.05 : 0); X.translate(-b.cx, -b.cy);
      if (mode === 'paper') { X.save(); X.translate(5, 8); path(pts); X.fillStyle = 'rgba(40,25,10,0.28)'; X.fill(); X.restore(); }
      if (mode === 'flat' && o.shadow !== false) { X.save(); X.translate(0, 8); path(pts); X.fillStyle = TH.shadow; X.fill(); X.restore(); }
      if (mode === 'gloss') { X.shadowColor = 'rgba(0,0,0,0.45)'; X.shadowBlur = 24; X.shadowOffsetY = 12; }
      path(pts);
      if (mode === 'gloss' && fill) { const gr = X.createLinearGradient(b.x0, b.y0, b.x1, b.y1); gr.addColorStop(0, o.hi || shade(fill, 0.35)); gr.addColorStop(0.55, fill); gr.addColorStop(1, shade(fill, -0.35)); X.fillStyle = gr; }
      else X.fillStyle = fill || 'rgba(0,0,0,0)';
      if (fill) X.fill();
      X.shadowColor = 'rgba(0,0,0,0)';
      if (mode === 'flat' && o.stroke !== false) { X.lineWidth = TH.lw; X.strokeStyle = o.col || TH.line || TH.ink; X.lineJoin = 'round'; X.stroke(); }
      if (mode === 'gloss') { X.globalAlpha *= 0.35; X.beginPath(); X.ellipse(lerp(b.x0, b.cx, 0.55), lerp(b.y0, b.cy, 0.5), (b.x1 - b.x0) * 0.22, (b.y1 - b.y0) * 0.12, -0.4, 0, TAU); X.fillStyle = '#ffffff'; X.fill(); }
      X.restore(); return;
    }
    // engrave / collage / neon: tô nền mờ rồi vẽ viền dần
    if (fill) { X.save(); X.globalAlpha *= clamp(p * 1.6 - 0.3); path(pts); X.fillStyle = fill; X.fill();
      if (mode === 'engrave') { X.clip(); X.strokeStyle = TH.ink; X.globalAlpha *= 0.35; X.lineWidth = 1.2; for (let k = b.x0 - (b.y1 - b.y0); k < b.x1; k += 9) { X.beginPath(); X.moveTo(k, b.y1); X.lineTo(k + (b.y1 - b.y0), b.y0); X.stroke(); } }
      X.restore(); }
    if (mode === 'collage' && o.tape !== false && p > 0.6) { X.save(); X.globalAlpha *= P(p, 0.6, 0.3) * 0.8; X.translate(b.cx, b.y0); X.rotate((hash(seed) - 0.5) * 0.5); X.fillStyle = 'rgba(242,171,17,0.55)'; X.fillRect(-36, -12, 72, 24); X.restore(); }
    strokePts(jit(pts, seed), p, { col: o.col, w: o.w });
    X.restore();
  }
  function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g2 = n >> 8 & 255, b = n & 255;
    const f = (c) => Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k)); return `rgb(${f(r)},${f(g2)},${f(b)})`; }
  // chữ: hiện từng ký tự (step giây/ký tự)
  function font(role, size) { const f = TH.fonts[role] || TH.fonts.b; return `${f[0]} ${size}px ${f[1]}`; }
  function txt(str, x, y, size, t0, o = {}) {
    if (T < t0) return 0;
    const f = font(o.role || 'b', size), chars = [...str], step = o.step ?? 0.06;
    const base = X.globalAlpha; X.save(); X.font = f; X.textBaseline = 'middle'; X.textAlign = 'left';
    const ws = chars.map((c) => X.measureText(c).width), tot = ws.reduce((a, b2) => a + b2, 0);
    let xx = o.align === 'center' ? x - tot / 2 : o.align === 'right' ? x - tot : x;
    X.fillStyle = o.col || TH.ink; if (TH.glow && o.glow !== false) { X.shadowColor = TH.glow; X.shadowBlur = 10; }
    for (let i = 0; i < chars.length; i++) { const a = P(T, t0 + i * step, 0.18); if (a <= 0) break;
      X.globalAlpha = base * a * (o.a ?? 1); X.fillText(chars[i], xx, y + (1 - a) * (TH.rise ?? 8)); xx += ws[i]; }
    X.restore(); return tot;
  }
  function tw(str, role, size) { X.save(); X.font = font(role, size); const w = X.measureText(str).width; X.restore(); return w; }
  // nhãn khối màu (từ tô màu A/B)
  function block(str, x, y, size, col, t0, o = {}) {
    const w = tw(str, o.role || 'h', size) + size * 0.7, h = size * 1.35, p = P(T, t0 - 0.05, 0.25);
    if (p <= 0) return;
    X.save(); X.globalAlpha *= clamp(p * 2);
    if (TH.mode === 'neon') { X.strokeStyle = col; X.lineWidth = 2.5; X.shadowColor = col; X.shadowBlur = 16; X.strokeRect(x, y - h / 2, w * p, h); }
    else { if (TH.mode === 'paper') { X.fillStyle = 'rgba(40,25,10,0.28)'; X.fillRect(x + 5, y - h / 2 + 7, w * p, h); } X.fillStyle = col; X.fillRect(x, y - h / 2, w * p, h); }
    X.restore();
    txt(str, x + size * 0.35, y + 2, size, t0 + 0.12, { role: o.role || 'h', col: TH.mode === 'neon' ? col : TH.onBlock, step: 0.045, glow: false });
  }
  function tag(str, x, y, size, t0, col) { block(str, x, y, size, col || TH.tag, t0, { role: 'b' }); }
  function panel(x, y, w, h, t0, o = {}) { shape(rrPts(x, y, w, h, TH.radius), P(T, t0, o.d || 0.5), { fill: o.fill === undefined ? TH.panel : o.fill, col: o.col, tape: o.tape }); }

  // ---------- biểu tượng ----------
  function bag(cx, cy, k, p, o = {}) {
    const body = [[cx - 32 * k, cy - 78 * k], [cx - 92 * k, cy - 8 * k], [cx - 106 * k, cy + 62 * k], [cx - 64 * k, cy + 112 * k], [cx + 64 * k, cy + 112 * k], [cx + 106 * k, cy + 62 * k], [cx + 92 * k, cy - 8 * k], [cx + 32 * k, cy - 78 * k]];
    const sm = []; for (let i = 0; i < body.length; i++) { const a = body[i], b2 = body[(i + 1) % body.length]; sm.push(a, [(a[0] + b2[0]) / 2, (a[1] + b2[1]) / 2]); } sm.push(body[0]);
    shape(sm, p, { fill: o.fill || TH.bag });
    shape([[cx - 44 * k, cy - 92 * k], [cx + 44 * k, cy - 92 * k], [cx + 34 * k, cy - 74 * k], [cx - 34 * k, cy - 74 * k], [cx - 44 * k, cy - 92 * k]], P(p, 0.4, 0.6), { fill: o.fill || TH.bag, tape: false });
  }
  function crate(x, y, w, h, p) { shape(rrPts(x, y, w, h, 6), p, { fill: TH.crate }); line(x + 10, y + 10, x + w - 10, y + h - 10, P(p, 0.5, 0.5), { w: TH.lw * 0.7 }); line(x + w - 10, y + 10, x + 10, y + h - 10, P(p, 0.6, 0.4), { w: TH.lw * 0.7 }); }
  function gear(cx, cy, r, p, rot = 0) {
    const pts = []; const n = 10; for (let i = 0; i <= n * 4; i++) { const a = rot + i / (n * 4) * TAU, k = (i % 4 < 2) ? 1.22 : 1; pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); }
    shape(pts, p, { fill: TH.metal, tape: false }); shape(circPts(cx, cy, r * 0.35), P(p, 0.5, 0.5), { fill: TH.panel || '#ffffff', tape: false });
  }
  function worker(x, y, k, p) {   // y = chân
    const hy = y - 262 * k, q = (a, d) => P(p, a, d);
    shape(circPts(x, hy + 6 * k, 34 * k, 38 * k), q(0, 0.3), { fill: TH.skin, tape: false });
    const dome = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; dome.push([x + 44 * k * Math.cos(a), hy - 10 * k + 40 * k * Math.sin(a)]); } dome.push(dome[0]);
    shape(dome, q(0.15, 0.3), { fill: TH.accA2 || TH.accA, tape: false });
    const lw = { w: TH.lw * 1.2 };
    line(x, hy + 44 * k, x, y - 112 * k, q(0.3, 0.2), lw); line(x, hy + 78 * k, x - 62 * k, y - 150 * k, q(0.45, 0.15), lw);
    line(x, hy + 78 * k, x + 58 * k, y - 186 * k, q(0.5, 0.15), lw); line(x + 58 * k, y - 186 * k, x + 80 * k, y - 262 * k, q(0.6, 0.15), { w: TH.lw * 1.5 });
    shape(rrPts(x + 52 * k, y - 292 * k, 58 * k, 30 * k, 4), q(0.7, 0.2), { fill: TH.metal, tape: false });
    line(x, y - 112 * k, x - 44 * k, y, q(0.75, 0.15), lw); line(x, y - 112 * k, x + 44 * k, y, q(0.8, 0.15), lw);
  }
  function bills(x, y, w, h, p) { for (let k = 2; k >= 0; k--) shape(rrPts(x + k * 14, y - k * 12, w, h, 10), P(p, (2 - k) * 0.2, 0.5), { fill: TH.money, tape: false }); shape(circPts(x + w / 2, y + h / 2, h * 0.3), P(p, 0.7, 0.3), { fill: null, tape: false }); }
  function clock(cx, cy, r, p, prog) {
    shape(circPts(cx, cy, r), p, { fill: TH.panel || null, tape: false });
    if (p < 1) return;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8, cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92, 1, { w: 2.5 }); }
    const a = -Math.PI / 2 + prog / 12 * TAU, a2 = -Math.PI / 2 + T * 1.6;
    line(cx, cy, cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, 1, { w: TH.lw * 1.6 }); line(cx, cy, cx + Math.cos(a2) * r * 0.8, cy + Math.sin(a2) * r * 0.8, 1, { col: TH.accA, w: TH.lw });
  }
  function hat(cx, cy, k, p) { shape([[cx - 46 * k, cy], [cx - 40 * k, cy - 96 * k], [cx + 40 * k, cy - 96 * k], [cx + 46 * k, cy], [cx - 46 * k, cy]], p, { fill: TH.hat, tape: false }); line(cx - 84 * k, cy + 4, cx + 84 * k, cy, P(p, 0.5, 0.5), { w: TH.lw * 1.6 }); }
  function brace(x0, x1, y, p, col) { const m = (x0 + x1) / 2, h = 18; strokePts([[x0, y - h], [x0 + 6, y - 4], [m - 14, y], [m, y + h]], p, { col }); strokePts([[x1, y - h], [x1 - 6, y - 4], [m + 14, y], [m, y + h]], p, { col }); }
  function qmark(x, y, p, s = 1) { const pts = []; for (let i = 0; i <= 14; i++) { const a = Math.PI * 1.15 - i / 14 * Math.PI * 1.35; pts.push([x + Math.cos(a) * 30 * s, y - 40 * s + Math.sin(a) * 30 * s]); } pts.push([x, y + 10 * s]);
    strokePts(pts, p, { col: TH.accA, w: TH.lw * 2.2 }); if (p > 0.9) { X.save(); X.fillStyle = TH.accA; X.beginPath(); X.arc(x, y + 42 * s, 7 * s, 0, TAU); X.fill(); X.restore(); } }
  function cellRow(x0, y, n, cw, h, p) { shape(rrPts(x0, y, n * cw, h, 4), p, { fill: TH.panel || null, tape: false }); for (let i = 1; i < n; i++) line(x0 + i * cw, y + 4, x0 + i * cw, y + h - 4, P(p, 0.4 + i * 0.05, 0.2), { w: TH.lw * 0.6 }); }
  function cellFill(x0, y, cw, h, i, p, col) { if (p <= 0) return; X.save(); X.fillStyle = col; if (TH.glow) { X.shadowColor = col; X.shadowBlur = 14; } X.globalAlpha *= TH.mode === 'neon' ? 0.75 : 0.95; X.fillRect(x0 + i * cw + 6, y + 8, (cw - 12) * p, h - 16); X.restore(); }

  // ---------- các cảnh ----------
  const S = {};
  S[0] = () => {   // T – H – T'
    const t1 = M('bỏ tiền'), t2 = M('thu về'), t3 = M('nhiều tiền hơn');
    txt("T – H – T'", VW / 2, 40, 64, 0.2, { role: 'h', align: 'center', step: 0.09 });
    txt('Công thức chung của tư bản', VW / 2, 105, 34, 0.9, { align: 'center', col: TH.mute, step: 0.03 });
    bag(260, 360, 1, P(T, t1 - 0.4, 0.6)); txt('T', 260, 385, 80, t1 + 0.1, { role: 'h', align: 'center', col: TH.onBag });
    txt('Tiền', 260, 540, 40, t1 + 0.2, { align: 'center' });
    arrow(420, 380, 640, 380, P(T, t1 + 0.3, 0.35), { col: TH.accent });
    crate(730, 290, 180, 170, P(T, t1 + 0.5, 0.45)); txt('H', 820, 375, 80, t1 + 0.8, { role: 'h', align: 'center' });
    txt('Hàng hóa', 820, 540, 40, t1 + 0.85, { align: 'center' });
    arrow(1000, 380, 1220, 380, P(T, t2 - 0.15, 0.35), { col: TH.accent });
    X.save(); const s = 1 + 0.05 * bump(P(T, t3, 0.5)); X.translate(1380, 350); X.scale(s, s); X.translate(-1380, -350);
    bag(1380, 350, 1.4, P(T, t2 + 0.05, 0.6), { fill: TH.bag2 }); txt("T'", 1380, 375, 104, t2 + 0.35, { role: 'h', align: 'center', col: TH.onBag2, step: 0.1 }); X.restore();
    txt('Tiền nhiều hơn', 1380, 560, 40, t3, { align: 'center' });
    qmark(1580, 200, P(T, t3, 0.4), 1.2);
    if (T > t3 + 0.3) tag("T' > T", 1500, 70, 34, t3 + 0.3, TH.accA);
  };
  S[1] = () => {   // sức lao động — hàng hóa đặc biệt
    const tm = M('Các Mác'), th = M('hàng hóa đặc biệt'), ts = M('sức lao động'), s0 = window.TL.shots[1].start;
    panel(40, 20, 560, 150, tm - 0.3, { d: 0.4 });
    txt('K. Marx', 80, 72, 52, tm, { role: 'h' }); txt('«Tư bản», quyển I (1867)', 80, 132, 32, tm + 0.4, { step: 0.03 });
    X.save(); const sw = Math.sin(T * 1.7) * 0.012; X.translate(480, 690); X.rotate(sw * P(T, tm + 1.2, 0.5)); X.translate(-480, -690); worker(480, 690, 1.45, P(T, s0 + 0.2, 1.1)); X.restore();
    const tagPts = [[880, 330], [940, 250], [1380, 250], [1380, 410], [940, 410], [880, 330]];
    shape(tagPts, P(T, th - 0.25, 0.5), { fill: TH.panel || null });
    line(880, 330, 640, 420, P(T, th, 0.3), { w: TH.lw * 0.7 });
    txt('Hàng hóa', 980, 300, 54, th, { role: 'h' }); txt('đặc biệt', 980, 366, 46, th + 0.35, { col: TH.accA });
    block('sức lao động', 900, 560, 72, TH.accB, ts);
  };
  S[2] = () => {   // c và v
    const s2 = window.TL.shots[2].start, s3 = window.TL.shots[3].start, th = M('hai phần');
    bag(820, 110, 0.75, P(T, s2 + 0.1, 0.55), { fill: TH.bag2 }); txt('Tư bản ứng trước', 820, 18, 38, s2 + 0.3, { role: 'h', align: 'center', step: 0.03 });
    arrow(740, 170, 420, 240, P(T, th - 0.1, 0.4)); arrow(900, 170, 1220, 240, P(T, th + 0.1, 0.4));
    panel(20, 250, 780, 440, M('bất biến') - 0.3, { d: 0.5 }); panel(840, 250, 780, 440, Math.max(s3, M('khả biến') - 0.3), { d: 0.5 });
    // c
    const tb = M('bất biến'), tc = M('c5'), tm = M('máy móc'), tn = M('nguyên liệu'), tcv = M('chuyển nguyên'), tsp = M('sản phẩm');
    tag('Tư bản bất biến', 50, 300, 34, tb); txt('c', 720, 300, 96, tc - 0.05, { role: 'h', align: 'center', col: TH.accA });
    gear(150, 470, 64, P(T, tm - 0.15, 0.45), clamp((T - tm) / 6) * 1.5); txt('máy móc', 150, 610, 32, tm + 0.1, { align: 'center' });
    crate(260, 410, 130, 120, P(T, tn - 0.15, 0.4)); txt('nguyên liệu', 325, 610, 32, tn + 0.1, { align: 'center' });
    arrow(420, 470, 540, 470, P(T, tcv - 0.1, 0.35), { col: TH.accA }); txt('chuyển nguyên', 480, 425, 26, tcv, { align: 'center', col: TH.accA, step: 0.04 });
    shape(rrPts(560, 400, 210, 150, 16), P(T, tsp - 0.2, 0.4), { fill: TH.panel2 || TH.panel });
    txt('Sản phẩm', 665, 445, 32, tsp, { role: 'h', align: 'center' }); txt('c', 665, 505, 52, tsp + 0.3, { role: 'h', align: 'center' });
    txt('giá trị không tăng', 665, 610, 28, tsp + 0.5, { align: 'center', col: TH.accA, step: 0.035 });
    // v
    const tk = M('khả biến'), tv = M('v8'), tmu = M('mua'), tcn = M('công nhân');
    tag('Tư bản khả biến', 870, 300, 34, Math.max(tk, s3)); txt('v', 1540, 300, 96, tv - 0.05, { role: 'h', align: 'center', col: TH.accB });
    bills(900, 430, 190, 100, P(T, tmu - 0.1, 0.5)); txt('tiền công', 1000, 610, 32, tmu + 0.2, { align: 'center' });
    arrow(1130, 480, 1290, 480, P(T, tmu + 0.4, 0.35));
    worker(1430, 670, 0.95, P(T, tcn - 0.6, 0.9));
    block('sức lao động', 1300, 370, 40, TH.accB, tcn + 0.1);
  };
  S[3] = () => {   // ngày lao động
    const s4 = window.TL.shots[4].start, s5 = window.TL.shots[5].start, t8 = M('tám giờ'), t4 = M('bốn giờ'), tgm = M('giá trị mới'), tnv = M('ngang với'), tty = M('tất yếu');
    const tcl = M('còn lại'), ttd = M('lao động thặng dư'), tck = M('chiếm không'), tgt = M('giá trị thặng dư'), tm = M('m16');
    const x0 = 60, cw = 165, by = 200, bh = 110;
    txt('Một ngày lao động = 8 giờ', x0, 60, 56, Math.min(t8 - 0.5, s4 + 0.4), { role: 'h', step: 0.035 });
    const prog = 4 * P(T, t4, 1.0) + 4 * P(T, tcl + 0.2, 1.0); clock(1520, 80, 72, P(T, s4 + 0.2, 0.5), prog);
    cellRow(x0, by, 8, cw, bh, P(T, t8 - 0.2, 0.7));
    for (let i = 0; i < 4; i++) cellFill(x0, by, cw, bh, i, P(T, t4 + i * 0.22, 0.25), TH.accB);
    for (let i = 4; i < 8; i++) cellFill(x0, by, cw, bh, i, P(T, tcl + 0.2 + (i - 4) * 0.22, 0.25), TH.accA);
    for (let i = 0; i <= 8; i++) txt(String(i), x0 + i * cw, by + bh + 80, 28, t8 + 0.3 + i * 0.04, { align: 'center', col: TH.mute });
    txt('giá trị mới = v', x0 + 2 * cw, by - 36, 40, tgm, { align: 'center', step: (tnv + 0.2 - tgm) / 15 });
    brace(x0 + 8, x0 + 4 * cw - 8, by + bh + 30, P(T, tty - 0.35, 0.35));
    txt('Lao động tất yếu', x0 + 2 * cw, by + bh + 140, 40, tty - 0.05, { role: 'h', align: 'center', step: 0.04 });
    brace(x0 + 4 * cw + 8, x0 + 8 * cw - 8, by + bh + 30, P(T, ttd - 0.2, 0.35), TH.accA);
    txt('Lao động thặng dư', x0 + 6 * cw, by + bh + 140, 40, ttd, { role: 'h', align: 'center', col: TH.accA, step: 0.04 });
    const capT = Math.max(s5 + 0.3, tck - 1.6);
    bag(1500, 560, 0.75, P(T, capT, 0.7)); hat(1500, 455, 0.8, P(T, capT + 0.3, 0.5));
    txt('Nhà tư bản', 1500, 685, 34, capT + 0.6, { align: 'center' });
    strokePts([[x0 + 6 * cw, by - 10], [x0 + 6.6 * cw, by - 120], [1400, 150], [1440, 450]], P(T, tck - 0.2, 0.6), { col: TH.accA, w: TH.lw * 1.4 });
    txt('chiếm không', 1250, 120, 38, tck + 0.1, { role: 'h', align: 'center', col: TH.accA, step: 0.04 });
    block('giá trị thặng dư', x0, 610, 56, TH.accA, tgt);
    txt('= m', x0 + tw('giá trị thặng dư', 'h', 56) + 70, 612, 64, tm - 0.1, { role: 'h', col: TH.accA, step: 0.08 });
  };
  S[4] = () => {   // G = c + v + m
    const s6 = window.TL.shots[6].start, th = M('hàng hóa'), tc = M('c17'), tv = M('v17'), tm = M('m17');
    panel(120, 140, 1400, 300, s6 + 0.1, { d: 0.5 });
    tag('Giá trị hàng hóa', 120, 70, 40, s6 + 0.15);
    const items = [['G', th], [' = ', th + 0.25], ['c', tc - 0.05], [' + ', tv - 0.3], ['v', tv - 0.05], [' + ', tm - 0.25], ['m', tm - 0.05]];
    const ws = items.map(([s]) => tw(s, 'h', 160)), tot = ws.reduce((a, b2) => a + b2, 0); let x = VW / 2 - tot / 2;
    const xs = [];
    items.forEach(([s, t0], i) => { xs.push(x + ws[i] / 2); const col = i === 6 ? TH.accA : i === 4 ? TH.accB : TH.ink; if (s.trim()) txt(s.trim(), x + ws[i] / 2, 290, 160, t0, { role: 'h', align: 'center', col }); x += ws[i]; });
    const lab = [[0, 'giá trị hàng hóa', th + 0.2, TH.ink, 500], [2, 'máy móc, nguyên liệu', tc + 0.15, TH.ink, 570], [4, 'tiền công', tv + 0.15, TH.accB, 500], [6, 'thặng dư', tm + 0.15, TH.accA, 570]];
    lab.forEach(([i, s, t0, col, y]) => txt(s, xs[i], y, 34, t0, { align: 'center', col, step: 0.03 }));
  };
  S[5] = () => {   // m' = m/v × 100%
    const s7 = window.TL.shots[7].start, tmv = M('m trên v'), t100 = M('một trăm');
    tag('Tỷ suất giá trị thặng dư', 120, 40, 40, s7 + 0.1);
    txt("m'", 180, 230, 130, s7 + 0.4, { role: 'h', col: TH.accA, step: 0.1 }); txt('=', 360, 230, 130, s7 + 0.7, { role: 'h' });
    txt('m', 560, 165, 104, tmv, { role: 'h', align: 'center', col: TH.accA }); line(470, 240, 650, 240, P(T, tmv + 0.15, 0.2), { w: TH.lw * 1.4 });
    txt('v', 560, 320, 104, tmv + 0.4, { role: 'h', align: 'center', col: TH.accB }); txt('× 100%', 700, 230, 120, tmv + 0.6, { role: 'h', step: 0.07 });
    txt('=', 360, 520, 90, t100 - 0.3, { role: 'h' });
    txt('4 giờ', 560, 465, 60, t100 - 0.2, { role: 'h', align: 'center', col: TH.accA }); line(470, 520, 650, 520, P(T, t100, 0.2));
    txt('4 giờ', 560, 580, 60, t100 + 0.15, { role: 'h', align: 'center', col: TH.accB }); txt('× 100% =', 700, 520, 86, t100 + 0.4, { role: 'h', step: 0.05 });
    const sp = P(T, t100 + 0.9, 0.22);
    if (sp > 0) { X.save(); X.translate(1330, 500); X.rotate(-0.08); const s = lerp(1.7, 1, outC(sp)); X.scale(s, s); X.globalAlpha *= clamp(sp * 3);
      X.lineWidth = 8; X.strokeStyle = TH.accA; if (TH.glow) { X.shadowColor = TH.accA; X.shadowBlur = 18; } X.strokeRect(-200, -95, 400, 190);
      X.font = font('h', 120); X.fillStyle = TH.accA; X.textAlign = 'center'; X.textBaseline = 'middle'; X.fillText('100%', 0, 6); X.restore(); }
  };
  const SCENE_OF_SHOT = [0, 1, 2, 2, 3, 3, 4, 5];

  function draw(ctx, t, theme) {
    X = ctx; TH = theme; T = theme.fps ? Math.floor(t * theme.fps) / theme.fps : t;
    const shots = window.TL.shots; let i = shots.findIndex((s) => t < s.end); if (i < 0) i = shots.length - 1;
    const sc = SCENE_OF_SHOT[i], first = SCENE_OF_SHOT.indexOf(sc), last = SCENE_OF_SHOT.lastIndexOf(sc);
    const a = shots[first].start, b = shots[last].end;
    const b0 = theme.box, s = Math.min((b0.x1 - b0.x0) / VW, (b0.y1 - b0.y0) / VH);
    const push = 1 + 0.025 * clamp((t - a) / Math.max(1, b - a));   // đẩy chậm trong mỗi cảnh
    X.save();
    X.translate((b0.x0 + b0.x1) / 2, (b0.y0 + b0.y1) / 2); X.scale(s * push, s * push); X.translate(-VW / 2, -VH / 2);
    X.globalAlpha = clamp((t - a) / 0.3) * (1 - P(t, b - 0.2, 0.2) * (last < shots.length - 1 ? 1 : 0));
    X.textBaseline = 'middle'; X.lineCap = 'round'; X.lineJoin = 'round';
    if (theme.backdrop) { X.save(); X.globalAlpha = 1; X.fillStyle = theme.backdrop.fill; X.shadowColor = 'rgba(0,0,0,0.25)'; X.shadowBlur = 30; X.fillRect(-40, -40, VW + 80, VH + 80); X.restore();
      X.save(); X.strokeStyle = theme.backdrop.line; X.lineWidth = 2; X.strokeRect(-24, -24, VW + 48, VH + 48); X.lineWidth = 1; X.strokeRect(-16, -16, VW + 32, VH + 32); X.restore(); }
    S[sc]();
    X.restore();
  }
  window.GT = { draw };
})();
