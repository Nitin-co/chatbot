// src/components/chat/ChatView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useMutation, useSubscription } from "@apollo/client";
import { Loader } from "lucide-react";

import { SUBSCRIBE_TO_MESSAGES } from "/home/project/src/graphql/queries.ts";
import { INSERT_MESSAGE, SEND_MESSAGE_ACTION } from "/home/project/src/graphql/mutations.ts";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  created_at: string;
}

interface ChatViewProps {
  chatId: string;
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useSubscription(SUBSCRIBE_TO_MESSAGES, {
    variables: { chatId },
    fetchPolicy: "network-only",
  });

  const [insertMessage] = useMutation(INSERT_MESSAGE);
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [data?.messages?.length]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;
    setIsSending(true);

    try {
      const cleaned = text.trim();
      await insertMessage({ variables: { chat_id: chatId, text: cleaned, sender: "user" } });
      await sendMessageAction({ variables: { chat_id: chatId, text: cleaned } });
    } catch (e) {
      console.error("Error sending message", e);
    } finally {
      setIsSending(false);
    }
  };

  if (loading && !data) return (
    <div className="flex-1 flex items-center justify-center">
      <Loader className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  if (error) return <p className="text-red-600">Unable to load messages.</p>;

  const messages: Message[] = data?.messages ?? [];

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
    </div>
  );
};
