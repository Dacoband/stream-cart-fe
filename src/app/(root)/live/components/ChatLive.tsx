import { Card, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import ChatCommon from "./ChatCommon";
import ChatwithAI from "./ChatwithAI";

interface ChatLiveProps {
  livestreamId?: string;
}

const ChatLive: React.FC<ChatLiveProps> = ({ livestreamId }) => {
  return (
    <Card className="bg-white border h-full rounded-none py-0 gap-0">
      <Tabs defaultValue="live" className="w-full">
        <CardTitle className="border-b  w-full text-black text-center">
          <TabsList className="w-full h-full ">
            <TabsTrigger value="live">Chat Live</TabsTrigger>
            <TabsTrigger value="ai">Chat AI</TabsTrigger>
          </TabsList>
        </CardTitle>
        <TabsContent value="live">
          <ChatCommon livestreamId={livestreamId} />
        </TabsContent>
        <TabsContent value="ai">
          <ChatwithAI />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatLive;
