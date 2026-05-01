import ChatWorkspace from "@/components/chat/ChatWorkspace";
import { requireServerSession } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  await requireServerSession();
  return (
    <>
      <ChatWorkspace />
    </>
  );
}
