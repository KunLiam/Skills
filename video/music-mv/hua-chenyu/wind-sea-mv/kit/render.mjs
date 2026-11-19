// 华晨宇《风之海》像素 RPG 闯关 MV 一键渲染器（支持 macOS / Linux / Windows）
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const k = a.slice(2);
    const nxt = argv[i + 1];
    out[k] = nxt && !nxt.startsWith("--") ? (i++, nxt) : true;
  }
  return out;
}

const args = parseArgs(process.argv);
if (args.help || args.h) {
  console.log(`用法: node render.mjs [选项]
  --mode <full|preview|keyframes>  渲染模式（默认 full：全篇 5:03；preview：前 45.5 秒；keyframes：22 张关键帧）
  --player <姓名>                   玩家名称（默认 追风少年）
  --fps <数字>                      帧率（默认 30）
  --duration <秒>                   自定义时长（覆盖 mode 默认值）
  --workers <数字>                  并发渲染数（默认 6）
  --audio <路径>                    音频路径（默认 song.mp3，传 none 则不混音）
  --out <路径>                      输出 MP4 路径或关键帧目录
  --keep-frames                     保留临时帧图片目录`);
  process.exit(0);
}

const MODE = args.mode || "full";
const PLAYER = args.player || "追风少年";
const FPS = Number(args.fps || 30);
const WORKERS = Number(args.workers || 6);
const DEFAULT_DUR = MODE === "preview" ? 45.5 : 303.0;
const DUR = Number(args.duration || DEFAULT_DUR);
const AUDIO = args.audio === "none" ? null : path.resolve(__dirname, args.audio || "song.mp3");
const KEEP_FRAMES = Boolean(args["keep-frames"]);
const KEYFRAME_TIMES = [2.5, 11.5, 29.0, 36.2, 41.2, 58.0, 71.0, 83.5, 95.5, 108.0, 121.0, 134.0, 146.5, 159.0, 172.0, 185.0, 198.0, 210.0, 230.0, 249.5, 263.5, 292.0];
const TIMES = args.times ? String(args.times).split(",").map(Number) : (MODE === "keyframes" ? KEYFRAME_TIMES : null);

const DEFAULT_OUT = TIMES
  ? path.resolve(__dirname, `keyframes_${PLAYER}`)
  : path.resolve(__dirname, `风之海_${PLAYER}闯关版_${MODE === "preview" ? "45秒试看" : "完整版"}.mp4`);
const OUT_TARGET = args.out ? path.resolve(__dirname, args.out) : DEFAULT_OUT;
const FRAMES_DIR = TIMES ? OUT_TARGET : path.resolve(__dirname, `.tmp_frames_${MODE}_${Date.now()}`);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

function findChrome() {
  const winPF = process.env["PROGRAMFILES"] || "C:\\Program Files";
  const winPF86 = process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";
  const winLocal = process.env["LOCALAPPDATA"] || "";
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    path.join(winPF, "Google\\Chrome\\Application\\chrome.exe"),
    path.join(winPF86, "Google\\Chrome\\Application\\chrome.exe"),
    path.join(winLocal, "Google\\Chrome\\Application\\chrome.exe"),
    path.join(winPF, "Microsoft\\Edge\\Application\\msedge.exe"),
    path.join(winPF86, "Microsoft\\Edge\\Application\\msedge.exe")
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error("未找到 Chrome / Chromium / Edge，请安装 Chrome 或设置环境变量 CHROME_PATH");
}

function checkFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
  if (r.status !== 0) throw new Error("未检测到 ffmpeg，请先安装（macOS: brew install ffmpeg）");
}

if (!TIMES) checkFfmpeg();

const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || "/").split("?")[0];
  const filePath = path.join(__dirname, decodeURIComponent(cleanUrl));
  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}/full_mv_pixel.html?player=${encodeURIComponent(PLAYER)}`;

fs.mkdirSync(FRAMES_DIR, { recursive: true });
const total = TIMES ? TIMES.length : Math.ceil(DUR * FPS);
const queue = Array.from({ length: total }, (_, i) => i);

console.log(TIMES
  ? `[风之海 MV] 渲染 ${TIMES.length} 张关键帧（玩家：${PLAYER}） -> ${FRAMES_DIR}`
  : `[风之海 MV] 玩家：${PLAYER} | 模式：${MODE} | 共 ${total} 帧 (${DUR}s × ${FPS}fps) | ${WORKERS} 并发`);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: findChrome(),
  args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--no-sandbox"]
});

let done = 0;
const t0 = Date.now();

async function worker(id) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(`[W${id}] pageerror:`, e.message));
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction(() => window.sceneReady === true, { timeout: 120000 });
  while (queue.length) {
    const n = queue.shift();
    const tt = TIMES ? TIMES[n] : n / FPS;
    const dataUrl = await page.evaluate((t) => window.renderAt(t), tt);
    const outPath = TIMES
      ? path.join(FRAMES_DIR, `t${String(Math.round(tt * 100)).padStart(6, "0")}.jpg`)
      : path.join(FRAMES_DIR, `f${String(n).padStart(6, "0")}.jpg`);
    fs.writeFileSync(outPath, Buffer.from(dataUrl.split(",")[1], "base64"));
    done++;
    if (done % 100 === 0 || done === total) {
      const el = (Date.now() - t0) / 1000;
      const eta = Math.max(0, Math.round((el / done) * (total - done)));
      console.log(`进度: ${done}/${total} 帧 (${(el / done).toFixed(3)}s/帧，预计剩 ${eta}s)`);
    }
  }
  await page.close();
}

await Promise.all(Array.from({ length: Math.min(WORKERS, Math.max(1, total)) }, (_, i) => worker(i)));
await browser.close();
server.close();

if (TIMES) {
  console.log(`关键帧已导出到: ${FRAMES_DIR}`);
  process.exit(0);
}

console.log("正在使用 ffmpeg 封装视频并混入原曲音频...");
const hasAudio = AUDIO && fs.existsSync(AUDIO);
const ffArgs = [
  "-y",
  "-framerate", String(FPS),
  "-i", path.join(FRAMES_DIR, "f%06d.jpg")
];
if (hasAudio) {
  ffArgs.push("-i", AUDIO, "-t", String(DUR), "-map", "0:v:0", "-map", "1:a:0");
}
ffArgs.push(
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
  ...(hasAudio ? ["-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
  "-movflags", "+faststart",
  OUT_TARGET
);

const res = spawnSync("ffmpeg", ffArgs, { stdio: "inherit" });
if (!KEEP_FRAMES) fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
if (res.status !== 0) process.exit(res.status || 1);

console.log(`\n✅ 渲染完成: ${OUT_TARGET}`);
