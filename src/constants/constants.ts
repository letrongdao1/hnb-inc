export const AUTH_NOT_REQUIRED_PATHS = ["/auth/login", "/auth/signup"];
export const NAVBAR_NOT_REQUIRED_PATHS = ["/auth/login", "/auth/signup", "/get-start"];

export const SUPABASE_DATE_FORMAT = "YYYY-MM-DD";

export const GLOBAL_DATE_FORMAT = "DD/MM/YYYY";

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_BANK_ACCOUNT_CAPACITY = 4;

export const VIETNAMESE_WEEK_DAYS: { [key: string]: string } = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

export const IMAGE_COMPRESS_OPTIONS = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1024,
  useWebWorker: true,
};