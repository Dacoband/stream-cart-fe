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
    <Card className="bg-white border  h-[calc(100vh-8vh)] rounded-none py-0 gap-0">
      <Tabs defaultValue="live" className="w-full h-full">
        <CardTitle className="border-b  w-full text-black text-center">
          <TabsList className="w-full p-0 ">
            <TabsTrigger value="live" className="rounded-none ">
              Chat Live
            </TabsTrigger>
            <TabsTrigger value="ai" className="rounded-none ">
              Chat AI
            </TabsTrigger>
          </TabsList>
        </CardTitle>

        <TabsContent value="live" className="h-full">
          <ChatCommon livestreamId={livestreamId} />
        </TabsContent>
        <TabsContent value="ai" className="h-full">
          <ChatwithAI />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChatLive;
