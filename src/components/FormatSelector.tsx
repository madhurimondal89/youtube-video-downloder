"use client";

import React, { useState } from "react";
import { Download, Film, Music, Loader2, Sparkles, Volume2, Link as LinkIcon, Check } from "lucide-react";
import { VideoInfo } from "@/lib/ytdlp-runner";
import { saveToHistory } from "./DownloadHistory";

interface FormatSelectorProps {
  info: VideoInfo;
  url: string;
}

export function FormatSelector({ info, url }: FormatSelectorProps) {
  const [activeTab, setActiveTab] = useState<"video" | "audio">("video");
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Standard resolutions including 4K (2160p) and 2K (1440p) always available in the downloader options
  const standardResolutions = [2160, 1440, 1080, 720, 480, 360];

  // Always show 4K (2160p), 2K (1440p), 1080p, 720p, 480p, 360p in the list
  const resolutionsToDisplay = Array.from(
    new Set([
      ...(info.availableResolutions || []).filter((r) => [2160, 1440, 1080, 720, 480, 360].includes(r)),
      ...standardResolutions,
    ])
  ).sort((a, b) => b - a);

  const audioOptions = [
    { bitrate: "320", label: "Ultra High Quality", desc: "320 kbps MP3", badge: "Best Quality" },
    { bitrate: "256", label: "High Quality", desc: "256 kbps MP3", badge: "Studio" },
    { bitrate: "192", label: "Standard Quality", desc: "192 kbps MP3", badge: "Popular" },
    { bitrate: "128", label: "Compact Quality", desc: "128 kbps MP3", badge: "Lightweight" },
  ];

  const handleDownloadVideo = (resolution: number) => {
    const key = `video-${resolution}`;
    setDownloadingFormat(key);

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&type=video&quality=${resolution}&title=${encodeURIComponent(info.title)}`;
    
    // Save to history
    saveToHistory({
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail,
      channel: info.channel,
      format: `${resolution}p MP4`,
      downloadUrl,
    });

    // Trigger browser download via invisible anchor
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `${info.title}_${resolution}p.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset status after triggering
    setTimeout(() => {
      setDownloadingFormat(null);
    }, 12000);
  };

  const handleDownloadAudio = (bitrate: string) => {
    const key = `audio-${bitrate}`;
    setDownloadingFormat(key);

    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&type=audio&bitrate=${bitrate}&title=${encodeURIComponent(info.title)}`;
    
    // Save to history
    saveToHistory({
      id: info.id,
      title: info.title,
      thumbnail: info.thumbnail,
      channel: info.channel,
      format: `${bitrate} kbps MP3`,
      downloadUrl,
    });

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `${info.title}.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingFormat(null);
    }, 10000);
  };

  const handleCopyLink = async (downloadUrl: string, key: string) => {
    try {
      const fullUrl = `${window.location.origin}${downloadUrl}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {}
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("video")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            activeTab === "video"
              ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Video (MP4)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audio")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
            activeTab === "audio"
              ? "bg-red-600 text-white shadow-lg shadow-red-500/25"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Audio (MP3)</span>
        </button>
      </div>

      {/* Video Options List */}
      {activeTab === "video" && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Select Video Resolution (Guaranteed Full Sound)</span>
            {(info.availableResolutions || []).some((r) => r >= 2160) && (
              <span className="text-purple-400 text-[11px] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                4K Available
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resolutionsToDisplay.map((res) => {
              const key = `video-${res}`;
              const isDownloading = downloadingFormat === key;
              const isCopied = copiedKey === key;
              const dlUrl = `/api/download?url=${encodeURIComponent(url)}&type=video&quality=${res}&title=${encodeURIComponent(info.title)}`;

              return (
                <div
                  key={res}
                  className={`flex items-center justify-between p-4 bg-slate-950/60 border rounded-xl transition duration-200 ${
                    res >= 2160
                      ? "border-purple-500/40 hover:border-purple-500/70 bg-purple-950/10"
                      : "border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                      res >= 2160
                        ? "bg-purple-500/10 border-purple-500/30 text-purple-400"
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                    }`}>
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{res}p</span>
                        {res >= 2160 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            4K Ultra HD
                          </span>
                        )}
                        {res === 1440 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                            2K QHD
                          </span>
                        )}
                        {res === 1080 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                            Full HD
                          </span>
                        )}
                        {res === 720 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded">
                            HD
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">MP4 • Full Sound</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(dlUrl, key)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                      title="Copy direct download link (for IDM / download managers)"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadVideo(res)}
                      disabled={isDownloading}
                      className={`px-3.5 py-2 font-medium text-xs rounded-lg transition duration-200 flex items-center gap-1.5 shadow-sm active:scale-95 ${
                        res >= 2160
                          ? "bg-purple-600 hover:bg-purple-500 text-white"
                          : "bg-slate-800 hover:bg-red-600 text-white"
                      } disabled:bg-slate-800/50`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Audio Options List */}
      {activeTab === "audio" && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select MP3 Audio Quality
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {audioOptions.map((opt) => {
              const key = `audio-${opt.bitrate}`;
              const isDownloading = downloadingFormat === key;
              const isCopied = copiedKey === key;
              const dlUrl = `/api/download?url=${encodeURIComponent(url)}&type=audio&bitrate=${opt.bitrate}&title=${encodeURIComponent(info.title)}`;

              return (
                <div
                  key={opt.bitrate}
                  className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 rounded-xl transition duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{opt.desc}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(dlUrl, key)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition"
                      title="Copy direct download link (for IDM / download managers)"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <LinkIcon className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadAudio(opt.bitrate)}
                      disabled={isDownloading}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-emerald-600 disabled:bg-slate-800/50 text-white font-medium text-xs rounded-lg transition duration-200 flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {downloadingFormat && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
          <span>Processing multi-threaded download and saving to browser...</span>
        </div>
      )}
    </div>
  );
}
