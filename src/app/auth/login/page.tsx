'use client'

import { useState } from 'react'
import { login, signup } from '../actions'

export default function LoginPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", form.email);
    formData.append("password", form.password);
  
    login(formData);
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6"
      >
        <h1 className="text-2xl font-bold text-white text-center">
          Chào mừng đến với HNB Hub
        </h1>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-100 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-100 mb-1"
          >
            Mật khẩu
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-indigo-200"
            placeholder="••••••••"
          />
        </div>

        <button
          formAction={signup}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 focus:ring focus:ring-indigo-300 transition"
        >
          Continue
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  )
}
