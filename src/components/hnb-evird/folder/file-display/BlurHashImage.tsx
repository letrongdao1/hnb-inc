import { Image } from "@heroui/react";
import { useMemo, useState } from "react";
import { decode } from "blurhash";
import ERROR_IMAGE from "@/assets/images/fallback/error-image-fallback.png";

type BlurHashImageProps = {
  src: string;
  blurHash?: string;
  alt: string;
  width?: number;
  height?: number;
};

export default function BlurHashImage({
  src,
  blurHash,
  alt,
  width = 128,
  height = 128,
}: BlurHashImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(src);

  const blurUrl = useMemo(() => {
    if (!blurHash) return "";

    const pixels = decode(blurHash, width, height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const imgData = new ImageData(pixels, width, height);
    ctx.putImageData(imgData, 0, 0);

    return canvas.toDataURL("image/png");
  }, [blurHash, width, height]);

  return (
    <div className="relative h-auto w-full cursor-pointer overflow-hidden">
      {blurUrl && (
        <Image
          src={blurUrl}
          alt={`${alt}-blur`}
          className={`absolute inset-0 h-full min-h-[${height / 4}px] w-full min-w-[${width / 4}px] scale-110 object-cover blur-xl transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"} `}
        />
      )}

      <Image
        src={currentSrc}
        alt={alt}
        loading="lazy"
        radius="sm"
        removeWrapper
        onLoad={() => setTimeout(() => setLoaded(true), 100)}
        onError={() => {
          setCurrentSrc(ERROR_IMAGE.src);
        }}
        className={`h-auto w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
