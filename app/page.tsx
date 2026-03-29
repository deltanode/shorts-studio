"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import VideoUploader from "@/components/VideoUploader";
import VideoPreview from "@/components/VideoPreview";
import TimeRangePicker from "@/components/TimeRangePicker";
import AspectRatioPicker from "@/components/AspectRatioPicker";
import OutputPreview from "@/components/OutputPreview";
import { loadFFmpeg, processVideo, type AspectRatio } from "@/lib/ffmpeg";

type Stage = "upload" | "edit" | "processing" | "done";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [videoSource, setVideoSource] = useState<File | string | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [progress, setProgress] = useState(0);
  const [outputSrc, setOutputSrc] = useState("");
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false);
  const prevOutputRef = useRef<string>("");

  // Preload FFmpeg when edit stage begins
  useEffect(() => {
    if (stage === "edit" && !ffmpegReady && !loadingFFmpeg) {
      setLoadingFFmpeg(true);
      loadFFmpeg()
        .then(() => { setFfmpegReady(true); setLoadingFFmpeg(false); })
        .catch(() => setLoadingFFmpeg(false));
    }
  }, [stage, ffmpegReady, loadingFFmpeg]);

  const handleFileSelect = useCallback((f: File) => {
    if (videoSrc && file) URL.revokeObjectURL(videoSrc);
    const src = URL.createObjectURL(f);
    setFile(f);
    setVideoSource(f);
    setVideoSrc(src);
    setStage("edit");
    setOutputSrc("");
  }, [videoSrc, file]);

  const handleUrlSelect = useCallback((url: string) => {
    if (videoSrc && file) URL.revokeObjectURL(videoSrc);
    setFile(null);
    setVideoSource(url);
    setVideoSrc(url);
    setStage("edit");
    setOutputSrc("");
  }, [videoSrc, file]);

  const handleDurationLoad = useCallback((d: number) => {
    setDuration(d);
    setStartTime(0);
    setEndTime(Math.min(d, 60));
  }, []);

  async function handleProcess() {
    if (!videoSource || !ffmpegReady) return;
    setStage("processing");
    setProgress(0);

    try {
      if (prevOutputRef.current) URL.revokeObjectURL(prevOutputRef.current);
      const url = await processVideo(videoSource, startTime, endTime, aspectRatio, setProgress);
      prevOutputRef.current = url;
      setOutputSrc(url);
      setStage("done");
    } catch (err) {
      console.error(err);
      setStage("edit");
    }
  }

  function handleReset() {
    setStage("upload");
    setFile(null);
    setVideoSource(null);
    if (videoSrc && file) URL.revokeObjectURL(videoSrc);
    setVideoSrc("");
    setOutputSrc("");
    setDuration(0);
  }

  const outputFileName = file
    ? `${file.name.replace(/\.[^.]+$/, "")}_${aspectRatio.replace(":", "x")}.mp4`
    : `clip_${aspectRatio.replace(":", "x")}.mp4`;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Shorts Studio</h1>
          <p className="text-zinc-500 text-sm">Convert Long Videos to Short Videos - Trim · Reframe · Export</p>
        </div>

        {/* Upload stage */}
        {stage === "upload" && (
          <VideoUploader
            onFileSelect={handleFileSelect}
            onUrlSelect={handleUrlSelect}
          />
        )}

        {/* Edit / Done stage */}
        {(stage === "edit" || stage === "done") && videoSource && (
          <div className="space-y-6">

            {/* Source preview */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Source Video
                </h2>
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ✕ Change video
                </button>
              </div>
              <VideoPreview
                src={videoSrc}
                onDurationLoad={handleDurationLoad}
                currentTime={startTime}
              />
            </section>

            {/* Time range */}
            {duration > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Clip Range
                </h2>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <TimeRangePicker
                    duration={duration}
                    startTime={startTime}
                    endTime={endTime}
                    onStartChange={setStartTime}
                    onEndChange={setEndTime}
                  />
                </div>
              </section>
            )}

            {/* Aspect ratio */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Output Format
              </h2>
              <AspectRatioPicker value={aspectRatio} onChange={setAspectRatio} />
            </section>

            {/* Process button */}
            <button
              onClick={handleProcess}
              disabled={!ffmpegReady || duration === 0}
              className="
                w-full py-3 rounded-xl font-semibold text-white transition-all
                bg-violet-600 hover:bg-violet-500
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {loadingFFmpeg
                ? "Loading FFmpeg…"
                : !ffmpegReady
                ? "Preparing…"
                : "Process Video"}
            </button>

            {/* Output preview */}
            {stage === "done" && outputSrc && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                  Output Clip
                </h2>
                <OutputPreview src={outputSrc} fileName={outputFileName} />
              </section>
            )}

          </div>
        )}

        {/* Processing stage */}
        {stage === "processing" && (
          <div className="bg-zinc-900 rounded-xl p-8 space-y-6 text-center">
            <div className="text-4xl animate-pulse">⚙️</div>
            <div className="space-y-2">
              <p className="text-zinc-300 font-medium">Processing video…</p>
              <p className="text-zinc-500 text-sm">
                Trimming + reframing to {aspectRatio} - this may take a moment
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-violet-400 font-mono text-sm">{progress}%</p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
