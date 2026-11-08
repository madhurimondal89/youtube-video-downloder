"use client";

import React, { useState } from "react";
import { Search, Clipboard, X, Loader2, Sparkles } from "lucide-react";
import { YoutubeIcon } from "./YoutubeIcon";

interface DownloaderFormProps {
  onSearch: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
}

export function DownloaderForm({ onSearch, isLoading, error }: DownloaderFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSearch(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        onSearch(text.trim());
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleClear = () => {
    setUrl("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>

        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl">
          <div className="flex items-center w-full px-3 py-1 flex-1">
            <YoutubeIcon className="w-6 h-6 text-red-500 shrink-0 mr-3" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL or Shorts link here..."
              disabled={isLoading}
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-base focus:outline-none focus:ring-0 py-2"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition mr-1"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition shrink-0"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paste</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition duration-200 active:scale-95 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Fetch Media</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
          <div>
            <p className="font-semibold text-red-300">Download Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
