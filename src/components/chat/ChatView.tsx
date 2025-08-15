import React, { useEffect, useRef } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_CHAT_MESSAGES, SUBSCRIBE_TO_MESSAGES } from '../../graphql/queries'
import { INSERT_MESSAGE, SEND_MESSAGE_ACTION } from '../../graphql/mutations'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { Message } from '../../types'
import { MessageCircle } from 'lucide-react'

interface ChatViewProps {
  chatId: string
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { data, loading, error } = useQuery(GET_CHAT_MESSAGES, {
    variables: { chat_id: chatId },
    subscribeToMore: {
      document: SUBSCRIBE_TO_MESSAGES,
      variables: { chat_id: chatId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        return subscriptionData.data
      }
    }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction, { loading: sending }] = useMutation(SEND_MESSAGE_ACTION)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [data?.messages])

  const handleSendMessage = async (messageText: string) => {
    try {
      // Insert user message first
      await insertMessage({
        variables: {
          chat_id: chatId,
          text: messageText,
          sender: 'user'
        }
      })

      // Send to n8n via Hasura Action for AI response
      await sendMessageAction({
        variables: {
          chat_id: chatId,
          message: messageText
        }
      })
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <p className="text-red-600">Error loading messages</p>
      </div>
    )
  }

  const messages = data?.messages || []

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
            <p className="text-sm text-center max-w-sm">
              Send a message below to start chatting with the AI assistant
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: Message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {sending && (
              <div className="flex items-start space-x-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="max-w-xs lg:max-w-md px-4 py-2 bg-gray-100 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={sending} />
    </div>
  )
}