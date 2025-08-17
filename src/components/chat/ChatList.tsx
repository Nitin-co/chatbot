import React, { useEffect, useState } from 'react'
import { Plus, MessageCircle, Loader, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import clsx from 'clsx'
import { GET_CHATS, SUBSCRIBE_TO_CHATS, CREATE_CHAT } from '../../graphql/queries'
import { DELETE_CHAT } from '../../graphql/mutations'

interface Message {
  id: string
  text: string
  sender: string
  created_at: string
}

interface Chat {
  id: string
  created_at: string
  messages?: Message[]
}

interface ChatListProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([])

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  })

  const [createChat, { loading: createLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      if (data?.insert_chats_one) {
        const newChat = { ...data.insert_chats_one, messages: [] }
        setChats(prev => [newChat, ...prev])
        onSelectChat(newChat.id)
      }
    },
    onError: (error) => {
      console.error('Error creating chat:', error)
    }
  })

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => {
      console.error('Error deleting chat:', error)
    }
  })

  // Subscribe to live updates
  useSubscription(SUBSCRIBE_TO_CHATS, {
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data?.chats) {
        setChats(subscriptionData.data.chats)
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error)
    }
  })

  useEffect(() => {
    if (data?.chats) {
      setChats(data.chats)
    }
  }, [data])

  const handleCreateChat = async () => {
    try {
      await createChat()
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChat({ variables: { chat_id: chatId } })
        if (selectedChatId === chatId) {
          onSelectChat('')
        }
      } catch (err) {
        console.error('Error deleting chat:', err)
      }
    }
  }

  if (loading && chats.length === 0) {
    return (
      <div className="w-80 flex flex-col p-4 border-r border-gray-200 h-full">
        <div className="flex items-center justify-center h-full">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  if (error && chats.length === 0) {
    return (
      <div className="w-80 flex flex-col p-4 border-r border-gray-200 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <button
            onClick={handleCreateChat}
            disabled={createLoading}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {createLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-sm mb-4">Unable to load chats</p>
            <button
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 flex flex-col p-4 border-r border-gray-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={handleCreateChat}
          disabled={createLoading}
          className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {createLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No chats yet</p>
            <p className="text-xs mt-1">Create your first chat to get started</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {chats.map((chat) => {
              const lastMsg = chat.messages?.[0]
              const preview = lastMsg?.text || 'New chat'
              const truncatedPreview = preview.length > 50 ? preview.substring(0, 50) + '...' : preview
              
              return (
                <li
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={clsx(
                    'group p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-100',
                    selectedChatId === chat.id && 'bg-blue-50 border border-blue-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {truncatedPreview}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-500">
                          {lastMsg.sender === 'user' ? 'You' : 'Bot'} · {' '}
                          {new Date(lastMsg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}