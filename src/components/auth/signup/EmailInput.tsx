"use client";

import { useState } from "react";

export default function EmailSignupForm({ onNext }: { onNext: (email: string) => void }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onNext(email);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-16 max-w-sm space-y-5 rounded-2xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-lg"
    >
      <h2 className="text-center text-xl font-semibold">Tạo tài khoản Nhân viên HNB</h2>

      <div>
        <label className="mb-2 block text-sm text-gray-400">Địa chỉ email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition duration-150 hover:bg-indigo-500"
      >
        Continue
      </button>
    </form>
  );
}
