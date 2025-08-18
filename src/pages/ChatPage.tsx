import React, { useState } from 'react'
import { ChatList } from '../components/chat/ChatList'
import { ChatView } from '../components/chat/ChatView'
import { MessageCircle } from 'lucide-react'

export const ChatPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSelectChat = (chatId: string) => {
    // Only set valid UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (chatId && uuidRegex.test(chatId)) {
      setSelectedChatId(chatId)
      setIsMobileMenuOpen(false)
    } else {
      setSelectedChatId('')
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Mobile menu button */}
      <div className="md:hidden absolute top-4 left-4 z-10">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      </div>

      {/* Chat List - Mobile overlay or desktop sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'fixed inset-0 z-20 bg-white' : 'hidden'} 
        md:relative md:block md:z-auto md:bg-transparent
      `}>
        <ChatList 
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* Chat View */}
      {selectedChatId && selectedChatId.length > 0 ? (
        <ChatView chatId={selectedChatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500 p-8">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Welcome to AI Assistant</h3>
            <p className="text-sm mb-4">
              Choose a conversation from the sidebar or create a new one to get started
            </p>
            <p className="text-xs text-gray-400">
              Your AI assistant is ready to help with questions, conversations, and more!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}