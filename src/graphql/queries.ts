import { gql } from '@apollo/client'

// Get all chats with the latest message
export const GET_CHATS = gql`
  query GetChats {
    chats(order_by: { created_at: desc }) {
      id
      created_at
      messages(order_by: { created_at: desc }, limit: 1) {
        id
        text
        sender
        created_at
      }
    }
  }
`

// Get messages for a chat
export const GET_MESSAGES = gql`
  query GetMessages($chatId: uuid!) {
    messages(where: { chat_id: { _eq: $chatId } }, order_by: { created_at: asc }) {
      id
      text
      sender
      created_at
      chat_id
    }
  }
`

// Create chat
export const CREATE_CHAT = gql`
  mutation CreateChat {
    insert_chats_one(object: {}) {
      id
      created_at
    }
  }
`

// Insert message
export const INSERT_MESSAGE = gql`
  mutation InsertMessage($chat_id: uuid!, $text: String!, $sender: String!) {
    insert_messages_one(object: { chat_id: $chat_id, text: $text, sender: $sender }) {
      id
      text
      sender
      created_at
      chat_id
    }
  }
`

// Delete chat
export const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`
