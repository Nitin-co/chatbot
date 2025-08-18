import React, { useEffect, useState } from 'react'
import { getChats, createChat, deleteChat } from '/home/project/src/graphql/queries'
import { Chat } from '/home/project/src/types/index'

interface ChatListProps {
  onSelectChat: (chat: Chat) => void
  selectedChatId?: string
}

export const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChats = async () => {
    try {
      const data = await getChats()
      setChats(data)
    } catch (err) {
      console.error('Error fetching chats:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat()
      setChats([newChat, ...chats])
      onSelectChat(newChat)
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  const handleDeleteChat = async (id: string) => {
    try {
      await deleteChat(id)
      setChats(chats.filter(chat => chat.id !== id))
    } catch (err) {
      console.error('Error deleting chat:', err)
    }
  }

  useEffect(() => {
    fetchChats()
  }, [])

  if (loading) return <div>Loading chats...</div>

  return (
    <div className="w-64 border-r border-gray-200 p-2 flex flex-col">
      <button
        onClick={handleCreateChat}
        className="mb-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        + New Chat
      </button>
      <ul className="flex-1 overflow-y-auto">
        {chats.map(chat => (
          <li
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-2 rounded cursor-pointer mb-1 ${
              selectedChatId === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>Chat {chat.id.slice(0, 5)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id) }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
            {chat.messages[0] && <p className="text-xs text-gray-500 truncate">{chat.messages[0].text}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
