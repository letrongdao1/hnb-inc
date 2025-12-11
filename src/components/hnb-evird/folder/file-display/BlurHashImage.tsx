import { Image as HeroImage } from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Blurhash } from "react-blurhash";
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

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className="relative h-auto w-full cursor-pointer overflow-hidden rounded-md">
      {blurHash && !loaded && (
        <Blurhash
          hash={blurHash}
          width={400}
          height={200}
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      )}

      {loaded && (
        <HeroImage
          src={currentSrc}
          alt={alt}
          loading="lazy"
          radius="sm"
          removeWrapper
          onError={() => {
            setCurrentSrc(ERROR_IMAGE.src);
          }}
          className={`h-auto w-full object-cover`}
        />
      )}
    </div>
  );
}
