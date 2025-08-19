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

// Enhanced bot responses with more intelligence
const getBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  // Greeting responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    const greetings = [
      "Hello! I'm your AI assistant. How can I help you today?",
      "Hi there! What would you like to chat about?",
      "Hey! I'm here to help. What's on your mind?",
      "Hello! Great to see you. How can I assist you?"
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }
  
  // How are you responses
  if (message.includes('how are you') || message.includes('how do you do')) {
    const responses = [
      "I'm doing great, thank you for asking! I'm here to help you with any questions or tasks you might have.",
      "I'm fantastic! Ready to chat and help you with whatever you need.",
      "I'm doing well! How are you doing today?",
      "Great! I'm always excited to have a conversation. How about you?"
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
  
  // Weather responses
  if (message.includes('weather')) {
    return "I don't have access to real-time weather data, but I'd recommend checking a weather app or website like Weather.com for the most accurate forecast!"
  }
  
  // Time responses
  if (message.includes('time') || message.includes('what time')) {
    return `The current time is ${new Date().toLocaleTimeString()}. Is there anything else I can help you with?`
  }
  
  // Help responses
  if (message.includes('help') || message.includes('what can you do')) {
    return "I'm here to help! I can have conversations, answer questions, provide information, or just chat. What would you like to talk about?"
  }
  
  // Thank you responses
  if (message.includes('thank') || message.includes('thanks')) {
    const thanks = [
      "You're welcome! Is there anything else you'd like to know?",
      "Happy to help! Feel free to ask me anything else.",
      "No problem at all! What else can I do for you?",
      "You're very welcome! I'm here whenever you need assistance."
    ]
    return thanks[Math.floor(Math.random() * thanks.length)]
  }
  
  // Goodbye responses
  if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
    const goodbyes = [
      "Goodbye! It was nice chatting with you. Come back anytime!",
      "See you later! Feel free to return whenever you want to chat.",
      "Bye! Have a great day and don't hesitate to come back if you need anything.",
      "Take care! I'll be here whenever you want to continue our conversation."
    ]
    return goodbyes[Math.floor(Math.random() * goodbyes.length)]
  }
  
  // Question responses
  if (message.includes('?')) {
    const questionResponses = [
      "That's a great question! While I don't have all the answers, I'm happy to discuss it with you.",
      "Interesting question! What are your thoughts on this?",
      "I'd love to explore that with you. Can you tell me more about what you're thinking?",
      "That's something worth discussing! What's your perspective on this?"
    ]
    return questionResponses[Math.floor(Math.random() * questionResponses.length)]
  }
  
  // Default conversational responses
  const defaultResponses = [
    "That's interesting! Tell me more about that.",
    "I understand. What else would you like to discuss?",
    "Thanks for sharing that. How can I help further?",
    "That's a great point. What are your thoughts on it?",
    "I see what you mean. Anything specific you'd like to know?",
    "Fascinating! I'd love to hear more about your perspective.",
    "That sounds intriguing. Can you elaborate on that?",
    "I appreciate you sharing that with me. What's your take on it?"
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  // Validate UUID format
  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  if (!chatId || !isValidUUID(chatId)) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
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
    skip: !chatId || !isValidUUID(chatId),
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE, {
    onCompleted: () => refetch(),
    onError: (err) => console.error('Error inserting message:', err),
  })

  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages)
    }
  }, [data])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return
    
    // Validate chatId before sending message
    if (!chatId || !isValidUUID(chatId)) {
      console.error('Invalid chat ID, cannot send message')
      return
    }

    try {
      // Insert user message
      await insertMessage({ 
        variables: { 
          chat_id: chatId, 
          text: text.trim(), 
          sender: 'user' 
        } 
      })
      
      // Show typing indicator
      setIsTyping(true)

      // Simulate bot thinking time (1-3 seconds)
      const thinkingTime = 1000 + Math.random() * 2000
      
      setTimeout(async () => {
        try {
          const botResponse = getBotResponse(text)
          await insertMessage({ 
            variables: { 
              chat_id: chatId, 
              text: botResponse, 
              sender: 'bot' 
            } 
          })
        } catch (err) {
          console.error('Error sending bot message:', err)
        } finally {
          setIsTyping(false)
        }
      }, thinkingTime)
      
    } catch (err) {
      console.error('Error sending message:', err)
      setIsTyping(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm mb-2">Unable to load messages</p>
          <button 
            onClick={() => refetch()} 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Start a conversation</p>
              <p className="text-xs mt-1">Send a message to begin chatting with your AI assistant</p>
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