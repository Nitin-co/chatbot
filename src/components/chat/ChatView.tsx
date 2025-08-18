import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { MessageCircle, Loader } from 'lucide-react'
import { GET_MESSAGES, INSERT_MESSAGE } from '../../graphql/queries'
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

// Simple bot responses
const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  if (message.includes('hello') || message.includes('hi')) {
    return "Hello! I'm your AI assistant. How can I help you today?"
  }
  
  if (message.includes('how are you')) {
    return "I'm doing great, thank you for asking! I'm here to help you with any questions or tasks you might have."
  }
  
  if (message.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website for the most current conditions in your area."
  }
  
  if (message.includes('time')) {
    return `The current time is ${new Date().toLocaleTimeString()}.`
  }
  
  if (message.includes('help')) {
    return "I'm here to help! You can ask me questions, have a conversation, or just chat. What would you like to talk about?"
  }
  
  if (message.includes('thank')) {
    return "You're welcome! I'm happy to help. Is there anything else you'd like to know?"
  }
  
  if (message.includes('bye') || message.includes('goodbye')) {
    return "Goodbye! It was nice chatting with you. Feel free to come back anytime!"
  }
  
  // Default responses
  const defaultResponses = [
    "That's interesting! Tell me more about that.",
    "I understand. What else would you like to discuss?",
    "Thanks for sharing that with me. How can I help you further?",
    "That's a great point. What are your thoughts on this?",
    "I see what you mean. Is there anything specific you'd like to know?",
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  // Validate chatId is a proper UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  if (!chatId || !isValidUUID(chatId)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Invalid chat selected</p>
          <p className="text-xs mt-1">Please select a valid chat from the sidebar</p>
        </div>
      </div>
    )
  }

  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, loading, error, refetch } = useQuery(GET_MESSAGES, {
    variables: { chatId },
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Error inserting message:', error)
    }
  })

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages)
    }
  }, [data])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (text: string) => {
    try {
      // Insert user message
      await insertMessage({
        variables: {
          chat_id: chatId,
          text,
          sender: 'user'
        }
      })

      // Show typing indicator
      setIsTyping(true)

      // Simulate bot thinking time
      setTimeout(async () => {
        const botResponse = getBotResponse(text)
        
        // Insert bot message
        await insertMessage({
          variables: {
            chat_id: chatId,
            text: botResponse,
            sender: 'bot'
          }
        })
        
        setIsTyping(false)
      }, 1000 + Math.random() * 2000) // 1-3 seconds delay
      
    } catch (error) {
      console.error('Error sending message:', error)
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm mb-2">Unable to load messages</p>
          <button
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Start a conversation</p>
              <p className="text-xs mt-1">Send a message to begin chatting</p>
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
                  <MessageCircle className="h-4 w-4 text-blue-600" />
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