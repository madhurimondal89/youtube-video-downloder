# YouTube Video & MP3 Audio Downloader

A modern, fast, full-stack YouTube Downloader web application built with **Next.js (App Router)**, **React 19**, **Tailwind CSS**, **Python yt-dlp**, and **FFmpeg**.

---

## ✨ Features

- **Any YouTube Video & Shorts:** Supports full YouTube links, shortlinks (`youtu.be`), and YouTube Shorts.
- **Multiple Video Resolutions:** Download in 1080p Full HD, 720p HD, 480p, and 360p.
- **Crystal Clear Audio (MP3):** One-click extraction of high-quality MP3 (320 kbps, 256 kbps, 192 kbps, 128 kbps).
- **Guaranteed Audio-Video Sync:** Automatically muxes the best video stream and audio stream with FFmpeg.
- **Zero Watermark & No Quality Loss:** Direct downloads with clean filenames and metadata.
- **Instant Preview:** Displays video title, author/channel, duration, and high-res thumbnail before downloading.
- **Modern Dark UI:** Responsive creator-focused interface with quick clipboard paste, format cards, and loading states.
- **Automatic Temp Cleanup:** Downloads are streamed directly to the browser and temporary files are purged automatically.

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+)
2. **Python** (with `yt-dlp` installed: `pip install yt-dlp`)
3. **FFmpeg** (installed locally or available via ffmpeg-static)

### Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## 🛠️ Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── download/route.ts   # Stream / download video & MP3
│   │   │   └── info/route.ts       # Retrieve video metadata & resolutions
│   │   ├── globals.css             # Tailwind & custom styling
│   │   ├── layout.tsx              # Root HTML & metadata
│   │   └── page.tsx                # Main Downloader Web UI
│   ├── components/
│   │   ├── DownloaderForm.tsx      # URL input & paste form
│   │   ├── FormatSelector.tsx      # Video / Audio tab & download triggers
│   │   ├── VideoPreviewCard.tsx    # Video thumbnail & details card
│   │   └── YoutubeIcon.tsx         # Clean SVG YouTube icon
│   └── lib/
│       ├── binary-resolver.ts      # Python, FFmpeg, and cookies path resolver
│       ├── file-cleanup.ts         # Temp directory management & purging
│       └── ytdlp-runner.ts         # yt-dlp metadata & download processor
├── .env.local
├── package.json
└── tsconfig.json
```
