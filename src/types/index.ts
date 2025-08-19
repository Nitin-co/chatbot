import { apolloClient } from '/src/lib/apollo'
import { GET_CHATS, GET_MESSAGES, CREATE_CHAT, INSERT_MESSAGE, DELETE_CHAT } from '/home/project/src/graphql/queries'

export const getChats = async () => {
  const { data } = await apolloClient.query({ query: GET_CHATS, fetchPolicy: 'network-only' })
  return data.chats
}

export const getMessages = async (chatId: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID")
  const { data } = await apolloClient.query({ query: GET_MESSAGES, variables: { chatId }, fetchPolicy: 'network-only' })
  return data.messages
}

export const createChat = async () => {
  const { data } = await apolloClient.mutate({ mutation: CREATE_CHAT })
  return data.insert_chats_one
}

export const sendMessage = async (chatId: string, text: string, sender: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID")
  console.log("📩 sendMessage called with:", { chatId, text, sender })
  const { data } = await apolloClient.mutate({
    mutation: INSERT_MESSAGE,
    variables: {  }
  })
  return data.insert_messages_one
}


export const deleteChat = async (chatId: string) => {
  if (!chatId) throw new Error("chatId is required and must be a valid UUID")
  const { data } = await apolloClient.mutate({
    mutation: DELETE_CHAT,
    variables: { chat_id: chatId } // <-- FIXED: snake_case to match mutation
  })
  return data.delete_chats_by_pk
}
