import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatWorkspace from "@/components/chat/ChatWorkspace";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const sessionIsValid = cookieHeader
    ? await fetch(`${API_BASE_URL}/auth/session`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: "no-store",
      })
        .then((response) => response.ok)
        .catch(() => false)
    : false;

  if (!sessionIsValid) {
    redirect("/login");
  }

  return (
    <ChatWorkspace />
  );
}
