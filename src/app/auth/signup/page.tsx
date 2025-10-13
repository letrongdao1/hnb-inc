"use client";

import { useState } from "react";
import { signup } from "../actions";
import EmailSignupForm from "@/components/auth/signup/EmailInput";
import PasswordSignupForm from "@/components/auth/signup/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState<string | null>(null);

  if (!email) return <EmailSignupForm onNext={(value) => setEmail(value)} />;

  return (
    <PasswordSignupForm
      email={email}
      onSubmit={(password) => {
        console.log("Create Supabase user with:", { email, password });
        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        signup(formData);
      }}
    />
  );
}
