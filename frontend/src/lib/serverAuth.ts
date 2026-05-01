import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export async function getServerCookieHeader() {
  const cookieStore = await cookies();

  return cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
}

export async function hasValidServerSession() {
  const cookieHeader = await getServerCookieHeader();

  if (!cookieHeader) {
    return false;
  }

  return fetch(`${API_BASE_URL}/auth/session`, {
    headers: {
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })
    .then((response) => response.ok)
    .catch(() => false);
}

export async function requireServerSession(redirectTo = "/login") {
  const sessionIsValid = await hasValidServerSession();

  if (!sessionIsValid) {
    redirect(redirectTo);
  }
}
