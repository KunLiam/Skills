# 陀飞轮「人生闯关」像素 MV 一键工具包

将陈奕迅《陀飞轮》（4:38）改编为「玩家人生闯关 RPG」的 1080p 30fps 代码渲染 MV，支持直接打包发给别人一键生成，也支持自定义主角姓名。

## 环境要求

- **Node.js 18+**
- **ffmpeg**（macOS 可执行 `brew install ffmpeg`）
- **Chrome / Chromium / Edge** 任意其一（或通过环境变量 `CHROME_PATH` 指定路径）

## 一键使用

### macOS / Linux

```bash
# 1. 一键生成完整版 4:38（默认主角：坤仔）
./一键生成.sh

# 2. 自定义主角名字（例如改成「阿豪」）
./一键生成.sh --player 阿豪

# 3. 仅渲染前 42 秒快速试看
./一键生成.sh --mode preview

# 4. 仅导出 17 张关键帧用于快速预览构图（约 5 秒）
./一键生成.sh --mode keyframes
```

### Windows

双击 `一键生成.bat` 即可生成完整版；或在命令行中传参：

```cmd
一键生成.bat --player 阿豪 --mode preview
```

## 目录结构

| 文件 / 目录 | 说明 |
|---|---|
| `full_mv_game.html` | 17 阶段游戏化 MV 核心渲染引擎（Canvas 2D + 像素人物 + HUD + 歌词同步） |
| `lyrics.js` | 精确歌词时间轴（0:00 – 4:38） |
| `assets_v3/` | 16 张 16:9 港风像素插画场景底图 |
| `song.mp3` | 原曲音频（自动混入输出 MP4） |
| `render.mjs` | 跨平台并行帧渲染 + ffmpeg 音视频封装脚本 |
| `一键生成.sh` / `一键生成.bat` | macOS/Linux 与 Windows 一键启动脚本 |

## 常用参数

- `--mode <full|preview|keyframes>`：全篇 / 42 秒试看 / 17 张关键帧
- `--player <姓名>`：自定义主角名字（默认 `坤仔`）
- `--workers <数量>`：Chrome 并行标签数（默认 `6`，内存较小可设为 `3`）
- `--out <文件名>`：指定输出路径
- `--audio <路径|none>`：替换音频文件或禁用音频
