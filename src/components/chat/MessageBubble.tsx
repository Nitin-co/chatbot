import React from 'react'
import { Message } from '/home/project/src/types/index'

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`p-2 rounded-lg max-w-xs ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'}`}>
        {message.text}
      </div>
    </div>
  )
}
