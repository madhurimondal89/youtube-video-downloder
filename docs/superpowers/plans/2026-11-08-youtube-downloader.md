# YouTube Video & Audio Downloader Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, modern YouTube Video & Audio Downloader web application with format selection, metadata inspection, and direct browser download using yt-dlp and ffmpeg.

**Architecture:** Next.js (App Router) with TypeScript and Tailwind CSS. The backend API handles URL metadata extraction via `yt-dlp` (`/api/info`) and stream/download generation (`/api/download`) using `python -m yt_dlp` and `ffmpeg` for automatic audio/video muxing and MP3 conversion. The frontend provides an intuitive, high-conversion creator interface with quick paste, thumbnail previews, format badges, and one-click downloading.

**Tech Stack:** Next.js 15+, React 19, TypeScript, Tailwind CSS, Lucide React, Python `yt-dlp`, FFmpeg.

**Spec:** Standalone YouTube video/audio downloader supporting standard YouTube URLs, Shorts, and Music URLs, with format choices (1080p, 720p, 480p, MP3 320k/128k) and clean file streaming.

## Global Constraints

- Must run smoothly on Windows with Node.js and Python.
- Must execute `python -m yt_dlp` safely without shell injection.
- Must use FFmpeg for lossless video+audio merging and clean MP3 transcoding.
- Temp download files must be safely tracked and cleaned up after streaming.
- Provide clean human-readable error messages for private, age-restricted, or geo-blocked videos.

## Review Focus

- Invalid or malformed YouTube URLs: Must return a clear 400 error with descriptive message.
- Videos without combined 1080p stream: Must safely mux separate 1080p video stream + best audio stream via ffmpeg.
- Long videos (e.g. 1hr+): Must support streaming transfer without memory exhaustion or timeouts.
- Audio extraction (MP3): Must produce valid MP3 files with proper Content-Disposition and MIME type headers.
- File cleanup: Temporary files generated during download/transcode must be deleted even if client disconnects.

---

### Task 1: Project Scaffolding & Dependencies Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `.gitignore`
- Create: `.env.local`

- [ ] Step 1: Create `package.json` with Next.js, React, Tailwind, Lucide React, ffmpeg-static.
- [ ] Step 2: Install dependencies using `npm.cmd install`.
- [ ] Step 3: Configure `tsconfig.json`, `next.config.ts`, and `.gitignore`.
- [ ] Step 4: Verify Next.js builds cleanly.

---

### Task 2: Backend Core - Helper Utilities & Binary Resolvers

**Files:**
- Create: `src/lib/binary-resolver.ts`
- Create: `src/lib/ytdlp-runner.ts`
- Create: `src/lib/file-cleanup.ts`

- [ ] Step 1: Implement `binary-resolver.ts` to locate `python` / `yt-dlp` and `ffmpeg.exe` reliably.
- [ ] Step 2: Implement `ytdlp-runner.ts` to execute yt-dlp commands safely using `child_process.execFile` or `spawn`.
- [ ] Step 3: Implement `file-cleanup.ts` to handle temp file deletion on completion and periodic purge.
- [ ] Step 4: Write test script to verify yt-dlp execution and binary detection.

---

### Task 3: Backend API Endpoints (`/api/info` and `/api/download`)

**Files:**
- Create: `src/app/api/info/route.ts`
- Create: `src/app/api/download/route.ts`

- [ ] Step 1: Implement `/api/info` to fetch video title, author, duration, thumbnail, and available resolutions/formats in JSON.
- [ ] Step 2: Implement `/api/download` to download the requested format (MP4 video at selected quality or MP3 audio) and stream it as a file attachment to the browser.
- [ ] Step 3: Test API endpoints with curl / invoke commands to verify valid JSON and download streaming.

---

### Task 4: Frontend UI - Downloader App Interface

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/components/DownloaderForm.tsx`
- Create: `src/components/VideoPreviewCard.tsx`
- Create: `src/components/FormatSelector.tsx`

- [ ] Step 1: Setup global styling in `src/app/globals.css` and font layout in `src/app/layout.tsx`.
- [ ] Step 2: Build `DownloaderForm.tsx` with URL input, paste button, validation, and loading indicators.
- [ ] Step 3: Build `VideoPreviewCard.tsx` and `FormatSelector.tsx` showing thumbnail, duration, title, channel, video quality chips (1080p, 720p, 480p, 360p) and MP3 options.
- [ ] Step 4: Build download action handler with real-time feedback and direct browser file download trigger.

---

### Task 5: Integration, Verification & Polish

**Files:**
- Modify: `src/app/page.tsx`
- Create: `README.md`

- [ ] Step 1: Run Next.js production build (`npm.cmd run build`) and fix any TypeScript or bundle warnings.
- [ ] Step 2: Start the dev/production server and test with a sample YouTube video URL to verify metadata fetch and video/audio download.
- [ ] Step 3: Add `README.md` with instructions on how to run and customize the application.
