"use client";

import { useRef, useState } from "react";

interface VideoMeta {
  duration: number;
  width: number;
  height: number;
  format: string;
  thumbnail: string;
}

interface Props {
  onFileSelect: (file: File) => void;
  onUrlSelect: (url: string) => void;
}

function toHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function aspectLabel(w: number, h: number): string {
  const d = gcd(w, h);
  return `${w / d}:${h / d}`;
}

function formatFromUrl(url: string): string {
  const match = url.split("?")[0].match(/\.(\w+)$/);
  return match ? match[1].toUpperCase() : "Unknown";
}

export default function VideoUploader({ onFileSelect, onUrlSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [meta, setMeta] = useState<VideoMeta | null>(null);
  const [urlError, setUrlError] = useState("");
  const [probing, setProbing] = useState(false);
  const [pendingUrl, setPendingUrl] = useState("");

  function handleFile(file: File) {
    if (file.type.startsWith("video/")) onFileSelect(file);
  }

  function probeUrl(url: string) {
    if (!url.trim()) return;
    setProbing(true);
    setMeta(null);
    setUrlError("");
    setPendingUrl(url);

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.src = url;

    video.addEventListener("loadedmetadata", () => {
      const { duration, videoWidth: w, videoHeight: h } = video;
      video.currentTime = 0.1;

      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(video, 0, 0, w, h);
        const thumbnail = canvas.toDataURL("image/jpeg", 0.7);

        setMeta({
          duration,
          width: w,
          height: h,
          format: formatFromUrl(url),
          thumbnail,
        });
        setProbing(false);
        video.src = "";
      }, { once: true });
    });

    video.addEventListener("error", () => {
      setUrlError("Could not load video. The URL may be CORS-blocked or invalid.");
      setProbing(false);
      video.src = "";
    });
  }

  return (
    <div className="space-y-4">
      {/* File drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`
          flex flex-col items-center justify-center gap-3
          border-2 border-dashed rounded-xl p-10 cursor-pointer
          transition-colors select-none
          ${dragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-zinc-700 hover:border-violet-500/60 bg-zinc-900/50"
          }
        `}
      >
        <div className="text-4xl">🎬</div>
        <p className="text-zinc-300 font-medium">Drop a video file here</p>
        <p className="text-zinc-500 text-sm">or click to browse - MP4, MOV, WebM</p>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-zinc-600 text-xs">
        <div className="flex-1 h-px bg-zinc-800" />
        or paste a URL
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => { setUrlInput(e.target.value); setMeta(null); setUrlError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") probeUrl(urlInput); }}
          placeholder="https://example.com/video.mp4"
          className="
            flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700
            text-sm text-zinc-200 placeholder-zinc-600
            focus:outline-none focus:border-violet-500 transition-colors
          "
        />
        <button
          onClick={() => probeUrl(urlInput)}
          disabled={probing || !urlInput.trim()}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors disabled:opacity-40"
        >
          {probing ? "Loading…" : "Load"}
        </button>
      </div>

      {/* Error */}
      {urlError && (
        <p className="text-amber-400 text-sm flex items-start gap-2">
          <span>⚠</span> {urlError}
        </p>
      )}

      {/* Metadata card */}
      {meta && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex gap-4">
            {meta.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={meta.thumbnail}
                alt="thumbnail"
                className="w-28 h-16 object-cover rounded-lg shrink-0 bg-zinc-800"
              />
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm flex-1">
              <span className="text-zinc-500">Format</span>
              <span className="text-zinc-200 font-medium">{meta.format}</span>
              <span className="text-zinc-500">Resolution</span>
              <span className="text-zinc-200 font-medium">{meta.width} × {meta.height}</span>
              <span className="text-zinc-500">Duration</span>
              <span className="text-zinc-200 font-medium">{toHMS(meta.duration)}</span>
              <span className="text-zinc-500">Aspect ratio</span>
              <span className="text-zinc-200 font-medium">{aspectLabel(meta.width, meta.height)}</span>
            </div>
          </div>
          <button
            onClick={() => onUrlSelect(pendingUrl)}
            className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Use this video →
          </button>
        </div>
      )}
    </div>
  );
}
