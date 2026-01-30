import { NextRequest, NextResponse } from "next/server";
import { STATUS_CODE } from "@/constants/enums";
import { CommonUtils } from "@/utils/common.utils";
import { createClient } from "@/lib/supabase/server";
import { UserInfo } from "@/interfaces/user";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.code === "invalid_credentials") {
      return NextResponse.json(
        {
          status: STATUS_CODE.INVALID_CREDENTIALS,
          message: "Email hoặc mật khẩu không đúng. Vui lòng thử lại!",
        },
        { headers: corsHeaders }
      );
    }
  } else {
    const checkUser = await supabase.from("users").select("*").eq("id", data.user.id).single();
    if (checkUser && checkUser.data) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role:user_roles_role_fkey(*)")
        .eq("user_id", data.user.id);

      const roles = roleData
        ? roleData.map((r) => CommonUtils.getSingleDataFromUnknown(r.role))
        : [];

      const userDataWithRoles: UserInfo = {
        ...checkUser.data,
        roles,
      };
      return NextResponse.json(
        { data: userDataWithRoles, status: STATUS_CODE.OK, message: "Đăng nhập thành công." },
        { headers: corsHeaders }
      );
    } else {
      return NextResponse.json(
        { data: null, status: STATUS_CODE.OK, message: "Đăng nhập thành công." },
        { headers: corsHeaders }
      );
    }
  }

  return NextResponse.json({ ok: true, status: STATUS_CODE.OK }, { headers: corsHeaders });
}
