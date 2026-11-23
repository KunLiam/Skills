@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo [向阳而生 MV] 首次运行，正在安装依赖...
  call npm install
)
node render.mjs %*
pause
