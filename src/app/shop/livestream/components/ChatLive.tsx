import React from "react";
import { ChatSignalR } from "@/types/livestream/chatSignalR";
import { joinChatLiveStream } from "@/services/api/livestream/chatsignalR";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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
      <CardTitle className="border-b py-4 text-black text-center ">
        Chat Live
      </CardTitle>
      <CardContent className="flex-1">
        <div className="flex flex-col gap-2">
          {messages.length === 0 ? (
            <span className="text-gray-500 text-sm">No messages yet.</span>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className="p-2 border rounded bg-gray-50 text-black text-sm"
              >
                {/* Replace 'content' with an existing property, e.g., 'message' */}
                {msg.message}
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="py-4 border-t">
        <div className=" w-full  flex items-end gap-2">
          <textarea
            rows={4}
            placeholder="Nhập tin nhắn..."
            className="flex-1 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="default" size="icon" className="h-10 w-10">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatLive;
