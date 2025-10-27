"use server";

import { createClient } from "@/lib/supabase/server";
import GetStartView from "./GetStartView";
import { createUserRole, getCurrentUserAuthInfo, getCurrentUserInfo } from "../auth/actions";
import { ROLE, STATUS_CODE } from "@/constants/enums";
import { UserInfo } from "@/interfaces/user";

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

  const now = Date.now();
  const newFileName = file.name + "-" + now;

  const { data, error } = await supabase.storage
    .from("avatar")
    .upload(`upload/${newFileName}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    try {
      const checkFile = supabase.storage.from("avatar").getPublicUrl(`upload/${newFileName}`);
      if (checkFile) return { status: STATUS_CODE.OK, data: checkFile.data.publicUrl };
      else throw new Error();
    } catch {
      throw new Error("Tải ảnh lên thất bại: ", error);
    }
  } else if (data) {
    const urlData = supabase.storage.from("avatar").getPublicUrl(`upload/${newFileName}`);
    return { status: STATUS_CODE.OK, data: urlData.data.publicUrl };
  }
}

export async function createUser(params: any) {
  const supabase = await createClient();

  const authInfo = await getCurrentUserAuthInfo();

  if (!authInfo) return;

  const { error } = await supabase.from("users").insert({
    id: authInfo.id,
    email: authInfo.email,
    ...params,
  });

  if (error) {
    return {
      status: STATUS_CODE.ERROR,
      message: "Thiết lập thông tin tài khoản thất bại. Vui lòng thử lại!",
      data: null,
    };
  } else {
    const { data: userData } = await supabase.from("users").select().eq("id", authInfo.id).single();
    if (userData) {
      const createRoleResponse = await createUserRole(userData.id, [ROLE.STAFF]);

      if (
        createRoleResponse &&
        createRoleResponse.some((res) => res.then((r) => r.status === STATUS_CODE.CREATED))
      ) {        
        return {
          status: STATUS_CODE.CREATED,
          data: await getCurrentUserInfo(),
          message: `Thiết lập hoàn tất. Chào mừng ${params.display_name || "bạn"} đến với HNB Hub!`,
        };
      }
    }
  }
}
