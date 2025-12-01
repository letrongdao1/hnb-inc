import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis/redis";
import { CryptoUtils } from "@/utils/crypto";
import { Resend } from "resend";
import PlaidVerifyIdentityEmail from "@/components/email-templates/VerifyEmail";
import { STATUS_CODE } from "@/constants/enums";

const OTP_TTL = 5 * 60; // 5 minutes
const MAX_SENDS_HOUR = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email)
    return NextResponse.json(
      { error: "Không tìm thấy email!" },
      { status: STATUS_CODE.BAD_REQUEST, headers: corsHeaders }
    );

  const sendKey = `otp_sends:${email}`;
  const sends = Number((await redis.get(sendKey)) ?? 0);
  if (sends >= MAX_SENDS_HOUR)
    return NextResponse.json(
      {
        error:
          "Vượt quá giới hạn gửi yêu cầu xác thực OTP. Vui lòng sử dụng email khác hoặc thử lại sau 1 tiếng nữa!",
      },
      { status: STATUS_CODE.TOO_MANY_REQUESTS, headers: corsHeaders }
    );
  await redis.multi().incr(sendKey).expire(sendKey, 3600).exec();

  const otp = CryptoUtils.generateOtp(6);
  const hashed = CryptoUtils.hashOtp(otp);

  await redis.set(`otp:${email}`, hashed, "EX", OTP_TTL);
  await redis.set(`otp_attempts:${email}`, "0", "EX", OTP_TTL);

  const resend = new Resend(process.env.RESEND_API_KEY!);

  await resend.emails
    .send({
      from: "HNB Inc <no-reply@hnb-inc.site>",
      to: email,
      subject: "[HNB] MÃ XÁC THỰC ĐĂNG KÝ TÀI KHOẢN HNB HUB",
      react: PlaidVerifyIdentityEmail({ validationCode: otp }),
    })
    .catch((err) => {
      console.log(err);
      return NextResponse.json({ status: STATUS_CODE.ERROR }, { headers: corsHeaders });
    });

  return NextResponse.json({ ok: true, status: STATUS_CODE.OK }, { headers: corsHeaders });
}
