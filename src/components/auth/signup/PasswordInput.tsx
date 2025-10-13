"use client";

import { useState } from "react";

export default function PasswordSignupForm({
  email,
  onSubmit,
}: {
  email: string;
  onSubmit: (password: string, confirmPassword: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    onSubmit(password, confirmPassword);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-10 max-w-sm space-y-5 rounded-2xl border border-gray-700 bg-gray-900 p-6 text-gray-100 shadow-lg"
    >
      <h2 className="text-center text-xl font-semibold">Set Your Password</h2>
      <p className="text-center text-sm text-gray-400">for {email}</p>

      <div>
        <label className="mb-2 block text-sm text-gray-400">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-400">Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-gray-100 focus:border-transparent focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-center text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-2.5 font-medium text-white transition duration-150 hover:bg-indigo-500"
      >
        Finish Sign Up
      </button>
    </form>
  );
}
