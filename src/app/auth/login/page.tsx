"use client";

import { useState } from "react";
import { login, signup } from "../actions";
import { useAppStore } from "@/lib/store/useAppStore";

export default function LoginPage() {
  const { setLoading } = useAppStore();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);

      const response = await login(formData);
      if (response && response.status === 400) {
        console.log(response.message);
      }
    } catch {
      console.log("Login error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-2xl p-8 shadow-lg">
        <h1 className="text-center text-2xl font-bold text-white">Chào mừng đến với HNB Hub</h1>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-100">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring focus:ring-indigo-200 focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-100">
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring focus:ring-indigo-200 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          formAction={signup}
          className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700 focus:ring focus:ring-indigo-300"
        >
          Continue
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
