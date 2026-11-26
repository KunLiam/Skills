#!/usr/bin/env python3
"""lrc / 网易云音频 → 精准对拍 lyrics.js（支持 163 key 反解与飙高音区间不断档检测）。

用法:
    python3 scripts/sync_lyrics.py <音频文件> [-l 歌词.lrc] -o mv/lyrics.js
"""
import argparse
import base64
import json
import os
import re
import subprocess
import urllib.request

import librosa
import numpy as np


def extract_163_music_id(audio_path: str):
    """从 FLAC/MP3 标签中的 `163 key(Don't modify):` 解密提取网易云 musicId。"""
    try:
        out = subprocess.check_output(
            ["ffprobe", "-v", "quiet", "-show_entries", "format_tags", "-of", "json", audio_path],
            text=True,
        )
        tags = json.loads(out).get("format", {}).get("tags", {})
        raw_val = next((str(v) for k, v in tags.items() if "163 key" in str(v)), "")
        if not raw_val:
            return None
        key_b64 = raw_val.split("163 key(Don't modify):", 1)[1].strip()
        node_js = (
            'const c=require("crypto");'
            'const d=c.createDecipheriv("aes-128-ecb",Buffer.from("#14ljk_!\\\\]&0U<\'("),null);'
            f'const out=Buffer.concat([d.update(Buffer.from("{key_b64}","base64")),d.final()]).toString("utf8");'
            'process.stdout.write(out);'
        )
        dec = subprocess.check_output(["node", "-e", node_js], text=True)
        meta = json.loads(dec.split("music:", 1)[1])
        return meta.get("musicId"), meta.get("duration")
    except Exception:
        return None


def fetch_163_lrc(music_id: int) -> str:
    url = f"https://music.163.com/api/song/lyric?id={music_id}&lv=1&kv=1&tv=-1"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read().decode("utf-8"))
    return data.get("lrc", {}).get("lyric", "")


def parse_lrc(lrc_text: str):
    """解析 LRC 时间标签，同时记录空行间隙（用于识别间奏或长高音吟唱）."""
    events = []
    for line in lrc_text.splitlines():
        tags = re.findall(r"\[(\d+):(\d+(?:\.\d+)?)\]", line)
        if not tags:
            continue
        body = re.sub(r"\[\d+:\d+(?:\.\d+)?\]", "", line).strip()
        if any(body.startswith(p) for p in ("作词", "作曲", "编曲", "制作人", "混音", "母带", "监制")):
            continue
        for mm, ss in tags:
            t = int(mm) * 60 + float(ss)
            events.append((round(t, 3), body))
    events.sort(key=lambda x: x[0])
    return events


def measure_vocal_band(audio_path: str):
    y, sr = librosa.load(audio_path, sr=22050, mono=False)
    dur = float(librosa.get_duration(y=y, sr=sr))
    mid = (y[0] + y[1]) if y.ndim == 2 else y
    side = (y[0] - y[1]) if y.ndim == 2 else np.zeros_like(y)
    S_vox = np.maximum(
        0,
        np.abs(librosa.stft(mid, n_fft=2048, hop_length=256))
        - 1.1 * np.abs(librosa.stft(side, n_fft=2048, hop_length=256)),
    )
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    vox_e = np.sqrt(np.mean(S_vox[(freqs >= 240) & (freqs <= 3400)] ** 2, axis=0))
    times = librosa.frames_to_time(np.arange(len(vox_e)), sr=sr, hop_length=256)
    return dur, times, vox_e


def build_cues(events, dur, times, vox_e):
    # 过滤掉纯空行但记住后续空行时间点
    lyrics_only = [(t, txt) for t, txt in events if txt and txt != "该歌曲暂无歌词"]
    blank_times = {t for t, txt in events if not txt}
    cues = []
    for i, (t, txt) in enumerate(lyrics_only):
        next_t = lyrics_only[i + 1][0] if i + 1 < len(lyrics_only) else dur
        # 查找本句后到下一句前的空行截断点
        blanks_between = [bt for bt in sorted(blank_times) if t + 0.5 < bt < next_t - 0.2]
        end_t = next_t - 0.08
        if blanks_between:
            bt = blanks_between[0]
            gap_len = next_t - bt
            # 检查空行期间是否仍在飙高音 / 强人声保持（若是则绝不截断歌词！）
            seg_idx = (times >= bt) & (times < next_t - 0.3)
            active_ratio = float(np.mean(vox_e[seg_idx] > 3.5)) if np.any(seg_idx) else 0.0
            if gap_len >= 5.5 and active_ratio < 0.35:
                end_t = bt + 0.6
        if i + 1 == len(lyrics_only):
            # 尾句保持到人声彻底淡出 + 0.6s
            tail_idx = np.where((times >= t) & (vox_e > 1.2))[0]
            last_vox = float(times[tail_idx[-1]]) if len(tail_idx) else t + 4.5
            end_t = min(dur - 0.3, max(t + 4.0, last_vox + 0.8))
        cues.append({"t": round(t, 2), "text": txt, "end": round(end_t, 2)})
    return cues


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio")
    ap.add_argument("-l", "--lrc", default=None)
    ap.add_argument("-o", "--out", required=True)
    args = ap.parse_args()

    lrc_text = ""
    if args.lrc and os.path.exists(args.lrc):
        raw = open(args.lrc, encoding="utf-8-sig").read().strip()
        if raw and "该歌曲暂无歌词" not in raw and re.search(r"\[\d+:\d+", raw):
            lrc_text = raw

    if not lrc_text:
        res = extract_163_music_id(args.audio)
        if res and res[0]:
            print(f"[sync_lyrics] 本地 LRC 无效，从 163 key 提取到 musicId={res[0]} (dur={res[1]}ms)，正在拉取原版歌词...")
            lrc_text = fetch_163_lrc(res[0])

    if not lrc_text:
        raise SystemExit("未找到有效时间戳 LRC，请先提供标准 .lrc 文件后再生成。")

    events = parse_lrc(lrc_text)
    dur, times, vox_e = measure_vocal_band(args.audio)
    cues = build_cues(events, dur, times, vox_e)

    with open(args.out, "w", encoding="utf-8") as f:
        f.write("window.LYRICS = " + json.dumps(cues, ensure_ascii=False, indent=2) + ";\n")

    print(f"[sync_lyrics] 已输出 {len(cues)} 句精确对拍歌词 -> {args.out} (音频总长 {dur:.2f}s)")
    for c in cues:
        pre = float(np.mean(vox_e[(times >= c["t"] - 0.35) & (times < c["t"])]))
        on = float(np.mean(vox_e[(times >= c["t"]) & (times < c["t"] + 0.45)]))
        print(f"  [{c['t']:6.2f} - {c['end']:6.2f}] pre={pre:4.1f} -> on={on:4.1f} | {c['text']}")


if __name__ == "__main__":
    main()
