import { encode, isBlurhashValid } from "blurhash";
import { fileTypeFromBuffer } from "file-type";
import { intToRGBA, Jimp, JimpMime } from "jimp";
import sharp from "sharp";

export enum FileTypeEnum {
  IMAGE = "img",
  VIDEO = "vid",
  OTHER = "other",
  UNKNOWN = "unknown",
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
const VIDEO_EXT = ["mp4", "mov", "avi", "mkv", "webm", "flv"];

export const FileUtils = {
  generateVideoThumbnail(input: File | string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");

      const isFile = input instanceof File;
      const videoUrl = isFile ? URL.createObjectURL(input) : input;

      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;

      video.addEventListener("loadedmetadata", () => {
        video.currentTime = 0;
      });

      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          ctx!.drawImage(video, 0, 0, canvas.width, canvas.height);

          const thumbnail = canvas.toDataURL("image/jpeg");

          if (isFile) URL.revokeObjectURL(videoUrl);
          resolve(thumbnail);
        } catch (err) {
          reject(err);
        }
      });

      video.addEventListener("loadeddata", () => {
        video.currentTime = 0;
      });

      video.onerror = () => {
        if (isFile) URL.revokeObjectURL(videoUrl);
      };
    });
  },
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";

    const units = ["B", "KB", "MB", "GB", "TB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    const size = bytes / Math.pow(1024, index);

    return `${parseFloat(size.toFixed(1))} ${units[index]}`;
  },
  normalizeName(input: string): string {
    if (!input) return "";

    const noAccents = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const cleaned = noAccents.replace(/đ/g, "d").replace(/Đ/g, "D");

    const parts = cleaned
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());

    return parts.join("_");
  },
  formatFolderName(dateStr: string, name: string): string {
    const trimmed = dateStr.trim();
    const parts = trimmed.split("/").map((p) => p.trim());

    let finalDate = "";

    if (parts.length === 3) {
      const [d, m, y] = parts;
      finalDate = y.padStart(4, "0") + m.padStart(2, "0") + d.padStart(2, "0");
    } else if (parts.length === 2) {
      const [m, y] = parts;
      finalDate = y.padStart(4, "0") + m.padStart(2, "0");
    } else if (parts.length === 1) {
      const y = parts[0];
      if (y) finalDate = y.padStart(4, "0");
    }

    const formattedName = this.normalizeName(name).toUpperCase();
    return [finalDate, formattedName].filter((text) => Boolean(text.length)).join("_");
  },
  generateCurrentMomentFolderName: () => {
    const d = new Date();

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");

    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
  },
  detectFileType: (url: string): FileTypeEnum => {
    const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
    if (!ext) return FileTypeEnum.UNKNOWN;

    if (IMAGE_EXT.includes(ext)) return FileTypeEnum.IMAGE;
    if (VIDEO_EXT.includes(ext)) return FileTypeEnum.VIDEO;
    return FileTypeEnum.OTHER;
  },
  getCurrentFolderNameByRelativePath: (path: string): string => {
    if (!path || !path.length) return "";

    const parts = path.split("/").filter((p) => p && p.trim().length > 0);
    return parts[parts.length - 1];
  },
  generateBlurHash: async (imageBuffer: Buffer) => {
    let img;

    const fileMime = await fileTypeFromBuffer(imageBuffer);

    if (fileMime?.mime && !Object.values(JimpMime).includes(fileMime.mime as any)) {
      return undefined;
    } else {
      img = await Jimp.read(imageBuffer);
    }

    const targetWidth = 32;
    const ratio = img.bitmap.height / img.bitmap.width;
    const targetHeight = Math.round(targetWidth * ratio);

    img = img.resize({ w: targetWidth, h: targetHeight });

    const { width, height } = img.bitmap;

    const rgbPixels = new Uint8ClampedArray(width * height * 4);

    let p = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const { r, g, b } = intToRGBA(img.getPixelColor(x, y));
        rgbPixels[p++] = r;
        rgbPixels[p++] = g;
        rgbPixels[p++] = b;
        rgbPixels[p++] = 255;
      }
    }

    const hash = encode(rgbPixels, width, height, 4, 4);
    return isBlurhashValid(hash) ? hash : undefined;
  },
};
