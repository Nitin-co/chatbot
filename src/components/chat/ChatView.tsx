import React, { useEffect, useState } from 'react'
import { getMessages } from '/home/project/src/graphql'
import { Message, Chat } from '/home/project/src/types'
import { MessageBubble } from '/home/project/src/components/chat/MessageBubble'
import { MessageInput } from '/home/project/src/components/chat/MessageInput'

interface ChatViewProps {
  chat: Chat
}

export const ChatView: React.FC<ChatViewProps> = ({ chat }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const data = await getMessages(chat.id)
      setMessages(data)
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [chat.id])

  const handleSendMessage = (message: Message) => {
    setMessages([...messages, message])
  }

  if (loading) return <div className="p-4">Loading messages...</div>

  return (
    <div className="flex-1 flex flex-col border-l border-gray-200">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
      <MessageInput chatId={chat.id} onSend={handleSendMessage} />
    </div>
  )
}
