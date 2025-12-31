import { FileUtils } from "@/utils/file.utils";

export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME!;
export const B2_REGION = process.env.B2_REGION!;

export const CHUNK_SIZE = 50 * 1024 * 1024;
export const MULTIPART_THRESHOLD = 500 * 1024 * 1024;

export const CLOUD_LOGS_ERROR_FOLDER_PATH = "LOGS/ERROR";

export const getCurrentLogsErrorFolderPath = () =>
  [CLOUD_LOGS_ERROR_FOLDER_PATH, FileUtils.generateCurrentMomentFolderName()].join("/");

export const CLOUD_UPLOAD_FOLDER_TYPE: {
  [key: string]: {
    label: string;
    folderPath: string;
    description?: string;
    isRequireSubfolder?: boolean;
  };
} = {
  // MEME: {
  //   label: "Meme",
  //   description: "Mememememe",
  //   folderPath: "MEME",
  //   isRequireSubfolder: false,
  // },
  GRADUATION: {
    label: "HNB Tốt Nghiệp",
    folderPath: `TOT_NGHIEP`,
    description: "Những tư liệu về ngày tốt nghiệp để mai sau nhìn lại",
    isRequireSubfolder: true,
  },
  TEAM_BUILDING: {
    label: "HNB Team building",
    folderPath: `TEAM_BUILDING`,
    description: "Những chuyến Team building của HNB",
    isRequireSubfolder: true,
  },
  HNB_MEETING: {
    label: "HNB Họp",
    folderPath: `HOP_HNB`,
    description: "Những cuộc họp quan trọng tại hội sở và những lần đi gặp đối tác lớn",
    isRequireSubfolder: true,
  },
  OTHER: {
    label: "Các sự kiện khác",
    folderPath: `SU_KIEN_KHAC`,
    description: "Bao gồm những ngày sinh nhật, meeting nhỏ, hoạt động ngoại khóa,...",
    isRequireSubfolder: true,
  },
};
