import React from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { GET_CHATS, SUBSCRIBE_TO_CHATS } from '../../graphql/queries'
import { CREATE_CHAT } from '../../graphql/mutations'
import { Chat } from '../../types'
import { Plus, MessageCircle } from 'lucide-react'
import clsx from 'clsx'
import { nhost } from '../../graphql/nhost' // make sure nhost import is correct

interface ChatListProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
}

export const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const { data, loading, error } = useQuery(GET_CHATS, {
    subscribeToMore: {
      document: SUBSCRIBE_TO_CHATS,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        return subscriptionData.data
      }
    }
  })

  const [createChat, { loading: creating }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      onSelectChat(data.insert_chats_one.id)
    },
    refetchQueries: [{ query: GET_CHATS }]
  })

  const handleCreateChat = async () => {
    try {
      const userId = nhost.auth.getUserId()
      if (!userId) return alert('You must be logged in')
      await createChat({ variables: { user_id: userId } })
    } catch (err) {
      console.error('Error creating chat:', err)
    }
  }

  const formatPreview = (chat: Chat) => {
    const lastMessage = chat.messages[0]
    if (!lastMessage) return 'New chat'
    return lastMessage.sender === 'user' 
      ? `You: ${lastMessage.text}` 
      : lastMessage.text
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error loading chats</div>

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleCreateChat}
          disabled={creating}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          <span>{creating ? 'Creating...' : 'New Chat'}</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {data?.chats?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No chats yet</p>
            <p className="text-sm">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.chats.map((chat: Chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={clsx(
                  'w-full p-4 text-left hover:bg-gray-50 transition-colors',
                  selectedChatId === chat.id && 'bg-blue-50 border-r-2 border-blue-600'
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 truncate">
                    Chat {chat.id.slice(0, 8)}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(chat.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {formatPreview(chat)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
