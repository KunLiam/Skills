#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

command -v node >/dev/null 2>&1 || { echo "❌ 请先安装 Node.js (https://nodejs.org)"; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "❌ 请先安装 ffmpeg (macOS: brew install ffmpeg)"; exit 1; }

if [ ! -d "node_modules/puppeteer-core" ]; then
  echo "📦 首次运行，正在安装依赖 (puppeteer-core)..."
  npm install --no-audit --no-fund
fi

node render.mjs "$@"
