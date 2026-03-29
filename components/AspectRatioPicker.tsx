"use client";

import type { AspectRatio } from "@/lib/ffmpeg";

const RATIOS: { value: AspectRatio; label: string; w: number; h: number }[] = [
  { value: "9:16", label: "9:16", w: 9, h: 16 },
  { value: "1:1",  label: "1:1",  w: 1, h: 1 },
  { value: "4:5",  label: "4:5",  w: 4, h: 5 },
  { value: "16:9", label: "16:9", w: 16, h: 9 },
];

interface Props {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export default function AspectRatioPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-3 flex-wrap">
      {RATIOS.map((r) => {
        const boxH = 48;
        const boxW = Math.round((r.w / r.h) * boxH);
        const active = value === r.value;
        return (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={`
              flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all
              ${active
                ? "border-violet-500 bg-violet-500/20 text-violet-300"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500"
              }
            `}
          >
            <div
              className={`border-2 rounded-sm ${active ? "border-violet-400" : "border-zinc-500"}`}
              style={{ width: Math.max(boxW, 20), height: boxH }}
            />
            <span className="text-xs font-medium">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
