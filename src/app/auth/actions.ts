"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const params = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data, error } = await supabase.auth.signInWithPassword(params);

  if (error) {
    if (error.code === "invalid_credentials") {
      return { status: 400, message: "Email hoặc mật khẩu không đúng. Vui lòng thử lại!" };
    }
  } else {
    const checkUser = await supabase.from("users").select().eq("id", data.user.id);
    if (checkUser && checkUser.data && checkUser.data.length) {
      revalidatePath("/", "layout");
      redirect("/");
    } else {
      redirect("/get-start");
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
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/auth/login");
}
