@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul || (echo [错误] 请先安装 Node.js: https://nodejs.org & pause & exit /b 1)
where ffmpeg >nul 2>nul || (echo [错误] 请先安装 ffmpeg 并加入 PATH & pause & exit /b 1)

if not exist "node_modules\puppeteer-core" (
  echo [首次运行] 正在安装 puppeteer-core ...
  call npm install --no-audit --no-fund
)

node render.mjs %*
pause
