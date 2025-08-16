import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useSubscription } from '@apollo/client'
import { Loader } from 'lucide-react'

import { SUBSCRIBE_TO_MESSAGES } from '/home/project/src/graphql/queries.ts'
import { INSERT_MESSAGE, SEND_MESSAGE_ACTION } from '/home/project/src/graphql/mutations.ts'
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

function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) console.error(`[${context}]`, error)
}

export const ChatView: React.FC<ChatViewProps> = ({ chatId }) => {
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data, loading, error } = useSubscription(SUBSCRIBE_TO_MESSAGES, {
    variables: { chat_id: chatId }
  })

  const [insertMessage] = useMutation(INSERT_MESSAGE)
  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION)

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
      // 1) Save user message
      await insertMessage({
        variables: { chat_id: chatId, text: text.trim(), sender: 'user' }
      })

      // 2) Trigger Hasura Action -> n8n -> OpenRouter -> inserts bot message
      await sendMessageAction({
        variables: { chat_id: chatId, text: text.trim() }
      })
      // No manual refetch needed — subscription will pick up the new bot row.
    } catch (e) {
      logError('Error sending message', e)
      alert('Failed to send message. See console for details.')
    } finally {
      setIsSending(false)
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
        </div>
      </div>
    )
  }

  const messages: Message[] = data?.messages ?? []

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} disabled={isSending} />
    </div>
  )
}
