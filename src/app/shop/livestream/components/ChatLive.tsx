import React from "react";
import { SendChatSignalR } from "@/types/livestream/chatSignalR";
import {
  joinChatLiveStream,
  SendMessageLiveStream,
} from "@/services/api/livestream/chatsignalR";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

function ChatLive({ livestreamId }: { livestreamId: string }) {
  const [newMessage, setNewMessage] = React.useState("");

  React.useEffect(() => {
    joinChatLiveStream(livestreamId);
  }, [livestreamId]);

  const handleMessageSend = async () => {
    if (!newMessage.trim()) return;
    const data: SendChatSignalR = {
      livestreamId,
      message: newMessage.trim(),
      messageType: 0,
      replyToMessageId: "",
    };
    await SendMessageLiveStream(livestreamId, data);
    setNewMessage("");
  };

  return (
    <Card className="bg-white border h-full rounded-none py-0 gap-0">
      <CardTitle className="border-b py-4 text-black text-center">
        Chat Live
      </CardTitle>
      <CardContent>
        <div>tin nhắn</div>
      </CardContent>
      <CardFooter className="py-4 border-t">
        <div className="w-full flex items-end gap-2">
          <textarea
            rows={4}
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleMessageSend();
              }
            }}
            className="flex-1 border rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10"
            onClick={handleMessageSend}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ChatLive;
