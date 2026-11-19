# KunLiam Skills

个人 AI Agent Skills 与一键工具包仓库，按「视频创作」与「其他功能工具」两大主类分层归档，便于持续扩展与直接分享使用。

## 目录结构

```text
Skills/
├── video/                              # 🎬 视频制作类 Skills
│   ├── music-mv/                       # 🎵 音乐 MV（按歌手分目录，每首歌独立文件夹）
│   │   ├── eason-chan/                 # 陈奕迅
│   │   │   └── tourbillon-mv/          # 《陀飞轮》人生闯关 RPG 像素风 1080p MV
│   │   │       ├── SKILL.md            # Agent Skill 定义与 17 阶段速查表
│   │   │       └── kit/                # 可直接运行的一键渲染代码包
│   │   └── hua-chenyu/                 # 华晨宇
│   │       └── wind-sea-mv/            # 《风之海》云海逐风 RPG 像素风 1080p MV
│   │           ├── SKILL.md            # Agent Skill 定义与 14 阶段速查表
│   │           └── kit/                # 可直接运行的一键渲染代码包
│   └── short-video/                    # 📱 短视频 / 混剪 / 动画类（预留）
└── tools/                              # 🛠️ 其他功能类 Skills（预留）
    ├── dev/                            # 开发 / 工程 / 代码移植类
    ├── productivity/                   # 效率 / 文档 / 知识管理类
    └── automation/                     # 自动化 / 定时任务 / 脚本类
```

## 分类与新增规范

1. **视频制作类**统一放在 `video/` 下：
   - 音乐 MV：`video/music-mv/<歌手英文或拼音>/<歌曲skill名>/`（如 `video/music-mv/eason-chan/tourbillon-mv/`）。
   - 其他视频形态（短视频、解说、宣传片等）：`video/short-video/<skill名>/`。
2. **其他功能类**统一放在 `tools/` 下，按领域细分到 `dev/`、`productivity/`、`automation/`（后续可按需新增子类）。
3. **每个 Skill 独立文件夹**，至少包含：
   - `SKILL.md`：标准 YAML frontmatter（`name` / `description`）+ 执行流程说明。
   - `kit/` 或 `scripts/`（如有）：可独立运行的脚本与资源，确保他人 clone 后即可一键运行。

## 已收录 Skills

| 分类 | 名称 | 路径 | 说明 |
|---|---|---|---|
| 🎬 音乐 MV · 陈奕迅 | `tourbillon-mv` | [video/music-mv/eason-chan/tourbillon-mv](video/music-mv/eason-chan/tourbillon-mv) | 陈奕迅《陀飞轮》「人生闯关 RPG」像素风 1080p MV，支持一键出片与自定义主角名 |
| 🎬 音乐 MV · 华晨宇 | `wind-sea-mv` | [video/music-mv/hua-chenyu/wind-sea-mv](video/music-mv/hua-chenyu/wind-sea-mv) | 华晨宇《风之海》「云海逐风 RPG」像素风 1080p MV，14 阶段三幕剧，支持一键出片与自定义主角名 |
