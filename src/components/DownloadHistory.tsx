"use client";

import React, { useState, useEffect } from "react";
import { History, Trash2, Download, ExternalLink, Film, Music } from "lucide-react";

export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  format: string; // e.g. "1080p MP4", "320 kbps MP3"
  downloadUrl: string;
  timestamp: number;
}

export function saveToHistory(item: Omit<HistoryItem, "timestamp">) {
  try {
    const raw = localStorage.getItem("yt_downloader_history");
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    
    // Prepend new item, remove duplicates if matching id + format
    const filtered = list.filter((i) => !(i.id === item.id && i.format === item.format));
    const updated = [{ ...item, timestamp: Date.now() }, ...filtered].slice(0, 10);
    
    localStorage.setItem("yt_downloader_history", JSON.stringify(updated));
    window.dispatchEvent(new Event("history_updated"));
  } catch (err) {
    console.warn("Failed to save history:", err);
  }
}

export function DownloadHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = () => {
    try {
      const raw = localStorage.getItem("yt_downloader_history");
      if (raw) {
        setHistory(JSON.parse(raw));
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();
    const handleUpdate = () => loadHistory();
    window.addEventListener("history_updated", handleUpdate);
    return () => window.removeEventListener("history_updated", handleUpdate);
  }, []);

  const handleClear = () => {
    localStorage.removeItem("yt_downloader_history");
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-12 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <History className="w-4 h-4 text-red-500" />
          <span>Recent Downloads</span>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition"
          title="Clear History"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {history.map((item, idx) => (
          <div
            key={`${item.id}-${item.format}-${idx}`}
            className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl hover:border-slate-700 transition"
          >
            <div className="relative w-16 aspect-video bg-slate-900 rounded-md overflow-hidden shrink-0 border border-slate-800">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">
                  Video
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-white truncate" title={item.title}>
                {item.title}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded font-medium">
                  {item.format}
                </span>
                <span className="truncate">{item.channel}</span>
              </div>
            </div>

            <a
              href={item.downloadUrl}
              download
              className="p-2 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition shrink-0"
              title="Download again"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
