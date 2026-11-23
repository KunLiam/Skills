---
name: pixel-music-mv
description: >-
  一站式像素风音乐游戏 MV 创作、词意剧情策划与防抖弹幕渲染 Skill（统一迭代版）。
  融合词意深度解构、去同质化创意玩法策划（严禁重复“跳云台/跳石阶”）、32-bit 像素场景生成、
  亚像素防抖高清热评弹幕系统、节拍卡点转场与无损音频封装。支持按歌曲气质自由选用
  「励志治愈探索 / 人生哲理闯关 / 悬疑剧情摄影 / 戏剧张力逆袭」四大风格原型，并随作品持续迭代。
  当用户需要“给某首歌做像素 MV / 动画游戏 MV / 歌词 MV”、重做或升级旧 MV、调整玩法弹幕时使用。
---

# 像素音乐游戏 MV 统一迭代引擎 (`pixel-music-mv`)

本 Skill 将原有的 `music-mv`、`lyric-narrative-planner`、`pixel-game-mv-creator` 及各单曲零散 Skill 合并为唯一维护入口。**任何新歌创作或旧片重构，均遵循同一套四阶段标准化流水线，并在此 Skill 的 `references/` 上持续迭代沉淀。**

---

## 核心工作流程（四阶段门禁）

### 阶段 1：听歌校验与词意剧情策划（先写文档，再写代码）
> 在产出两份 `docs/` 策划文档前，**严禁直接编写渲染 HTML 或渲染视频**。

1. **音源与词轴防伪校验**：
   - 检查音频格式与时长，避开 DJ 魔改/错剪音轨（推荐 `.flac` / 原版母带）。
   - 运行骨架分析脚本获取 BPM、能量分段与人声跃升点：
     ```bash
     python3 /Users/SEI/.gemini/config/skills/pixel-music-mv/scripts/analyze_song.py <音频路径> -o song-analysis.json
     ```
   - 核对 `.lrc` / `lyrics.js` 与真实人声能量峰值对齐，把长尾奏留白段也纳入时间线。
2. **背景调研与风格定型**：
   - 查阅专辑哲学、词曲背景与真实高赞热评。
   - 对照 [风格与玩法分类库](references/style-archetypes.md) 选择最匹配的主线架构，并确定主角名（如华晨宇系默认带 `yu` 后缀 `追光者yu`、港乐故事线默认 `坤仔` 等）。
3. **落盘两份策划文档（`<项目目录>/docs/`）**：
   - `docs/MV_故事与游戏策划.md`：宏观主线悬念、非重复创意玩法矩阵、高共鸣弹幕规划表（全曲 `25–40` 条）。
   - `docs/逐句歌词提示词清单.md`：**覆盖前奏、每一句歌词与尾奏**——逐行写明词意拆解、32-bit 像素美术提示词、本句专属互动动作及同期弹幕。

---

### 阶段 2：像素美术与互动引擎编码
1. **独立像素场景生成**：按 `逐句歌词提示词清单.md` 调用 `image-generator` 产出 16+ 张风格统一的 16:9 32-bit 像素场景底图（如已存在则复用或局部重绘）。
2. **反同质化交互实现**：严格对照 [创意玩法组件库](references/mechanics-library.md) 编码，**严禁连续两个以上乐章都使用“跳云台/跳青苔石阶”**；清除遮挡风景的大块静态对话框，改以实时粒子、护盾弹反、音游节拍环、光翼飞行、钩爪摆荡、镜面分裂、拍立得飞入等纯视觉语言驱动。
3. **高清防抖弹幕 & 工程红线**：严格遵守 [工程红线与避坑手册](references/danmaku-and-render-rules.md)（局部开启抗锯齿、浮点坐标禁用 `Math.round()`、慢速巡航气泡、Additive 叠辉与双层转场）。

---

### 阶段 3：双阶渲染与肉眼抽检（必须先看图再出长片）
1. **关键帧接触表质检**：
   ```bash
   ./一键生成.sh --mode keyframes --times <关键时间点逗号列表> --out /tmp/mv_kf
   ffmpeg -y -pattern_type glob -i '/tmp/mv_kf/t*.jpg' -filter_complex "scale=480:270,tile=4x3:padding=6:color=0x111111" /tmp/mv_sheet.jpg
   ```
   使用 `read_file` 审查接触表：检查人物脚底贴地、弹幕清晰不重叠、HUD 不遮挡、无 Chrome 拼块撕裂。发现问题改完复检，并及时清理 `/tmp/` 临时文件。
2. **40–45s 试看先行**：
   - 大改玩法或换歌后，先跑 `--mode preview` 导出前 40s 试看并用 `ffprobe` 校验音频采样率与时长，供用户直观确认节奏与弹幕手感。

---

### 阶段 4：完整版交付与 Skill 持续迭代
1. 用户点头后跑 `--mode full --workers 8` 导出完整 1080p 30fps 成片，并运行 `ffprobe` 校验最终 MP4。
2. 每次完成新歌或收到用户修改批评后，**必须将新踩的坑与新验证有效的技法补充进 [references/iteration-log.md](references/iteration-log.md) 与对应 `references/` 文档中**，让这套唯一 Skill 越用越强。

---

## 工具脚本清单 (`scripts/`)
- `scripts/analyze_song.py` — 音频 BPM、结构分段、能量突起点、重音分析
- `scripts/check_env.py` — 检查 Python/librosa/ffmpeg/Node.js 环境
- `scripts/srt2js.py` — 将 `.srt` 字幕转为前端 `lyrics.js`
- `scripts/contact_sheet.py` — 生成带时间水印的视频抽帧接触表
- `scripts/video_rhythm.py` — 量化镜头切点与画面静止率
- `scripts/finalize_audio.py` — 保持原曲响度无损封装音轨
