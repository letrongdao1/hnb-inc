"use server";

import React from "react";
import CreatePostForm from "../../../components/management/hub/news/CreateUpdatePostForm";
import { PostInfo } from "@/interfaces/news";
import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "@/constants/enums";
import { CommonUtils } from "@/utils/common.utils";
import { getPublicUserList } from "@/app/auth/users";

export async function generateMetadata() {
  return {
    title: CommonUtils.formatMetaData("Đăng bản tin"),
    description: "Đăng bản tin HNB",
  };
}

export default async function CreatePost() {
  const supabase = await createClient();

  return <></>;
}

export async function uploadPostImage(file: File) {
  if (!file) return;

  const supabase = await createClient();

  const now = Date.now();
  const newFileName = file.name + "-" + now;
  const targetBucket = "avatar";
  const targetFolder = "posts";

  const { data, error } = await supabase.storage
    .from(targetBucket)
    .upload(`${targetFolder}/${newFileName}`, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    try {
      const checkFile = supabase.storage
        .from(targetBucket)
        .getPublicUrl(`${targetFolder}/${newFileName}`);
      if (checkFile) return { status: STATUS_CODE.OK, data: checkFile.data.publicUrl };
      else throw new Error();
    } catch {
      throw new Error("Tải ảnh lên thất bại: ", error);
    }
  } else if (data) {
    const urlData = supabase.storage
      .from(targetBucket)
      .getPublicUrl(`${targetFolder}/${newFileName}`);
    return { status: STATUS_CODE.OK, data: urlData.data.publicUrl };
  }
}

export async function createNewPost(newPost: Partial<PostInfo>) {
  const supabase = await createClient();

  const { error } = await supabase.from("posts").insert({
    ...newPost,
    user: newPost.user?.id,
  });

  if (error) {
    console.log({ error });
    return { status: STATUS_CODE.ERROR };
  } else return { status: STATUS_CODE.CREATED };
}
