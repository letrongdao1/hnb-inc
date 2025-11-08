import { createClient } from "@/lib/supabase/client";

export const CommonUtils = {
  formatMetaData: (title?: string) => {
    const mainTitle = "HNB Hub";
    return [title, mainTitle].filter(Boolean).join(" | ");
  },
  getSingleDataFromUnknown: (data: any) => {
    if (!data) return data;
    if (typeof data === "object") return data;
    else if (Array.isArray(data) && data.length) return data[0];
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
  compareDate: (date1: string | Date, date2: string | Date) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  },
  getTimeComparedToNow(timestamp: string | Date): string {
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

    // Within today
    if (diffDay === 0) {
      if (diffHour > 0) return `${diffHour} giờ trước`;
      if (diffMin > 0) return `${diffMin} phút trước`;
      return `Vừa xong`;
    }

    // Days ago
    if (diffDay < 7) return `${diffDay} ngày trước`;

    // Weeks ago
    if (diffWeek < 4) return `${diffWeek} tuần trước`;

    // Months ago
    if (diffMonth < 12) return `${diffMonth} tháng trước`;

    // Over a year ago
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear} năm trước`;
  },
};
