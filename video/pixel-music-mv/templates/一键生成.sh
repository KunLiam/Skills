#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo "[向阳而生 MV] 首次运行，正在安装依赖..."
  npm install
fi
node render.mjs "$@"
