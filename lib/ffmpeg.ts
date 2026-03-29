import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

let ffmpeg: FFmpeg | null = null;

function getCropFilter(ratio: AspectRatio): string {
  switch (ratio) {
    case "9:16":
      return "crop=ih*9/16:ih:(iw-ih*9/16)/2:0";
    case "1:1":
      return "crop=ih:ih:(iw-ih)/2:0";
    case "4:5":
      return "crop=ih*4/5:ih:(iw-ih*4/5)/2:0";
    case "16:9":
      return "crop=iw:iw*9/16:0:(ih-iw*9/16)/2";
  }
}

export async function loadFFmpeg(onLog?: (msg: string) => void): Promise<void> {
  if (ffmpeg?.loaded) return;

  ffmpeg = new FFmpeg();

  if (onLog) {
    ffmpeg.on("log", ({ message }) => onLog(message));
  }

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  await ffmpeg.load({
    coreURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.js`,
      "text/javascript"
    ),
    wasmURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.wasm`,
      "application/wasm"
    ),
  });
}

export async function processVideo(
  file: File,
  startTime: number,
  endTime: number,
  aspectRatio: AspectRatio,
  onProgress: (percent: number) => void
): Promise<string> {
  if (!ffmpeg?.loaded) throw new Error("FFmpeg not loaded");

  ffmpeg.on("progress", ({ progress }) => {
    onProgress(Math.min(Math.round(progress * 100), 99));
  });

  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  const args = [
    "-i", "input.mp4",
    "-ss", String(startTime),
    "-to", String(endTime),
    "-vf", getCropFilter(aspectRatio),
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-c:a", "aac",
    "output.mp4",
  ];

  await ffmpeg.exec(args);

  const data = await ffmpeg.readFile("output.mp4");
  onProgress(100);

  const blob = new Blob([data as Uint8Array<ArrayBuffer>], { type: "video/mp4" });
  return URL.createObjectURL(blob);
}
