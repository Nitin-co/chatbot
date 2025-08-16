import React, { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { MessageBubble } from '/home/project/src/components/chat/MessageBubble.tsx'
import { MessageInput } from '/home/project/src/components/chat/MessageInput.tsx'
import { GET_CHAT_MESSAGES } from '/home/project/src/graphql/queries.ts'
import { INSERT_MESSAGE } from '/home/project/src/graphql/mutations.ts'
import { Bot, User, Loader } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  created_at: string
}

interface ChatViewProps {
  chatId: string
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, loading, error, refetch } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chat_id: chatId },
    fetchPolicy: 'cache-and-network',
    onCompleted: (data) => {
      setMessages(data?.messages || [])
    }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages)
    }
  }, [data])

  const simulateBotResponse = async (userMessage: string) => {
    setIsTyping(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simple bot responses for demo
    const responses = [
      "That's an interesting point! Can you tell me more about that?",
      "I understand what you're saying. Here's what I think...",
      "Thanks for sharing that with me. Let me help you with that.",
      "That's a great question! Based on what you've told me...",
      "I see. Have you considered looking at it from this perspective?",
      "Interesting! That reminds me of something similar...",
      "I appreciate you bringing that up. Here's my take on it...",
      "That makes sense. Let me provide some additional context..."
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    try {
      await insertMessage({
        variables: {
          chat_id: chatId,
          text: randomResponse,
          sender: 'bot'
        }
      })
      
      await refetch()
    } catch (error) {
      console.error('Error inserting bot message:', error)
    }
    
    setIsTyping(false)
  }

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    try {
      // Insert user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          text: text.trim(),
          sender: 'user'
        }
      })

      // Refresh messages
      await refetch()
      
      // Simulate bot response
      await simulateBotResponse(text)
      
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-2">Error loading messages</p>
          <button 
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-500 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-lg font-medium mb-1">Start a conversation</p>
              <p className="text-sm">Send a message to begin chatting with the AI</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  )
}