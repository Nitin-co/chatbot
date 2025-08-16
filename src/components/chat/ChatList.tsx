import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { Plus, MessageCircle } from 'lucide-react'
import clsx from 'clsx'

import { GET_CHATS } from '/home/project/src/graphql/queries.ts'
import { CREATE_CHAT } from '/home/project/src/graphql/mutations.ts'

interface Chat {
  id: string
  created_at: string
  title: string
  latest_message: Array<{
    id: string
    text: string
    sender: 'user' | 'bot'
    created_at: string
  }>
}

interface ChatListProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
}

// Centralized error logger
function logError(context: string, error: unknown) {
  if (import.meta.env.DEV) console.error(`[${context}]`, error)
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const [isCreating, setIsCreating] = useState(false)

  const { data, loading, error } = useQuery(GET_CHATS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  })

  const [createChat] = useMutation(CREATE_CHAT, {
    refetchQueries: [GET_CHATS],
    onError: (err) => {
      logError('Error creating chat', err)
      const msg =
        // @ts-ignore
        err?.graphQLErrors?.[0]?.message || (err as Error)?.message || 'Failed to create chat'
      alert(msg)
      setIsCreating(false)
    },
    onCompleted: () => setIsCreating(false)
  })

  const handleCreateChat = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      await createChat({
        variables: { title: `New Chat ${new Date().toLocaleTimeString()}` }
      })
    } catch (e) {
      logError('Error creating chat (catch)', e)
      setIsCreating(false)
    }
  }

  const getPreviewText = (chat: Chat) => {
    const last = chat.latest_message?.[0] // updated to latest_message
    if (!last) return chat.title || 'New chat'
    return last.text.length > 50 ? last.text.slice(0, 50) + '…' : last.text
  }

  const getTimeAgo = (iso: string) => {
    const date = new Date(iso)
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 min-w-[280px] max-w-xs">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleCreateChat}
          disabled={isCreating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreating ? 'Creating...' : 'New Chat'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && <div className="p-4 text-sm text-gray-500">Loading…</div>}
        {error && (
          <div className="p-4 text-red-600 text-sm">Unable to load chats. Please try again later.</div>
        )}
        {!loading && !error && (data?.chats?.length ?? 0) === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-xs">Create your first chat to get started</p>
          </div>
        )}

        <div className="space-y-1 p-2">
          {data?.chats?.map((chat: Chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={clsx(
                'w-full text-left p-3 rounded-lg transition-colors',
                selectedChatId === chat.id
                  ? 'bg-blue-100 border border-blue-200'
                  : 'hover:bg-white border border-transparent'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {getPreviewText(chat)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getTimeAgo(chat.created_at)}</p>
                </div>
                <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
