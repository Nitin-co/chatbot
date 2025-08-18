import React, { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { MessageCircle, Loader } from 'lucide-react'
import { GET_MESSAGES, INSERT_MESSAGE } from '/src/graphql/queries'
import { Message } from '/src/types'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ChatViewProps {
  chatId: string
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
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
    onCompleted: () => refetch(),
    onError: (err) => console.error('Error inserting message:', err),
  })

  useEffect(() => {
    if (data?.messages) setMessages(data.messages)
  }, [data])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const getBotResponse = (text: string) => `Bot says: ${text}`

  const handleSendMessage = async (text: string) => {
    try {
      await insertMessage({ variables: { chat_id: chatId, text, sender: 'user' } })
      setIsTyping(true)

      setTimeout(async () => {
        const botResponse = getBotResponse(text)
        await insertMessage({ variables: { chat_id: chatId, text: botResponse, sender: 'bot' } })
        setIsTyping(false)
      }, 1000 + Math.random() * 2000)
    } catch (err) {
      console.error('Error sending message:', err)
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
          <button onClick={() => refetch()} className="text-blue-600 hover:text-blue-700 text-sm">
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
