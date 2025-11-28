import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redis } from "@/lib/redis/redis";
import { CryptoUtils } from "@/utils/crypto";
import { STATUS_CODE } from "@/constants/enums";

const MAX_ATTEMPTS = 5;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp)
    return NextResponse.json(
      { error: "Không tìm thấy email hoặc OTP" },
      { status: STATUS_CODE.BAD_REQUEST, headers: corsHeaders }
    );

  const attemptsKey = `otp_attempts:${email}`;
  const attempts = Number((await redis.get(attemptsKey)) ?? 0);
  if (attempts >= MAX_ATTEMPTS)
    return NextResponse.json(
      { error: "Số lần xác thực OTP đã vượt quá giới hạn!" },
      { status: STATUS_CODE.TOO_MANY_REQUESTS, headers: corsHeaders }
    );

  const storedHash = await redis.get(`otp:${email}`);
  if (!storedHash)
    return NextResponse.json(
      { error: "Không tìm thấy OTP hoặc OTP đã hết hạn!" },
      { status: STATUS_CODE.BAD_REQUEST, headers: corsHeaders }
    );

  const candidate = CryptoUtils.hashOtp(otp);
  const ok =
    storedHash.length === candidate.length &&
    crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(candidate));

  if (!ok) {
    await redis.incr(attemptsKey);
    await redis.expire(attemptsKey, 5 * 60);
    const attemptsLeft = MAX_ATTEMPTS - attempts - 1;
    return NextResponse.json(
      {
        error: `Mã xác thực không đúng!`,
        data: { attemptsLeft },
      },
      { status: STATUS_CODE.INVALID_CREDENTIALS, headers: corsHeaders }
    );
  }

  await redis.del(`otp:${email}`);
  await redis.del(attemptsKey);

  return NextResponse.json({ ok: true }, { status: STATUS_CODE.OK, headers: corsHeaders });
}
