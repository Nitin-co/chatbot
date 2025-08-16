// src/components/chat/ChatList.tsx
import React, { useEffect, useState } from "react";
import { Plus, MessageCircle } from "lucide-react";
import { apolloClient } from "/home/project/src/lib/apollo.ts";
import { useSubscription } from "@apollo/client";
import clsx from "clsx";
import { GET_CHATS, SUBSCRIBE_TO_CHATS, CREATE_CHAT } from "/home/project/src/graphql/queries.ts";

// Types
interface Chat {
  id: string;
  created_at: string;
}

interface ChatListProps {
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await apolloClient.query({
        query: GET_CHATS,
        fetchPolicy: "network-only",
      });
      setChats(data.chats || []);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_CHAT,
        variables: {},
      });
      const newChat: Chat = data.insert_chats_one;
      setChats((prev) => [newChat, ...prev]);
      onSelectChat(newChat.id);
    } catch (err) {
      console.error("Error creating chat:", err);
    }
  };

  // Subscribe to live updates
  useSubscription(SUBSCRIBE_TO_CHATS, {
    onData: ({ data }) => {
      if (data.data?.chats) setChats(data.data.chats);
    },
  });

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className="flex flex-col p-4 border-r border-gray-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={handleCreateChat}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : chats.length === 0 ? (
        <p className="text-gray-500 text-sm">No chats yet</p>
      ) : (
        <ul className="space-y-2 overflow-y-auto">
          {chats.map((chat) => (
            <li
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                "p-2 rounded-lg cursor-pointer flex items-center space-x-2 hover:bg-gray-100",
                selectedChatId === chat.id && "bg-blue-100 font-semibold"
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                {new Date(chat.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
