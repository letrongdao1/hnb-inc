import { createClient } from "@/lib/supabase/client";

export const CommonUtils = {
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
};
