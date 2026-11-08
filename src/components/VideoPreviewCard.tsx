"use client";

import React from "react";
import Image from "next/image";
import { Clock, Eye, User, ExternalLink, Image as ImageIcon } from "lucide-react";
import { VideoInfo } from "@/lib/ytdlp-runner";

interface VideoPreviewCardProps {
  info: VideoInfo;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "Live / Unknown";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views?: number): string {
  if (!views) return "0";
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`;
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toLocaleString();
}

export function VideoPreviewCard({ info }: VideoPreviewCardProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col md:flex-row gap-5 items-start">
        {/* Thumbnail container */}
        <div className="relative w-full md:w-72 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
          {info.thumbnail ? (
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              No Thumbnail
            </div>
          )}
          {info.duration > 0 && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 text-xs font-semibold bg-black/85 text-white rounded-md flex items-center gap-1 backdrop-blur-xs">
              <Clock className="w-3 h-3" />
              {formatDuration(info.duration)}
            </span>
          )}
        </div>

        {/* Video metadata */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2 leading-snug">
              {info.title}
            </h3>

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-medium text-slate-300">
                <User className="w-3.5 h-3.5 text-red-400" />
                <span>{info.channel}</span>
              </div>

              {info.viewCount !== undefined && info.viewCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatViews(info.viewCount)} views</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Video ID: <span className="font-mono text-slate-400">{info.id}</span></span>
            <div className="flex items-center gap-3">
              <a
                href={`https://img.youtube.com/vi/${info.id}/maxresdefault.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                download={`${info.id}-thumbnail.jpg`}
                className="text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                title="Open / Download HD Thumbnail"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>HD Thumbnail</span>
              </a>
              <a
                href={`https://www.youtube.com/watch?v=${info.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:text-red-300 flex items-center gap-1 transition"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

