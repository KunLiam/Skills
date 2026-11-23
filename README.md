# KunLiam Skills

个人 AI Agent Skills 仓库，按「视频创作」与「其他工具」分层归档，通过统一可迭代 Skill 持续沉淀最佳实践。

## 目录结构

```text
Skills/
├── video/                              # 🎬 视频制作类 Skills
│   ├── pixel-music-mv/                 # 🎵 一站式像素风音乐游戏 MV 创作、策划与防抖弹幕 Skill（统一迭代版）
│   │   ├── SKILL.md                    # 四阶段标准化工作流（词意策划 → 像素制作 → 抽帧质检 → 渲染迭代）
│   │   ├── references/                 # 四大风格原型库、10 类去同质化玩法组件库、防抖弹幕与工程红线、迭代日志
│   │   ├── scripts/                    # 音频骨架/BPM 分析、字幕转换、接触表抽帧、音轨对齐脚本
│   │   └── templates/                  # 轻量通用 render.mjs / package.json 一键渲染启动模板（不含版权音频与大图）
│   └── short-video/                    # 📱 短视频 / 混剪 / 动画类（预留）
└── tools/                              # 🛠️ 其他功能类 Skills（预留）
    ├── dev/                            # 开发 / 工程 / 代码移植类
    ├── productivity/                   # 效率 / 文档 / 知识管理类
    └── automation/                     # 自动化 / 定时任务 / 脚本类
```

## 为什么不在 Git 仓库中上传各首歌的一键工具包？

- **Skills 与生成物解耦**：每首歌的 `song.mp3` / `.flac` 属于版权音频，定制 `assets_px/*.png` 单首可达 30–70 MB；将其提交进 Git 会令仓库迅速膨胀至数百 MB。
- **单一 Skill 持续迭代**：所有词意分析、反同质化游戏策划、亚像素防抖弹幕、Chrome 渲染排坑均统一维护在 [`video/pixel-music-mv/`](video/pixel-music-mv) 中。每次创作新歌只需把审美或技术升级沉淀到本 Skill，无需为每首歌单独建 Skill。

## 已收录 Skills

| 分类 | 名称 | 路径 | 说明 |
|---|---|---|---|
| 🎬 音乐 MV（统一迭代版） | `pixel-music-mv` | [video/pixel-music-mv](video/pixel-music-mv) | 一站式词意策划、四大曲风原型、10 类非重复玩法库、高清防抖弹幕与 1080p 像素 MV 渲染工作流 |
