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

    const shortTimestamp = Date.now().toString(36);

    return `${base}-${shortTimestamp}`;
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
};
