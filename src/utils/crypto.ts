import crypto from "crypto";

export const CryptoUtils = {
  generateOtp: (length: number = 6) => {
    const max = 10 ** length;
    return String(crypto.randomInt(0, max)).padStart(length, "0");
  },
  hashOtp: (otp: string) => {
    return crypto.createHmac("sha256", process.env.OTP_HASH_SECRET!).update(otp).digest("hex");
  },
};
