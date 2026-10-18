#!/bin/bash
set -euo pipefail

# Chỉ chạy trong phiên cloud
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Đã có XeLaTeX thì bỏ qua (idempotent)
if command -v xelatex >/dev/null 2>&1; then
  exit 0
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq --no-install-recommends \
  texlive-xetex texlive-latex-extra texlive-fonts-recommended \
  texlive-lang-other lmodern fonts-lmodern
