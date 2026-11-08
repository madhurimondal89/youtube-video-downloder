import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { getCookiesArg, getFfmpegPath, getPythonCommand } from "./binary-resolver";
import { TEMP_DIR } from "./file-cleanup";

const execFileAsync = promisify(execFile);

export interface VideoFormatOption {
  formatId: string;
  resolution: string;
  height: number;
  ext: string;
  filesizeApprox?: number;
  note?: string;
  hasAudio: boolean;
}

export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  thumbnail: string;
  channel: string;
  channelUrl?: string;
  viewCount?: number;
  availableResolutions: number[];
}

/**
 * Clean and normalize a YouTube URL or Video ID.
 */
export function normalizeYoutubeUrl(input: string): string {
  const trimmed = input.trim();
  // If it's an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }

  // Handle youtu.be shortlinks
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) {
    return `https://www.youtube.com/watch?v=${shortMatch[1]}`;
  }

  // Handle shorts
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) {
    return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
  }

  // Standard watch or music url
  return trimmed;
}

/**
 * Fetch video metadata via yt-dlp dump-json.
 */
export async function getVideoMetadata(url: string): Promise<VideoInfo> {
  const normalizedUrl = normalizeYoutubeUrl(url);
  const pythonCmd = getPythonCommand();
  const cookiesArgs = getCookiesArg();

  const args = [
    "-m",
    "yt_dlp",
    "--dump-json",
    "--no-warnings",
    "--no-playlist",
    ...cookiesArgs,
    normalizedUrl,
  ];

  try {
    const { stdout } = await execFileAsync(pythonCmd, args, {
      maxBuffer: 10 * 1024 * 1024,
      timeout: 30000,
    });

    const data = JSON.parse(stdout);

    // Extract available video resolutions
    const heights = new Set<number>();
    if (Array.isArray(data.formats)) {
      for (const fmt of data.formats) {
        if (fmt.vcodec && fmt.vcodec !== "none" && typeof fmt.height === "number" && fmt.height > 0) {
          heights.add(fmt.height);
        }
      }
    }

    const sortedHeights = Array.from(heights).sort((a, b) => b - a);

    return {
      id: data.id,
      title: data.title || "YouTube Video",
      description: data.description || "",
      duration: data.duration || 0,
      thumbnail: data.thumbnail || (data.thumbnails && data.thumbnails[0]?.url) || "",
      channel: data.uploader || data.channel || "Unknown Creator",
      channelUrl: data.uploader_url || data.channel_url || "",
      viewCount: data.view_count || 0,
      availableResolutions: sortedHeights,
    };
  } catch (err: any) {
    console.error("yt-dlp metadata extraction failed:", err);
    const msg = err.stderr || err.message || "Failed to retrieve video information";
    if (msg.includes("Private video") || msg.includes("Sign in if you've been granted access")) {
      throw new Error("This video is private or restricted.");
    }
    if (msg.includes("Video unavailable") || msg.includes("Incomplete YouTube ID")) {
      throw new Error("Invalid YouTube video URL or video unavailable.");
    }
    throw new Error(msg);
  }
}

/**
 * Sanitize filename for safe Content-Disposition HTTP headers.
 */
export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim().substring(0, 100);
}

/**
 * Download Video or Audio file to TEMP_DIR.
 * Returns the absolute path of the downloaded output file.
 */
export async function downloadMedia(options: {
  url: string;
  isAudio: boolean;
  quality?: string; // e.g. "1080", "720", "480", "360" or "best"
  audioBitrate?: string; // e.g. "320", "192", "128"
}): Promise<{ filePath: string; fileName: string; mimeType: string }> {
  const { url, isAudio, quality = "1080", audioBitrate = "320" } = options;
  const normalizedUrl = normalizeYoutubeUrl(url);
  const pythonCmd = getPythonCommand();
  const ffmpegPath = getFfmpegPath();
  const cookiesArgs = getCookiesArg();

  const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const outTemplate = path.join(TEMP_DIR, `${fileId}.%(ext)s`);

  const args: string[] = [
    "-m",
    "yt_dlp",
    "--no-playlist",
    "--no-warnings",
    ...cookiesArgs,
  ];

  if (ffmpegPath) {
    args.push("--ffmpeg-location", ffmpegPath);
  }

  if (isAudio) {
    // Audio extraction to MP3
    args.push(
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      `${audioBitrate}K`,
      "-o",
      outTemplate,
      normalizedUrl
    );
  } else {
    // Video download with audio muxing
    const q = quality.replace(/[^0-9]/g, "") || "1080";
    // Format selector: best video up to height q + best audio, mux to mp4
    const formatFilter = `bestvideo[height<=${q}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${q}]+bestaudio/best[height<=${q}]/best`;
    args.push(
      "-f",
      formatFilter,
      "--merge-output-format",
      "mp4",
      "-o",
      outTemplate,
      normalizedUrl
    );
  }

  try {
    await execFileAsync(pythonCmd, args, {
      maxBuffer: 20 * 1024 * 1024,
      timeout: 300000, // 5 min timeout
    });

    // Locate the resulting file in TEMP_DIR starting with fileId
    const files = fs.readdirSync(TEMP_DIR);
    const targetFile = files.find((f) => f.startsWith(fileId));

    if (!targetFile) {
      throw new Error("Output file was not generated by downloader.");
    }

    const fullPath = path.join(TEMP_DIR, targetFile);
    const ext = path.extname(targetFile).toLowerCase();

    return {
      filePath: fullPath,
      fileName: targetFile,
      mimeType: ext === ".mp3" ? "audio/mpeg" : "video/mp4",
    };
  } catch (err: any) {
    console.error("Download media execution failed:", err);
    throw new Error(err.stderr || err.message || "Failed to download media.");
  }
}
