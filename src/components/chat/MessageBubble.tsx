import React from 'react'
import { Bot, User } from 'lucide-react'
import clsx from 'clsx'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  created_at: string
}

interface MessageBubbleProps {
  message: Message
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.sender === 'bot'

  return (
    <div
      className={clsx(
        'flex items-start space-x-3 mb-4',
        !isBot && 'flex-row-reverse space-x-reverse'
      )}
    >
      <div
        className={clsx(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isBot ? 'bg-blue-100' : 'bg-gray-100'
        )}
      >
        {isBot ? <Bot className="h-4 w-4 text-blue-600" /> : <User className="h-4 w-4 text-gray-600" />}
      </div>

      <div
        className={clsx(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
          isBot ? 'bg-gray-100 text-gray-900' : 'bg-blue-600 text-white'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={clsx('text-xs mt-1', isBot ? 'text-gray-500' : 'text-blue-100')}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}
