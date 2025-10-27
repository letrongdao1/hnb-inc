import * as React from "react";
import { Html, Button } from "@react-email/components";

export default function VerifyEmailTemplate(props: { code: string }) {
  const { code } = props;

  return (
    <Html lang="en" className="font-sans">
      <p>
        Chào mừng bạn đến với HNB Hub,
      </p>
      <p>
        Mã xác thực của bạn là: <p className="text-3xl font-bold tracking-widest">{code}</p>
      </p>
    </Html>
  );
}
