"use client";

import { useEffect, useRef } from "react";

interface Props {
  src: string;
  onDurationLoad: (duration: number) => void;
  currentTime?: number;
}

export default function VideoPreview({ src, onDurationLoad, currentTime }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    function handleMeta() {
      if (video) onDurationLoad(video.duration);
    }
    video.addEventListener("loadedmetadata", handleMeta);
    return () => video.removeEventListener("loadedmetadata", handleMeta);
  }, [src, onDurationLoad]);

  useEffect(() => {
    if (videoRef.current && currentTime !== undefined) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full rounded-lg bg-black max-h-72 object-contain"
    />
  );
}
