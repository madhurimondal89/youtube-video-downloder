"use client";

import React, { useState } from "react";
import { ShieldCheck, Zap, Music2, Video, CheckCircle, ArrowRight } from "lucide-react";
import { YoutubeIcon } from "@/components/YoutubeIcon";
import { DownloaderForm } from "@/components/DownloaderForm";
import { VideoPreviewCard } from "@/components/VideoPreviewCard";
import { FormatSelector } from "@/components/FormatSelector";
import { DownloadHistory } from "@/components/DownloadHistory";
import { VideoInfo } from "@/lib/ytdlp-runner";

export default function HomePage() {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (url: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentUrl(url);

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to inspect video details.");
      }

      setVideoInfo(data.data);
    } catch (err: any) {
      setError(err.message || "Failed to retrieve video details. Please check the URL.");
      setVideoInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between">
      {/* Background radial gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-red-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl flex-1 flex flex-col justify-center">
        {/* Header / Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-4 backdrop-blur-md">
            <YoutubeIcon className="w-4 h-4" />
            <span>High-Speed Video & MP3 Downloader</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Download YouTube <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500">Videos & Audio</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Convert and download YouTube videos in 1080p Full HD, 720p HD or extract crystal clear MP3 audio instantly without restrictions.
          </p>
        </div>

        {/* Input Form */}
        <DownloaderForm
          onSearch={handleSearch}
          isLoading={isLoading}
          error={error}
        />

        {/* Results Section */}
        {videoInfo && !isLoading && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <VideoPreviewCard info={videoInfo} />
            <FormatSelector info={videoInfo} url={currentUrl} />
          </div>
        )}

        {/* Recent Downloads History */}
        <DownloadHistory />

        {/* Value Proposition Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">4K & Full HD Video</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download up to 4K (2160p) and 1080p resolution with guaranteed high-bitrate synchronized audio tracks.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <Music2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Crystal Clear MP3</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extract lossless quality 320 kbps & 256 kbps audio files directly from any YouTube clip or track.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Direct & Unlimited</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero registration, no spam popups, and ultra-fast direct streaming straight to your downloads folder.
            </p>
          </div>
        </div>

        {/* How it works steps */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-900/30 border border-slate-800/50">
          <h2 className="text-base font-bold text-white mb-4 text-center">How to Download in 3 Steps</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Copy YouTube URL</strong>
                Copy any video, Shorts, or music URL from YouTube.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Choose Format</strong>
                Select your preferred MP4 resolution (1080p, 720p) or MP3 bitrate.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-slate-200 block mb-0.5">Instant Download</strong>
                Click download and save the file directly to your device.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-slate-900 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} YouTube Downloader App. For personal backup and offline viewing.</p>
      </footer>
    </main>
  );
}
