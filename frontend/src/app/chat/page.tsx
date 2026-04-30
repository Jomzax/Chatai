import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/chat/Sidebar";
import SuggestionCard from "@/components/chat/SuggestionCard";
import MessageInput from "@/components/chat/MessageInput";
import StatusBar from "@/components/chat/StatusBar";
import { MOCK_USER, SUGGESTIONS } from "@/lib/mockChat";

export default async function ChatPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");

  if (!token) {
    redirect("/login");
  }

  const firstName = MOCK_USER.name.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto px-10 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              ยินดีต้อนรับ, {firstName}.
            </h1>
            <p className="text-slate-500 mb-10">
              วันนี้อยากให้ AI ช่วยอะไรบ้าง?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <SuggestionCard
                suggestion={SUGGESTIONS[0]}
                className="col-span-2"
              />
              <SuggestionCard suggestion={SUGGESTIONS[1]} />
              <SuggestionCard suggestion={SUGGESTIONS[2]} />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-10 py-5">
          <div className="max-w-4xl mx-auto">
            <MessageInput />
            <StatusBar tokensUsed={1420} />
          </div>
        </div>
      </main>
    </div>
  );
}
