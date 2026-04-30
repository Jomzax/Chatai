"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Mail, Shield, MessageCircle, EyeOff, Eye } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setIsSubmitting(true);

    const username = email.includes("@") ? email.split("@")[0] : email;
    try {
      await login(username, password);
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 3000); // 3 วินาที

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-10">
      <div className="flex items-center gap-2 mb-10">
        <MessageCircle />
        <span className="text-xl font-bold text-slate-900">Chat Ai</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl  font-bold text-slate-900">ยินดีต้อนรับ</h1>
          <p className="text-sm text-slate-500 mt-2">
            ลงชื่อเข้าใช้งาน Chat Ai!
          </p>
        </div>

        <div className="flex border-b border-slate-200 mt-6">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 pb-3 text-md font-bold tracking-widest ${tab === "login"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-400"
              }`}
          >
            ลงชื่อเข้าใช้
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 pb-3 text-md font-bold tracking-widest ${tab === "signup"
              ? "text-indigo-600 border-b-2 border-indigo-600"
              : "text-slate-400"
              }`}
          >
            สมัครสมาชิก
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          <div>
            <label className="block text-sm font-bold text-slate-600 tracking-wider mb-2">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-slate-100 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-600 tracking-wider">
                รหัสผ่าน
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-100 rounded-lg pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">จำรหัสผ่าน</span>
              <Link
                href="#"
                className="text-sm  font-medium text-indigo-600 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition"
          >
            {loading ? "ล็อกอิน..." : tab === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
          </button>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-md font-medium text-slate-400 tracking-widest">
              หรือเข้าสู่ระบบด้วย
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <GoogleIcon className="w-4 h-4" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <GitHubIcon className="w-4 h-4" />
              GitHub
            </button>
          </div>
        </form>
      </div>

      <footer className="w-full max-w-5xl mt-auto pt-12 flex justify-between items-center text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3" />
          <span>ISO/IEC 27001 Certified</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-700">Privacy Policy</a>
          <a href="#" className="hover:text-slate-700">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}


function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function GitHubIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2.1c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2.9-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}
