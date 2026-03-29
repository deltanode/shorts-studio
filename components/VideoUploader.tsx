"use client";

import { useRef, useState } from "react";

interface Props {
  onFileSelect: (file: File) => void;
}

export default function VideoUploader({ onFileSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (file.type.startsWith("video/")) {
      onFileSelect(file);
    }
  }

  return (
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
        border-2 border-dashed rounded-xl p-12 cursor-pointer
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
  );
}
