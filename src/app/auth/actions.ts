"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "../constants/status";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const params = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signInWithPassword(params);

  if (error) {
    console.log({ error });
    if (error.code === "invalid_credentials") {
      return {
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Email hoặc mật khẩu không đúng. Vui lòng thử lại!",
      };
    }
  } else {
    const checkUser = await supabase.from("users").select().eq("id", data.user.id);
    if (checkUser && checkUser.data && checkUser.data.length) {
      return {
        status: STATUS_CODE.OK,
        data: checkUser.data[0],
        message: "Đăng nhập thành công.",
      };
    } else {
      return {
        status: STATUS_CODE.OK,
        data: null,
        message: "Đăng nhập thành công.",
      };
    }
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const params = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signUp(params);

  if (error) {
    throw new Error("Tạo tài khoản thất bại: ", error);
  } else {
    return {
      status: STATUS_CODE.OK,
      message: "Chúc mừng bạn đã có mặt trên HNB Hub. Vui lòng đăng nhập để tiếp tục!",
    };
  }
}

export async function checkEmail(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.admin.listUsers();

  console.log({ data, error });

  const exists = data.users.some((u) => u.email === email);

  if (error) {
    return { status: STATUS_CODE.INTERNAL_SERVER_ERROR };
  } else if (exists) {
    return {
      status: STATUS_CODE.CONFLICT,
      message: "Email này đã tồn tại trên HNB Hub. Vui lòng thử đăng nhập lại!",
    };
  } else {
    return {
      status: STATUS_CODE.OK,
    };
  }
}
