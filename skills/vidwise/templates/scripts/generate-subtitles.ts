#!/usr/bin/env tsx
// generate-subtitles.ts — 从 audio-segments.json + mp3 文件生成 SRT 字幕
//
// 每步的 narration 按句子拆分，按字数比例分配时间，每句独立一条 SRT。
//
// 用法：
//   npx tsx scripts/generate-subtitles.ts
//   npx tsx scripts/generate-subtitles.ts --output=subtitles.srt
//
// 依赖：ffprobe（ffmpeg 自带）

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SEGMENTS_PATH = resolve(ROOT, "audio-segments.json");
const OUT_DIR = resolve(ROOT, "public", "audio");

// 解析参数
let outputPath = resolve(ROOT, "subtitles.srt");
for (const arg of process.argv.slice(2)) {
  if (arg.startsWith("--output=")) {
    outputPath = resolve(arg.slice("--output=".length));
  }
  if (arg === "-h" || arg === "--help") {
    console.log("Usage: npx tsx scripts/generate-subtitles.ts [--output=subtitles.srt]");
    process.exit(0);
  }
}

// 查找 ffprobe
function findFfprobe(): string {
  const candidates =
    process.platform === "win32"
      ? ["ffprobe.exe", "ffprobe"]
      : ["ffprobe"];
  for (const c of candidates) {
    try {
      execFileSync(c, ["-version"], { stdio: "ignore", timeout: 5000 });
      return c;
    } catch { /* next */ }
  }
  console.error("✗ ffprobe is required (install ffmpeg)");
  console.error("  macOS:  brew install ffmpeg");
  console.error("  Linux:  apt install ffmpeg");
  console.error("  Windows: download from https://github.com/BtbN/FFmpeg-Builds/releases");
  process.exit(1);
}

// 获取 mp3 时长（秒）
function getDuration(ffprobe: string, filePath: string): number {
  const out = execFileSync(
    ffprobe,
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", filePath],
    { encoding: "utf-8", timeout: 10000 }
  ).trim();
  const d = parseFloat(out);
  if (isNaN(d)) throw new Error(`Cannot parse duration: ${out}`);
  return d;
}

// 秒 → SRT 时间戳 HH:MM:SS,mmm
function formatTime(secs: number): string {
  const ms = Math.round(secs * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return (
    String(h).padStart(2, "0") + ":" +
    String(m).padStart(2, "0") + ":" +
    String(s).padStart(2, "0") + "," +
    String(millis).padStart(3, "0")
  );
}

// 按句子拆分文本（保留标点）
function splitSentences(text: string): string[] {
  // 按句号/问号/叹号/分号/逗号 切分，标点归前一句
  const raw = text.split(/(?<=[。！？；!?;,，、])/);
  return raw.map(s => s.trim()).filter(s => s.length > 0);
}

// ── Main ──────────────────────────────────────────────────────────

if (!existsSync(SEGMENTS_PATH)) {
  console.error(`✗ ${SEGMENTS_PATH} not found. Run: npm run extract-narrations`);
  process.exit(1);
}

const ffprobe = findFfprobe();
const segments: Array<{ chapter: string; step: number; text: string; audio: string }> =
  JSON.parse(readFileSync(SEGMENTS_PATH, "utf-8"));

const srtEntries: string[] = [];
let globalTime = 0;
let entryIdx = 0;

for (const seg of segments) {
  const mp3Path = resolve(OUT_DIR, seg.audio);
  if (!existsSync(mp3Path)) {
    console.warn(`⚠ ${mp3Path} not found, skipping`);
    continue;
  }

  let duration: number;
  try {
    duration = getDuration(ffprobe, mp3Path);
  } catch (e) {
    console.warn(`⚠ Cannot get duration for ${mp3Path}: ${e}`);
    continue;
  }

  // 拆句
  const sentences = splitSentences(seg.text);
  if (sentences.length === 0) continue;

  // 按字数比例分配时间
  const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
  let stepTime = globalTime;

  for (const sent of sentences) {
    const charRatio = sent.length / totalChars;
    const sentDuration = duration * charRatio;

    entryIdx++;
    srtEntries.push(String(entryIdx));
    srtEntries.push(`${formatTime(stepTime)} --> ${formatTime(stepTime + sentDuration)}`);
    srtEntries.push(sent);
    srtEntries.push("");

    stepTime += sentDuration;
  }

  globalTime += duration;
}

writeFileSync(outputPath, srtEntries.join("\n"), "utf-8");
console.log(`✓ generated ${outputPath} (${entryIdx} entries, ${globalTime.toFixed(1)}s)`);
