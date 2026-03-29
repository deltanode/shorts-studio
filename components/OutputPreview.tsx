"use client";

interface Props {
  src: string;
  fileName: string;
}

export default function OutputPreview({ src, fileName }: Props) {
  return (
    <div className="space-y-4">
      <video
        src={src}
        controls
        autoPlay
        loop
        className="w-full rounded-lg bg-black max-h-96 object-contain"
      />
      <a
        href={src}
        download={fileName}
        className="
          flex items-center justify-center gap-2 w-full py-3 rounded-xl
          bg-violet-600 hover:bg-violet-500 text-white font-medium
          transition-colors
        "
      >
        ⬇ Download {fileName}
      </a>
    </div>
  );
}
