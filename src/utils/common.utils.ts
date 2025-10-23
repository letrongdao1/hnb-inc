import { createClient } from "@/lib/supabase/client";

export const CommonUtils = {
  formatMetaData: (title?: string) => {
    const mainTitle = "HNB Hub";
    return [title, mainTitle].filter(Boolean).join(" | ");
  },
  getSingleDataFromUnknown: (data: any) => {
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
};
