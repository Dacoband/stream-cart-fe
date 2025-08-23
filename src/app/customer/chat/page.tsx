import { Suspense } from "react";
import ChatPage from "./components/ChatUI";

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ChatPage />
    </Suspense>
  );
}
