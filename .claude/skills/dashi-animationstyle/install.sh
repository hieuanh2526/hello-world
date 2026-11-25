#!/usr/bin/env bash
# install.sh：一条命令装好 dashi-animationstyle（越南语 / 英语版）要用的东西。macOS 和 Linux（含 Claude Code 云端容器）都能跑。
#   bash install.sh              装字体 + whisper-cli + whisper 模型，最后跑自检
#   bash install.sh --no-whisper 只装字体（没有 whisper 时字幕要给稿子）
#   bash install.sh --global     另外把 skill 链接到 ~/.claude/skills/，在别的项目里也能用
#   bash install.sh --voice      thêm môi trường giọng đọc VieNeu-TTS (tao-giong.py: nhân bản giọng / giọng có sẵn)
# 可以重复跑：已经装好的会跳过。
set -euo pipefail
SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WHISPER_TAG="v1.9.5"
MODEL="ggml-large-v3-turbo-q5_0.bin"     # 约 550 MB；越南语识别比 small / base 好得多
MODEL_URL="https://huggingface.co/ggerganov/whisper.cpp/resolve/main/$MODEL"
MODEL_DIR="$HOME/.cache/whisper-cpp"
WANT_WHISPER=1; GLOBAL=0; VOICE=0
for a in "$@"; do case "$a" in
  --no-whisper) WANT_WHISPER=0 ;; --global) GLOBAL=1 ;; --voice) VOICE=1 ;;
  -h|--help) sed -n 2,7p "$0"; exit 0 ;; *) echo "không hiểu tham số: $a"; exit 1 ;; esac; done
say() { printf '\n== %s\n' "$*"; }
OS="$(uname -s)"

say "1/4 Node 22+, ffmpeg"
need=()
command -v node >/dev/null && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ] || need+=(node)
command -v ffmpeg >/dev/null || need+=(ffmpeg)
if [ ${#need[@]} -gt 0 ]; then
  if [ "$OS" = Darwin ]; then echo "Thiếu: ${need[*]}. Cài bằng: brew install ${need[*]}"; exit 1
  elif [ "$(id -u)" = 0 ] && command -v apt-get >/dev/null && [[ " ${need[*]} " == *" ffmpeg "* ]] && [ ${#need[@]} -eq 1 ]; then apt-get install -y ffmpeg
  else echo "Thiếu: ${need[*]} (Node phải từ bản 22). Cài rồi chạy lại."; exit 1; fi
fi
echo "ok: node $(node -v), $(ffmpeg -version | head -1 | cut -d' ' -f1-3)"

say "2/4 Font tiếng Việt / tiếng Anh"
node "$SKILL/pipeline/cai-font.mjs"

if [ "$WANT_WHISPER" = 1 ]; then
  say "3/4 whisper-cli"
  if command -v whisper-cli >/dev/null || [ -x "$HOME/.local/bin/whisper-cli" ]; then echo "đã có whisper-cli"
  elif [ "$OS" = Darwin ] && command -v brew >/dev/null; then brew install whisper-cpp
  else
    for t in git cmake make c++; do command -v $t >/dev/null || { echo "Thiếu $t để build whisper.cpp (Ubuntu: apt-get install -y git cmake build-essential)"; exit 1; }; done
    tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
    git clone -q --depth 1 --branch "$WHISPER_TAG" https://github.com/ggml-org/whisper.cpp "$tmp/whisper.cpp"
    cmake -S "$tmp/whisper.cpp" -B "$tmp/build" -DCMAKE_BUILD_TYPE=Release -DBUILD_SHARED_LIBS=OFF -DWHISPER_BUILD_TESTS=OFF >/dev/null
    cmake --build "$tmp/build" -j"$(nproc 2>/dev/null || echo 4)" --target whisper-cli >/dev/null
    mkdir -p "$HOME/.local/bin"; cp "$tmp/build/bin/whisper-cli" "$HOME/.local/bin/"
    echo "đã build whisper.cpp $WHISPER_TAG -> $HOME/.local/bin/whisper-cli"
  fi
  say "4/4 Model whisper ($MODEL)"
  mkdir -p "$MODEL_DIR"
  if [ -s "$MODEL_DIR/$MODEL" ]; then echo "đã có $MODEL_DIR/$MODEL"
  else curl -fL --retry 3 -o "$MODEL_DIR/$MODEL.part" "$MODEL_URL" && mv "$MODEL_DIR/$MODEL.part" "$MODEL_DIR/$MODEL"
    echo "đã tải $MODEL_DIR/$MODEL"; fi
else say "3-4/4 Bỏ qua whisper (--no-whisper)"; fi

if [ "$VOICE" = 1 ]; then
  say "Giọng đọc VieNeu-TTS (tao-giong.py)"
  VENV="$HOME/.local/share/dashi-tts/venv"
  command -v python3 >/dev/null || { echo "Thiếu python3 (Mac: brew install python)"; exit 1; }
  [ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q --upgrade pip >/dev/null 2>&1 || true
  "$VENV/bin/pip" install -q vieneu && echo "đã cài vieneu vào $VENV (model tải về lần chạy đầu, vài trăm MB)"
fi

if [ "$GLOBAL" = 1 ]; then
  mkdir -p "$HOME/.claude/skills"
  if [ -e "$HOME/.claude/skills/dashi-animationstyle" ]; then echo "đã có ~/.claude/skills/dashi-animationstyle, không ghi đè"
  else ln -s "$SKILL" "$HOME/.claude/skills/dashi-animationstyle"; echo "đã link vào ~/.claude/skills/dashi-animationstyle"; fi
fi

say "Tự kiểm tra"
node "$SKILL/pipeline/tu-kiem-tra.mjs" || true
