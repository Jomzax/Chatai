"use client";

import { useRouter } from "next/navigation";

const AUTH_COOKIE = "auth_token";
const ONE_DAY = 60 * 60 * 24;

export function useAuth() {
  const router = useRouter();

  async function login(username: string, password: string) {
    if (username === "admin" && password === "admin123") {
      document.cookie = `${AUTH_COOKIE}=mock-token-${Date.now()}; path=/; max-age=${ONE_DAY}; SameSite=Lax`;
      return;
    }
    throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง (ลอง admin / admin123)");
  }

  function logout() {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
    router.push("/login");
  }

  return { login, logout };
}
