import React, { useState } from 'react'
import { ChatList } from '../components/chat/ChatList'
import { ChatView } from '../components/chat/ChatView'
import { MessageCircle } from 'lucide-react'

export const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>()

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <ChatList 
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
      />
      
      {selectedChatId ? (
        <ChatView chatId={selectedChatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Select a chat</h3>
            <p className="text-sm">
              Choose a conversation from the sidebar or create a new one
            </p>
          </div>
        </div>
      )}
    </div>
  )
}