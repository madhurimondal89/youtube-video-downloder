import fs from "fs";
import path from "path";

/**
 * Resolves the path to the FFmpeg executable across Windows, Linux, and local workspaces.
 */
export function getFfmpegPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    // Project local node_modules
    path.join(cwd, "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(cwd, "node_modules", "ffmpeg-static", "ffmpeg"),
    // Neighbor workspace fallback (confirmed installed)
    path.join(cwd, "..", "youtube-creator-toolkit-pro", "node_modules", "ffmpeg-static", "ffmpeg.exe"),
    path.join(cwd, "..", "youtube-creator-toolkit-pro", "node_modules", "ffmpeg-static", "ffmpeg"),
    // System standard paths
    "C:\\ffmpeg\\bin\\ffmpeg.exe",
    "/usr/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Fallback to system command name if in PATH
  return "ffmpeg";
}

/**
 * Resolves the Python executable capable of running yt_dlp.
 */
export function getPythonCommand(): string {
  if (process.platform === "win32") {
    return "python";
  }
  return "python3";
}

/**
 * Resolves cookies file if present (useful to bypass YouTube bot detection / 403 Forbidden).
 */
export function getCookiesArg(): string[] {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, "cookies.txt"),
    path.join(cwd, "..", "youtube-creator-toolkit-pro", "cookies.txt"),
    path.join(cwd, ".temp_downloads", "cookies.txt"),
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand) && fs.statSync(cand).size > 50) {
      return ["--cookies", cand];
    }
  }

  return [];
}
