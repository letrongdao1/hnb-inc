"use server";

import { createClient } from "@/lib/supabase/server";
import { STATUS_CODE } from "../../constants/status.enum";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const params = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signInWithPassword(params);

  if (error) {
    if (error.code === "invalid_credentials") {
      return {
        status: STATUS_CODE.INVALID_CREDENTIALS,
        message: "Email hoặc mật khẩu không đúng. Vui lòng thử lại!",
      };
    }
  } else {
    const checkUser = await supabase.from("users").select().eq("id", data.user.id).single();
    if (checkUser && checkUser.data) {
      return {
        status: STATUS_CODE.OK,
        data: checkUser.data,
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

export async function checkSession() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getSession();

  if (data && data.session) {
    const { data: authData } = await supabase.auth.getUser(data.session.access_token);
    const { data: userData } = await supabase
      .from("users")
      .select()
      .eq("id", authData.user?.id)
      .single();

    return {
      status: STATUS_CODE.OK,
      data: userData,
    };
  } else {
    return {
      status: STATUS_CODE.NOT_FOUND,
      data: null,
    };
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
      message: "Tạo tài khoản HNB Hub thành công. Vui lòng đăng nhập để tiếp tục!",
    };
  }
}

export async function checkEmail(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.admin.listUsers();

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

export async function getCurrentUserId() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (data && data.user) return data.user.id;
  else return null;
}

export async function getCurrentUserAuthInfo() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (data && data.user)
    return {
      id: data.user.id,
      email: data.user.email,
    };
  else return null;
}

export async function getCurrentUserInfo() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  if (!data || !data.user) {
    return null;
  } else {
    const { data: userData } = await supabase
      .from("users")
      .select(
        "id, email, display_name, gender, avatar, dob, phone, role:users_role_fkey(id, name, status), status, created_at"
      )
      .eq("id", data.user.id)
      .single();

    return userData;
  }
}
