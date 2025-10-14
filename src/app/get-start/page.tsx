"use server";

import { createClient } from "@/lib/supabase/server";
import GetStartView from "./GetStartView";
import { STATUS_CODE } from "../constants/status";

export default async function GetStart() {
  const supabase = await createClient();

  const { data } = await supabase.storage.from("avatar").list("avatar", { limit: 50 });

  const urlList: string[] = [];

  if (data && data.length) {
    data.map((d) => {
      const urlData = supabase.storage.from("avatar").getPublicUrl(`avatar/${d.name}`);
      if (urlData) urlList.push(urlData.data.publicUrl);
    });
  }

  return <GetStartView defaultAvatars={urlList} />;
}

export async function uploadAvatar(file: File) {
  if (!file) return;

  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("avatar")
    .upload(`avatar/${file.name}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error("Tải ảnh lên thất bại: ", error);
  } else if (data) {
    console.log({ data });
    const urlData = supabase.storage.from("avatar").getPublicUrl(`avatar/${file.name}`);
    return { status: STATUS_CODE.OK, data: urlData.data.publicUrl };
  }
}

// export async function createUser(data: any) {
//   const { data, error }   
// }
