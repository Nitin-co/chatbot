import React, { useState, useEffect } from "react"
import { useQuery, useMutation } from "@apollo/client"
import { Plus, MessageCircle } from "lucide-react"
import clsx from "clsx"
import { nhost } from "/home/project/src/lib/nhost.ts"
import { CREATE_CHAT } from "/home/project/src/graphql/mutations.ts"
import { GET_CHATS } from "/home/project/src/graphql/queries.ts"

export const ChatList = ({ selectedChatId, onSelectChat }) => {
  const { data, loading, refetch } = useQuery(GET_CHATS)
  const [createChat] = useMutation(CREATE_CHAT)
  const [chats, setChats] = useState([])

  useEffect(() => {
    if (data?.chats) setChats(data.chats)
  }, [data])

  const handleCreateChat = async () => {
    try {
      const userId = nhost.auth.getUser()?.id
      if (!userId) throw new Error("No user logged in")

      const { data } = await createChat({
        variables: { user_id: userId }
      })

      if (data?.insert_chats_one) {
        setChats((prev) => [...prev, data.insert_chats_one])
        onSelectChat(data.insert_chats_one.id)
      }
    } catch (err) {
      console.error("Error creating chat:", err)
    }
  }

  if (loading) return <p>Loading chats...</p>
  if (!chats || chats.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
        <p>No chats yet. Start a new conversation!</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          onClick={handleCreateChat}
        >
          <Plus className="inline h-4 w-4 mr-2" />
          New Chat
        </button>
      </div>
    )

  return (
    <div className="flex flex-col space-y-2 p-2">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={clsx(
            "p-2 rounded-lg cursor-pointer",
            selectedChatId === chat.id ? "bg-blue-100" : "hover:bg-gray-100"
          )}
          onClick={() => onSelectChat(chat.id)}
        >
          Chat ID: {chat.id.slice(0, 8)}
        </div>
      ))}
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
        onClick={handleCreateChat}
      >
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </button>
    </div>
  )
}
