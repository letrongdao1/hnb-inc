import { PostComment } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(" ");
};

export const CommonUtils = {
  isMobile: () => typeof window !== "undefined" && /Mobi|Android/i.test(navigator.userAgent),

  formatMetaData: (title?: string) => {
    const mainTitle = "HNB Hub";
    return [title, mainTitle].filter(Boolean).join(" | ");
  },

  getSingleDataFromUnknown: (data: any) => {
    if (!data) return data;
    if (typeof data === "object") return data;
    else if (Array.isArray(data) && data.length) {
      console.log("is array");
      return data[0];
    } else return data;
  },

  checkIsYou: async (userId?: string) => {
    if (!userId) return false;

    const clientSupabase = createClient();

    return await clientSupabase.auth
      .getUser()
      .then((res) => {
        if (res.data.user) {
          return res.data.user.id === userId;
        } else return false;
      })
      .catch(() => false);
  },

  formatPhoneNumber: (phone: string) => {
    if (!phone) return;

    let normalized = phone.replace(/\D/g, "");
    if (normalized.startsWith("84")) normalized = "0" + normalized.slice(2);

    if (normalized.length === 10) {
      return normalized.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
    } else if (normalized.length === 11) {
      return normalized.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3");
    } else {
      return phone;
    }
  },

  formatMoneyVND(value: number | string): string {
    if (value === null || value === undefined || value === "") return "";
    const number = Number(value);
    if (isNaN(number)) return "";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(number);
  },

  generateSlug(title: string = "hnb"): string {
    const fromVietnamese = title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");

    const base = fromVietnamese
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const randomNumId = Array.from(crypto.getRandomValues(new Uint8Array(20)))
      .map((n) => (n % 10).toString())
      .join("");

    return `${base}-${randomNumId}`;
  },

  getHiddenEmail: (email: string) => {
    if (!email) return "";

    const emailParts = email.split("@");

    if (emailParts.length < 2) return email;
    else {
      return [emailParts[0].slice(0, 2), "*****", "@", emailParts[1]].join("");
    }
  },

  getHiddenNumber: (num: string | number) => {
    if (!num) return "";

    return String(num).slice(0, 3) + "***********";
  },

  generateRandomCode: (length: number = 6, prefix: string = "") => {
    const digits = "0123456789";
    let result = prefix;
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      result += digits[randomIndex];
    }
    return result;
  },

  parseMentions: (text: string) => {
    const regex = /@\[(.*?)\]\(id:(.*?)\)/g;
    const mentions: { id: string; display: string }[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      mentions.push({ display: match[1], id: match[2] });
    }

    return mentions;
  },

  getDateString: (date: Date) => {
    if (!date) return null;
    else return date.toISOString().split("T")[0];
  },

  getTodayAsDate: () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  },

  compareDate: (date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  },

  getTimeComparedToNow(timestamp: string | Date, shortened?: boolean): string {
    const date = new Date(timestamp);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth =
      now.getMonth() - date.getMonth() + 12 * (now.getFullYear() - date.getFullYear());
    const diffYear = Math.floor(diffMonth / 12);

    const short = (value: number, unit: string) => `${value}${unit}`;
    const full = (value: number, unit: string) => `${value} ${unit} trước`;

    if (diffDay === 0) {
      if (diffHour > 0) return shortened ? short(diffHour, "g") : full(diffHour, "giờ");
      if (diffMin > 0) return shortened ? short(diffMin, "p") : full(diffMin, "phút");
      if (diffSec > 0) return "Vừa xong";
      return "Vừa xong";
    }

    if (diffDay < 7) return shortened ? short(diffDay, "n") : full(diffDay, "ngày");

    if (diffWeek < 4) return shortened ? short(diffWeek, "t") : full(diffWeek, "tuần");

    if (diffMonth < 12) return shortened ? short(diffMonth, "th") : full(diffMonth, "tháng");

    return shortened ? short(diffYear, "y") : full(diffYear, "năm");
  },

  formatComments: (comments: any[]): PostComment[] => {
    const map = new Map<string, PostComment>();
    const roots: PostComment[] = [];

    comments.forEach((comment) => {
      const formatted: PostComment = { ...comment, children: [] };
      map.set(comment.id, formatted);
    });

    comments.forEach((comment) => {
      if (comment.parent_id) {
        const parent = map.get(comment.parent_id);
        if (parent) {
          parent.children!.push(map.get(comment.id)!);
        }
      }
    });

    comments.forEach((comment) => {
      if (!comment.parent_id) {
        roots.push(map.get(comment.id)!);
      }
    });

    return roots;
  },

  toGMT7TimeString: (date: Date | string) => {
    return dayjs(date).tz("Asia/Bangkok").format();
  },

  formatDecimal: (value?: number | null, fractionDigits = 2): string => {
    if (!value || !Number.isFinite(value)) return "-";
    return value.toFixed(fractionDigits).replace(/\.?0+$/, "");
  },
};
