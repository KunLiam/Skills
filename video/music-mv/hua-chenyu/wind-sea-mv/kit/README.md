# 华晨宇《风之海》像素 RPG 闯关 MV 一键工具包

将华晨宇《风之海》（精修版 5:03，已裁去原音频尾部 30s 无关声音）改编为 **21 阶段 · 20 张独立 32-bit 像素场景**「云海逐风 RPG」1080p 30fps 代码渲染 MV，支持直接打包发给别人一键出片，也支持自定义主角姓名。

## 环境要求

- **Node.js 18+**
- **ffmpeg**（macOS 可执行 `brew install ffmpeg`）
- **Chrome / Chromium / Edge** 任意其一（或通过环境变量 `CHROME_PATH` 指定）

## 一键使用

### macOS / Linux

```bash
# 1. 一键生成完整版 5:03（默认主角：追风少年）
./一键生成.sh

# 2. 自定义主角名字（例如改成「坤仔」）
./一键生成.sh --player 坤仔

# 3. 仅渲染前 45.5 秒快速试看
./一键生成.sh --mode preview

# 4. 仅导出 22 张关键帧用于快速验收构图（约 5 秒）
./一键生成.sh --mode keyframes
```

### Windows

双击 `一键生成.bat` 即可生成完整版；或在命令行传参：

```cmd
一键生成.bat --player 坤仔 --mode preview
```

## 目录结构

| 文件 / 目录 | 说明 |
|---|---|
| `full_mv_pixel.html` | 21 阶段像素 RPG 核心渲染引擎（Canvas 2D + 像素人物 + 小小孩双角色 + 像素云幕转场 + 歌词同步） |
| `lyrics.js` | 精准对齐的简体歌词时间轴（0:00 – 5:03） |
| `assets_px/` | 20 张 16:9 定制 32-bit 像素插画底图 |
| `song.mp3` | 精修原曲音频（303.0s，已裁去尾部无关音并做平滑淡出） |
| `render.mjs` | 跨平台并行帧渲染 + ffmpeg 音视频封装脚本 |
| `一键生成.sh` / `一键生成.bat` | macOS/Linux 与 Windows 一键启动脚本 |
