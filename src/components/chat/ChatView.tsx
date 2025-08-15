// src/components/chat/ChatView.tsx
import React, { useEffect, useState, useRef } from "react";
import { apolloClient } from "/home/project/src/lib/apollo.ts";
import { gql } from "@apollo/client";
import { nhost } from "/home/project/src/lib/nhost.ts";
import { MessageInput } from "/home/project/src/components/chat/MessageInput.tsx";

const GET_MESSAGES = gql`
  query GetMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      text
      sender
      created_at
    }
  }
`;

const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $text: String!, $sender: String!) {
    insert_messages_one(object: { chat_id: $chat_id, text: $text, sender: $sender }) {
      id
      text
      sender
      created_at
    }
  }
`;

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const { data } = await apolloClient.query({
        query: GET_MESSAGES,
        variables: { chat_id: chatId },
        fetchPolicy: "network-only",
      });
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const user = nhost.auth.getUser();
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    try {
      const { data } = await apolloClient.mutate({
        mutation: INSERT_MESSAGE,
        variables: {
          chat_id: chatId,
          text: text,
          sender: "user", // Must match messages table column
        },
      });

      if (data?.insert_messages_one) {
        setMessages((prev) => [...prev, data.insert_messages_one]);
        scrollToBottom();
      }
    } catch (err: any) {
      console.error("Error sending message:", err);
      if (err.graphQLErrors) console.error(err.graphQLErrors);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  return (
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 p-2 rounded-lg max-w-xs ${
                msg.sender === "user" ? "bg-blue-100 self-end" : "bg-gray-100 self-start"
              }`}
            >
              {msg.text}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};
