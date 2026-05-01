import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ChatPanel from "@/components/chat/ChatPanel";
import Sidebar from "@/components/chat/Sidebar";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex min-h-screen flex-1 flex-col">
        <ChatPanel />
      </main>
    </div>
  );
}
