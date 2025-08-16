import React, { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Loader } from 'lucide-react'
import { GET_CHAT_MESSAGES } from '/home/project/src/graphql/queries.ts'
import { INSERT_MESSAGE } from '/home/project/src/graphql/mutations.ts'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  created_at: string
}

interface ChatViewProps {
  chatId: string
}

// Centralized error logger
function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error)
  }
  // Future: send error to monitoring service.
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
      logError('Error inserting bot message', error)
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
      logError('Error sending message', error)
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
          <p className="mb-2">Unable to load messages. Please try again later.</p>
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
    // ...rest of the ChatView rendering logic...
    <div>
      {/* ... */}
    </div>
  )
}