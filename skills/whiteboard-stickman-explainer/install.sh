#!/usr/bin/env bash
# Cài skill vào thư mục skill toàn cục của Gemini CLI (mặc định ~/.gemini/config/skills).
# Bản cũ (nếu có) được đổi tên thành <tên>.bak-<thời điểm>, không bị xoá.
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_ROOT="${GEMINI_SKILLS_DIR:-$HOME/.gemini/config/skills}"
DEST="$DEST_ROOT/whiteboard-stickman-explainer"
mkdir -p "$DEST_ROOT"
if [ -e "$DEST" ]; then
  BAK="$DEST.bak-$(date +%Y%m%d-%H%M%S)"
  mv "$DEST" "$BAK"
  echo "Đã lưu bản cũ: $BAK"
fi
mkdir -p "$DEST"
cp -R "$SRC/SKILL.md" "$SRC/scripts" "$SRC/references" "$DEST/"
chmod +x "$DEST/scripts/vi_narration.py"
echo "Đã cài: $DEST"
[ -f "$DEST_ROOT/video-explainer/SKILL.md" ] || echo "Cảnh báo: chưa thấy skill video-explainer ở $DEST_ROOT (cần cho bước 4–5)." >&2
command -v uv >/dev/null || echo "Cảnh báo: chưa có 'uv' (cần để chạy vi_narration.py)." >&2
command -v ffmpeg >/dev/null || echo "Cảnh báo: chưa có 'ffmpeg' (cần để chuẩn hoá audio)." >&2
