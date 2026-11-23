# 工程红线、高清弹幕规范与历史项目清单

## 一、五条必须严格遵守的工程红线

1. **高清防抖弹幕系统（绝对禁止“文字小+像素取整晃动”）**
   - 绘制 `drawDanmaku(t)` 内部必须在 `ctx.save()` 后**显式设置 `ctx.imageSmoothingEnabled = true`**。
   - 水平坐标 `x = lerp(W + 60, -tw - 100, u)` **必须保留浮点数**，绝不可使用 `Math.round()`，彻底杜绝缓慢移动时的帧间跳跃晃动！
   - 字号使用 **`700 26px "PingFang SC"`**，横穿 1920px 耗时 **`14.0–15.0s`**，衬底使用圆角半透明毛玻璃胶囊（`rgba(8, 12, 22, 0.72)` + `1.2px` 边框），保证高光场景依然清晰锐利。
   - 轨道安全区为顶部 3 条错峰跑道（`y = 114~224`），避开 HUD 顶栏与中央剧情角色。
2. **消除 Mac 无头 Chrome 渲染撕裂（`toDataURL` + `--disable-gpu`）**
   - `render.mjs` 启动 Chrome 必须使用 `args: ["--disable-gpu", "--no-sandbox"]`。
   - 优先使用页面内 `c.toDataURL("image/jpeg", 0.92)` 导出帧图像，禁止旧版 `page.screenshot()` + `--enable-gpu-rasterization`（多并发下会出现 3×3 网格错位拼块）。
3. **非侵入式 UI 与景深**
   - 除开篇前 5–8 秒建立悬念的档案卡及结局致敬卡外，正片流程中**禁止使用大面积居中静态 RPG 对话框遮挡像素风景**。
   - 利用前景低透明度视差遮挡、Additive 叠辉（`globalCompositeOperation = "lighter"`）与 `0.80s` 暖光缩放溶图转场实现电影连贯感。
4. **音轨母带保真与对齐校验**
   - `ffmpeg` 封装使用 `-c:a aac -b:a 256k` 保持原曲动态。仅在 `--mode preview` 加 1.5s 尾音淡出；`--mode full` 完整保留原曲自然尾奏。
   - 若用户更换音频文件，务必先 `ffprobe` 测时长再用 `librosa` 核对人声能量跃升点，不可沿用旧 DJ 版歌词时间轴。
5. **先抽帧、再试看、后全片**
   - 每次改动 HTML 渲染逻辑必须跑 `--mode keyframes` + `ffmpeg tile` 拼图并以 `read_file` 审查，清理 `/tmp/` 后再渲染 MP4，渲染完毕跑 `ffprobe` 验收参数。

---

## 二、已沉淀成品工具包总览（供随时二创与重渲染）

| 歌曲 | 所属风格原型 | 工具包目录 |
|---|---|---|
| 陈奕迅《陀飞轮》 | 类型 B · 人生哲理闯关 | `/Users/SEI/Desktop/liangkun/Video/陀飞轮MV_一键工具包/` |
| 华晨宇《风之海》 | 类型 A · 励志治愈探索 | `/Users/SEI/Desktop/liangkun/Video/风之海MV_一键工具包/` |
| 华晨宇《向阳而生》 | 类型 A · 无损多玩法+防抖弹幕 | `/Users/SEI/Desktop/liangkun/Video/向阳而生MV_一键工具包/` |
| 陈奕迅《沙龙》 | 类型 C · 悬疑摄影互动 | `/Users/SEI/Desktop/liangkun/Video/沙龙MV_一键工具包/` |
| 陈奕迅《浮夸》 | 类型 D · 戏剧冲突逆袭 | `/Users/SEI/Desktop/liangkun/Video/浮夸MV_一键工具包/` |
