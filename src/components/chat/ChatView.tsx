import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useSubscription } from '@apollo/client'
import { Loader, AlertCircle } from 'lucide-react'
import { SUBSCRIBE_TO_MESSAGES } from '../../graphql/queries'
import { INSERT_MESSAGE } from '../../graphql/mutations'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  created_at: string
}

interface ChatViewProps {
  chatId: string
}

// Simple bot responses for demonstration
const getBotResponse = (userMessage: string): string => {
  const responses = [
    "That's an interesting point! Can you tell me more about that?",
    "I understand what you're saying. How does that make you feel?",
    "Thanks for sharing that with me. What would you like to explore next?",
    "That's a great question! Let me think about that for a moment...",
    "I appreciate you bringing that up. Have you considered looking at it from a different angle?",
    "That sounds important to you. Can you help me understand why?",
    "I'm here to help! What specific aspect would you like to focus on?",
    "That's fascinating! I'd love to learn more about your perspective on this.",
  ]
  
  // Simple keyword-based responses
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! It's great to meet you. How are you doing today?"
  }
  
  if (lowerMessage.includes('help')) {
    return "I'm here to help! Feel free to ask me anything or just chat about what's on your mind."
  }
  
  if (lowerMessage.includes('how are you')) {
    return "I'm doing well, thank you for asking! I'm here and ready to chat with you. How are you feeling today?"
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're very welcome! I'm happy I could help. Is there anything else you'd like to talk about?"
  }
  
  // Return a random response for other messages
  return responses[Math.floor(Math.random() * responses.length)]
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, loading, error } = useSubscription(SUBSCRIBE_TO_MESSAGES, {
    variables: { chatId },
    errorPolicy: 'all',
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    errorPolicy: 'all',
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [data?.messages?.length])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return
    
    setIsSending(true)
    
    try {
      const cleanedText = text.trim()
      
      // Insert user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          text: cleanedText,
          sender: 'user'
        }
      })

      // Simulate bot thinking time
      setTimeout(async () => {
        try {
          const botResponse = getBotResponse(cleanedText)
          
          // Insert bot message
          await insertMessage({
            variables: {
              chat_id: chatId,
              text: botResponse,
              sender: 'bot'
            }
          })
        } catch (error) {
          console.error('Error sending bot message:', error)
          // Send error message as bot
          await insertMessage({
            variables: {
              chat_id: chatId,
              text: "I'm sorry, I'm having trouble responding right now. Please try again.",
              sender: 'bot'
            }
          })
        } finally {
          setIsSending(false)
        }
      }, 1000 + Math.random() * 2000) // Random delay between 1-3 seconds
      
    } catch (error) {
      console.error('Error sending user message:', error)
      setIsSending(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-red-600">
          <AlertCircle className="h-8 w-8 mx-auto mb-4" />
          <p className="mb-2">Unable to load messages</p>
          <p className="text-sm text-gray-500">Please check your connection and try again</p>
        </div>
      </div>
    )
  }

  const messages: Message[] = data?.messages || []

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Start a conversation</p>
              <p className="text-sm">Send a message to begin chatting with the AI assistant</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isSending && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader className="h-4 w-4 text-blue-600 animate-spin" />
            </div>
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
    </div>
  )
}