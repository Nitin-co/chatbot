import { gql } from '@apollo/client'

// Get all chats with latest message preview
import { gql } from '@apollo/client'

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      id
      title
      created_at
      latest_message(limit: 1, order_by: { created_at: desc }) {
        id
        text
        sender
        created_at
      }
    }
  }
`

// Historic messages
export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      text
      sender
      created_at
    }
  }
`

// Live chat list updates
export const SUBSCRIBE_TO_CHATS = gql`
  subscription SubscribeToChats {
    chats(order_by: { created_at: desc }) {
      id
      title
      created_at
      latest_message: messages(order_by: { created_at: desc }, limit: 1) {
        id
        text
        sender
        created_at
      }
    }
  }
`

// Live updates for messages in a chat
export const SUBSCRIBE_TO_MESSAGES = gql`
  subscription SubscribeToMessages($chat_id: uuid!) {
    messages(where: { chat_id: { _eq: $chat_id } }, order_by: { created_at: asc }) {
      id
      text
      sender
      created_at
    }
  }
`
