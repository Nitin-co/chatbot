keep everything else intact: import React, { useEffect, useState } from 'react'
import { Plus, MessageCircle, Loader, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useSubscription } from '@apollo/client'
import clsx from 'clsx'
import { GET_CHATS, SUBSCRIBE_TO_CHATS, CREATE_CHAT } from '/home/project/src/graphql/queries'
import { DELETE_CHAT } from '/home/project/src/graphql/mutations'
import { nhost } from '/home/project/src/lib/nhost'

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

interface ChatViewProps {
  selectedChatId?: string
}

export const ChatView: React.FC<ChatViewProps> = ({ selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([])
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await nhost.auth.getAccessToken()
        setToken(t)
      } catch (err) {
        console.error('Token fetch error:', err)
        setToken(null)
      }
    }
    fetchToken()
    const unsubscribe = nhost.auth.onAuthStateChanged(fetchToken)
    return () => unsubscribe()
  }, [])

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    skip: !token,
  })

  const [createChat, { loading: createLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      if (data?.insert_chats_one) {
        const newChat = { ...data.insert_chats_one, messages: [] }
        setChats(prev => [newChat, ...prev])
      }
    },
    onError: (error) => console.error('Error creating chat:', error)
  })

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => refetch(),
    onError: (error) => console.error('Error deleting chat:', error)
  })

  useSubscription(SUBSCRIBE_TO_CHATS, {
    skip: !token,
    onData: ({ data: subscriptionData }) => {
      if (subscriptionData.data?.chats) {
        setChats(subscriptionData.data.chats)
      }
    },
    onError: (error) => console.error('Subscription error:', error)
  })

  useEffect(() => {
    if (data?.chats) {
      setChats(data.chats)
    }
  }, [data])

  return (
    <div className="flex-1 flex flex-col p-4">
      {selectedChatId ? (
        <p>Chat details for {selectedChatId}</p>
      ) : (
        <p className="text-gray-500 text-sm">Select a chat to view messages</p>
      )}
    </div>
  )
}