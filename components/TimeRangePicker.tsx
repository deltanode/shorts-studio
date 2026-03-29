"use client";

interface Props {
  duration: number;
  startTime: number;
  endTime: number;
  onStartChange: (t: number) => void;
  onEndChange: (t: number) => void;
}

function toHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TimeRangePicker({
  duration,
  startTime,
  endTime,
  onStartChange,
  onEndChange,
}: Props) {
  const clipDuration = endTime - startTime;

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-zinc-500 px-1">
        <span>{toHMS(0)}</span>
        <span className="text-violet-400 font-medium">
          Clip: {toHMS(clipDuration)}
        </span>
        <span>{toHMS(duration)}</span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-8 bg-zinc-800 rounded-lg overflow-hidden">
        <div
          className="absolute h-full bg-violet-600/40 border-x-2 border-violet-500"
          style={{
            left: `${(startTime / duration) * 100}%`,
            width: `${((endTime - startTime) / duration) * 100}%`,
          }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm w-14 shrink-0">Start</span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={startTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val < endTime - 1) onStartChange(val);
            }}
            className="flex-1 accent-violet-500"
          />
          <span className="text-violet-300 text-sm font-mono w-16 text-right">
            {toHMS(startTime)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400 text-sm w-14 shrink-0">End</span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={endTime}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (val > startTime + 1) onEndChange(val);
            }}
            className="flex-1 accent-violet-500"
          />
          <span className="text-violet-300 text-sm font-mono w-16 text-right">
            {toHMS(endTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
