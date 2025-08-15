import { gql } from '@apollo/client'

export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      id
      created_at
      messages(order_by: { created_at: asc }, limit: 1) {
        text
        sender
      }
    }
  }
`

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      text
      sender
      created_at
    }
  }
`

export const SUBSCRIBE_TO_CHATS = gql`
  subscription SubscribeToChats {
    chats(order_by: { created_at: desc }) {
      id
      created_at
      messages(order_by: { created_at: asc }, limit: 1) {
        text
        sender
      }
    }
  }
`

export const SUBSCRIBE_TO_MESSAGES = gql`
  subscription SubscribeToMessages($chat_id: uuid!) {
    messages(
      where: { chat_id: { _eq: $chat_id } }
      order_by: { created_at: asc }
    ) {
      id
      text
      sender
      created_at
    }
  }
`