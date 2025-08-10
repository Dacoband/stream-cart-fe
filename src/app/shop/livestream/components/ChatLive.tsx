import React from "react";
import { ChatSignalR } from "@/types/livestream/chatSignalR";
import { joinChatLiveStream } from "@/services/api/livestream/chatsignalR";
import { Card, CardTitle } from "@/components/ui/card";
function ChatLive({ livestreamId }: { livestreamId: string }) {
  const [messages, setMessages] = React.useState<ChatSignalR[]>([]);

  React.useEffect(() => {
    const fetchMessages = async () => {
      const data = await joinChatLiveStream(livestreamId);
      setMessages(data);
    };

    fetchMessages();
  }, [livestreamId]);

  return (
    <Card className=" bg-[white] border  h-full rounded-none py-0 gap-0">
      <CardTitle className="border-b py-4 text-black text-center">
        Chat Live
      </CardTitle>
    </Card>
  );
}

export default ChatLive;
